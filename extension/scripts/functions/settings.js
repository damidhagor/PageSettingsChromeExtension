var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
function isPageSettings(obj) {
    return "zoomFactor" in obj
        && "scrollX" in obj
        && "scrollY" in obj
        && "elements" in obj
        && "elementsHidden" in obj;
}
function isVersionedPageSettings(obj) {
    return "version" in obj
        && "settings" in obj;
}
function exportSettingsToFile() {
    return __awaiter(this, void 0, void 0, function* () {
        let settings = yield loadAllSettingsFromStorage();
        let serialized = serializeSettings(settings);
        yield downloadSerializedSettings("exported-page-settings.json", serialized);
    });
}
function importSettingsFromFile(file) {
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
function downloadSerializedSettings(filename, settings) {
    return __awaiter(this, void 0, void 0, function* () {
        let settingsFile = new File([settings], filename, { type: "text/plain" });
        let url = window.URL.createObjectURL(settingsFile);
        yield chrome.tabs.create({ url: url });
    });
}
function serializeSettings(settings) {
    return serializeSettingsV1(settings);
}
function serializeSettingsV1(settings) {
    let versionedSettings = {
        version: "1",
        settings: settings
    };
    return JSON.stringify(versionedSettings, null, 4);
}
function deserializeSettings(serializedSettings) {
    let versionedSettings = JSON.parse(serializedSettings);
    if (isVersionedPageSettings(versionedSettings)) {
        if (versionedSettings.version == "1")
            return deserializeSettingsV1(versionedSettings);
    }
    return null;
}
function deserializeSettingsV1(settings) {
    return settings.settings;
}
function createDefaultPageSettings() {
    return { zoomFactor: 1.0, scrollX: 0.0, scrollY: 0.0, elements: null };
}
;
