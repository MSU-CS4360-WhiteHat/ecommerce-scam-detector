"use strict";

// Arbitrary numbers, we should adjust them as needed.
const Risk = {
  HIGH: 3,
  MED: 2,
  LOW: 1,
  UNKNOWN: 0,
};

function domain_from_url(url) {
  return url.split("/")[2];
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
});

function onError(error) {
  console.error(`Error: ${error}`);
}

function sendMessageToTabs(tabs) {
  console.info(tabs);
  for (const tab of tabs) {
    const data = {
      title: "This site seems unsafe!",
      subTitle: "Our ranking",
      rankNumber: 43,
      message: "Here are the reasons this site could be harmful.",
      reasons: ["Bad", "Awful", "No Good"],
    };
    browser.tabs
      .sendMessage(tab.id, data)
      .then((response) => {
        console.log("Message from the content script:");
        console.log(response.response);
      })
      .catch(onError);
  }
}

// Called when the user navigates to a new page.
browser.webNavigation.onCompleted.addListener(function (details) {
  browser.tabs
    .query({
      currentWindow: true,
      active: true,
    })
    .then(sendMessageToTabs)
    .catch(onError);

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
      console.log(json);
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

function makeWOTRequest(url, callback) {
  let WOTUrl = "https://scorecard.api.mywot.com/v3/targets?t=";
  let requestUrl = WOTUrl + url;

  headers = {
    // NOTE: Add the API key and user ID here.
    "x-user-id": "",
    "x-api-key": "",
  };

  console.log("Making API request to: " + requestUrl);

  fetch(requestUrl, {
    method: "GET",
    headers: headers,
  })
    .then((response) => response.json())
    .then((json) => {
      callback(json.length > 0 ? JSON.stringify(json[0]) : null);
    });
}
