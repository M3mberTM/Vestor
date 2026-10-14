import { NoFirstNodeError } from "./types.js";

// TODO figure out a better way of doing the timeout
const TIMEOUT = 1000;
// TODO replace allTabs with a Map so that I can handle multiple window at once (key: windowId, value: allTabs)
// TODO don't use Tab objects, but just tab ids
let allTabs: chrome.tabs.Tab[] = [];

formInitialList().then(tabs => {
    allTabs = [...tabs];
    console.log(allTabs);
}).catch(err => {
    if (err instanceof NoFirstNodeError) {
        console.error(err.message);
        return;
    }
    console.error(err);
});


let timeout: number | null = null;
let tabIndex = 0;
chrome.commands.onCommand.addListener((command) => {
    if (command === "switch-recent-tab") {
        if (timeout) {
            clearTimeout(timeout);
        }
        tabIndex = (tabIndex + 1) % allTabs.length;
        switchTab(allTabs[tabIndex]);
        timeout = setTimeout(() => {
            updateList(tabIndex);
            tabIndex = 0;
            logList();
        }, TIMEOUT);
    }
})

function updateList(activeIndex: number) {
    if (allTabs.length < 3) {
        const first = allTabs[0];
        const second = allTabs[1];
        allTabs[1] = first;
        allTabs[0] = second;
        return;
    }
    const first = allTabs[0];
    const second = allTabs[1];
    const picked = allTabs[activeIndex];

    allTabs[0] = picked;
    allTabs[1] = first;
    allTabs[2] = second;

}

function logList() {
    for (let tab of allTabs) {
        console.log(tab.title);
    }
    console.log("==========\n");
}

async function switchTab(tab: chrome.tabs.Tab) {
    chrome.tabs.update(tab.id, { active: true });

}
async function getAllTabs(): Promise<chrome.tabs.Tab[]> {
    let allTabs = await chrome.tabs.query({ currentWindow: true });
    return allTabs;
}

async function formInitialList(): Promise<chrome.tabs.Tab[]> {
    const tabs = await getAllTabs();
    if (tabs.length === 0) {
        throw new NoFirstNodeError();
    }
    for (let i = 0; i < tabs.length; i++) {
        const tab = tabs[i];
        if (tab.active) {
            const temp = tabs[0];
            tabs[0] = tab;
            tabs[i] = temp;
            return tabs;
        }
    }
    return tabs;
}
