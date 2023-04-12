browser.runtime.sendMessage(
  { html: document.documentElement.innerHTML },
  function (response) {
    console.log("Response received:", response);
  }
);
