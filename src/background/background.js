const debug = true;
const STATIC_RATING = 5;

let isSecure = false;
let hasSSLCert = false;

let weight = 100; // we can rename to score.

const Icons = {
  SAFE: "safe",
  WARN: "warning",
  UNSAFE: "unsafe",
  DEFAULT: "default",
};

// TODO see if we can make this a state, similar to react states @see https://www.w3schools.com/react/react_state.asp
let payloadForUserPrompt = {
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

/*
---- When we determine the score and reasons it is unsafe use the following
  
payloadForUserPrompt = {
    title: "This site seems unsafe!",
    subTitle: "Our ranking",
    rankNumber: 43,
    message: "Here are the reasons this site could be harmful.",
    reasons: ["Bad", "Awful", "No Good"],
  };

  or 

  payloadForUserPrompt.rankNumber = 43;
  payloadForUserPrompt.reasons = [...];

---- When we want to trigger the prompt after we determine an score, use the following
  
browser.tabs
  .query({
    currentWindow: true,
  })
  .then(sendMessageToTabs)
  .catch(onError);

*/
function sendMessageToTabs(tabs) {
  for (const tab of tabs) {
    browser.tabs
      .sendMessage(tab.id, payloadForUserPrompt)
      .then((response) => {
        console.log("Message from the content script:");
        console.log(response.response);
      })
      .catch(onError);
  }
}

// Sets the extension's icon to the specified color.
function setIcon(status = "default") {
  console.debug("setting status to: ", status);
  try {
    browser.browserAction.setIcon({ path: "/icons/" + status + ".svg" });
  } catch (e) {
    console.log(e);
  }
}

async function makeWOTRequest(url, callback) {
  const WOTUrl = "https://scorecard.api.mywot.com/v3/targets?t=";
  const requestUrl = WOTUrl + url;

  headers = {
    // NOTE: Add the API key and user ID here.
    "x-user-id": "8866427",
    "x-api-key": "f2b8ef8f223b9943ba9512bc516d375c05a63613",
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

function getData(url) {
  const domain = domain_from_url(url);
  let localStorageData = localStorage.getItem(domain);
  if (localStorageData) {
    return JSON.parse(localStorageData);
  } else {
    return "No data found";
  }
}

// listen for a data request from the popup script
browser.runtime.onMessage.addListener(function (request, sender, sendResponse) {
  if (request.type == "get_data") {
    sendResponse({ data: getData(request.url) });
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
        JSON.stringify({
          wot: json.length > 0 ? json[0] : null,
          score: weight,
        })
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
