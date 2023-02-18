const message = "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Proin sed libero enim sed faucibus turpis in. Facilisis mauris sit amet massa vitae tortor. Aenean et tortor at risus viverra adipiscing at. Nec nam aliquam sem et tortor consequat id porta. Aliquet nibh praesent tristique magna sit amet purus gravida. Et ultrices neque ornare aenean euismod elementum nisi quis. Varius sit amet mattis vulputate enim nulla. Quam nulla porttitor massa id neque aliquam vestibulum morbi blandit. Ultrices tincidunt arcu non sodales neque sodales ut etiam. Nisl vel pretium lectus quam. Massa eget egestas purus viverra accumsan in. Dolor sit amet consectetur adipiscing. Elementum nibh tellus molestie nunc non blandit massa enim. Purus in mollis nunc sed id semper risus. Sit amet justo donec enim diam vulputate ut pharetra. Nisl vel pretium lectus quam id leo in vitae. Nibh nisl condimentum id venenatis a. Mauris cursus mattis molestie a iaculis at erat. Sed felis eget velit aliquet sagittis id consectetur purus. Commodo ullamcorper a lacus vestibulum. Massa massa ultricies mi quis hendrerit dolor magna eget est. Lectus mauris ultrices eros in. Lacus luctus accumsan tortor posuere. Velit dignissim sodales ut eu sem integer vitae justo. Mi bibendum neque egestas congue quisque egestas diam in. Volutpat sed cras ornare arcu dui. Elementum integer enim neque volutpat ac tincidunt. Arcu non sodales neque sodales ut etiam sit amet. Purus faucibus ornare suspendisse sed nisi lacus sed. Vitae elementum curabitur vitae nunc sed. Aliquam purus sit amet luctus venenatis.";
function load_not_secure(){
    document.body.classList.add('stop-scrolling');
    window.scrollTo(0, 0);

    let backdrop = document.createElement("div");
    backdrop.className += "container backdrop";
    document.body.appendChild(backdrop);


    let container = document.createElement("div");
    container.className += "container top-container";
    document.body.appendChild(container);

    let header = document.createElement("h1");
    header.textContent = message;
    container.appendChild(header);
}

chrome.runtime.onMessage.addListener(function (msg, sender, sendResponse) {
    // If the received message has the expected format...
    if (msg.text === "warning") {
        // Call the specified callback, passing
        // the web-page's DOM content as argument
        load_not_secure();
        sendResponse(document.all[0].outerHTML);
    }
});
