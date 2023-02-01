chrome.webNavigation.onCompleted.addListener(function (details) {
    console.log("Navigated to: " + details.url);
});