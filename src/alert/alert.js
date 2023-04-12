const app = window?.chrome ?? browser;

const title = document.getElementById("title");
const subTitle = document.getElementById("sub-title");
const rankNumber = document.getElementById("ranking");
const message = document.getElementById("message");
const reasons = document.getElementById("reasons");

const stay = document.getElementById("stay");
const leave = document.getElementById("leave");

// Send messages to background script to close the alert
stay.addEventListener("click", () => {
  app.runtime.sendMessage({
    type: "close_alert",
    shouldStay: true,
  });
});

leave.addEventListener("click", () => {
  app.runtime.sendMessage({
    type: "close_alert",
    shouldStay: false,
  });
});

// listen for messages from the background script to open the alert
app.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.type === "open_alert") {
    // set the data in the alert
    title.innerText = request.payload.title;
    subTitle.innerText = request.payload.subTitle;
    rankNumber.innerText = request.payload.rankNumber;
    message.innerText = request.payload.message;
    reasons.innerHTML = "";
    request.payload.reasons.forEach((reason) => {
      const li = document.createElement("li");
      li.innerText = reason;
      reasons.appendChild(li);
    });
  }
});
