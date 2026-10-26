const link = document.getElementById("chromeLink");
if (!link) {
    console.error("No link on the page")
} else {
    link.addEventListener("click", () => {
        chrome.tabs.create({ url: "chrome://extensions/shortcuts" });
    })
}