let settings: PageSettings = createDefaultPageSettings();
let elements: NodeListOf<HTMLElement> | null;

window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => {
    chrome.runtime.sendMessage({ topic: "updateTheme" });
});

window.addEventListener("load", function () {
    const hostname = window.location.hostname;
    console.log("RemoveDOMElementsBrowserExtension loaded for " + hostname + "!");
});

chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
    let result: any = false;

    const message: Message = request;
    if (isMessage(message)) {
        const topic = message.topic;
        const payload = message.payload;

        if (message.topic === MessageTopics.GetStatus) {
            result = true;
        }
        else if (message.topic === MessageTopics.GetScroll && isScrollValues(message.payload)) {
            result = <ScrollValues>{ x: window.scrollX, y: window.scrollY };
        }
        else if (message.topic === MessageTopics.SetScroll && isScrollValues(message.payload)) {
            window.scroll(message.payload.x, message.payload.y);
            result = true;
        }
        else if (message.topic === MessageTopics.GetElementsQuery) {
            result = settings.elements;
        }
        else if (message.topic === MessageTopics.SetElementsQuery && isNullableString(message.payload)) {
            settings.elements = message.payload;
        }
        else if (message.topic === MessageTopics.GetElementsState) {
            result = settings.elementsHidden;
        }
        else if (message.topic === MessageTopics.SetElementsState && isBoolean(message.payload)) {
            message.payload ? hideElements() : showElements();
            result = true;
        }
        else if (message.topic === MessageTopics.ToggleElementsState) {
            settings.elementsHidden ? showElements() : hideElements();
            result = true;
        }
    }

    sendResponse(result);
});

function showElements() {
    if (elements !== null)
        elements.forEach(e => e.style.display = "");

    settings.elementsHidden = false;
}

function hideElements() {
    showElements();

    const query = settings.elements;

    console.log("Hide query: " + query);

    elements = null;
    if (query !== null) {
        elements = document.querySelectorAll(query);
        elements.forEach(e => e.style.display = "none");
        settings.elementsHidden = true;
    }

    console.log("Hidden elements: ", elements);
}