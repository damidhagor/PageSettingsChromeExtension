{
    let settings: PageSettings = createDefaultPageSettings();
    let elements: NodeListOf<HTMLElement> | null = null;


    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', async (e) => {
        try {
            const theme = e.matches ? Theme.DarkMode : Theme.LightMode;
            await sendRuntimeMessage({ topic: MessageTopics.UpdateTheme, payload: theme });
        } catch (error) {
            console.error(`Error sending update-theme: ${error}`);
        }
    });

    window.addEventListener("load", async () => {
        const hostname = window.location.hostname;
        console.log("RemoveDOMElementsBrowserExtension loaded for " + hostname + "!");

        const isDarkMode = window.matchMedia('(prefers-color-scheme: dark)').matches;
        try {
            const theme = isDarkMode ? Theme.DarkMode : Theme.LightMode;
            await sendRuntimeMessage({ topic: MessageTopics.UpdateTheme, payload: theme });
        } catch (error) {
            console.error(`Error sending update-theme: ${error}`);
        }
    });

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

        settings.elementsHidden ? hideElements() : showElements();
        window.scroll(settings.scrollX, settings.scrollY);
    }


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
}