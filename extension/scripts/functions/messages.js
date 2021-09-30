var MessageTopics;
(function (MessageTopics) {
    // Messages to Content
    MessageTopics[MessageTopics["GetStatus"] = 0] = "GetStatus";
    MessageTopics[MessageTopics["GetScroll"] = 1] = "GetScroll";
    MessageTopics[MessageTopics["SetScroll"] = 2] = "SetScroll";
    MessageTopics[MessageTopics["GetElementsQuery"] = 3] = "GetElementsQuery";
    MessageTopics[MessageTopics["SetElementsQuery"] = 4] = "SetElementsQuery";
    MessageTopics[MessageTopics["GetElementsState"] = 5] = "GetElementsState";
    MessageTopics[MessageTopics["SetElementsState"] = 6] = "SetElementsState";
    MessageTopics[MessageTopics["ToggleElementsState"] = 7] = "ToggleElementsState";
    // Messages to Popup
    MessageTopics[MessageTopics["GetSettingsFromPage"] = 8] = "GetSettingsFromPage";
    MessageTopics[MessageTopics["SetSettingsToPage"] = 9] = "SetSettingsToPage";
    // Messages to Background
    MessageTopics[MessageTopics["UpdateTheme"] = 10] = "UpdateTheme";
    MessageTopics[MessageTopics["GetActiveTabInfo"] = 11] = "GetActiveTabInfo";
})(MessageTopics || (MessageTopics = {}));
function isMessage(obj) {
    return "topic" in obj
        && "payload" in obj;
}
function sendTabMessage(tabId, message) {
    return new Promise((resolve, reject) => {
        chrome.tabs.sendMessage(tabId, message, response => {
            if (chrome.runtime.lastError) {
                console.error(`Error sending message to tab: ${chrome.runtime.lastError.message}`);
            }
            console.log(`Response: ${response}`);
            response ? resolve(response) : reject();
        });
    });
}
function sendRuntimeMessage(message) {
    return new Promise((resolve, reject) => {
        chrome.runtime.sendMessage(message, response => {
            if (chrome.runtime.lastError) {
                console.error(`Error sending message to runtime: ${chrome.runtime.lastError.message}`);
            }
            response ? resolve(response) : reject();
        });
    });
}
