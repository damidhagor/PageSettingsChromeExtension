var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
{
    importScripts("functions/types.js");
    importScripts("functions/tabs.js");
    importScripts("functions/messages.js");
    let activeTabInfo;
    chrome.runtime.onMessage.addListener((request, sender, sendResponse) => __awaiter(this, void 0, void 0, function* () {
        let result = false;
        const message = request;
        if (isMessage(message)) {
            const topic = message.topic;
            const payload = message.payload;
            if (topic === MessageTopics.GetActiveTabInfo) {
                refreshActiveTabInfo()
                    .then(() => {
                    sendResponse(activeTabInfo);
                })
                    .catch((reason) => {
                    console.error(`Error refreshing active tab info: ${reason}`);
                    result = false;
                });
                return true;
            }
            else if (topic === MessageTopics.UpdateTheme) {
                updateBrowserActionIcons(payload);
                result = true;
            }
        }
        sendResponse(result);
    }));
    chrome.commands.onCommand.addListener((command) => __awaiter(this, void 0, void 0, function* () {
        console.log(`Command received: ${command}`);
        if (command === "load-apply") {
            const tabId = yield getActiveTabId();
            if (tabId !== null) {
                const tabInfo = yield getTabInfo(tabId);
                if (tabInfo !== null && tabInfo.host !== null) {
                    const settings = yield loadSettingsFromStorage(tabInfo.host);
                    yield setSettingsToPage(tabId, settings);
                }
            }
        }
    }));
    chrome.runtime.onInstalled.addListener(initialize);
    chrome.runtime.onStartup.addListener(initialize);
    chrome.tabs.onActivated.addListener(refreshActiveTabInfo);
    chrome.tabs.onUpdated.addListener(refreshActiveTabInfo);
    function initialize() {
        return __awaiter(this, void 0, void 0, function* () {
            // updateBrowserActionIcons();
            yield refreshActiveTabInfo();
        });
    }
    function refreshActiveTabInfo() {
        var _a;
        return __awaiter(this, void 0, void 0, function* () {
            const id = yield getActiveTabId();
            activeTabInfo = id !== null ? yield getTabInfo(id) : null;
            console.log("Active tab changed: " + (activeTabInfo === null || activeTabInfo === void 0 ? void 0 : activeTabInfo.id) + ", " + (activeTabInfo === null || activeTabInfo === void 0 ? void 0 : activeTabInfo.url));
            yield updateBrowserActionState((_a = activeTabInfo === null || activeTabInfo === void 0 ? void 0 : activeTabInfo.id) !== null && _a !== void 0 ? _a : null);
        });
    }
    // #region Browser Action
    function updateBrowserActionState(tabId) {
        var _a;
        return __awaiter(this, void 0, void 0, function* () {
            if (tabId !== null) {
                let result;
                try {
                    result = (_a = yield sendTabMessage(tabId, { topic: MessageTopics.GetStatus, payload: null })) !== null && _a !== void 0 ? _a : false;
                }
                catch (error) {
                    result = false;
                }
                result ? chrome.action.enable(tabId) : chrome.action.disable(tabId);
                console.log(`BrowserAction ${result ? "enabled" : "disabled"}.`);
            }
        });
    }
    function updateBrowserActionIcons(theme) {
        if (theme === Theme.DarkMode) {
            console.log("Setting dark mode.");
            chrome.action.setIcon({
                path: {
                    "128": "/images/dark/icon128.png",
                    "48": "/images/dark/icon48.png",
                    "32": "/images/dark/icon32.png",
                    "16": "/images/dark/icon16.png"
                }
            });
        }
        else if (theme === Theme.LightMode) {
            console.log("Setting light mode.");
            chrome.action.setIcon({
                path: {
                    "128": "/images/icon128.png",
                    "48": "/images/icon48.png",
                    "32": "/images/icon32.png",
                    "16": "/images/icon16.png"
                }
            });
        }
    }
    // #endregion
    // #region Page Settings
    function invokeGetFromPage() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                yield sendRuntimeMessage({ topic: MessageTopics.GetSettingsFromPage, payload: null });
            }
            catch (error) {
                console.error(`Error invoking get-settings-from-page: ${error.message}`);
            }
        });
    }
    function invokeSetToPage() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                yield sendRuntimeMessage({ topic: MessageTopics.SetSettingsToPage, payload: null });
            }
            catch (error) {
                console.error(`Error invoking set-settings-to-page: ${error.message}`);
            }
        });
    }
    // #endregion
}
