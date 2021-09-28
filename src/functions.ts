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


// PAGE FUNCTIONS
function getTabInfo(tabId, callback) {
    chrome.tabs.get(tabId, function (tab) {
        let tabUrl = undefined;
        let tabHostname = undefined;

        if (chrome.runtime.lastError) {
            console.log("Error getting tab: " + chrome.runtime.lastError.message);
        }
        else if (tab != undefined) {
            tabUrl = tab.url != undefined ? tab.url : tab.pendingUrl;
            try {
                tabHostname = tabUrl ? new URL(tabUrl).hostname : undefined;
            } catch (e) {
                console.log(e.message);
            }
        }

        callback({ tabUrl: tabUrl, tabHostname: tabHostname });
    });
}

function getSettingsFromPage(tabId, settings, callback) {
    getZoomFromPage(tabId, settings, function (newSettings) {
        getScrollFromPage(tabId, newSettings, function (newSettings) {
            getElementsFromPage(tabId, newSettings, function (newSettings) {
                getElementsStateFromPage(tabId, newSettings, function (newSettings) {
                    callback(newSettings);
                });
            });
        });
    });
}

function setSettingsToPage(tabId, settings, callback) {
    setZoomSettingsToPage(tabId, settings, function () {
        setZoomToPage(tabId, settings, function () {
            setScrollToPage(tabId, settings, function () {
                setElementsToPage(tabId, settings, function () {
                    setElementsStateToPage(tabId, settings, function () {
                        callback();
                    });
                })
            })
        })
    })
}

function resetPageSettings(tabId, settings, callback) {
    resetSettings(settings);
    setSettingsToPage(tabId, settings, function () {
        callback(settings);
    });
}

function getZoomFromPage(tabId, settings, callback) {
    chrome.tabs.getZoom(tabId, function (zoomFactor) {
        if (chrome.runtime.lastError) {
            console.log("Error getting zoom: " + chrome.runtime.lastError.message);
            return;
        }

        settings.zoomFactor = zoomFactor;
        callback(settings);
    });
}

function getScrollFromPage(tabId, settings, callback) {
    chrome.tabs.sendMessage(tabId, { topic: "getScroll" }, function (response) {
        if (chrome.runtime.lastError) {
            console.log("Error getting scroll: " + chrome.runtime.lastError.message);
            return;
        }

        settings.scrollX = response.scrollX;
        settings.scrollY = response.scrollY;

        callback(settings);
    });
}

function getElementsFromPage(tabId, settings, callback) {
    chrome.tabs.sendMessage(tabId, { topic: "getElements" }, function (response) {
        if (chrome.runtime.lastError) {
            console.log("Error getting elements: " + chrome.runtime.lastError.message);
            return;
        }

        settings.elements = response.elements;
        callback(settings);
    });
}

function getElementsStateFromPage(tabId, settings, callback) {
    chrome.tabs.sendMessage(tabId, { topic: "getElementsState" }, function (response) {
        if (chrome.runtime.lastError) {
            console.log("Error getting elements state: " + chrome.runtime.lastError.message);
            return;
        }

        settings.elementsHidden = response.state;
        callback(settings);
    });
}

function setZoomSettingsToPage(tabId, settings, callback) {
    chrome.tabs.setZoomSettings(tabId, { scope: "per-tab" }, function (response) {
        if (chrome.runtime.lastError) {
            console.log("Error setting zoom settings: " + chrome.runtime.lastError.message);
            return;
        }
        callback();
    });
}

function setZoomToPage(tabId, settings, callback) {
    chrome.tabs.setZoom(tabId, settings.zoomFactor, function (response) {
        if (chrome.runtime.lastError) {
            console.log("Error setting zoom: " + chrome.runtime.lastError.message);
            return;
        }
        callback();
    });
}

function setScrollToPage(tabId, settings, callback) {
    chrome.tabs.sendMessage(tabId, { topic: "setScroll", scrollX: settings.scrollX, scrollY: settings.scrollY }, function (response) {
        if (chrome.runtime.lastError) {
            console.log("Error setting scroll: " + chrome.runtime.lastError.message);
            return;
        }

        callback();
    });
}

function setElementsToPage(tabId, settings, callback) {
    chrome.tabs.sendMessage(tabId, { topic: "setElements", elements: settings.elements }, function (response) {
        if (chrome.runtime.lastError) {
            console.log("Error setting elements: " + chrome.runtime.lastError.message);
            return;
        }

        callback();
    });
}

function setElementsStateToPage(tabId, settings, callback) {
    chrome.tabs.sendMessage(tabId, { topic: "setElementsState", state: settings.elementsHidden }, function (response) {
        if (chrome.runtime.lastError) {
            console.log("Error setting elements state: " + chrome.runtime.lastError.message);
            return;
        }

        callback();
    });
}

function toggleElementsStateOnPage(tabId, callback) {
    chrome.tabs.sendMessage(tabId, { topic: "toggleElementsState" }, function (response) {
        if (chrome.runtime.lastError) {
            console.log("Error toggling elements state: " + chrome.runtime.lastError.message);
            return;
        }

        callback();
    });
}


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