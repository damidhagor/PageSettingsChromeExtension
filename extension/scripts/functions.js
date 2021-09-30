var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
// #region PAGE
function getSettingsFromPage(tabId) {
    return __awaiter(this, void 0, void 0, function* () {
        let settings = createDefaultPageSettings();
        try {
            const zoom = yield getZoomFromPage(tabId);
            if (zoom !== null)
                settings.zoomFactor = zoom;
            const scroll = yield getScrollFromPage(tabId);
            if (scroll !== null) {
                settings.scrollX = scroll.x;
                settings.scrollY = scroll.y;
            }
            const elements = yield getElementsFromPage(tabId);
            if (elements !== null)
                settings.elements = elements;
            const hidden = yield getElementsStateFromPage(tabId);
            if (hidden !== null)
                settings.elementsHidden = hidden;
        }
        catch (error) {
            console.error(`Error getting settings from page: ${error.message}`);
        }
        return settings;
    });
}
function setSettingsToPage(tabId, settings) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            yield setZoomSettingsToPage(tabId);
            yield setZoomToPage(tabId, settings.zoomFactor);
            yield setScrollToPage(tabId, { x: settings.scrollX, y: settings.scrollY });
            yield setElementsToPage(tabId, settings.elements);
            yield setElementsStateToPage(tabId, settings.elementsHidden);
        }
        catch (error) {
            console.log("Error setting settings to page: " + error.message);
        }
    });
}
function resetPageSettings(tabId) {
    return __awaiter(this, void 0, void 0, function* () {
        const settings = createDefaultPageSettings();
        try {
            yield setSettingsToPage(tabId, settings);
        }
        catch (error) {
            console.log("Error setting elements state: " + error.message);
        }
        return settings;
    });
}
function getZoomFromPage(tabId) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            return yield chrome.tabs.getZoom(tabId);
        }
        catch (error) {
            console.log("Error getting zoom: " + error.message);
            return null;
        }
    });
}
function getScrollFromPage(tabId) {
    try {
        return new Promise((resolve, reject) => {
            chrome.tabs.sendMessage(tabId, { topic: "getScroll" }, response => {
                if (chrome.runtime.lastError) {
                    console.log("Error getting scroll values from page: " + chrome.runtime.lastError.message);
                    reject(null);
                }
                else if (isScrollValues(response)) {
                    resolve(response);
                }
                else {
                    reject(null);
                }
            });
        });
    }
    catch (error) {
        console.log("Error getting scroll values from page: " + error.message);
        return Promise.resolve(null);
    }
}
function getElementsFromPage(tabId) {
    try {
        return new Promise((resolve, reject) => {
            chrome.tabs.sendMessage(tabId, { topic: "getElements" }, response => {
                if (chrome.runtime.lastError) {
                    console.log("Error getting elements from page: " + chrome.runtime.lastError.message);
                    reject(null);
                }
                else if (typeof response === "string") {
                    resolve(response);
                }
                else {
                    reject(null);
                }
            });
        });
    }
    catch (error) {
        console.log("Error getting elements from page: " + error.message);
        return Promise.resolve(null);
    }
}
function getElementsStateFromPage(tabId) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            return new Promise((resolve, reject) => {
                chrome.tabs.sendMessage(tabId, { topic: "getElementsState" }, response => {
                    if (chrome.runtime.lastError) {
                        console.log("Error getting elements state from page: " + chrome.runtime.lastError.message);
                        reject(null);
                    }
                    else if (typeof response === "boolean") {
                        resolve(response);
                    }
                    else {
                        reject(null);
                    }
                });
            });
        }
        catch (error) {
            console.log("Error getting elements state from page: " + error.message);
            return Promise.resolve(null);
        }
    });
}
function setZoomSettingsToPage(tabId) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            yield chrome.tabs.setZoomSettings(tabId, { scope: "per-tab" });
        }
        catch (error) {
            console.log("Error setting zoom settings: " + error.message);
        }
    });
}
function setZoomToPage(tabId, zoom) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            yield chrome.tabs.setZoom(tabId, zoom);
        }
        catch (error) {
            console.log("Error setting zoom: " + error.message);
        }
    });
}
function setScrollToPage(tabId, scroll) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            yield chrome.tabs.sendMessage(tabId, { topic: "setScroll", scroll: scroll });
        }
        catch (error) {
            console.log("Error setting scroll: " + error.message);
        }
    });
}
function setElementsToPage(tabId, elements) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            yield chrome.tabs.sendMessage(tabId, { topic: "setElements", elements: elements });
        }
        catch (error) {
            console.log("Error setting elements: " + error.message);
        }
    });
}
function setElementsStateToPage(tabId, state) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            yield chrome.tabs.sendMessage(tabId, { topic: "setElementsState", state: state });
        }
        catch (error) {
            console.log("Error setting elements state: " + error.message);
        }
    });
}
function toggleElementsStateOnPage(tabId) {
    try {
        chrome.tabs.sendMessage(tabId, { topic: MessageTopics.ToggleElementsState, payload: null });
    }
    catch (error) {
        console.log("Error toggling elements state: " + error.message);
    }
}
// #endregion
function isHostnameValid(hostname) {
    return hostname !== undefined && hostname !== null && hostname !== "";
}
