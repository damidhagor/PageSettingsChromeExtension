var hideHeaderBtn = null;

document.addEventListener("DOMContentLoaded", function () {
    hideHeaderBtn = document.getElementById("hideHeaderBtn");
    showHeaderBtn = document.getElementById("showHeaderBtn");

    hideHeaderBtn.addEventListener("click", hideHeaderBtnClickHandler);
    showHeaderBtn.addEventListener("click", showHeaderBtnClickHandler);
});

function hideHeaderBtnClickHandler() {
    chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
        chrome.tabs.sendMessage(tabs[0].id, { hideHeader: true }, function (response) {
            ;
        });
    });
}

function showHeaderBtnClickHandler() {
    chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
        chrome.tabs.sendMessage(tabs[0].id, { showHeader: true }, function (response) {
            ;
        });
    });
}