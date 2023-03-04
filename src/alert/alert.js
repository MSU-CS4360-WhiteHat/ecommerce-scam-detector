"use strict";

const app = window?.chrome ?? browser;

function loadNotSecure(values) {
  const title = values?.title;
  const subTitle = values?.subTitle;
  const rankNumber = values?.rankNumber;
  const message = values?.message;
  const reasons = values?.reasons;

  document.body.classList.add("stop-scrolling");
  window.scrollTo(0, 0);
  document.body.parentElement.classList.add("stop-scrolling");

  let backdrop = document.createElement("div");
  let container = document.createElement("div");
  let innerContent = document.createElement("div");
  let hOneTitle = document.createElement("h1");
  let hThreeSubTitle = document.createElement("h3");
  let hTwoRank = document.createElement("h2");
  let pMessage = document.createElement("p");
  let orderedList = document.createElement("ol");
  let buttons = document.createElement("div");
  let buttonContainer = document.createElement("div");
  let stay = document.createElement("button");
  let leave = document.createElement("button");

  backdrop.className += "container backdrop";
  container.className += "container top-container";
  innerContent.className += "innercontent";
  hThreeSubTitle.className += "shadoweffect";
  buttons.className += "buttons";
  buttonContainer.className += "buttons-container-control";
  stay.className += "btn btn-2s btn-2as";
  leave.className += "btn btn-2 btn-2a";

  hOneTitle.innerHTML = title;
  hThreeSubTitle.innerHTML = subTitle;
  hTwoRank.innerHTML = rankNumber;
  pMessage.innerHTML = message;

  reasons.forEach((element) => {
    let listItem = document.createElement("li");
    listItem.innerHTML = element;
    orderedList.appendChild(listItem);
  });

  stay.innerHTML = "Stay";
  leave.innerHTML = "Leave";

  backdrop.id = "main-backdrop";
  container.id = "main-container";
  stay.id = stay.innerHTML.toLowerCase();
  leave.id = leave.innerHTML.toLowerCase();

  document.body.appendChild(backdrop);
  document.body.appendChild(container);
  container.appendChild(innerContent);
  innerContent.appendChild(hOneTitle);
  innerContent.appendChild(hThreeSubTitle);
  innerContent.appendChild(hTwoRank);
  innerContent.appendChild(pMessage);
  innerContent.appendChild(orderedList);
  innerContent.appendChild(buttons);
  buttons.appendChild(buttonContainer);
  buttonContainer.appendChild(stay);
  buttonContainer.appendChild(leave);
}

// https://stackoverflow.com/questions/5525071/how-to-wait-until-an-element-exists
function waitForElm(selector) {
  return new Promise((resolve) => {
    if (document.querySelector(selector)) {
      return resolve(document.querySelector(selector));
    }

    const observer = new MutationObserver((mutations) => {
      if (document.querySelector(selector)) {
        resolve(document.querySelector(selector));
        observer.disconnect();
      }
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true,
    });
  });
}

const closePopup = (e) => {
  console.log(e?.target?.id);
  document.body.classList.remove("stop-scrolling");
  document.body.parentElement.classList.remove("stop-scrolling");
  document.getElementById("main-container").remove();
  document.getElementById("main-backdrop").remove();
};

const closeTab = (e) => {
  console.log(e?.target?.id);
  browser.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    // send a data request to the background script
    browser.runtime.sendMessage(
      { type: "close_current_tab", url: tabs[0]?.url },
      (response) => {
        updateInfo(response.data);
      }
    );
  });
};

app.runtime.onMessage.addListener((request, sender) => {
  console.log(request);
  loadNotSecure(request);
  waitForElm("#stay").then((elm) => {
    console.log("Element is ready");
    console.log(elm.textContent);
    let stay = document.getElementById("stay");
    stay.addEventListener("click", closePopup, false);
  });
  waitForElm("#leave").then((elm) => {
    console.log("Element is ready");
    console.log(elm.textContent);
    let stay = document.getElementById("leave");
    stay.addEventListener("click", closeTab, false);
  });
  return Promise.resolve({ response: "Loaded the popup" });
});

browser.tabs.query({ active: true, currentWindow: true }, (tabs) => {
  // send a data request to the background script
  browser.runtime.sendMessage(
    { type: "close_current_tab", url: tabs[0]?.url },
    (response) => {
      updateInfo(response.data);
    }
  );
});
