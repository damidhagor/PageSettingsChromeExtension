const SettingsStatusEnum = Object.freeze({ "unsaved": 0, "saved": 1, "changed": 2 });

var activeTabId = null;
var activeTabHostname = null;

var hostheader = null;
var zoomTb = null;
var scrollXTb = null;
var scrollYTb = null;
var statusLbl = null;

var loadBtn = null;
var saveBtn = null;
var clearBtn = null;
var getBtn = null;
var setBtn = null;
var resetBtn = null;

var settings =
{
    zoomFactor: undefined,
    scrollX: undefined,
    scrollY: undefined
}
var settingsStatus = undefined;


document.addEventListener("DOMContentLoaded", function () {
    hostheader = document.getElementById("hostheader");
    zoomTb = document.getElementById("zoomTb");
    scrollXTb = document.getElementById("scrollXTb");
    scrollYTb = document.getElementById("scrollYTb");
    statusLbl = document.getElementById("statusLbl");
    loadBtn = document.getElementById("loadBtn");
    saveBtn = document.getElementById("saveBtn");
    clearBtn = document.getElementById("clearBtn");
    getBtn = document.getElementById("getBtn");
    setBtn = document.getElementById("setBtn");
    resetBtn = document.getElementById("resetBtn");

    zoomTb.addEventListener("input", tb_input);
    scrollXTb.addEventListener("input", tb_input);
    scrollYTb.addEventListener("input", tb_input);

    loadBtn.addEventListener("click", loadBtn_click);
    saveBtn.addEventListener("click", saveBtn_click);
    clearBtn.addEventListener("click", clearBtn_click);
    getBtn.addEventListener("click", getBtn_click);
    setBtn.addEventListener("click", setBtn_click);
    resetBtn.addEventListener("click", resetBtn_click);

    chrome.runtime.onMessage.addListener(onMessage);

    getActiveTabInfo();
});


function onMessage(request, sender, sendResponse) {
    if (request.topic == "getZoom") {
        settings.zoomFactor = request.zoom;
        applySettingsToUI();
    }
    else if (request.topic == "getScroll") {
        settings.scrollX = request.scrollX;
        settings.scrollY = request.scrollY;
        applySettingsToUI();
    }
}


function tb_input() {
    let saved = settingsStatus == SettingsStatusEnum.saved || settingsStatus == SettingsStatusEnum.changed;
    let changed = false;
    if (zoomTb.value / 100 != settings.zoomFactor
        || scrollXTb.value != settings.scrollX
        || scrollYTb.value != settings.scrollY)
        changed = true;

    if (saved && changed)
        settingsStatus = SettingsStatusEnum.changed;
    else if (saved && !changed)
        settingsStatus = SettingsStatusEnum.saved;
    else
        settingsStatus = SettingsStatusEnum.unsaved

    updateSettingsStatus();
}

function loadBtn_click() {
    loadFromStorage();
}

function saveBtn_click() {
    getSettingsFromUI();
    saveToStorage();
}

function clearBtn_click() {
    clearFromStorage();
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


function loadFromStorage() {
    chrome.storage.sync.get({ [activeTabHostname]: { zoomFactor: undefined, scrollX: undefined, scrollY: undefined } }, function (result) {
        if (chrome.runtime.lastError)
            return;

        settings = result[activeTabHostname];
        settingsStatus = settings.zoomFactor == undefined ? SettingsStatusEnum.unsaved : SettingsStatusEnum.saved;
        setSettingsToUI();
    });
}

function saveToStorage() {
    chrome.storage.sync.set({ [activeTabHostname]: settings }, function () {
        if (chrome.runtime.lastError)
            return;

        settingsStatus = SettingsStatusEnum.saved;
        setSettingsToUI();
    });
}

function clearFromStorage() {
    chrome.storage.sync.remove(activeTabHostname, function () {
        if (chrome.runtime.lastError)
            return;

        settingsStatus = SettingsStatusEnum.unsaved;
        resetSettings();
    });
}


function getFromPage() {
    chrome.tabs.getZoom(activeTabId, function (zoomFactor) {
        if (chrome.runtime.lastError)
            return;

        settings.zoomFactor = zoomFactor;

        chrome.tabs.sendMessage(activeTabId, { topic: "getScroll" }, function (response) {
            if (chrome.runtime.lastError)
                return;

            settings.scrollX = response.scrollX;
            settings.scrollY = response.scrollY;
            setSettingsToUI();
        });
    })
}

function setToPage() {
    getSettingsFromUI();

    chrome.tabs.setZoom(activeTabId, settings.zoomFactor, function (response) {
        if (chrome.runtime.lastError)
            return;

        chrome.tabs.sendMessage(activeTabId, { topic: "setScroll", scrollX: settings.scrollX, scrollY: settings.scrollY }, function (response) {
            if (chrome.runtime.lastError)
                return;
        })
    })
}

function resetPage() {
    resetSettings();
    setToPage();
}


function getActiveTabInfo() {
    chrome.runtime.sendMessage({ topic: "getActiveTabInfo" }, function (response) {
        if (chrome.runtime.lastError)
            return;

        activeTabId = response.activeTabId;
        activeTabHostname = response.activeTabHostname;
        loadFromStorage();
    });
}


function getSettingsFromUI() {
    settings.zoomFactor = zoomTb.value / 100;
    settings.scrollX = scrollXTb.value;
    settings.scrollY = scrollYTb.value;
}

function setSettingsToUI() {
    hostheader.innerText = "Website " + activeTabHostname;
    zoomTb.value = isNaN(settings.zoomFactor) || settings.zoomFactor == null ? "-" : settings.zoomFactor * 100;
    scrollXTb.value = isNaN(settings.scrollX) || settings.scrollX == null ? "-" : settings.scrollX;
    scrollYTb.value = isNaN(settings.scrollY) || settings.scrollY == null ? "-" : settings.scrollY;
    updateSettingsStatus();
}

function updateSettingsStatus() {
    if (settingsStatus == SettingsStatusEnum.unsaved) {
        statusLbl.style.color = "red";
        statusLbl.innerText = "Unsaved";
    }
    else if (settingsStatus == SettingsStatusEnum.saved) {
        statusLbl.style.color = "green";
        statusLbl.innerText = "Saved";
    }
    else if (settingsStatus == SettingsStatusEnum.changed) {
        statusLbl.style.color = "orange";
        statusLbl.innerText = "Changed";
    }
    else {
        statusLbl.style.color = "white";
        statusLbl.innerText = "";
    }
}

function resetSettings() {
    settings = {
        zoomFactor: 1.0,
        scrollX: 0.0,
        scrollY: 0.0
    };

    setSettingsToUI();
}