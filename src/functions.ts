async function setElementsStateToPage(tabId: number, state: boolean): Promise<void> {
    try {
        await sendTabMessage(tabId, { topic: MessageTopics.SetElementsState, payload: state });
    } catch (error) {
        console.log("Error setting elements state: " + error.message);
    }
}


async function getZoomFromPage(tabId: number): Promise<number> {
    try {
        return await chrome.tabs.getZoom(tabId);
    } catch (error) {
        console.log("Error getting zoom: " + error.message);
        return 0;
    }
}

async function setZoomForPage(tabId: number, zoom: number): Promise<void> {
    try {
        await chrome.tabs.setZoomSettings(tabId, { scope: "per-tab" });
        await chrome.tabs.setZoom(tabId, zoom);
    } catch (error) {
        console.log("Error setting zoom: " + error.message);
    }
}

async function getSettingsFromPage(tabId: number): Promise<PageSettings> {
    try {
        const settings = await sendTabMessage<PageSettings>(tabId, { topic: MessageTopics.GetPageSettings, payload: null })
            ?? createDefaultPageSettings();
        settings.zoomFactor = await getZoomFromPage(tabId);
        return settings;
    } catch (error) {
        console.log(`Error getting settings: ${error}`);
        return createDefaultPageSettings();
    }
}

async function setSettingsToPage(tabId: number, settings: PageSettings): Promise<void> {
    try {
        await sendTabMessage(tabId, { topic: MessageTopics.SetPageSettings, payload: settings });
        await setZoomForPage(tabId, settings.zoomFactor);
    } catch (error) {
        console.log(`Error setting settings: ${error}`);
    }
}