chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
    if (request.hideHeader == true) {
        hideHeader();
    }
    else if (request.showHeader == true) {
        showHeader();
    }
});

function hideHeader() {
    $("header").hide();
}

function showHeader() {
    $("header").show();
}