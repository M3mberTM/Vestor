console.log("background");
// background needs to handle on message receivers. the service workers only
function handleMessages(message: any, sender: any, sendResponse: any) {
    console.log(message);
    sendResponse({
        status: "ok"
    });
}

browser.runtime.onMessage.addListener(handleMessages);