{
    importScripts("functions/messages.js")
    importScripts("functions/tabs.js")
    importScripts("functions/storage.js")
    importScripts("functions/settings.js")
    importScripts("functions/page.js")
    


    chrome.runtime.onMessage.addListener(async (request, sender, sendResponse) => {
        let result: any = false;

        const message: Message = request;
        if (isMessage(message)) {
            const topic = message.topic;
            const payload = message.payload;

            if (topic === MessageTopics.UpdateTheme) {
                updateBrowserActionIcons(payload);
                result = true;
            }
        }

        sendResponse(result);
    });

    chrome.commands.onCommand.addListener(async (command) => {
        console.log(`Command received: ${command}`);

        if (command === "load-apply") {
            const tabInfo = await getActiveTabInfo();
            if (tabInfo !== null && tabInfo.id !== null && tabInfo.host !== null) {
                const settings = await loadSettingsFromStorage(tabInfo.host);
                await setSettingsToPage(tabInfo.id, settings);
            }
        }
    });

    chrome.tabs.onActivated.addListener(refreshActiveTabInfo);
    chrome.tabs.onUpdated.addListener(refreshActiveTabInfo);


    async function refreshActiveTabInfo(): Promise<void> {
        const activeTabInfo = await getActiveTabInfo();

        console.log("Active tab changed: " + activeTabInfo?.id + ", " + activeTabInfo?.url);

        await updateBrowserActionState(activeTabInfo?.id ?? null);
    }


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
}