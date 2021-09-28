// #region STORAGE
async function loadSettingsFromStorage(key: string): Promise<PageSettings> {
    try {
        let results = await chrome.storage.sync.get(key);

        return (results !== null && key in results && isPageSettings(results[key])) ? results[key] : createDefaultPageSettings();
    } catch (error) {
        console.log("Error saving settings: " + error.message);
        return createDefaultPageSettings();
    }
}

async function saveSettingsToStorage(key: string, settings: PageSettings): Promise<void> {
    try {
        await chrome.storage.sync.set({ [key]: settings });
    } catch (error) {
        console.log("Error saving settings: " + error.message);
    }
}

async function clearSettingsFromStorage(key: string): Promise<void> {
    try {
        await chrome.storage.sync.remove(key);
    } catch (error) {
        console.log("Error clearing settings: " + error.message);
    }
}

async function loadAllSettingsFromStorage(): Promise<PageSettingsCollection> {
    try {
        let results = await chrome.storage.sync.get(null);

        let settings: PageSettingsCollection = {};
        let keys = Object.keys(results).filter(key => isPageSettings(results[key]));
        keys.forEach(key => {
            settings[key] = results[key] as PageSettings;
        });

        return settings;
    } catch (error) {
        console.log("Error loading all settings: " + error.message);
        return {};
    }
}

async function saveAllSettingsToStorage(settings: PageSettingsCollection): Promise<void> {
    try {
        await chrome.storage.sync.set(settings);
    } catch (error) {
        console.log("Error saving all settings: " + error.message);
    }
}
// #endregion


// #region PAGE
async function getTabInfo(tabId: number): Promise<TabInfo | null> {
    try {
        const tab = await chrome.tabs.get(tabId);

        const id = tab.id ?? null;
        let url = null;
        let hostname = null;

        try {
            if (typeof tab.url === "string")
                url = new URL(tab.url);
            else if (typeof tab.pendingUrl === "string")
                url = new URL(tab.pendingUrl);
        } catch { }

        if (url !== null)
            hostname = url.hostname;

        return { id: id, url: url, host: hostname };
    } catch (error) {
        console.log("Error getting tab info: " + error.message);
        return null;
    }
}

async function getSettingsFromPage(tabId: number): Promise<void> {
    try {
        let settings: PageSettings = createDefaultPageSettings();

        const zoom = await getZoomFromPage(tabId);
        if (zoom !== null) settings.zoomFactor = zoom;

        const scroll = await getScrollFromPage(tabId);
        if (scroll !== null) { settings.scrollX = scroll.x; settings.scrollY = scroll.y; }

        const elements = await getElementsFromPage(tabId);
        if (elements !== null) settings.elements = elements;

        const hidden = await getElementsStateFromPage(tabId);
        if (hidden !== null) settings.elementsHidden = hidden;
    } catch (error) {
        console.log("Error getting settings from page: " + error.message);
    }
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

async function toggleElementsStateOnPage(tabId: number): Promise<void> {
    try {
        await chrome.tabs.sendMessage(tabId, { topic: "toggleElementsState" });
    } catch (error) {
        console.log("Error toggling elements state: " + error.message);
    }
}
// #endregion


// #region SETTINGS
function createDefaultPageSettings(): PageSettings {
    return { zoomFactor: 1.0, scrollX: 0.0, scrollY: 0.0, elements: null, elementsHidden: false, };
};

function isHostnameValid(hostname: string | null | undefined): boolean {
    return hostname !== undefined && hostname !== null && hostname !== "";
}
// #endregion


// #region IMPORT/EXPORT
async function exportSettingsToFile(): Promise<void> {
    let settings = await loadAllSettingsFromStorage();

    let serialized = serializeSettings(settings);
    await downloadSerializedSettings("exported-page-settings.json", serialized);
}

function importSettingsFromFile(file: File): Promise<void> {
    return new Promise((resolve, reject) => {
        let reader = new FileReader();

        reader.onload = async function (e) {
            if (e !== null && e.target !== null && e.target.result !== null && typeof e.target.result === "string") {
                let settings = deserializeSettings(e.target.result);

                if (settings !== null)
                    await saveAllSettingsToStorage(settings);

                resolve();
            }
            else {
                reject();
            }
        };

        reader.onerror = reject;

        reader.readAsText(file);
    });
}

async function downloadSerializedSettings(filename: string, settings: string): Promise<void> {
    let settingsFile: File = new File([settings], filename, { type: "text/plain" });
    let url: string = window.URL.createObjectURL(settingsFile);

    await chrome.tabs.create({ url: url });
}

function serializeSettings(settings: PageSettingsCollection): string {
    return serializeSettingsV1(settings);
}

function serializeSettingsV1(settings: PageSettingsCollection): string {
    let versionedSettings: VersionedPageSettings = {
        version: "1",
        settings: settings
    };

    return JSON.stringify(versionedSettings, null, 4);
}

function deserializeSettings(serializedSettings: string): PageSettingsCollection | null {
    let versionedSettings: VersionedPageSettings = JSON.parse(serializedSettings);

    if (isVersionedPageSettings(versionedSettings)) {
        if (versionedSettings.version == "1")
            return deserializeSettingsV1(versionedSettings);
    }

    return null;
}

function deserializeSettingsV1(settings: VersionedPageSettings): PageSettingsCollection {
    return settings.settings;
}
// #endregion