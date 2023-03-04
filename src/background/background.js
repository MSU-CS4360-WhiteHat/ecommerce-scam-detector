//TODO add back in "use strict";

// Arbitrary numbers, we should adjust them as needed.
const Risk = {
  HIGH: 3,
  MED: 2,
  LOW: 1,
  UNKNOWN: 0,
};

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
  } else if (request.type == "close_current_tab") {
    browser.tabs.query(
      {
        currentWindow: true,
        active: true,
      },
      function (tabs) {
        browser.tabs.remove(tabs[0]?.id);
      }
    );
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
