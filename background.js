// Arbitrary numbers, we should adjust them as needed.
const Risk = {
  HIGH: 3,
  MED: 2,
  LOW: 1,
  UNKNOWN: 0,
};

// https://stackoverflow.com/questions/34818020/javascript-regex-url-extract-domain-only
function domain_from_url(url) {
  var result;
  var match;
  if (
    (match = url.match(
      /^(?:https?:\/\/)?(?:[^@\n]+@)?(?:www\.)?([^:\/\n\?\=]+)/im
    ))
  ) {
    result = match[1];
    if ((match = result.match(/^[^\.]+\.(.+\..+)$/))) {
      result = match[1];
    }
  }
  return result;
}

// Opens a dropdown menu when the extension is clicked
browser.browserAction.onClicked.addListener(function (tab) {
  console.log("extension clicked")
  browser.browserAction.setPopup({
    popup: "popup.html"
  });
});

// Listens for what color is chosen from the drowpdown and changes extension icon
browser.runtime.onMessage.addListener(function(request, sender, sendResponse) {
  if (request.color) {
    setIcon(request.color);
  }
});
  
// Called before the Navigation occurs.
browser.webNavigation.onBeforeNavigate.addListener(function (details) {
  // Consider moving this to onCompleted if onBefore is never used.
  const domain = domain_from_url(details.url);
  const riskStatus = localStorage.getItem(domain);

  if (riskStatus == Risk.HIGH) {
    // Consider stopping page load and asking the user if they wish to continue
    // if we deep scan here and find some oddities.
    console.log("Risk is HIGH");
  } else if (!riskStatus) {
    // Consider a please wait while we check if the site is safe?
    // Deep scan here.
    //  If this causes a huge latency before page load, we can move it to onCompleted.

    console.log("Site " + domain + " has not been scanned, scanning now.");
    // TODO replace with an method call to the application service.
    // e.g. const riskResults = someApiFunctionCall() ?? Risk.UNKNOWN
    const riskResults = Risk.UNKNOWN;
    localStorage.setItem(domain, riskResults);
  } else {
    // TODO Debugging else, remove.
    console.log("Site " + domain + " has already been scanned--do nothing");
  }
});

// Called when the user navigates to a new page.
browser.webNavigation.onCompleted.addListener(function (details) {
  console.log("Navigated to: " + details.url);
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