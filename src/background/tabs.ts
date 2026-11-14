/*
    Just pure functions only. handles playing with the tabs
*/

const mru = new Map<number, chrome.tabs.Tab[]>();

export async function initializeTabs() {
    const tabs = await browser.tabs.query({});
    console.log("initalized tabs", tabs);
    mru.clear();

    for (const tab of tabs) {
        addTab(tab.windowId, tab);
    }
}

export function getWindowTabs(windowId: number) {
    return mru.get(windowId) ?? [];
}

export function addTab(windowId: number, tab: chrome.tabs.Tab) {
    if (tab.id === undefined) return;

    const tabs = mru.get(windowId) ?? [];

    mru.set(windowId, [...tabs, tab]);
}

export function removeTab(windowId: number, tabId: number) {
    const tabs = mru.get(windowId);

    if (!tabs) return;

    mru.set(
        windowId,
        tabs.filter(tab => tab.id !== tabId)
    );
}

export function updateTab(windowId: number, updatedTab: chrome.tabs.Tab) {
    const tabs = mru.get(windowId);

    if (!tabs) return;

    mru.set(
        windowId,
        tabs.map(tab =>
            tab.id === updatedTab.id ? updatedTab : tab
        )
    );
}

export function moveToFront(windowId: number, tabId: number) {
    const tabs = mru.get(windowId);

    if (!tabs) return;

    const index = tabs.findIndex(tab => tab.id === tabId);

    if (index === -1) return;

    const updated = [
        tabs[index],
        ...tabs.slice(0, index),
        ...tabs.slice(index + 1)
    ];

    mru.set(windowId, updated);
}