/*
---- When we determine the score and reasons it is unsafe use the following
  
payloadForUserAlert = {
    title: "This site seems unsafe!",
    subTitle: "Our ranking",
    rankNumber: 43,
    message: "Here are the reasons this site could be harmful.",
    reasons: ["Bad", "Awful", "No Good"],
  };

  or 

  payloadForUserAlert.rankNumber = 43;
  payloadForUserAlert.reasons = [...];

---- When we want to trigger the alert after we determine an score, use the following
  
browser.tabs
  .query({
    currentWindow: true,
  })
  .then(sendMessageToTabs)
  .catch(onError);

*/

const debug = true;
const STATIC_RATING = 5;
const THRESHOLD_TO_ALERT_THE_USER = 60;
const RETENTION_PERIOD = 1000 * 60 * 60 * 24 * 7; // 7 days
const NUM_ITEMS_TO_STORE = 50; // once it goes over 150 we purge to 100

const X_USER_ID = "";
const X_API_KEY = "";

let isSecure = false;
let hasSSLCert = false;

const Icons = {
  SAFE: "safe",
  WARN: "warning",
  UNSAFE: "unsafe",
  DEFAULT: "default",
};

const IconThreshold = {
  SAFE: 80,
  WARN: 50,
};

const EXCLUDE_URLS = ["moz-extension://", "about:", "chrome://", "google.com"];

// TODO see if we can make this a state, similar to react states @see https://www.w3schools.com/react/react_state.asp
let payloadForUserAlert = {
  title: "This site seems unsafe!",
  subTitle: "Our ranking",
  rankNumber: 0,
  message: "Here are the reasons this site could be harmful.",
  reasons: [],
};

function domain_from_url(url) {
  return url.split("/")[2];
}

function onError(error) {
  console.error(`Error: ${error}`);
}

function sendMessageToTabs(tabs) {
  for (const tab of tabs) {
    browser.tabs.sendMessage(tab.id, payloadForUserAlert).catch(onError);
  }
}

function closeAlert(shouldStay = true) {
  // send a message to the content script to close the alert
  browser.tabs
    .query({
      currentWindow: true,
      active: true,
    })
    .then((tabs) => {
      browser.tabs.sendMessage(tabs[0].id, {
        type: "close_alert",
        shouldStay: shouldStay,
      });
    });
}

function updateIcon(value) {
  // Sets the extension's icon to the specified color.
  let setIcon = (status = "default") => {
    try {
      browser.browserAction.setIcon({ path: "/icons/" + status + ".svg" });
    } catch (e) {
      console.error(e);
    }
  };

  if (value === undefined) {
    setIcon(Icons.DEFAULT);
  } else if (value >= IconThreshold.SAFE) {
    setIcon(Icons.SAFE);
  } else if (IconThreshold.WARN <= value && value < IconThreshold.SAFE) {
    setIcon(Icons.WARN);
  } else {
    setIcon(Icons.UNSAFE);
  }
}

async function makeWOTRequest(url) {
  const WOTUrl = "https://scorecard.api.mywot.com/v3/targets?t=";
  const requestUrl = WOTUrl + url;

  headers = {
    // NOTE: Add the API key and user ID here.
    "x-user-id": X_USER_ID,
    "x-api-key": X_API_KEY,
  };

  /**
   * In summary, use await fetch() when you need to perform some operation with the data obtained
   * from the HTTP response before proceeding with the next line of code, and use fetch() with
   * then() when you want to perform multiple asynchronous operations in a specific order.
   */
  // NOTE:  If we want to switch back to using then, we can.
  //        This tells it to wait and prevents null errors.
  const response = await fetch(requestUrl, {
    method: "GET",
    headers: headers,
  });
  const json = await response.json();

  return json;
}

function getData(url) {
  const domain = domain_from_url(url);
  let localStorageData = localStorage.getItem(domain);
  if (localStorageData) {
    return JSON.parse(localStorageData);
  } else {
    return "No data found";
  }
}

function alertUserOfCurrentSite(data) {
  payloadForUserAlert.rankNumber = data?.score;
  payloadForUserAlert.reasons = data?.wot?.categories?.map((category) => {
    return `${category.name}: ${category.confidence}%`;
  });
  browser.tabs
    .query({
      currentWindow: true,
      active: true,
    })
    .then((tabs) => {
      browser.tabs.sendMessage(tabs[0].id, {
        type: "open_alert",
        payload: payloadForUserAlert,
      });
    });
}

function checkExpired(date) {
  const now = new Date();
  const old = new Date(date);
  const diff = now.getTime() - old.getTime();
  return diff > RETENTION_PERIOD;
}

function purgeStorage() {
  const numItems = localStorage.length;
  if (numItems > NUM_ITEMS_TO_STORE) {
    console.log("Max number of items reached, removing 50 oldest items.");
    // remove the 50 oldest items, sorting by the 'date' value
    const items = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      const value = JSON.parse(localStorage.getItem(key));
      items.push({ key: key, date: new Date(value.date) });
    }

    // sort by date
    items.sort((a, b) => {
      return a.date - b.date;
    });

    // remove the first 50 items
    for (let i = 0; i < 1; i++) {
      localStorage.removeItem(items[i].key);
    }
  }
}

// listen for a data request from the popup script
browser.runtime.onMessage.addListener(function (request, sender, sendResponse) {
  if (request.type == "get_data") {
    sendResponse({ data: getData(request.url) });
  }

  if (request.type == "alert_opened") {
    // send anoter open alert message so the alert.js script can get the data
    browser.tabs
      .query({
        currentWindow: true,
        active: true,
      })
      .then((tabs) => {
        browser.tabs.sendMessage(tabs[0].id, {
          type: "open_alert",
          payload: payloadForUserAlert,
        });
      });
  }

  if (request.type == "close_alert") {
    closeAlert(request.shouldStay);
  }

  if (request.type == "tab_loaded") {
    const debug = new URL(request.url).searchParams.get("debug") ?? false;
    handleTabUpdate(request.url, debug);
  }
});

async function handleTabUpdate(url, debug = false) {
  let weight = 100;
  let notSafe = false;

  if (EXCLUDE_URLS.some((u) => url.includes(u))) {
    updateIcon();
    return;
  }

  const domain = domain_from_url(url);

  if (!domain) {
    // No domain found, so just return.

    return 1;
  }

  let localStorageData = localStorage.getItem(domain);

  let shouldUpdate = false;
  if (localStorageData && !debug) {
    data = JSON.parse(localStorageData);
    weight = data?.score;

    // Check if the data has expired
    if (localStorageData) {
      if (checkExpired(data?.date)) {
        localStorage.removeItem(domain);
        localStorageData = null;
        shouldUpdate = true;
      }
    }
  } else {
    shouldUpdate = true;
  }

  if (shouldUpdate) {
    weight = 100;

    const json = await makeWOTRequest(domain);
    localStorageData = json;
    // Iterate through each category and compile weight
    localStorageData[0]?.categories.forEach((category) => {
      let evaluator = new Evaluate()
        .setWeight(weight)
        .setCategoryId(category.id)
        .setConfidence(category.confidence)
        .setMultiplierCurve([0, 2, 8, 16]) // if not set, defaults to [0,1,2,3]
        .evaluateWeight();

      weight = evaluator.getWeight();
      notSafe = notSafe === true ? true : evaluator.notSafe;
      console.info("Weight is: " + weight);
    });

    if (!isSecure) {
      weight -= STATIC_RATING;
    }

    if (!hasSSLCert) {
      weight -= STATIC_RATING;
    }

    // TODO if has cart and no SSL Ding them even more. Add a category that says has cart but not secure.
    // if ((!hasSSLCert || !isSecure) && hasCart) {
    //   weight -= STATIC_RATING * 10;
    // }

    weight = weight >= 0 ? weight : 0;

    localStorageData = JSON.stringify({
      date: new Date().toISOString(),
      wot: json.length > 0 ? json[0] : null,
      score: weight,
    });

    localStorage.setItem(domain, localStorageData);
  }

  updateIcon(weight);

  if (notSafe || weight <= THRESHOLD_TO_ALERT_THE_USER) {
    console.warn("Alerting user of current site");
    alertUserOfCurrentSite(JSON.parse(localStorageData));
  } else {
    closeAlert();
  }

  purgeStorage();
}

// Called when the user changes tabs.
browser.tabs.onActivated.addListener(async function (activeInfo) {
  const tab = await browser.tabs.get(activeInfo.tabId);
  handleTabUpdate(tab.url);
});

// Checks for SSL Certificate on website
browser.tabs.onUpdated.addListener(async (tabId, changeInfo, tab) => {
  if (changeInfo.status === "complete") {
    const url = tab.url;
    const certificate = await window.crypto.subtle.digest(
      "SHA-256",
      new TextEncoder().encode(
        await fetch(url).then((response) => response.arrayBuffer())
      )
    );

    console.log(
      `The SSL certificate of ${url} is: ${Array.from(
        new Uint8Array(certificate)
      )
        .map((b) => b.toString(16).padStart(2, "0"))
        .join("")}`
    );

    // TODO adjust the hasSSLCert flag here.
  }

  // Only run the code if the URL has changed and is not a blank page
  // Checks getSecurityInfo from browser/chrome API
  if (changeInfo.url && changeInfo.url !== "about:blank") {
    // Inject a content script that retrieves the security information
    browser.tabs
      .executeScript(tabId, {
        code: `
        const protocol = window.location.protocol;
        const hostname = window.location.hostname;
        const isSecure = protocol === 'https:';
        const securityInfo = { isSecure, hostname };
        securityInfo;
      `,
      })
      .then((results) => {
        isSecure = results[0].isSecure;
      })
      .catch((error) => {
        console.error("Error:", error);
      });
  }
});
