// Sets the broswer to the current window 
const browser = window.browser || window.chrome;

// Listens for changes in the dropdown menu and sends what was chosen
document.getElementById("color-picker").addEventListener("change", function (event) {
  browser.runtime.sendMessage({ color: event.target.value })
});
