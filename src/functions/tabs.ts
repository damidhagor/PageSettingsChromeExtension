interface TabInfo {
    id: number | null,
    url: URL | null,
    host: string | null
}

function isTabInfo(obj: any): obj is TabInfo {
    return "x" in obj
        && "y" in obj;
}


async function getActiveTabId(): Promise<number | null> {
    const tabs = await chrome.tabs.query({ active: true, currentWindow: true });

    return tabs.length > 0 ? tabs[0].id ?? null : null;
}

async function getTabInfo(tabId: number): Promise<TabInfo | null> {
    try {
        const tab = await chrome.tabs.get(tabId);
        return createTabInfo(tab);
    } catch (error) {
        console.log(`Error getting tab info: ${error.message}`);
        return null;
    }
}

async function getActiveTabInfo(): Promise<TabInfo | null> {
    try {

        const id = await getActiveTabId();
        return id !== null ? await getTabInfo(id) : null;
    } catch (error) {
        console.log(`Error getting tab info: ${error.message}`);
        return null;
    }
}

function createTabInfo(tab: chrome.tabs.Tab): TabInfo | null {
    try {
        const id = tab.id ?? null;
        let url: URL | null = null;
        let hostname: string | null = null;

        try {
            if (typeof tab.url === "string")
                url = new URL(tab.url);
            else if (typeof tab.pendingUrl === "string")
                url = new URL(tab.pendingUrl);
            else
                url = null;
        } catch { }

        hostname = url?.hostname ?? null;

        return <TabInfo>{ id: id, url: url, host: hostname };
    } catch (error) {
        console.log(`Error creating tab info: ${error.message}`);
        return null;
    }
}