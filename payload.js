// send the page html as a chrome message
chrome.runtime.sendMessage({ html: document.documentElement.innerHTML });
