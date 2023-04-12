const browser = window.browser || window.chrome;

// send the page html as a chrome message
browser.runtime.sendMessage({ html: document.documentElement.innerHTML });

// const browser = window.browser || window.chrome;

// function sendPageHtml() {
//   // check if the "sentPageHtml" flag is set in localStorage
//   if (!localStorage.getItem("sentPageHtml")) {
//     // send the page html as a chrome message
//     browser.runtime.sendMessage({ html: document.documentElement.innerHTML });

//     // set the "sentPageHtml" flag in localStorage
//     localStorage.setItem("sentPageHtml", true);
//   }
// }

// // add event listener for the DOMContentLoaded event
// document.addEventListener("DOMContentLoaded", sendPageHtml, { once: true });

// // add message listener to ignore any updates
// chrome.runtime.onMessage.addListener(function (message, sender, sendResponse) {
//   if (message.ignoreUpdates) {
//     // remove the "sentPageHtml" flag from localStorage
//     localStorage.removeItem("sentPageHtml");
//   }
// });
