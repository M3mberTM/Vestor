console.log("background");

import * as tabs from "./tabs";

browser.windows.onRemoved.addListener((windowId) => {
    // remove the whole window from the harpoon
    tabs.removeWindowFromHarpoon(windowId);
})

browser.tabs.onRemoved.addListener((tabId, info) => {
    // remove the tab if it is in harpoon and move the rest of the tabs accordingly
    tabs.removeTabFromHarpoon(tabId, info.windowId);
});


chrome.commands.onCommand.addListener(async (cmd, tab) => {
    switch (cmd) {
        case "debug":
            testCmd();
            break;
        case "add-to-harpoon":
            addCmd(tab);
            break;
        case "remove-from-harpoon":
            removeCmd(tab);
            break;
        case "harpoon-1":
            activateCmd(0);
            break;
        case "harpoon-2":
            activateCmd(1);
            break;
        case "harpoon-3":
            activateCmd(2);
            break;
        case "harpoon-4":
            activateCmd(3);
            break;
        default:
            break;
    }
});

async function testCmd() {
    const allWindows = await chrome.windows.getAll();
    console.log("=====Showing tabs per window=====");
    for (const window of allWindows) {
        if (window.id === undefined) {
            continue;
        }
        console.log(window.id, " contains ", tabs.getTabsInHarpoon(window.id));
    }
    console.log("================================");

}

function removeCmd(tab: chrome.tabs.Tab | undefined) {
    if (tab === undefined || tab.id === undefined) {
        return;
    }
    tabs.removeTabFromHarpoon(tab.id, tab.windowId);
}
function addCmd(tab: chrome.tabs.Tab | undefined) {
    if (tab === undefined) {
        return;
    }
    tabs.addTabToHarpoon(tab);
}

async function activateCmd(index: number) {
    const currWindow = await chrome.windows.getCurrent();
    if (currWindow.id === undefined) {
        console.warn("Current window does not exist?");
        return;
    }
    tabs.activateHarpoonAtPosition(index, currWindow.id);
}

async function initialize() {
    tabs.initializeHarpoonFromStorage();
}

chrome.runtime.onStartup.addListener(initialize);
chrome.runtime.onInstalled.addListener(initialize);

initialize();