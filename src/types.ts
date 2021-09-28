interface PageSettings {
    zoomFactor: number,
    scrollX: number,
    scrollY: number,
    elements: string | null,
    elementsHidden: boolean
}


interface VersionedPageSettings {
    version: string,
    settings: PageSettingsCollection
}

type PageSettingsCollection = { [key: string]: PageSettings };


function isPageSettings(obj: any): obj is PageSettings {
    return "zoomFactor" in obj
        && "scrollX" in obj
        && "scrollY" in obj
        && "elements" in obj
        && "elementsHidden" in obj;
}

function isVersionedPageSettings(obj: any): obj is VersionedPageSettings {
    return "version" in obj
        && "settings" in obj
        && isPageSettings(obj["settings"]);
}