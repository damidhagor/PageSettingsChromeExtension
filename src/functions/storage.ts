async function loadSettingsFromStorage(key: string): Promise<PageSettings> {
    try {
        let results = await chrome.storage.sync.get(key);

        return (results !== null && key in results && isPageSettings(results[key])) ? results[key] : createDefaultPageSettings();
    } catch (error) {
        console.log(`Error saving settings: ${error.message}`);
        return createDefaultPageSettings();
    }
}

async function saveSettingsToStorage(key: string, settings: PageSettings): Promise<void> {
    try {
        await chrome.storage.sync.set({ [key]: settings });
    } catch (error) {
        console.log(`Error saving settings: ${error.message}`);
    }
}

async function clearSettingsFromStorage(key: string): Promise<void> {
    try {
        await chrome.storage.sync.remove(key);
    } catch (error) {
        console.log(`Error clearing settings: ${error.message}`);
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
        console.log(`Error loading all settings: ${error.message}`);
        return {};
    }
}

async function saveAllSettingsToStorage(settings: PageSettingsCollection): Promise<void> {
    try {
        await chrome.storage.sync.set(settings);
    } catch (error) {
        console.log(`Error saving all settings: ${error.message}`);
    }
}