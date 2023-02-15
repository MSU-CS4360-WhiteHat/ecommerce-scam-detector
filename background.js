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

// Called when the user clicks on the extension's icon.
browser.browserAction.onClicked.addListener(function (tab) {
  toggleIcon();
});

// Called before the Navigation occurs.
browser.webNavigation.onBeforeNavigate.addListener(function (details) {
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
  const domain = domain_from_url(details.url);

  if (!domain) {
    // No domain found, so just return.
    console.log("No domain found, so just return.");
    return 1;
  }
  console.log("Getting data from local storage for: " + domain);

  const data = localStorage.getItem(domain);

  if (data) {
    console.log("Site " + domain + " has already been scanned");
    console.log("Data for " + domain + " is: " + data);
    return 1;
  } else {
    makeWOTRequest(domain, function (json) {
      localStorage.setItem(domain, json);
    });
  }
});

// Temp Code for testing the toggleIcon function
let color = "red";
function toggleIcon() {
  if (color === "red") {
    color = "yellow";
  } else if (color === "yellow") {
    color = "green";
  } else {
    color = "red";
  }

  setIcon(color);
}

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
    "x-user-id": "8866427",
    "x-api-key": "f2b8ef8f223b9943ba9512bc516d375c05a63613",
  };

  console.log("Making API request to: " + requestUrl);

  fetch(requestUrl, {
    method: "GET",
    headers: headers,
  })
    .then((response) => response.json())
    .then((json) => {
      callback(JSON.stringify(json));
    });
}
