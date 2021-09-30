interface Message {
    topic: MessageTopics,
    payload: any | null
}

enum MessageTopics {
    // Messages to Content
    GetStatus,
    GetScroll,
    SetScroll,
    GetElementsQuery,
    SetElementsQuery,
    GetElementsState,
    SetElementsState,
    ToggleElementsState,
    // Messages to Popup
    GetSettingsFromPage,
    SetSettingsToPage,
    // Messages to Background
    UpdateTheme,
    GetActiveTabInfo
}

function isMessage(obj: any): obj is Message {
    return "topic" in obj
        && "payload" in obj;
}



function sendTabMessage<Type>(tabId: number, message: Message): Promise<Type | null> {
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

function sendRuntimeMessage<Type>(message: Message): Promise<Type | null> {
    return new Promise((resolve, reject) => {
        chrome.runtime.sendMessage(message, response => {
            if (chrome.runtime.lastError) {
                console.error(`Error sending message to runtime: ${chrome.runtime.lastError.message}`);
            }

            response ? resolve(response) : reject();
        });
    });
}