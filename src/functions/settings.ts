interface PageSettings {
    zoomFactor: number,
    scrollX: number,
    scrollY: number,
    elements: string | null,
    elementsHidden: boolean
}

interface VersionedPageSettings {
    version: string,
    settings: PageSettingsCollection
}

type PageSettingsCollection = { [key: string]: PageSettings };


function isPageSettings(obj: any): obj is PageSettings {
    return "zoomFactor" in obj
        && "scrollX" in obj
        && "scrollY" in obj
        && "elements" in obj
        && "elementsHidden" in obj;
}

function isVersionedPageSettings(obj: any): obj is VersionedPageSettings {
    return "version" in obj
        && "settings" in obj;
}


async function exportSettingsToFile(): Promise<void> {
    let settings = await loadAllSettingsFromStorage();

    let serialized = serializeSettings(settings);
    await downloadSerializedSettings("exported-page-settings.json", serialized);
}

function importSettingsFromFile(file: File): Promise<void> {
    return new Promise((resolve, reject) => {
        let reader = new FileReader();

        reader.onload = function (e) {
            if (e !== null && e.target !== null && e.target.result !== null && typeof e.target.result === "string") {
                let settings = deserializeSettings(e.target.result);

                if (settings !== null)
                    saveAllSettingsToStorage(settings);
                else
                    reject();

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

function createDefaultPageSettings(): PageSettings {
    return { zoomFactor: 1.0, scrollX: 0.0, scrollY: 0.0, elements: null, elementsHidden: false, };
};