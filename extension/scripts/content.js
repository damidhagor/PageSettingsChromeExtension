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
    let settings = createDefaultPageSettings();
    let elements;
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => __awaiter(this, void 0, void 0, function* () {
        try {
            const theme = e.matches ? Theme.DarkMode : Theme.LightMode;
            yield sendRuntimeMessage({ topic: MessageTopics.UpdateTheme, payload: theme });
        }
        catch (error) {
            console.error(`Error sending update-theme: ${error}`);
        }
    }));
    window.addEventListener("load", () => __awaiter(this, void 0, void 0, function* () {
        const hostname = window.location.hostname;
        console.log("RemoveDOMElementsBrowserExtension loaded for " + hostname + "!");
        const isDarkMode = window.matchMedia('(prefers-color-scheme: dark)').matches;
        try {
            const theme = isDarkMode ? Theme.DarkMode : Theme.LightMode;
            yield sendRuntimeMessage({ topic: MessageTopics.UpdateTheme, payload: theme });
        }
        catch (error) {
            console.error(`Error sending update-theme: ${error}`);
        }
    }));
    chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
        let result = false;
        const message = request;
        if (isMessage(message)) {
            const topic = message.topic;
            const payload = message.payload;
            if (topic === MessageTopics.GetStatus) {
                result = true;
            }
            else if (topic === MessageTopics.GetScroll && isScrollValues(payload)) {
                result = { x: window.scrollX, y: window.scrollY };
            }
            else if (topic === MessageTopics.SetScroll && isScrollValues(payload)) {
                window.scroll(payload.x, payload.y);
                result = true;
            }
            else if (topic === MessageTopics.GetElementsQuery) {
                result = settings.elements;
            }
            else if (topic === MessageTopics.SetElementsQuery && isNullableString(payload)) {
                settings.elements = payload;
            }
            else if (topic === MessageTopics.GetElementsState) {
                result = settings.elementsHidden;
            }
            else if (topic === MessageTopics.SetElementsState && isBoolean(payload)) {
                payload ? hideElements() : showElements();
                result = true;
            }
            else if (topic === MessageTopics.ToggleElementsState) {
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
}
