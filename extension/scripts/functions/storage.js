var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
function loadSettingsFromStorage(key) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            let results = yield chrome.storage.sync.get(key);
            return (results !== null && key in results && isPageSettings(results[key])) ? results[key] : createDefaultPageSettings();
        }
        catch (error) {
            console.log(`Error saving settings: ${error.message}`);
            return createDefaultPageSettings();
        }
    });
}
function saveSettingsToStorage(key, settings) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            yield chrome.storage.sync.set({ [key]: settings });
        }
        catch (error) {
            console.log(`Error saving settings: ${error.message}`);
        }
    });
}
function clearSettingsFromStorage(key) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            yield chrome.storage.sync.remove(key);
        }
        catch (error) {
            console.log(`Error clearing settings: ${error.message}`);
        }
    });
}
function loadAllSettingsFromStorage() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            let results = yield chrome.storage.sync.get(null);
            let settings = {};
            let keys = Object.keys(results).filter(key => isPageSettings(results[key]));
            keys.forEach(key => {
                settings[key] = results[key];
            });
            return settings;
        }
        catch (error) {
            console.log(`Error loading all settings: ${error.message}`);
            return {};
        }
    });
}
function saveAllSettingsToStorage(settings) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            yield chrome.storage.sync.set(settings);
        }
        catch (error) {
            console.log(`Error saving all settings: ${error.message}`);
        }
    });
}
