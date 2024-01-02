{
    importScripts("functions/messages.js")
    importScripts("functions/tabs.js")
    importScripts("functions/storage.js")
    importScripts("functions/settings.js")
    importScripts("functions/page.js")
    

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
}