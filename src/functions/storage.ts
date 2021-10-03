async function loadSettingsFromStorage(key: string): Promise<PageSettings> {
    return new Promise((resolve, reject) => {
        chrome.storage.sync.get(key, (results) => {
            if (chrome.runtime.lastError) {
                console.warn(`Error loading settings: ${chrome.runtime.lastError.message}`);
                reject(chrome.runtime.lastError.message);
            }

            const settings = (results !== null && results !== undefined && key in results && isPageSettings(results[key]))
                ? results[key]
                : createDefaultPageSettings();
            resolve(settings);
        });
    });
}

function saveSettingsToStorage(key: string, settings: PageSettings) {
    try {
        if (isHostnameValid(key))
            chrome.storage.sync.set({ [key]: settings });
    } catch (error) {
        console.log(`Error saving settings: ${error.message}`);
    }
}

function clearSettingsFromStorage(key: string) {
    try {
        chrome.storage.sync.remove(key);
    } catch (error) {
        console.log(`Error clearing settings: ${error.message}`);
    }
}

async function loadAllSettingsFromStorage(): Promise<PageSettingsCollection> {
    return new Promise((resolve, reject) => {
        chrome.storage.sync.get((results) => {
            if (chrome.runtime.lastError) {
                console.log(`Error loading all settings: ${chrome.runtime.lastError}`);
                reject(chrome.runtime.lastError.message);
            }

            let settings: PageSettingsCollection = {};
            let keys = Object.keys(results).filter(key => isPageSettings(results[key]));

            keys.forEach(key => {
                settings[key] = results[key] as PageSettings;
            });

            resolve(settings);
        });
    });
}

function saveAllSettingsToStorage(settings: PageSettingsCollection) {
    try {
        chrome.storage.sync.set(settings);
    } catch (error) {
        console.log(`Error saving all settings: ${error.message}`);
    }
}