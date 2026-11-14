/*
    Handles all the state in the background of the app
*/
import { getWindowTabs, moveToFront } from "./tabs";

const RESET_DELAY = 500;

type Timeout = ReturnType<typeof setTimeout> | undefined;

const windowCounters = new Map<number, number>();
const windowTimeouts = new Map<number, Timeout>();

export function getNextTab(windowId: number) {
    const tabs = getWindowTabs(windowId);

    if (tabs.length < 2) return undefined;

    let timeout = windowTimeouts.get(windowId);

    if (timeout) clearTimeout(timeout);
    let counter = windowCounters.get(windowId);

    if (counter === undefined) {
        console.log("No counter for this window");
        return tabs[0]; // default to the first element if the window counter does not exist
    }

    counter = counter + 1;
    const selectedTab = tabs[counter % tabs.length];

    timeout = setTimeout(() => {
        resetCounter(windowId)
        moveToFront(windowId, selectedTab.id!);
    }, RESET_DELAY);
    windowCounters.set(windowId, counter);
    windowTimeouts.set(windowId, timeout);
    return selectedTab;
}

export function resetCounter(windowId: number) {
    windowCounters.set(windowId, 0);

    let timeout = windowTimeouts.get(windowId);
    if (timeout) {
        clearTimeout(timeout);
        windowTimeouts.set(windowId, undefined);
    }
}

export function initializeCounterAndTimeout(windowId: number) {
    windowCounters.set(windowId, 0);
    windowTimeouts.set(windowId, undefined);
}

export function removeCounterAndTimeout(windowId: number) {
    windowCounters.delete(windowId);
    windowTimeouts.delete(windowId);
}