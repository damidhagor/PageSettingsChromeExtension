var activeTabId;
var activeTabUrl;
var activeTabHostname


chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
    if (request.topic == "getActiveTabInfo")
        sendResponse({ activeTabId: activeTabId, activeTabUrl: activeTabUrl, activeTabHostname: activeTabHostname });
});

chrome.commands.onCommand.addListener(function (command) {
    console.log('Command:', command);
    if (command == "get-from-page") {
        invokeGetFromPage();
    }
    else if (command == "set-to-page") {
        invokeSetToPage();
    }
    else if (command == "load-apply") {
        loadSettingsFromStorage(activeTabHostname, function (settings) {
            setSettingsToPage(activeTabId, settings, function () { });
        });
    }
    else if (command == "save") {
        let settings = {};
        getSettingsFromPage(activeTabId, settings, function (newSettings) {
            saveSettingsToStorage(activeTabHostname, newSettings, function () { });
        });
    }
    else if (command == "toggle-elements") {
        toggleElementsStateOnPage(activeTabId, function () { });
    }
});

chrome.runtime.onInstalled.addListener(initialize);

chrome.runtime.onStartup.addListener(initialize);

chrome.tabs.onActivated.addListener(function (activeInfo) {
    activeTabId = activeInfo.tabId;

    chrome.tabs.get(activeTabId, function (tab) {
        activeTabUrl = tab.url != undefined ? tab.url : tab.pendingUrl;
        try {
            activeTabHostname = activeTabUrl ? new URL(activeTabUrl).hostname : undefined;
        } catch (e) {
            log.console(e.message);
        }
    });

    console.log("Active tab changed: " + activeTabId + ", " + activeTabUrl);

    updateBrowserActionState(activeTabId);
});

chrome.tabs.onUpdated.addListener(function (tabId, changeInfo, tab) {
    if (tabId == activeTabId) {
        if (changeInfo.url != undefined) {
            activeTabUrl = changeInfo.url;
            activeTabHostname = activeTabUrl != undefined ? new URL(activeTabUrl).hostname : undefined;
        }

        console.log("Active tab updated: ", activeTabId + ", " + activeTabUrl);
        updateBrowserActionState(activeTabId);
    }
});


function initialize() {
    updateBrowserActionIcons();

    chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
        console.log(tabs);
        activeTabId = tabs[0].id;
        activeTabUrl = tabs[0].url != undefined ? tabs[0].url : tabs[0].pendingUrl;
        try {
            activeTabHostname = activeTabUrl ? new URL(activeTabUrl).hostname : undefined;
        } catch (e) {
            log.console(e.message);
        }

        console.log(activeTabId);
        console.log(activeTabUrl);
        updateBrowserActionState(activeTabId);
    });
}

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


function invokeGetFromPage(k) {
    chrome.runtime.sendMessage({ topic: "getFromPage" }, function (response) {
        if (chrome.runtime.lastError) {
            console.log("Error invoking getting from page: " + chrome.runtime.lastError.message);
            return;
        }
    });
}

function invokeSetToPage(k) {
    chrome.runtime.sendMessage({ topic: "setToPage" }, function (response) {
        if (chrome.runtime.lastError) {
            console.log("Error invoking setting from page: " + chrome.runtime.lastError.message);
            return;
        }
    });
}