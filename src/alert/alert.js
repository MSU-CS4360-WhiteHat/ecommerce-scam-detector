"use strict";

function load_not_secure(values) {
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
  buttonContainer.className += "button-container";
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

browser.runtime.onMessage.addListener((request, sender) => {
  console.log(request);
  load_not_secure(request);
  return Promise.resolve({ response: "Hi from content script" });
});
