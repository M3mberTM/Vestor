const STORAGE_KEY = "chromeHarpoon"

type TabId = number;

const harpoon = new Map<number, TabId[]>();

export function addTabToHarpoon(tab: chrome.tabs.Tab) {
    const harpoonTabs = getTabsInHarpoon(tab.windowId);

    if (!tab.id){
        console.warn("Tab doesn't have id. cannot be added to harpoon", tab);
        return;
    }

    if (harpoonTabs.includes(tab.id)) {
        console.log("Current tab already in harpoon!");
        return;
    }
    harpoon.set(tab.windowId, harpoonTabs.concat(tab.id));
}

export function getTabsInHarpoon(windowId: number) {
    return harpoon.get(windowId) ?? [];
}

export function removeTabFromHarpoon(tabId: TabId, windowId: number) {
    const harpoonTabs = getTabsInHarpoon(windowId);
    if (harpoonTabs.length === 0) {
        console.log("Harpoon doesn't contain the current window");
        return;
    }

    harpoon.set(windowId, harpoonTabs.filter(id => id !== tabId));
}

export function removeWindowFromHarpoon(windowId: number) {
    harpoon.delete(windowId);
}

export function activateHarpoonAtPosition(index: number, windowId: number) {
    const harpoonTabs = getTabsInHarpoon(windowId);
    if (harpoonTabs.length <= index) {
        console.log(`Current harpoon doesn't have a tab at index ${index}`);
        return;
    }
    chrome.tabs.update(harpoonTabs[index], {active: true});
}
/*
=======================================================================================
HANDLING THE SAVING TO SESSION STORAGE FOR WHEN THE SERVICE WORKER WAKES UP AGAIN
=======================================================================================
*/

let saveQueue = Promise.resolve();

async function loadState() {
	const result = await chrome.storage.session.get(STORAGE_KEY);

	const savedWindows = result[STORAGE_KEY] ?? {};
	Object.entries(savedWindows).forEach(([id, tabs]) => harpoon.set(Number(id), tabs));
}

function getSnapshot() {
    return [...harpoon].map(([id, tabs]) => [id, [...tabs]])
}
function saveState() {
	const serialized = Object.fromEntries(getSnapshot());

    saveQueue = saveQueue.catch(console.error).then(() =>
        chrome.storage.session.set({
            [STORAGE_KEY]: serialized,
        })
    );
}

export async function initializeHarpoonFromStorage() {
    harpoon.clear();
    loadState();
}