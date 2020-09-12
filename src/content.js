var hiddenElements;

// SETTINGS
var settings =
{
    hostname: undefined,
    isEnabled: false,
    elements: undefined,
    classes: undefined
};


window.addEventListener("load", function (event) {
    settings.hostname = window.location.hostname;
    loadExtensionSettings();
});



window.matchMedia('(prefers-color-scheme: dark)').addListener(({ matches }) => {
    chrome.runtime.sendMessage({ updateTheme: true });
});

chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
    if (request.getStatus == true) {
        sendResponse({ status: true });
    }
    else if (request.sendSettings == true) {
        settings = request.settings;
        applySettings();
        sendResponse({ status: true });
    }
    else if (request.getSettings == true) {
        sendResponse(settings);
    }
    else {
        sendResponse({ status: false });
    }
});


function loadExtensionSettings() {
    chrome.storage.sync.get({
        autoApplyWebsitesList: []
    }, function (items) {
        if (items.autoApplyWebsitesList.includes(window.location.hostname))
            autoApplySettings();
    });
}



function applySettings() {
    showElements();
    if (settings.isEnabled == true)
        hideElements();
}

function hideElements() {
    let query = undefined;
    let elementQuery = undefined;
    let classQuery = undefined;

    console.log(settings);

    if (settings.elements && settings.elements.length > 0)
        query = settings.elements.join(",");
    if (settings.classes && settings.classes.length > 0)
        query = query == undefined ? settings.classes.join(",")
            : query + "," + settings.classes.join(",");

    console.log("Hide query: " + query);

    hiddenElements = undefined;
    if (query != undefined) {
        hiddenElements = $(query);
        hiddenElements.hide();
    }

    console.log("Hidden elements: ", hiddenElements);
}

function showElements() {
    if (hiddenElements)
        hiddenElements.show();
}