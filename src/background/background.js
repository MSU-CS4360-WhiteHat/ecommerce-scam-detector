//TODO add back in "use strict";

const debug = true;

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
    if (!debug) {
      makeWOTRequest(domain, function (json) {
        console.log(json);
        localStorage.setItem(domain, json);
        data = json;
      });
    }
  }
});

// Checks for SSL Certificate on website
// TODO: do not check on brand new tab
// TODO: save to local storage?
chrome.tabs.onUpdated.addListener(async (tabId, changeInfo, tab) => {
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
  }
});

// whois
function whois(domain, callback) {
  const whoisServer = "whois.verisign-grs.com";
  const whoisPort = 43;
  let response = "";

  // Create a new socket and connect to the WHOIS server
  chrome.sockets.tcp.create({}, (createInfo) => {
    chrome.sockets.tcp.connect(
      createInfo.socketId,
      whoisServer,
      whoisPort,
      () => {
        const query = domain + "\r\n";
        const buffer = new ArrayBuffer(query.length);
        const data = new Uint8Array(buffer);
        for (let i = 0; i < query.length; i++) {
          data[i] = query.charCodeAt(i);
        }
        chrome.sockets.tcp.send(createInfo.socketId, buffer, () => {
          // Handle incoming data from the server
          chrome.sockets.tcp.onReceive.addListener((info) => {
            if (info.socketId === createInfo.socketId && info.data) {
              response += String.fromCharCode.apply(
                null,
                new Uint8Array(info.data)
              );
            }
          });
          // Handle the end of the response
          chrome.sockets.tcp.onReceive.addListener((info) => {
            if (
              info.socketId === createInfo.socketId &&
              info.data.byteLength === 0
            ) {
              callback(response);
              chrome.sockets.tcp.close(createInfo.socketId);
            }
          });
        });
      }
    );
  });
}
