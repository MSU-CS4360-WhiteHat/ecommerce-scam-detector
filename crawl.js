// let browser = window.browser || window.chrome;

browser.tabs.onUpdated.addListener(function (tabId, changeInfo, tab) {
  // Check if the page has finished loading
  if (changeInfo.status === "complete") {
    // Inject the payload.js script into the current tab
    browser.tabs.executeScript(tabId, { file: "payload.js" });

    // Listen to messages from the payload.js script and write to popout.html
  }
});

// browser.runtime.onMessage.addListener(function (message) {
//   let webPageString = message.html;
//   const parser = new DOMParser();
//   const htmlDocument = parser.parseFromString(webPageString, "text/html");
//   const title = htmlDocument.title;

//   console.log("Wesbite: " + title);
//   console.log(htmlDocument);

//   if (htmlDocument.documentElement.innerHTML.includes("cart")) {
//     console.log("Found the word 'cart' in the HTML document");
//   } else {
//     console.log("No cart found");
//   }
// });

browser.runtime.onMessage.addListener(function (message) {
  if (!message.html) {
    return;
  }

  let webPageString = message.html;
  const parser = new DOMParser();
  const htmlDocument = parser.parseFromString(webPageString, "text/html");
  const title = htmlDocument.title;

  console.log("Website: " + title);
  console.log(htmlDocument);

  if (htmlDocument.documentElement.innerHTML.includes("cart")) {
    console.log("Found the word 'cart' in the HTML document");
  } else {
    console.log("No cart found");
  }
});
