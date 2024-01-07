var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
{
    let SettingsStatus;
    (function (SettingsStatus) {
        SettingsStatus[SettingsStatus["Unsaved"] = 0] = "Unsaved";
        SettingsStatus[SettingsStatus["Saved"] = 1] = "Saved";
        SettingsStatus[SettingsStatus["Changed"] = 2] = "Changed";
    })(SettingsStatus || (SettingsStatus = {}));
    let activeTabInfo = null;
    let settings = createDefaultPageSettings();
    let settingsStatus = SettingsStatus.Unsaved;
    let websiteTb;
    let zoomTb;
    let scrollXTb;
    let scrollYTb;
    let elementsQueryTb;
    let statusLbl;
    let loadBtn;
    let saveBtn;
    let clearBtn;
    let getBtn;
    let setBtn;
    let resetBtn;
    let backupBtn;
    let restoreBtn;
    let restoreInput;
    document.addEventListener("DOMContentLoaded", () => __awaiter(this, void 0, void 0, function* () {
        var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o;
        websiteTb = document.querySelector("#websiteLbl");
        statusLbl = document.querySelector("#statusLbl");
        (_a = (zoomTb = document.querySelector("#zoomTb"))) === null || _a === void 0 ? void 0 : _a.addEventListener("input", tb_input);
        (_b = (scrollXTb = document.querySelector("#scrollXTb"))) === null || _b === void 0 ? void 0 : _b.addEventListener("input", tb_input);
        (_c = (scrollYTb = document.querySelector("#scrollYTb"))) === null || _c === void 0 ? void 0 : _c.addEventListener("input", tb_input);
        (_d = (elementsQueryTb = document.querySelector("#elementsQueryTb"))) === null || _d === void 0 ? void 0 : _d.addEventListener("input", tb_input);
        (_e = (loadBtn = document.querySelector("#loadBtn"))) === null || _e === void 0 ? void 0 : _e.addEventListener("click", loadBtn_click);
        (_f = (saveBtn = document.querySelector("#saveBtn"))) === null || _f === void 0 ? void 0 : _f.addEventListener("click", saveBtn_click);
        (_g = (clearBtn = document.querySelector("#clearBtn"))) === null || _g === void 0 ? void 0 : _g.addEventListener("click", clearBtn_click);
        (_h = (getBtn = document.querySelector("#getBtn"))) === null || _h === void 0 ? void 0 : _h.addEventListener("click", getBtn_click);
        (_j = (setBtn = document.querySelector("#setBtn"))) === null || _j === void 0 ? void 0 : _j.addEventListener("click", setBtn_click);
        (_k = (resetBtn = document.querySelector("#resetBtn"))) === null || _k === void 0 ? void 0 : _k.addEventListener("click", resetBtn_click);
        (_l = (backupBtn = document.querySelector("#backupBtn"))) === null || _l === void 0 ? void 0 : _l.addEventListener("click", backupBtn_click);
        (_m = (restoreBtn = document.querySelector("#restoreBtn"))) === null || _m === void 0 ? void 0 : _m.addEventListener("click", restoreBtn_click);
        (_o = (restoreInput = document.querySelector("#restoreInput"))) === null || _o === void 0 ? void 0 : _o.addEventListener("change", restoreInput_change);
        chrome.runtime.onMessage.addListener((request, sender, sendResponse) => __awaiter(this, void 0, void 0, function* () {
            let result = false;
            const message = request;
            if (isMessage(message)) {
                const topic = message.topic;
                const payload = message.payload;
                if (topic === MessageTopics.GetSettingsFromPage) {
                    getFromPage();
                    result = true;
                }
                else if (topic === MessageTopics.SetSettingsToPage) {
                    setToPage();
                    result = true;
                }
            }
            sendResponse(result);
        }));
        yield loadSettings();
    }));
    // #region Eventhandlers
    function tb_input() {
        updateStatusLbl();
    }
    function loadBtn_click() {
        loadSettings();
    }
    function saveBtn_click() {
        getSettingsFromUI();
        saveSettings();
    }
    function clearBtn_click() {
        clearSettings();
    }
    function getBtn_click() {
        getFromPage();
    }
    function setBtn_click() {
        setToPage();
    }
    function resetBtn_click() {
        resetPage();
    }
    function backupBtn_click() {
        exportSettingsToFile();
    }
    function restoreBtn_click() {
        restoreInput.click();
    }
    function restoreInput_change() {
        importSettings();
    }
    // #endregion
    function loadSettings() {
        return __awaiter(this, void 0, void 0, function* () {
            activeTabInfo = yield getActiveTabInfo();
            if (activeTabInfo !== null && activeTabInfo.host !== null) {
                settings = yield loadSettingsFromStorage(activeTabInfo.host);
                settingsStatus = SettingsStatus.Saved;
            }
            else {
                settings = createDefaultPageSettings();
                settingsStatus = SettingsStatus.Unsaved;
            }
            setSettingsToUI();
            updateStatusLbl();
        });
    }
    function saveSettings() {
        const hostname = activeTabInfo === null || activeTabInfo === void 0 ? void 0 : activeTabInfo.host;
        if (isHostnameValid(hostname) && isString(hostname)) {
            saveSettingsToStorage(hostname, settings);
            settingsStatus = SettingsStatus.Saved;
            setSettingsToUI();
        }
    }
    function clearSettings() {
        const hostname = activeTabInfo === null || activeTabInfo === void 0 ? void 0 : activeTabInfo.host;
        if (isHostnameValid(hostname) && isString(hostname)) {
            clearSettingsFromStorage(hostname);
            settingsStatus = SettingsStatus.Unsaved;
            resetSettings();
        }
    }
    function importSettings() {
        return __awaiter(this, void 0, void 0, function* () {
            if (restoreInput.files !== null && restoreInput.files.length > 0) {
                let file = restoreInput.files[0];
                try {
                    yield importSettingsFromFile(file);
                    alert("Settings have been successfully imported.");
                }
                catch (_a) {
                    console.error(`Error importing settings.`);
                }
            }
        });
    }
    function getFromPage() {
        return __awaiter(this, void 0, void 0, function* () {
            const activeTabId = yield getActiveTabId();
            if (activeTabId !== null) {
                settings = yield getSettingsFromPage(activeTabId);
                setSettingsToUI();
            }
        });
    }
    function setToPage() {
        return __awaiter(this, void 0, void 0, function* () {
            getSettingsFromUI();
            const activeTabId = yield getActiveTabId();
            if (activeTabId !== null)
                yield setSettingsToPage(activeTabId, settings);
        });
    }
    function resetPage() {
        return __awaiter(this, void 0, void 0, function* () {
            resetSettings();
            yield setToPage();
        });
    }
    function resetSettings() {
        settings = createDefaultPageSettings();
        setSettingsToUI();
    }
    function getSettingsFromUI() {
        settings.zoomFactor = parseFloat(zoomTb.value) / 100;
        settings.scrollX = parseFloat(scrollXTb.value);
        settings.scrollY = parseFloat(scrollYTb.value);
        settings.elements = elementsQueryTb.value;
    }
    function setSettingsToUI() {
        var _a, _b;
        updateStatusLbl();
        websiteTb.value = (_a = activeTabInfo === null || activeTabInfo === void 0 ? void 0 : activeTabInfo.host) !== null && _a !== void 0 ? _a : "unknown";
        zoomTb.value = isNaN(settings.zoomFactor) || settings.zoomFactor === null ? "-" : String(settings.zoomFactor * 100);
        scrollXTb.value = isNaN(settings.scrollX) || settings.scrollX == null ? "-" : String(settings.scrollX);
        scrollYTb.value = isNaN(settings.scrollY) || settings.scrollY == null ? "-" : String(settings.scrollY);
        elementsQueryTb.value = (_b = settings.elements) !== null && _b !== void 0 ? _b : "";
        saveBtn.disabled = !isHostnameValid(activeTabInfo === null || activeTabInfo === void 0 ? void 0 : activeTabInfo.host);
    }
    function updateStatusLbl() {
        const saved = settingsStatus === SettingsStatus.Saved || settingsStatus === SettingsStatus.Changed;
        const zoom = parseFloat(zoomTb.value);
        const scrollX = parseFloat(scrollXTb.value);
        const scrollY = parseFloat(scrollYTb.value);
        const query = elementsQueryTb.value;
        let changed = false;
        if (zoom / 100 != settings.zoomFactor
            || scrollX != settings.scrollX
            || scrollY != settings.scrollY
            || query != settings.elements)
            changed = true;
        if (saved && changed)
            settingsStatus = SettingsStatus.Changed;
        else if (saved && !changed)
            settingsStatus = SettingsStatus.Saved;
        else
            settingsStatus = SettingsStatus.Unsaved;
        statusLbl.classList.remove("text-bg-danger", "text-bg-success", "text-bg-warning");
        if (settingsStatus == SettingsStatus.Unsaved) {
            statusLbl.classList.add("text-bg-danger");
            statusLbl.innerText = "Unsaved";
        }
        else if (settingsStatus == SettingsStatus.Saved) {
            statusLbl.classList.add("text-bg-success");
            statusLbl.innerText = "Saved";
        }
        else if (settingsStatus == SettingsStatus.Changed) {
            statusLbl.classList.add("text-bg-warning");
            statusLbl.innerText = "Changed";
        }
        else {
            statusLbl.innerText = "";
        }
    }
}
