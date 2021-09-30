{
    importScripts("functions/types.js")
    importScripts("functions/tabs.js")
    importScripts("functions/messages.js")

    let activeTabInfo: TabInfo | null;


    chrome.runtime.onMessage.addListener(async (request, sender, sendResponse) => {
        let result: any = false;

        const message: Message = request;
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
            } else if (topic === MessageTopics.UpdateTheme) {
                updateBrowserActionIcons(payload);
                result = true;
            }
        }

        sendResponse(result);
    });

    chrome.commands.onCommand.addListener(async (command) => {
        console.log(`Command received: ${command}`);

        if (command === "load-apply") {
            const tabId = await getActiveTabId();
            if (tabId !== null) {
                const tabInfo = await getTabInfo(tabId);
                if (tabInfo !== null && tabInfo.host !== null) {
                    const settings = await loadSettingsFromStorage(tabInfo.host);
                    await setSettingsToPage(tabId, settings);
                }
            }
        }
    });

    chrome.runtime.onInstalled.addListener(initialize);

    chrome.runtime.onStartup.addListener(initialize);

    chrome.tabs.onActivated.addListener(refreshActiveTabInfo);

    chrome.tabs.onUpdated.addListener(refreshActiveTabInfo);


    async function initialize(): Promise<void> {
        // updateBrowserActionIcons();
        await refreshActiveTabInfo();
    }

    async function refreshActiveTabInfo(): Promise<void> {
        const id = await getActiveTabId();
        activeTabInfo = id !== null ? await getTabInfo(id) : null;

        console.log("Active tab changed: " + activeTabInfo?.id + ", " + activeTabInfo?.url);

        await updateBrowserActionState(activeTabInfo?.id ?? null);
    }

    // #region Browser Action
    async function updateBrowserActionState(tabId: number | null): Promise<void> {
        if (tabId !== null) {
            let result: boolean;
            try {
                result = await sendTabMessage<boolean>(tabId, { topic: MessageTopics.GetStatus, payload: null }) ?? false;
            } catch (error) {
                result = false;
            }

            result ? chrome.action.enable(tabId) : chrome.action.disable(tabId);
            console.log(`BrowserAction ${result ? "enabled" : "disabled"}.`);
        }
    }

    function updateBrowserActionIcons(theme: Theme) {
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
    async function invokeGetFromPage(): Promise<void> {
        try {
            await sendRuntimeMessage<boolean>({ topic: MessageTopics.GetSettingsFromPage, payload: null })
        } catch (error) {
            console.error(`Error invoking get-settings-from-page: ${error.message}`);
        }
    }

    async function invokeSetToPage(): Promise<void> {
        try {
            await sendRuntimeMessage<boolean>({ topic: MessageTopics.SetSettingsToPage, payload: null })
        } catch (error) {
            console.error(`Error invoking set-settings-to-page: ${error.message}`);
        }
    }
    // #endregion
}