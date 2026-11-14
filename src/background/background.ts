console.log("background");

import * as tabs from "./tabs";
import { getNextTab, resetCounter, initializeCounterAndTimeout, removeCounterAndTimeout } from "./state";

let pendingActivation: number | undefined;

browser.windows.onCreated.addListener((window) => {
    if (!window.id) return;
    initializeCounterAndTimeout(window.id);
})

browser.windows.onRemoved.addListener((windowId) => {
    initializeCounterAndTimeout(windowId);
})


browser.tabs.onCreated.addListener(tab => {
    tabs.addTab(tab.windowId, tab);
});

browser.tabs.onRemoved.addListener((tabId, info) => {
    tabs.removeTab(info.windowId, tabId);
});

browser.tabs.onUpdated.addListener((_tabId, _changeInfo, tab) => {
    tabs.updateTab(tab.windowId, tab);
});

browser.tabs.onActivated.addListener(info => {
    if (pendingActivation === info.tabId) {
        pendingActivation = undefined;
        return;
    }

    tabs.moveToFront(info.windowId, info.tabId);
    resetCounter(info.windowId);
});

chrome.commands.onCommand.addListener(async (cmd, tab) => {
    if (cmd !== "switch-recent-tab") return;
    let windowId = tab?.windowId;
    if (windowId === undefined) {
        const window = await browser.windows.getLastFocused();
        windowId = window.id;
    }

    if (windowId === undefined) return;

    const nextTab = getNextTab(windowId);

    if (nextTab?.id === undefined) return;

    pendingActivation = nextTab.id;

    try {
        await browser.tabs.update(nextTab.id, {
            active: true
        });
    } catch (error) {
        pendingActivation = undefined;
        console.error(error);
    }
});

async function initialize() {
    await tabs.initializeTabs();
    await browser.windows.getAll().then((windows) =>{
        console.log("loaded the windows", windows);
        for (const window of windows) {
            if (window.id === undefined) {
                console.log("skipping ", window);
                continue;
            }
            initializeCounterAndTimeout(window.id);
        }
    });
}

chrome.runtime.onStartup.addListener(initialize);
chrome.runtime.onInstalled.addListener(initialize);

initialize();