const SettingsStatusEnum = Object.freeze({ "unsaved": 0, "saved": 1, "changed": 2 });

var activeTabId = null;
var activeTabHostname = null;

var settings =
{
    zoomFactor: undefined,
    scrollX: undefined,
    scrollY: undefined,
    elements: undefined
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
    else if (request.topic == "getElements") {
        settings.scrollX = request.scrollX;
        settings.scrollY = request.scrollY;
        applySettingsToUI();
    }
}


function tb_input() {
    updateStatusLbl();
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

function hideCbx_click() {
    let hide = this.checked;

    chrome.tabs.sendMessage(activeTabId, { topic: "setElementsState", hide: hide }, function (response) {
        if (chrome.runtime.lastError)
            return;
    })
}


function loadFromStorage() {
    chrome.storage.sync.get({ [activeTabHostname]: { zoomFactor: undefined, scrollX: undefined, scrollY: undefined, elements: undefined } }, function (result) {
        if (chrome.runtime.lastError)
            return;

        settings = result[activeTabHostname];
        settingsStatus = settings.zoomFactor == undefined ? SettingsStatusEnum.unsaved : SettingsStatusEnum.saved;
        setSettingsToUI();
        updateStatusLbl();
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

            chrome.tabs.sendMessage(activeTabId, { topic: "getElements" }, function (response) {
                if (chrome.runtime.lastError)
                    return;

                settings.elements = response.elements;
                setSettingsToUI();
            });
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

            chrome.tabs.sendMessage(activeTabId, { topic: "setElements", elements: settings.elements }, function (response) {
                if (chrome.runtime.lastError)
                    return;

                chrome.tabs.sendMessage(activeTabId, { topic: "setElementsState", hide: true }, function (response) {
                    if (chrome.runtime.lastError)
                        return;

                    let cbx = $("#hideCbx");
                    $("#hideCbx").prop('checked', true);
                })
            })
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
    settings.zoomFactor = $("#zoomTb").val() / 100;
    settings.scrollX = $("#scrollXTb").val();
    settings.scrollY = $("#scrollYTb").val();
    settings.elements = $("#elementsTb").val();
}

function setSettingsToUI() {
    updateStatusLbl();
    $("#hostheader.innerText").val("Website " + activeTabHostname);
    $("#zoomTb").val(isNaN(settings.zoomFactor) || settings.zoomFactor == null ? "-" : settings.zoomFactor * 100);
    $("#scrollXTb").val(isNaN(settings.scrollX) || settings.scrollX == null ? "-" : settings.scrollX);
    $("#scrollYTb").val(isNaN(settings.scrollY) || settings.scrollY == null ? "-" : settings.scrollY);
    $("#elementsTb").val(settings.elements);
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
    settings = {
        zoomFactor: 1.0,
        scrollX: 0.0,
        scrollY: 0.0,
        elements: ""
    };

    setSettingsToUI();
}