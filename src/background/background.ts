console.log("background");
/*
    This script responsibilities:

    - Tracks recently activated tabs using chrome.tabs.onActivated.
    - Tracks tab creation and removal.
    - Maintains the MRU (most-recently-used) list.
    - Handles the Alt+Q keyboard shortcut.
    - Chooses which tab should receive a message.
    - Activates the selected tab using chrome.tabs.update().
 */

// TODO make one big listener for all the message types
// background needs to handle on message receivers. the service workers only
// async function handleMessages(message: any, sender: any, sendResponse: any) {
//     console.log(message);
//     console.log(sender);
//     // await browser.tabs.sendMessage(sender.tab.id, { greeting: "hello"});
//     sendResponse({
//         status: "background send"
//     });
// }

// browser.runtime.onMessage.addListener(handleMessages);

const mru = new Map<number, chrome.tabs.Tab[]>();

async function getAllTabs(): Promise<chrome.tabs.Tab[]> {
    const tabs = await browser.tabs.query({});
    return tabs;
}


/**
 * Populates the mru map with the tabs based on the window in which they are located
 */
async function populateMru() {
    const tabs = await getAllTabs();
    for (const tab of tabs) {
        const existingWindowTabs = mru.get(tab.windowId);
        if (!existingWindowTabs) {
            mru.set(tab.windowId, [])
        }
        mru.get(tab.windowId)!.push(tab);
    }
}

function areTabsSame(tab1: chrome.tabs.Tab, tab2: chrome.tabs.Tab): boolean {
    return tab1.id != undefined && tab2.id != undefined && tab1.id === tab2.id;
}




function addWindowTab(windowId: number, tab: chrome.tabs.Tab) {
    if (!tab.id) {
        console.log("Undefined Id for tab", tab);
        return;
    }
    mru.get(windowId)?.push(tab)
}

function removeWindowTab(windowId: number, tabId: number) {
    if (!tabId) {
        return;
    }
    const original = mru.get(windowId);
    if (!original) {
        return
    }

    mru.set(windowId, original.filter((t) => t.id !== tabId));
}

function updateWindowTab(windowId: number, tab: chrome.tabs.Tab) {
    const original = mru.get(windowId);
    if (!original) {
        return
    }

    original.map(t => {
        if (areTabsSame(t, tab)) {
            return tab;
        }
        return t;
    })
}

function placeTabAsFirst(windowId: number, tabId: number) {
    const original = [...mru.get(windowId)!];

    let index = 0;
    for(let i = 0; i < original.length; i++) {
        if (original[i].id === tabId) {
            index = i;
            break;
        }
    }

    const [item] = original.splice(index, 1);
    original.unshift(item);

    mru.set(windowId, original);
}

browser.tabs.onCreated.addListener((tab: chrome.tabs.Tab) => {
    addWindowTab(tab.windowId, tab);
});

browser.tabs.onRemoved.addListener((tabId: number, removeInfo: chrome.tabs.OnRemovedInfo) => {
    removeWindowTab(removeInfo.windowId, tabId);
});

browser.tabs.onActivated.addListener((activeInfo: chrome.tabs.OnActivatedInfo)=>{
    placeTabAsFirst(activeInfo.windowId, activeInfo.tabId);
});


// populate on chrome startup
chrome.runtime.onStartup.addListener(() => {
  populateMru();
});