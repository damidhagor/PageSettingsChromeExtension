// #region PAGE
async function getSettingsFromPage(tabId: number): Promise<PageSettings> {
    let settings: PageSettings = createDefaultPageSettings();

    try {
        const zoom = await getZoomFromPage(tabId);
        if (zoom !== null) settings.zoomFactor = zoom;

        const scroll = await getScrollFromPage(tabId);
        if (scroll !== null) { settings.scrollX = scroll.x; settings.scrollY = scroll.y; }

        const elements = await getElementsFromPage(tabId);
        if (elements !== null) settings.elements = elements;

        const hidden = await getElementsStateFromPage(tabId);
        if (hidden !== null) settings.elementsHidden = hidden;
    } catch (error) {
        console.error(`Error getting settings from page: ${error.message}`);
    }

    return settings;
}

async function setSettingsToPage(tabId: number, settings: PageSettings): Promise<void> {
    try {
        await setZoomSettingsToPage(tabId);
        await setZoomToPage(tabId, settings.zoomFactor);
        await setScrollToPage(tabId, { x: settings.scrollX, y: settings.scrollY });
        await setElementsToPage(tabId, settings.elements);
        await setElementsStateToPage(tabId, settings.elementsHidden);
    } catch (error) {
        console.log("Error setting settings to page: " + error.message);
    }
}

async function resetPageSettings(tabId: number): Promise<PageSettings> {
    const settings = createDefaultPageSettings();

    try {
        await setSettingsToPage(tabId, settings);
    } catch (error) {
        console.log("Error setting elements state: " + error.message);
    }

    return settings;
}

async function getZoomFromPage(tabId: number): Promise<number | null> {
    try {
        return await chrome.tabs.getZoom(tabId);
    } catch (error) {
        console.log("Error getting zoom: " + error.message);
        return null;
    }
}

function getScrollFromPage(tabId: number): Promise<ScrollValues | null> {
    try {
        return new Promise((resolve, reject) => {
            chrome.tabs.sendMessage(tabId, { topic: "getScroll" }, response => {
                if (chrome.runtime.lastError) {
                    console.log("Error getting scroll values from page: " + chrome.runtime.lastError.message);
                    reject(null);
                } else if (isScrollValues(response)) {
                    resolve(response);
                } else {
                    reject(null);
                }
            });
        });
    } catch (error) {
        console.log("Error getting scroll values from page: " + error.message);
        return Promise.resolve(null);
    }
}

function getElementsFromPage(tabId: number): Promise<string | null> {
    try {
        return new Promise((resolve, reject) => {
            chrome.tabs.sendMessage(tabId, { topic: "getElements" }, response => {
                if (chrome.runtime.lastError) {
                    console.log("Error getting elements from page: " + chrome.runtime.lastError.message);
                    reject(null);
                } else if (typeof response === "string") {
                    resolve(response);
                } else {
                    reject(null);
                }
            });
        });
    } catch (error) {
        console.log("Error getting elements from page: " + error.message);
        return Promise.resolve(null);
    }
}

async function getElementsStateFromPage(tabId: number): Promise<boolean | null> {
    try {
        return new Promise((resolve, reject) => {
            chrome.tabs.sendMessage(tabId, { topic: "getElementsState" }, response => {
                if (chrome.runtime.lastError) {
                    console.log("Error getting elements state from page: " + chrome.runtime.lastError.message);
                    reject(null);
                } else if (typeof response === "boolean") {
                    resolve(response);
                } else {
                    reject(null);
                }
            });
        });
    } catch (error) {
        console.log("Error getting elements state from page: " + error.message);
        return Promise.resolve(null);
    }
}

async function setZoomSettingsToPage(tabId: number): Promise<void> {
    try {
        await chrome.tabs.setZoomSettings(tabId, { scope: "per-tab" });
    } catch (error) {
        console.log("Error setting zoom settings: " + error.message);
    }
}

async function setZoomToPage(tabId: number, zoom: number): Promise<void> {
    try {
        await chrome.tabs.setZoom(tabId, zoom);
    } catch (error) {
        console.log("Error setting zoom: " + error.message);
    }
}

async function setScrollToPage(tabId: number, scroll: ScrollValues): Promise<void> {
    try {
        await chrome.tabs.sendMessage(tabId, { topic: "setScroll", scroll: scroll });
    } catch (error) {
        console.log("Error setting scroll: " + error.message);
    }
}

async function setElementsToPage(tabId: number, elements: string | null): Promise<void> {
    try {
        await chrome.tabs.sendMessage(tabId, { topic: "setElements", elements: elements });
    } catch (error) {
        console.log("Error setting elements: " + error.message);
    }
}

async function setElementsStateToPage(tabId: number, state: boolean): Promise<void> {
    try {
        await chrome.tabs.sendMessage(tabId, { topic: "setElementsState", state: state });
    } catch (error) {
        console.log("Error setting elements state: " + error.message);
    }
}

function toggleElementsStateOnPage(tabId: number) {
    try {
        chrome.tabs.sendMessage(tabId, { topic: MessageTopics.ToggleElementsState, payload: null });
    } catch (error) {
        console.log("Error toggling elements state: " + error.message);
    }
}
// #endregion


function isHostnameValid(hostname: string | null | undefined): boolean {
    return hostname !== undefined && hostname !== null && hostname !== "";
}