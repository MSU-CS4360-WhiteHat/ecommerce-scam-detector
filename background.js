
// Called when the user clicks on the extension's icon.
browser.browserAction.onClicked.addListener(function (tab) {
    toggleIcon();
});

// Called when the user navigates to a new page.
browser.webNavigation.onCompleted.addListener(function (details) {
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