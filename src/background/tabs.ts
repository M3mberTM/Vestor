/*
    Just pure functions only. handles playing with the tabs
*/

type TabId = number;

const mru = new Map<number, TabId[]>();
let saveQueue = Promise.resolve();

// functions handling saving stuff to storage so that the background worker remembers between resets
function persistTabs() {
    const entries =[...mru.entries()].map(([windowId, tabs]) => [ windowId, tabs ])
    const snapshot = Object.fromEntries(entries);

    saveQueue = saveQueue
        .then(() => chrome.storage.session.set({ mru: snapshot }))
        .catch(console.error);
}

export async function initializeTabs() {
    const [tabs, stored] = await Promise.all([
        browser.tabs.query({}),
        chrome.storage.session.get("mru")
    ]);

    console.log("Queried tabs ", tabs, " and stored: ", stored);

    const saved = (stored["mru"] ?? {}) as  Record<number, number[]>;

    mru.clear();

    // First add the stored tabs in the mru as they preserve the order while the queried tabs don't
    for (const [windowId, windowTabs] of Object.entries(saved)) {
        const currentTabs = mru.get(Number(windowId)) ?? [];
        for (const tabId of windowTabs) {
            currentTabs.push(tabId);
        }
        mru.set(Number(windowId), currentTabs);
    }

    for (const tab of tabs) {
        if (tab.id === undefined || tab.windowId === undefined) continue

        const windowTabs = mru.get(tab.windowId) ?? [];
        if (windowTabs.includes(tab.id)) continue
        windowTabs.push(tab.id);
        mru.set(tab.windowId, windowTabs);
    }


    console.log("Current mru ", mru);

}

export function getWindowTabs(windowId: number) {
    return mru.get(windowId) ?? [];
}

export function addTab(windowId: number, tab: number | undefined) {
    if (tab === undefined) return;
    const tabs = mru.get(windowId) ?? [];

    mru.set(windowId, [...tabs, tab]);

    persistTabs();
}

export function removeTab(windowId: number, tabId: number) {
    const tabs = mru.get(windowId);

    if (!tabs) return;

    mru.set(
        windowId,
        tabs.filter(tab => tab !== tabId)
    );

    persistTabs();
}

export function moveToFront(windowId: number, tabId: number) {
    const tabs = mru.get(windowId);

    if (!tabs) return;

    const index = tabs.findIndex(tab => tab === tabId);

    if (index === -1) return;

    const updated = [
        tabs[index],
        ...tabs.slice(0, index),
        ...tabs.slice(index + 1)
    ];

    mru.set(windowId, updated);
    persistTabs();
}

