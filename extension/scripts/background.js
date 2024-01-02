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
    importScripts("functions/messages.js");
    importScripts("functions/tabs.js");
    importScripts("functions/storage.js");
    importScripts("functions/settings.js");
    importScripts("functions/page.js");
    chrome.commands.onCommand.addListener((command) => __awaiter(this, void 0, void 0, function* () {
        console.log(`Command received: ${command}`);
        if (command === "load-apply") {
            const tabInfo = yield getActiveTabInfo();
            if (tabInfo !== null && tabInfo.id !== null && tabInfo.host !== null) {
                const settings = yield loadSettingsFromStorage(tabInfo.host);
                yield setSettingsToPage(tabInfo.id, settings);
            }
        }
    }));
    chrome.tabs.onActivated.addListener(refreshActiveTabInfo);
    chrome.tabs.onUpdated.addListener(refreshActiveTabInfo);
    function refreshActiveTabInfo() {
        var _a;
        return __awaiter(this, void 0, void 0, function* () {
            const activeTabInfo = yield getActiveTabInfo();
            console.log("Active tab changed: " + (activeTabInfo === null || activeTabInfo === void 0 ? void 0 : activeTabInfo.id) + ", " + (activeTabInfo === null || activeTabInfo === void 0 ? void 0 : activeTabInfo.url));
            yield updateBrowserActionState((_a = activeTabInfo === null || activeTabInfo === void 0 ? void 0 : activeTabInfo.id) !== null && _a !== void 0 ? _a : null);
        });
    }
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
}
