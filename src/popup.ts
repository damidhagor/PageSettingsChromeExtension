{
    enum SettingsStatus {
        Unsaved,
        Saved,
        Changed
    }

    let activeTabInfo: TabInfo | null = null;
    let settings: PageSettings = createDefaultPageSettings();
    let settingsStatus: SettingsStatus = SettingsStatus.Unsaved;

    let websiteTb: HTMLInputElement;
    let zoomTb: HTMLInputElement;
    let scrollXTb: HTMLInputElement;
    let scrollYTb: HTMLInputElement;
    let elementsQueryTb: HTMLInputElement;
    let statusLbl: HTMLParagraphElement;
    let loadBtn: HTMLButtonElement;
    let saveBtn: HTMLButtonElement;
    let clearBtn: HTMLButtonElement;
    let getBtn: HTMLButtonElement;
    let setBtn: HTMLButtonElement;
    let resetBtn: HTMLButtonElement;
    let backupBtn: HTMLButtonElement;
    let restoreBtn: HTMLButtonElement;
    let restoreInput: HTMLInputElement;

    document.addEventListener("DOMContentLoaded", async () => {
        websiteTb = <HTMLInputElement>document.querySelector("#websiteLbl");
        statusLbl = <HTMLParagraphElement>document.querySelector("#statusLbl");
        (zoomTb = <HTMLInputElement>document.querySelector("#zoomTb"))?.addEventListener("input", tb_input);
        (scrollXTb = <HTMLInputElement>document.querySelector("#scrollXTb"))?.addEventListener("input", tb_input);
        (scrollYTb = <HTMLInputElement>document.querySelector("#scrollYTb"))?.addEventListener("input", tb_input);
        (elementsQueryTb = <HTMLInputElement>document.querySelector("#elementsQueryTb"))?.addEventListener("input", tb_input);
        (loadBtn = <HTMLButtonElement>document.querySelector("#loadBtn"))?.addEventListener("click", loadBtn_click);
        (saveBtn = <HTMLButtonElement>document.querySelector("#saveBtn"))?.addEventListener("click", saveBtn_click);
        (clearBtn = <HTMLButtonElement>document.querySelector("#clearBtn"))?.addEventListener("click", clearBtn_click);
        (getBtn = <HTMLButtonElement>document.querySelector("#getBtn"))?.addEventListener("click", getBtn_click);
        (setBtn = <HTMLButtonElement>document.querySelector("#setBtn"))?.addEventListener("click", setBtn_click);
        (resetBtn = <HTMLButtonElement>document.querySelector("#resetBtn"))?.addEventListener("click", resetBtn_click);
        (backupBtn = <HTMLButtonElement>document.querySelector("#backupBtn"))?.addEventListener("click", backupBtn_click);
        (restoreBtn = <HTMLButtonElement>document.querySelector("#restoreBtn"))?.addEventListener("click", restoreBtn_click);
        (restoreInput = <HTMLInputElement>document.querySelector("#restoreInput"))?.addEventListener("change", restoreInput_change);

        chrome.runtime.onMessage.addListener(async (request, sender, sendResponse) => {
            let result: any = false;

            const message: Message = request;
            if (isMessage(message)) {
                const topic = message.topic;
                const payload = message.payload;

                if (topic === MessageTopics.GetSettingsFromPage) {
                    getFromPage();
                    result = true;
                } else if (topic === MessageTopics.SetSettingsToPage) {
                    setToPage();
                    result = true;
                }
            }

            sendResponse(result);
        });

        await loadSettings();
    });


    // #region Eventhandlers
    function tb_input() {
        updateStatusLbl();
    }

    function loadBtn_click() {
        loadSettings();
    }

    function saveBtn_click() {
        getSettingsFromUI();
        saveSettings();
    }

    function clearBtn_click() {
        clearSettings();
    }

    function getBtn_click() {
        getFromPage();
    }

    function setBtn_click() {
        setToPage();
    }

    function resetBtn_click() {
        resetPage();
    }

    function backupBtn_click() {
        exportSettingsToFile();
    }

    function restoreBtn_click() {
        restoreInput.click();
    }

    function restoreInput_change() {
        importSettings();
    }
    // #endregion


    async function loadSettings(): Promise<void> {
        activeTabInfo = await getActiveTabInfo();
        if (activeTabInfo !== null && activeTabInfo.host !== null) {
            settings = await loadSettingsFromStorage(activeTabInfo.host);
            settingsStatus = SettingsStatus.Saved;
        } else {
            settings = createDefaultPageSettings();
            settingsStatus = SettingsStatus.Unsaved;
        }

        setSettingsToUI();
        updateStatusLbl();
    }

    function saveSettings() {
        const hostname = activeTabInfo?.host;

        if (isHostnameValid(hostname) && isString(hostname)) {
            saveSettingsToStorage(hostname, settings);
            settingsStatus = SettingsStatus.Saved;
            setSettingsToUI();
        }

    }

    function clearSettings() {
        const hostname = activeTabInfo?.host;

        if (isHostnameValid(hostname) && isString(hostname)) {
            clearSettingsFromStorage(hostname);
            settingsStatus = SettingsStatus.Unsaved;
            resetSettings();
        }
    }

    async function importSettings(): Promise<void> {
        if (restoreInput.files !== null && restoreInput.files.length > 0) {
            let file = restoreInput.files[0];
            try {
                await importSettingsFromFile(file);
                alert("Settings have been successfully imported.");
            } catch {
                console.error(`Error importing settings.`);
            }
        }
    }


    async function getFromPage(): Promise<void> {
        const activeTabId = await getActiveTabId();
        if (activeTabId !== null) {
            settings = await getSettingsFromPage(activeTabId);
            setSettingsToUI();
        }
    }

    async function setToPage(): Promise<void> {
        getSettingsFromUI();

        const activeTabId = await getActiveTabId();
        if (activeTabId !== null)
            await setSettingsToPage(activeTabId, settings);
    }

    async function resetPage(): Promise<void> {
        resetSettings();
        await setToPage();
    }


    function resetSettings() {
        settings = createDefaultPageSettings();
        setSettingsToUI();
    }


    function getSettingsFromUI() {
        settings.zoomFactor = parseFloat(zoomTb.value) / 100;
        settings.scrollX = parseFloat(scrollXTb.value);
        settings.scrollY = parseFloat(scrollYTb.value);
        settings.elements = elementsQueryTb.value;
    }

    function setSettingsToUI() {
        updateStatusLbl();
        websiteTb.value = activeTabInfo?.host ?? "unknown";
        zoomTb.value = isNaN(settings.zoomFactor) || settings.zoomFactor === null ? "-" : String(settings.zoomFactor * 100);
        scrollXTb.value = isNaN(settings.scrollX) || settings.scrollX == null ? "-" : String(settings.scrollX);
        scrollYTb.value = isNaN(settings.scrollY) || settings.scrollY == null ? "-" : String(settings.scrollY);
        elementsQueryTb.value = settings.elements ?? "";
        saveBtn.disabled = !isHostnameValid(activeTabInfo?.host);
    }

    function updateStatusLbl() {
        const saved = settingsStatus === SettingsStatus.Saved || settingsStatus === SettingsStatus.Changed;
        const zoom = parseFloat(zoomTb.value);
        const scrollX = parseFloat(scrollXTb.value);
        const scrollY = parseFloat(scrollYTb.value);
        const query = elementsQueryTb.value;

        let changed = false;
        if (zoom / 100 != settings.zoomFactor
            || scrollX != settings.scrollX
            || scrollY != settings.scrollY
            || query != settings.elements)
            changed = true;

        if (saved && changed)
            settingsStatus = SettingsStatus.Changed;
        else if (saved && !changed)
            settingsStatus = SettingsStatus.Saved;
        else
            settingsStatus = SettingsStatus.Unsaved

        statusLbl.classList.remove("statusLbl-unsaved", "statusLbl-saved", "statusLbl-changed");

        if (settingsStatus == SettingsStatus.Unsaved) {
            statusLbl.classList.add("statusLbl-unsaved");
            statusLbl.innerText = "Unsaved";
        }
        else if (settingsStatus == SettingsStatus.Saved) {
            statusLbl.classList.add("statusLbl-saved");
            statusLbl.innerText = "Saved";
        }
        else if (settingsStatus == SettingsStatus.Changed) {
            statusLbl.classList.add("statusLbl-changed");
            statusLbl.innerText = "Changed";
        }
        else {
            statusLbl.innerText = "";
        }
    }
}