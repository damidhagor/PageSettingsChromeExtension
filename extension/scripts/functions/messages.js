var MessageTopics;
(function (MessageTopics) {
    // Messages to Content
    MessageTopics[MessageTopics["GetStatus"] = 0] = "GetStatus";
    MessageTopics[MessageTopics["SetElementsState"] = 1] = "SetElementsState";
    MessageTopics[MessageTopics["GetPageSettings"] = 2] = "GetPageSettings";
    MessageTopics[MessageTopics["SetPageSettings"] = 3] = "SetPageSettings";
    // Messages to Popup
    MessageTopics[MessageTopics["GetSettingsFromPage"] = 4] = "GetSettingsFromPage";
    MessageTopics[MessageTopics["SetSettingsToPage"] = 5] = "SetSettingsToPage";
    // Messages to Background
    MessageTopics[MessageTopics["UpdateTheme"] = 6] = "UpdateTheme";
})(MessageTopics || (MessageTopics = {}));
function isMessage(obj) {
    return "topic" in obj
        && "payload" in obj;
}
function sendTabMessage(tabId, message) {
    return new Promise((resolve, reject) => {
        chrome.tabs.sendMessage(tabId, message, response => {
            if (chrome.runtime.lastError) {
                console.warn(`Error sending message to tab: ${chrome.runtime.lastError.message}`);
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
