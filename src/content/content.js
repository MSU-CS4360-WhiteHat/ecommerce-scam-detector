const app = window?.chrome ?? browser;

// keeps track of whether the alert is open
// otherwise it will infinitely open the alert
let isAlertOpen = false;

// the iframe that displays the alert
let iframe;

// notify the background script that the content script is ready
app.runtime.sendMessage({
  type: "tab_loaded",
  url: window.location.href,
});

// opens the alert
function openAlert() {
  if (isAlertOpen) {
    return;
  }
  // create an iframe to display the alert
  // the iframe sits as the first child of the body but fills the entire page
  iframe = document.createElement("iframe");
  iframe.src = app.runtime.getURL("src/alert/alert.html");
  iframe.id = "scam-detector-alert-iframe";

  // insert the iframe above the header
  document.body.insertBefore(iframe, document.body.firstChild);

  // disable scrolling on the page
  document.body.style.overflow = "hidden";

  isAlertOpen = true;
}

// listen for messages from the background script
app.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.type === "open_alert") {
    openAlert();
    app.runtime.sendMessage({
      type: "alert_opened",
    });
  } else if (request.type === "close_alert") {
    console.log("closing alert");
    // close the alert
    iframe?.remove();
    document.body.style.overflow = "auto";

    // if the user wants to leave the site, redirect them
    if (!request.shouldStay) {
      window.location.href = "https://www.google.com/";
    }
  }
});
