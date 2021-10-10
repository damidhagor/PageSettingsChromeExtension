var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
function getZoomFromPage(tabId) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            return yield chrome.tabs.getZoom(tabId);
        }
        catch (error) {
            console.log("Error getting zoom: " + error.message);
            return 0;
        }
    });
}
function setZoomForPage(tabId, zoom) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            yield chrome.tabs.setZoomSettings(tabId, { scope: "per-tab" });
            yield chrome.tabs.setZoom(tabId, zoom);
        }
        catch (error) {
            console.log("Error setting zoom: " + error.message);
        }
    });
}
function getSettingsFromPage(tabId) {
    var _a;
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const settings = (_a = yield sendTabMessage(tabId, { topic: MessageTopics.GetPageSettings, payload: null })) !== null && _a !== void 0 ? _a : createDefaultPageSettings();
            settings.zoomFactor = yield getZoomFromPage(tabId);
            return settings;
        }
        catch (error) {
            console.log(`Error getting settings: ${error}`);
            return createDefaultPageSettings();
        }
    });
}
function setSettingsToPage(tabId, settings) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            yield sendTabMessage(tabId, { topic: MessageTopics.SetPageSettings, payload: settings });
            yield setZoomForPage(tabId, settings.zoomFactor);
        }
        catch (error) {
            console.log(`Error setting settings: ${error}`);
        }
    });
}
function setElementsStateToPage(tabId, state) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            yield sendTabMessage(tabId, { topic: MessageTopics.SetElementsState, payload: state });
        }
        catch (error) {
            console.log("Error setting elements state: " + error.message);
        }
    });
}
