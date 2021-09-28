interface PageSettings {
    zoomFactor: number,
    scrollX: number,
    scrollY: number,
    elements: string | null,
    elementsHidden: boolean
}

interface ScrollValues {
    x: number,
    y: number
}

interface TabInfo {
    id: number | null,
    url: URL | null,
    host: string | null
}

interface VersionedPageSettings {
    version: string,
    settings: PageSettingsCollection
}

interface Message {
    topic: MessageTopics,
    payload: any | null
}

enum MessageTopics {
    GetStatus,
    GetScroll,
    SetScroll,
    GetElementsQuery,
    SetElementsQuery,
    GetElementsState,
    SetElementsState,
    ToggleElementsState
}

type PageSettingsCollection = { [key: string]: PageSettings };


function isPageSettings(obj: any): obj is PageSettings {
    return "zoomFactor" in obj
        && "scrollX" in obj
        && "scrollY" in obj
        && "elements" in obj
        && "elementsHidden" in obj;
}

function isScrollValues(obj: any): obj is ScrollValues {
    return "x" in obj
        && "y" in obj;
}

function isTabInfo(obj: any): obj is TabInfo {
    return "x" in obj
        && "y" in obj;
}

function isVersionedPageSettings(obj: any): obj is VersionedPageSettings {
    return "version" in obj
        && "settings" in obj
        && isPageSettings(obj["settings"]);
}

function isMessage(obj: any): obj is Message {
    return "topic" in obj
        && "payload" in obj;
}

function isNullableString(obj: any): obj is string | null {
    return obj === null
        || typeof obj === "string";
}

function isBoolean(obj: any): obj is boolean {
    return typeof obj === "boolean";
}