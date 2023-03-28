let data = null;

function domain_from_url(url) {
  return url.split("/")[2];
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

  let localStorageData = localStorage.getItem(domain);

  if (localStorageData) {
    console.log("Site " + domain + " has already been scanned");
    console.log("Data for " + domain + " is: " + data);
    data = JSON.parse(data);
  } else {
    makeWOTRequest(domain, function (json) {
      localStorage.setItem(domain, json);
      data = json;
      // Iterate through each category and compile weight
      let weight = 100;
      data[0]?.categories.forEach((category) => {
        weight = new Evaluate()
          .setWeight(weight)
          .setCategoryId(category.id)
          .setConfidence(category.confidence)
          .setValues([0, 2, 4, 8]) // if not set, defaults to [0,1,2,3]
          .setIsSecure(true) // Set using the scraper tool
          .setHasSslCert(true) // Set using the scraper tool
          .evaluateWeight()
          .getWeight();
      });
      console.warn(weight);
    }).catch((error) => console.error(error));
  }
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

async function makeWOTRequest(url, callback) {
  const WOTUrl = "https://scorecard.api.mywot.com/v3/targets?t=";
  const requestUrl = WOTUrl + url;

  headers = {
    // NOTE: Add the API key and user ID here.
    "x-user-id": "8866427",
    "x-api-key": "f2b8ef8f223b9943ba9512bc516d375c05a63613",
    // "x-user-id": process.env.X_USER_ID,
    // "x-api-key": process.env.X_API_KEY,
  };

  console.log("Making API request to: " + requestUrl);

  /**
   * In summary, use await fetch() when you need to perform some operation with the data obtained
   * from the HTTP response before proceeding with the next line of code, and use fetch() with
   * then() when you want to perform multiple asynchronous operations in a specific order.
   */
  const response = await fetch(requestUrl, {
    method: "GET",
    headers: headers,
  });
  const json = await response.json();

  callback(json);
}
