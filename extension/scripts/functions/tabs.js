var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
function isTabInfo(obj) {
    return "x" in obj
        && "y" in obj;
}
function getActiveTabId() {
    var _a;
    return __awaiter(this, void 0, void 0, function* () {
        const tabs = yield chrome.tabs.query({ active: true, currentWindow: true });
        return tabs.length > 0 ? (_a = tabs[0].id) !== null && _a !== void 0 ? _a : null : null;
    });
}
function getTabInfo(tabId) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const tab = yield chrome.tabs.get(tabId);
            return createTabInfo(tab);
        }
        catch (error) {
            console.log(`Error getting tab info: ${error.message}`);
            return null;
        }
    });
}
function getActiveTabInfo() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const id = yield getActiveTabId();
            return id !== null ? yield getTabInfo(id) : null;
        }
        catch (error) {
            console.log(`Error getting tab info: ${error.message}`);
            return null;
        }
    });
}
function createTabInfo(tab) {
    var _a, _b;
    try {
        const id = (_a = tab.id) !== null && _a !== void 0 ? _a : null;
        let url = null;
        let hostname = null;
        try {
            if (typeof tab.url === "string")
                url = new URL(tab.url);
            else if (typeof tab.pendingUrl === "string")
                url = new URL(tab.pendingUrl);
            else
                url = null;
        }
        catch (_c) { }
        hostname = (_b = url === null || url === void 0 ? void 0 : url.hostname) !== null && _b !== void 0 ? _b : null;
        return { id: id, url: url, host: hostname };
    }
    catch (error) {
        console.log(`Error creating tab info: ${error.message}`);
        return null;
    }
}
