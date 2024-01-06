{
    let settings: PageSettings = createDefaultPageSettings();
    let elements: NodeListOf<HTMLElement> | null = null;


    chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
        let result: any = false;

        const message: Message = request;
        if (isMessage(message)) {
            const topic = message.topic;
            const payload = message.payload;

            if (topic === MessageTopics.GetStatus) {
                result = true;
            }
            else if (topic === MessageTopics.GetPageSettings) {
                result = getCurrentSettings();
            }
            else if (topic === MessageTopics.SetPageSettings && isPageSettings(payload)) {
                applySettings(payload);
                result = true;
            }
            else if (topic === MessageTopics.SetElementsState && isBoolean(payload)) {
                payload ? showElements() : hideElements();
                result = true;
            }
        }

        sendResponse(result);
    });


    function getCurrentSettings(): PageSettings {
        const current = settings ?? createDefaultPageSettings();

        current.scrollX = window.scrollX;
        current.scrollY = window.scrollY;

        return current;
    }

    function applySettings(pageSettings: PageSettings) {
        settings = pageSettings;
        hideElements();
        window.scroll(settings.scrollX, settings.scrollY);
    }


    function showElements() {
        if (elements !== null) {
            elements.forEach(e => e.style.display = "");
        }
    }

    function hideElements() {
        showElements();

        const query = settings.elements;

        console.log("Hide query: " + query);

        elements = null;
        if (query !== null) {
            elements = document.querySelectorAll(query);
            elements.forEach(e => e.style.display = "none");
        }

        console.log("Hidden elements: ", elements);
    }
}