var isEnabledCbx = null;
var isEnabledText = null;
var elementsTa = null;
var classesTa = null;
var saveBtn = null;

var settings =
{
    hostname: undefined,
    isEnabled: false,
    elements: undefined,
    classes: undefined
}

document.addEventListener("DOMContentLoaded", function () {
    isEnabledCbx
        = document.getElementById("isEnabledCbx");
    isEnabledText = document.getElementById("isEnabledText");
    elementsTa = document.getElementById("elementsTa")
    classesTa = document.getElementById("classesTa");
    saveBtn = document.getElementById("saveBtn");

    isEnabledCbx.addEventListener("change", headerCbx_change);
    saveBtn.addEventListener("click", saveBtn_click)

    getSettings();
});

function headerCbx_change() {
    applySettingsFromUI();
    sendSettings();
}

function saveBtn_click() {
    applySettingsFromUI();

    chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
        chrome.tabs.sendMessage(tabs[0].id, { sendSettings: true, settings }, function (response) { });
    });
}


function sendSettings() {
    chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
        chrome.tabs.sendMessage(tabs[0].id, { sendSettings: true, settings }, function (response) { });
    });
}

function getSettings() {
    chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
        chrome.tabs.sendMessage(tabs[0].id, { getSettings: true }, function (response) {
            settings = response;
            applySettingsToUI();
        });
    });
}

function applySettingsToUI() {
    isEnabledCbx.checked = settings.isEnabled;
    isEnabledText.textContent = "Enable for '" + settings.hostname + "'";

    elementsTa.value = settings.elements == undefined ? "" : settings.elements.join('\n');
    classesTa.value = settings.classes == undefined ? "" : settings.classes.map(c => c.substring(1)).join('\n');
}

function applySettingsFromUI() {
    settings.isEnabled = isEnabledCbx.checked;
    settings.elements = elementsTa.value.split('\n').filter(e => e);
    settings.classes = classesTa.value.split('\n').filter(c => c).map(c => "." + c);
}