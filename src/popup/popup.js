const browser = window.browser || window.chrome;

const siteInfo = document.getElementById("site-info");
const moreInfo = document.getElementById("more-info-list");

window.onload = function () {
  browser.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    // send a data request to the background script
    browser.runtime.sendMessage(
      { type: "get_data", url: tabs[0].url },
      (response) => {
        updateInfo(response.data);
      }
    );
  });
};

function updateInfo(data) {
  data = JSON.parse(data).wot;
  console.log(data);
  const target = data.target;
  const safetyStatus = data.safety.status
    .split("_")
    .map((word) => word[0] + word.slice(1).toLowerCase())
    .join(" ");
  const reputation = data.safety.reputations;
  const childSafety = data.childSafety.reputations;
  const otherInfo = data.categories.map((category) => {
    return category.name + ": " + category.confidence + "%";
  });

  let li = null;
  if (target) {
    li = document.createElement("li");
    li.innerHTML = "Site: " + target;
    siteInfo.appendChild(li);
  }

  if (safetyStatus) {
    statusEl = document.createElement("span");
    statusEl.innerHTML = safetyStatus;
    statusEl.dataset.status = safetyStatus;
    statusEl.className = "status";

    li = document.createElement("li");
    li.innerHTML = "Safety Status: ";
    li.appendChild(statusEl);
    siteInfo.appendChild(li);
  }

  if (reputation) {
    li = document.createElement("li");
    li.innerHTML = "Reputation: " + reputation + "%";
    siteInfo.appendChild(li);
  }

  if (childSafety) {
    li = document.createElement("li");
    li.innerHTML = "Child Safety: " + childSafety + "%";
    siteInfo.appendChild(li);
  }

  if (otherInfo) {
    otherInfo.forEach((info) => {
      li = document.createElement("li");
      li.innerHTML = info;
      moreInfo.appendChild(li);
    });
  }
}
