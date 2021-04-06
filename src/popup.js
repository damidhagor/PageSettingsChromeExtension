const SettingsStatusEnum = Object.freeze({ "unsaved": 0, "saved": 1, "changed": 2 });

var activeTabId = null;
var activeTabHostname = null;

var settings =
{
    zoomFactor: undefined,
    scrollX: undefined,
    scrollY: undefined,
    elements: undefined,
    elementsHidden: false
}
var settingsStatus = undefined;


document.addEventListener("DOMContentLoaded", function () {
    $("#zoomTb").on("input", tb_input);
    $("#scrollXTb").on("input", tb_input);
    $("#scrollYTb").on("input", tb_input);
    $("#elementsTb").on("input", tb_input);
    $("#loadBtn").click(loadBtn_click);
    $("#saveBtn").click(saveBtn_click);
    $("#clearBtn").click(clearBtn_click);
    $("#getBtn").click(getBtn_click);
    $("#setBtn").click(setBtn_click);
    $("#resetBtn").click(resetBtn_click);
    $("#hideCbx").click(hideCbx_click);

    chrome.runtime.onMessage.addListener(onMessage);

    getActiveTabInfo(function (tabId, hostname) {
        activeTabId = tabId;
        activeTabHostname = hostname;
        loadSettings();
    });
});


function onMessage(request, sender, sendResponse) {
    if (request.topic == "getFromPage") {
        getFromPage();
        sendResponse({ state: true });
    }
    else if (request.topic == "setToPage") {
        setToPage();
        sendResponse({ state: true });
    }
}


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

function hideCbx_click() {
    settings.elementsHidden = $("#hideCbx").is(':checked');
    setElementsStateToPage(activeTabId, settings, function () { });
}


function loadSettings() {
    loadSettingsFromStorage(activeTabHostname, function (loadedSettings) {
        settings = loadedSettings;
        settingsStatus = settings.zoomFactor == undefined ? SettingsStatusEnum.unsaved : SettingsStatusEnum.saved;
        setSettingsToUI();
        updateStatusLbl();
    });
}

function saveSettings() {
    saveSettingsToStorage(activeTabHostname, settings, function () {
        settingsStatus = SettingsStatusEnum.saved;
        setSettingsToUI();
    });
}

function clearSettings() {
    clearSettingsFromStorage(activeTabHostname, function () {
        settingsStatus = SettingsStatusEnum.unsaved;
        resetSettings();
    });
}


function getFromPage() {
    getSettingsFromPage(activeTabId, settings, function (settings) {
        setSettingsToUI();
    });
}

function setToPage() {
    getSettingsFromUI();
    setSettingsToPage(activeTabId, settings, function () { });
}

function resetPage() {
    defaultSettings();
    setToPage();
}


function getSettingsFromUI() {
    settings.zoomFactor = $("#zoomTb").val() / 100;
    settings.scrollX = $("#scrollXTb").val();
    settings.scrollY = $("#scrollYTb").val();
    settings.elements = $("#elementsTb").val();
    settings.elementsHidden = $("#hideCbx").is(':checked');
}

function setSettingsToUI() {
    updateStatusLbl();
    $("#hostheader.innerText").val("Website " + activeTabHostname);
    $("#zoomTb").val(isNaN(settings.zoomFactor) || settings.zoomFactor == null ? "-" : settings.zoomFactor * 100);
    $("#scrollXTb").val(isNaN(settings.scrollX) || settings.scrollX == null ? "-" : settings.scrollX);
    $("#scrollYTb").val(isNaN(settings.scrollY) || settings.scrollY == null ? "-" : settings.scrollY);
    $("#elementsTb").val(settings.elements);
    $("#hideCbx").prop('checked', settings.elementsHidden);
}

function updateStatusLbl() {
    let saved = settingsStatus == SettingsStatusEnum.saved || settingsStatus == SettingsStatusEnum.changed;
    let changed = false;
    if ($("#zoomTb").val() / 100 != settings.zoomFactor
        || $("#scrollXTb").val() != settings.scrollX
        || $("#scrollYTb").val() != settings.scrollY
        || $("#elementsTb").val() != settings.elements)
        changed = true;

    if (saved && changed)
        settingsStatus = SettingsStatusEnum.changed;
    else if (saved && !changed)
        settingsStatus = SettingsStatusEnum.saved;
    else
        settingsStatus = SettingsStatusEnum.unsaved


    $("#statusLbl").removeClass("statusLbl-unsaved statusLbl-saved statusLbl-changed");
    if (settingsStatus == SettingsStatusEnum.unsaved) {
        $("#statusLbl").addClass("statusLbl-unsaved");
        statusLbl.innerText = "Unsaved";
    }
    else if (settingsStatus == SettingsStatusEnum.saved) {
        $("#statusLbl").addClass("statusLbl-saved");
        statusLbl.innerText = "Saved";
    }
    else if (settingsStatus == SettingsStatusEnum.changed) {
        $("#statusLbl").addClass("statusLbl-changed");
        statusLbl.innerText = "Changed";
    }
    else {
        statusLbl.innerText = "";
    }
}


function resetSettings() {
    resetSettingsObject(settings);
    setSettingsToUI();
}

function defaultSettings() {
    defaultSettingsObject(settings);
    setSettingsToUI();
}