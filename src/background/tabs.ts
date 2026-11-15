/*
    Just pure functions only. handles playing with the tabs
*/

type TabId = number;

const mru = new Map<number, TabId[]>();
let saveQueue = Promise.resolve();

// functions handling saving stuff to storage so that the background worker remembers between resets
function persistTabs() {
    const snapshot = Object.fromEntries(
        [...mru.entries()].map(([windowId, tabs]) => [
            windowId,
            tabs
        ])
    );

    saveQueue = saveQueue
        .then(() => chrome.storage.session.set({ mru: snapshot }))
        .catch(console.error);
}

export async function initializeTabs() {
    const [tabs, stored] = await Promise.all([
        browser.tabs.query({}),
        chrome.storage.session.get("mru")
    ]);

    console.log("initialized tabs", tabs, " and stored: ", stored);
    // mru.clear();

    // for (const tab of tabs) {
    //     addTab(tab.windowId, tab);
    // }


    const saved = (stored["mru"] ?? {}) as  Record<number, number[]>;

    mru.clear();

    for (const tab of tabs) {
        const windowId = tab.windowId;

        if (!mru.has(windowId)) {
            const savedIds: number[] = saved[windowId] ?? [];

            const queriedTabIds = tabs.map(t => t.id).filter(t => t !== undefined);

            const allIds = new Set(savedIds.concat(queriedTabIds));

            for (const id of allIds) {
                addTab(windowId, id);
            }
            // const orderedTabs = savedIds
            //     .map((id: number) => tabs.find(t => t.id === id))
            //     .filter((t: chrome.tabs.Tab | undefined): t is chrome.tabs.Tab =>
            //         t !== undefined && t.windowId === windowId
            //     ).map(t => t.id);

            // const existingIds = new Set(orderedTabs.map(t => t));
            // const tabIds = tabs.filter(t =>
            //         t.windowId === windowId && t.id !== undefined && !existingIds.has(t.id)
            //     ).map(t => t.id)

            // mru.set(windowId, [
            //     ...orderedTabs,
            // ]);
        }
    }


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

