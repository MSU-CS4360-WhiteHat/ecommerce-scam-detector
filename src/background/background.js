const debug = true;
const STATIC_RATING = 5;

let isSecure = false;
let hasSSLCert = false;

let weight = 100; // we can rename to score.

const testPayload = {
  title: "This site seems unsafe!",
  subTitle: "Our ranking",
  rankNumber: 43,
  message: "Here are the reasons this site could be harmful.",
  reasons: ["Bad", "Awful", "No Good"],
};

function domain_from_url(url) {
  return url.split("/")[2];
}

function onError(error) {
  console.error(`Error: ${error}`);
}

// listen for a data request from the popup script
browser.runtime.onMessage.addListener(function (request, sender, sendResponse) {
  if (request.type == "get_data") {
    const domain = domain_from_url(request.url);
    let data = localStorage.getItem(domain);
    if (data) {
      sendResponse({ data: data });
    } else {
      sendResponse({ data: "No data found" });
    }
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
          payload: testPayload,
        });
      });
  }

  if (request.type == "close_alert") {
    // send a message to the content script to close the alert
    browser.tabs
      .query({
        currentWindow: true,
        active: true,
      })
      .then((tabs) => {
        browser.tabs.sendMessage(tabs[0].id, {
          type: "close_alert",
          shouldStay: request.shouldStay,
        });
      });
  }
});

// Called when the user navigates to a new page.
browser.webNavigation.onCompleted.addListener(function (details) {
  // send a message to the content script to open the alert
  browser.tabs
    .query({
      currentWindow: true,
      active: true,
    })
    .then((tabs) => {
      console.log("Sending message to open alert");
      browser.tabs.sendMessage(tabs[0].id, {
        type: "open_alert",
        payload: testPayload,
      });
    });
  console.log("Navigated to: " + details.url);
  const domain = domain_from_url(details.url);

  if (!domain) {
    // No domain found, so just return.
    console.log("No domain found, so just return.");
    return 1;
  }
  console.log("Getting data from local storage for: " + domain);

  let data = localStorage.getItem(domain);

  if (data) {
    console.log("Site " + domain + " has already been scanned");
    console.log("Data for " + domain + " is: " + data);
    data = JSON.parse(data);
  } else {
    makeWOTRequest(domain, function (json) {
      localStorage.setItem(domain, json);
      data = json;
    });
  }
});

// Sets the extension's icon to the specified color.
// Available colors: "red", "yellow", "green"
function setIcon(color) {
  try {
    browser.browserAction.setIcon({ path: "/icons/" + color + "-circle.png" });
  } catch (e) {
    console.log(e);
  }
}

async function makeWOTRequest(url, callback) {
  const WOTUrl = "https://scorecard.api.mywot.com/v3/targets?t=";
  const requestUrl = WOTUrl + url;

  headers = {
    // NOTE: Add the API key and user ID here.
    "x-user-id": "",
    "x-api-key": "",
  };

  console.log("Making API request to: " + requestUrl);

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

  callback(json);
}

// listen for a data request from the popup script
browser.runtime.onMessage.addListener(function (request, sender, sendResponse) {
  if (request.type == "get_data") {
    const domain = domain_from_url(request.url);
    let localStorageData = localStorage.getItem(domain);
    if (localStorageData) {
      sendResponse({ data: localStorageData });
    } else {
      sendResponse({ data: "No data found" });
    }
  }
});

// Called when the user navigates to a new page.
browser.webNavigation.onCompleted.addListener(function (details) {
  console.log("Navigated to: " + details.url);
  const domain = domain_from_url(details.url);

  if (!domain) {
    // No domain found, so just return.
    console.log("No domain found, so just return.");
    return 1;
  }
  console.log("Getting data from local storage for: " + domain);

  let localStorageData = localStorage.getItem(domain);

  if (localStorageData) {
    console.log("Site " + domain + " has already been scanned");
    console.log("Data for " + domain + " is: " + localStorageData);
    localStorageData = JSON.parse(localStorageData);
  } else {
    makeWOTRequest(domain, function (json) {
      localStorageData = json;
      // Iterate through each category and compile weight
      localStorageData[0]?.categories.forEach((category) => {
        weight = new Evaluate()
          .setWeight(weight)
          .setCategoryId(category.id)
          .setConfidence(category.confidence)
          .setValues([0, 2, 4, 8]) // if not set, defaults to [0,1,2,3]
          .evaluateWeight()
          .getWeight();
      });

      if (!isSecure) {
        weight -= STATIC_RATING;
      }

      if (!hasSSLCert) {
        weight -= STATIC_RATING;
      }

      localStorage.setItem(
        domain,
        json.length > 0 ? JSON.stringify(json[0]) : null
      );
      console.warn(weight);
      // TODO send weight to the popup.
    }).catch((error) => console.error(error));
  }
});

// Checks for SSL Certificate on website
// TODO: do not check on brand new tab
// TODO: save to local storage?
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
        // console.log("Security information:", results[0]);
        console.log("Is Secure? - " + results[0].isSecure);
        isSecure = results[0].isSecure;
      })
      .catch((error) => {
        console.error("Error:", error);
      });
  }
});
