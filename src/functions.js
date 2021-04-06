// BACKGROUND FUNCTIONS
function getActiveTabInfo(callback) {
    chrome.runtime.sendMessage({ topic: "getActiveTabInfo" }, function (response) {
        if (chrome.runtime.lastError) {
            console.log("Error getting active tab: " + chrome.runtime.lastError.message);
            return;
        }

        callback(response.activeTabId, response.activeTabHostname)
    });
}


// STORAGE FUNCTIONS
function loadSettingsFromStorage(key, callback) {
    chrome.storage.sync.get({ [key]: { zoomFactor: undefined, scrollX: undefined, scrollY: undefined, elements: undefined } }, function (result) {
        if (chrome.runtime.lastError) {
            console.log("Error loading settings: " + chrome.runtime.lastError.message);
            return;
        }

        callback(result[key]);
    });
}

function saveSettingsToStorage(key, settings, callback) {
    chrome.storage.sync.set({ [key]: settings }, function () {
        if (chrome.runtime.lastError) {
            console.log("Error saving settings: " + chrome.runtime.lastError.message);
            return;
        }

        callback();
    });
}

function clearSettingsFromStorage(key, callback) {
    chrome.storage.sync.remove(key, function () {
        if (chrome.runtime.lastError) {
            console.log("Error clearing settings: " + chrome.runtime.lastError.message);
            return;
        }

        callback();
    });
}


// PAGE FUNCTIONS
function getSettingsFromPage(tabId, settings, callback) {
    getZoomFromPage(tabId, settings, function (newSettings) {
        getScrollFromPage(tabId, newSettings, function (newSettings) {
            getElementsFromPage(tabId, newSettings, function (newSettings) {
                getElementsStateFromPage(tabId, newSettings, function (newSettings) {
                    callback(newSettings);
                });
            });
        });
    });
}

function setSettingsToPage(tabId, settings, callback) {
    setZoomToPage(tabId, settings, function () {
        setScrollToPage(tabId, settings, function () {
            setElementsToPage(tabId, settings, function () {
                setElementsStateToPage(tabId, settings, function () {
                    callback();
                });
            })
        })
    })
}

function resetPageSettings(tabId, settings, callback) {
    resetSettings(settings);
    setSettingsToPage(tabId, settings, function () {
        callback(settings);
    });
}

function getZoomFromPage(tabId, settings, callback) {
    chrome.tabs.getZoom(tabId, function (zoomFactor) {
        if (chrome.runtime.lastError) {
            console.log("Error getting zoom: " + chrome.runtime.lastError.message);
            return;
        }

        settings.zoomFactor = zoomFactor;
        callback(settings);
    });
}

function getScrollFromPage(tabId, settings, callback) {
    chrome.tabs.sendMessage(tabId, { topic: "getScroll" }, function (response) {
        if (chrome.runtime.lastError) {
            console.log("Error getting scroll: " + chrome.runtime.lastError.message);
            return;
        }

        settings.scrollX = response.scrollX;
        settings.scrollY = response.scrollY;

        callback(settings);
    });
}

function getElementsFromPage(tabId, settings, callback) {
    chrome.tabs.sendMessage(tabId, { topic: "getElements" }, function (response) {
        if (chrome.runtime.lastError) {
            console.log("Error getting elements: " + chrome.runtime.lastError.message);
            return;
        }

        settings.elements = response.elements;
        callback(settings);
    });
}

function getElementsStateFromPage(tabId, settings, callback) {
    chrome.tabs.sendMessage(tabId, { topic: "getElementsState" }, function (response) {
        if (chrome.runtime.lastError) {
            console.log("Error getting elements state: " + chrome.runtime.lastError.message);
            return;
        }

        settings.elementsHidden = response.state;
        callback(settings);
    });
}

function setZoomToPage(tabId, settings, callback) {
    chrome.tabs.setZoom(tabId, settings.zoomFactor, function (response) {
        if (chrome.runtime.lastError) {
            console.log("Error setting zoom: " + chrome.runtime.lastError.message);
            return;
        }
        callback();
    });
}

function setScrollToPage(tabId, settings, callback) {
    chrome.tabs.sendMessage(tabId, { topic: "setScroll", scrollX: settings.scrollX, scrollY: settings.scrollY }, function (response) {
        if (chrome.runtime.lastError) {
            console.log("Error setting scroll: " + chrome.runtime.lastError.message);
            return;
        }

        callback();
    });
}

function setElementsToPage(tabId, settings, callback) {
    chrome.tabs.sendMessage(tabId, { topic: "setElements", elements: settings.elements }, function (response) {
        if (chrome.runtime.lastError) {
            console.log("Error setting elements: " + chrome.runtime.lastError.message);
            return;
        }

        callback();
    });
}

function setElementsStateToPage(tabId, settings, callback) {
    chrome.tabs.sendMessage(tabId, { topic: "setElementsState", state: settings.elementsHidden }, function (response) {
        if (chrome.runtime.lastError) {
            console.log("Error setting elements state: " + chrome.runtime.lastError.message);
            return;
        }

        callback();
    });
}

function toggleElementsStateOnPage(tabId, callback) {
    chrome.tabs.sendMessage(tabId, { topic: "toggleElementsState" }, function (response) {
        if (chrome.runtime.lastError) {
            console.log("Error toggling elements state: " + chrome.runtime.lastError.message);
            return;
        }

        callback();
    });
}


// SETTINGS FUNCTIONS
function resetSettingsObject(settings) {
    settings.zoomFactor = undefined;
    settings.scrollX = undefined;
    settings.scrollY = undefined;
    settings.elements = undefined;
    settings.elementsHidden = false;
}

function defaultSettingsObject(settings) {
    settings.zoomFactor = 1.0;
    settings.scrollX = 0.0;
    settings.scrollY = 0.0;
    settings.elements = "";
    settings.elementsHidden = false;
}