chrome.tabs.onUpdated.addListener(function (tabId, changeInfo, tab) {
  // Check if the page has finished loading
  if (changeInfo.status === "complete") {
    // Inject the payload.js script into the current tab
    chrome.tabs.executeScript(tabId, { file: "payload.js" });

    // Listen to messages from the payload.js script and write to popout.html
    chrome.runtime.onMessage.addListener(function (message) {
      console.log(message.html);
      document.getElementById("pagecontent").innerHTML = message.html;
    });
  }
});
