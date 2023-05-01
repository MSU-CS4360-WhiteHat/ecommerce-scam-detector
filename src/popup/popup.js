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
  let score = data?.score;
  let wot = data?.wot;

  if (!wot) {
    console.error("Missing WOT ratings");
  }

  const target = wot?.target;
  const safetyStatus = wot?.safety?.status
    .split("_")
    .map((word) => word[0] + word.slice(1).toLowerCase())
    .join(" ");
  const reputation = wot?.safety?.reputations;
  const childSafety = wot?.childSafety?.reputations;
  const otherInfo = wot?.categories.map((category) => {
    return category?.name + ": " + category?.confidence + "%";
  });

  let li = null;

  if (score) {
    li = document.createElement("li");
    li.textContent = "Score: " + score;
    siteInfo.appendChild(li);
  }

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
