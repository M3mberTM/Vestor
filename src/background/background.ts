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


/*
    TODO explain the whole idea here because I am stupid. Just write down exactly how this should work
*/

// browser.runtime.onMessage.addListener(handleMessages);

// for now, work with a timer
const RESET_DELAY = 2000;

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
    let windowTabs = mru.get(windowId)
    if (!windowTabs) {
        mru.set(windowId, [tab]);
        return;
    }
    windowTabs.push(tab);
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

    mru.set(windowId, original.map(t => {
        if (areTabsSame(t, tab)) {
            return tab;
        }
        return t;
    }));
}

function placeTabAsFirst(windowId: number, tabId: number) {
    const original = mru.get(windowId);
    if (!original) {
        console.log("No tabs for the given window Id");
        return;
    }
    const copy = [...original];

    let index = 0;
    for(let i = 0; i < copy.length; i++) {
        if (copy[i].id === tabId) {
            index = i;
            break;
        }
    }

    const [item] = copy.splice(index, 1);
    copy.unshift(item);

    mru.set(windowId, copy);
}

async function switchTab(counter: number,windowId?: number) {
    if (windowId === undefined) {
        const window = await browser.windows.getLastFocused();
        windowId = window.id;
    }

    if (windowId === undefined) return;
    const tabs = mru.get(windowId);

    console.log("Trying to switch tabs");
    console.log("Counter: ", counter, " tabs: ", tabs);
    if (!tabs || tabs.length < 2) {
        console.log("Not enough tabs to switch");
        return;
    }

    counter = counter % tabs.length;
    const nextTab = tabs[counter];

    if (!nextTab.id) return;

    // Activate the previous tab
    activateConsumer = true;
    await browser.tabs.update(nextTab.id, {
        active: true
    });

}

browser.tabs.onCreated.addListener((tab: chrome.tabs.Tab) => {
    addWindowTab(tab.windowId, tab);
});

browser.tabs.onRemoved.addListener((tabId: number, removeInfo: chrome.tabs.OnRemovedInfo) => {
    removeWindowTab(removeInfo.windowId, tabId);
});

browser.tabs.onActivated.addListener((activeInfo: chrome.tabs.OnActivatedInfo)=>{
    // TODO figure out a way to only do this when the user clicks on the tab, not when my script does
    if (activateConsumer) {
        return;
    }
    placeTabAsFirst(activeInfo.windowId, activeInfo.tabId);
    counter = 0;
});


// populate on chrome startup
chrome.runtime.onStartup.addListener(() => {
  populateMru();
});

chrome.runtime.onInstalled.addListener((details) => {
    console.log("Extension installed or updated:", details.reason);

    if (
        details.reason === "install" ||
        details.reason === "update" ||
        details.reason === "chrome_update"
    ) {
        populateMru();
    }
});


let timeout: number | null  = null;
let counter = 0;
let activateConsumer = false; // used to tell the onActivate function that the script activated the tab and not the user

// main function
chrome.commands.onCommand.addListener((cmd, tab)=> {
    if (cmd === "switch-recent-tab") {
        if (timeout) {
            clearTimeout(timeout);
        }
        setTimeout(() => {
            counter = 0
        }, RESET_DELAY);

        counter++;
        switchTab(counter, tab?.windowId);
    }
})