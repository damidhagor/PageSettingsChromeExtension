var activeTabId;
var activeTabUrl;

chrome.runtime.onInstalled.addListener(function () {
    updateBrowserActionIcons();

    chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
        console.log(tabs);
        activeTabId = tabs[0].id;
        activeTabUrl = tabs[0].url != undefined ? tabs[0].url : tabs[0].pendingUrl;

        console.log(activeTabId);
        console.log(activeTabUrl);
        updateBrowserActionState(activeTabId);
    });
});

chrome.runtime.onStartup.addListener(function () {
    updateBrowserActionIcons();

    chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
        console.log(tabs);
        activeTabId = tabs[0].id;
        activeTabUrl = tabs[0].url != undefined ? tabs[0].url : tabs[0].pendingUrl;

        console.log(activeTabId);
        console.log(activeTabUrl);
        updateBrowserActionState(activeTabId);
    });
});

chrome.tabs.onActivated.addListener(function (activeInfo) {
    activeTabId = activeInfo.tabId;

    chrome.tabs.get(activeTabId, function (tab) {
        activeTabUrl = tab.url != undefined ? tab.url : tab.pendingUrl;
    });

    console.log("Active tab changed: " + activeTabId + ", " + activeTabUrl);

    updateBrowserActionState(activeTabId);
});

chrome.tabs.onUpdated.addListener(function (tabId, changeInfo, tab) {
    if (tabId == activeTabId) {
        if (changeInfo.url != undefined)
            activeTabUrl = changeInfo.url;

        console.log("Active tab updated: ", activeTabId + ", " + activeTabUrl);
        updateBrowserActionState(activeTabId);
    }
});


chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
    if (request.updateTheme == true)
        updateBrowserActionIcons();
});



function updateBrowserActionState(tabId) {
    chrome.tabs.sendMessage(tabId, { getStatus: true }, function (response) {
        let enableBrowserAction;

        if (chrome.runtime.lastError)
            enableBrowserAction = false;
        else if (response.status == true)
            enableBrowserAction = true;
        else
            enableBrowserAction = false;

        if (enableBrowserAction)
            chrome.browserAction.enable(tabId);
        else
            chrome.browserAction.disable(tabId);

        console.log("BrowserAction enabled: " + enableBrowserAction);
    });
}

function updateBrowserActionIcons() {
    if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
        console.log("Setting dark mode.");
        chrome.browserAction.setIcon({
            path: {
                "128": "images/dark/icon128.png",
                "48": "images/dark/icon48.png",
                "32": "images/dark/icon32.png",
                "16": "images/dark/icon16.png"
            }
        });
    }
    else {
        console.log("Setting light mode.");
        chrome.browserAction.setIcon({
            path: {
                "128": "images/icon128.png",
                "48": "images/icon48.png",
                "32": "images/icon32.png",
                "16": "images/icon16.png"
            }
        });
    }
}