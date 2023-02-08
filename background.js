// Called when the user clicks on the extension's icon.
browser.browserAction.onClicked.addListener(function (tab) {
  toggleIcon();
});

// Called before the Navigation occurs.
browser.webNavigation.onBeforeNavigate.addListener(function (details) {
  // Consider stopping page load and asking the user if they wish to continue.

  // Consider a way to use the data to make a hash tag to see if the site has change,
  //      if so, then scan again.

  if (!localStorage.getItem("scanned_site")) {
    console.log("Make initial site scans.");

    // TODO Add initial site data to determine if we should scan the site again.
    localStorage.setItem(
      "scanned_site",
      JSON.stringify({ ts: details.timeStamp, site: details.url })
    );
  }
});

// Called when the user navigates to a new page.
browser.webNavigation.onCompleted.addListener(function (details) {
  // Look at local storage
  // If URL exists--and the hash has not changes, do not run API requests.

  // TODO add in deep scan web APIs

  console.log("Navigated to: " + details.url);
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
