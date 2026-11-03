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

function addWindowTab(windowId: number, tab: chrome.tabs.Tab) {

}

function removeWindowTab(windowId: number, tabId: number) {

}

function updateWindowTab(windowId: number, tab: chrome.tabs.Tab) {

}

browser.tabs.onCreated.addListener((tab: chrome.tabs.Tab) => {
    addWindowTab(tab.windowId, tab);
});

browser.tabs.onRemoved.addListener((tabId: number, removeInfo: chrome.tabs.OnRemovedInfo) => {
    removeWindowTab(removeInfo.windowId, tabId);
});

browser.tabs.onActivated.addListener((activeInfo: chrome.tabs.OnActivatedInfo)=>{
 // TODO function to change which window is first now. move the rest of the windows by one
});


// populate on chrome startup
chrome.runtime.onStartup.addListener(() => {
  populateMru();
});