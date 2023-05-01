browser.tabs.onUpdated.addListener(function (tabId, changeInfo, tab) {
  // Check if the page has finished loading
  if (changeInfo.status === "complete") {
    // Inject the payload.js script into the current tab
    browser.tabs.executeScript(tabId, { file: "payload.js" });

    let eCommerce;
    // Listen to messages from the payload.js script and write to popout.html
    browser.runtime.onMessage.addListener(function (message) {
      if (!message.html) {
        return;
      }

      let webPageString = message.html;
      const parser = new DOMParser();
      const htmlDocument = parser.parseFromString(webPageString, "text/html");
      // const title = htmlDocument.title;

      if (htmlDocument.documentElement.innerHTML.includes("cart")) {
        eCommerce = true;
        console.log("ecommerce: " + eCommerce);
      } else {
        eCommerce = false;
        console.log("ecommerce: " + eCommerce);
      }
    });

    // commenting out because this currently throws an error:
    // Uncaught (in promise) Error: Could not establish connection. Receiving end does not exist.
    // This is what I am working on right now
    // browser.runtime.sendMessage({ type: "ecommerce", value: eCommerce });
  }
});
