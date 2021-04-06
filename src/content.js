var hostname = undefined;
var elementsString = undefined;
var hiddenElements;


window.matchMedia('(prefers-color-scheme: dark)').addListener(({ matches }) => {
    chrome.runtime.sendMessage({ updateTheme: true });
});

window.addEventListener("load", function (event) {
    hostname = window.location.hostname;
    console.log("RemoveDOMElementsBrowserExtension loaded for " + hostname + "!");
});

chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
    if (request.getStatus == true) {
        sendResponse({ status: true });
    }
    else if (request.topic == "getScroll") {
        sendResponse({ scrollX: window.scrollX, scrollY: window.scrollY });
    }
    else if (request.topic == "setScroll") {
        window.scroll(request.scrollX, request.scrollY);
        sendResponse({ status: true });
    }
    else if (request.topic == "getElements") {
        sendResponse({ elements: elementsString });
    }
    else if (request.topic == "setElements") {
        elementsString = request.elements;
        sendResponse({ status: true });
    }
    else if (request.topic == "setElementsState") {
        if (request.hide)
            hideElements();
        else
            showElements();
        sendResponse({ status: true });
    }
    else {
        sendResponse({ status: false });
    }
});

function showElements() {
    if (hiddenElements)
        hiddenElements.show();
}

function hideElements() {
    showElements();

    let query = elementsString;

    console.log("Hide query: " + query);

    hiddenElements = undefined;
    if (query != undefined) {
        hiddenElements = $(query);
        hiddenElements.hide();
    }

    console.log("Hidden elements: ", hiddenElements);
}