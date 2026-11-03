console.log("content");
/*
This script responsibilities:

 - Listens for SHOW_SWITCHER messages.
 - Creates and displays the centered overlay.
 - Renders tab titles and favicons received from the background.
 - Handles keyboard navigation and selection while the overlay is open.
 - Sends the selected tab ID back to the background.
 - Removes the overlay when switching is finished.


 Since custom/overriden local pages don't work for this, make background have a backup functionality!
*/
(async () => {
	const response = await browser.runtime.sendMessage({ greeting: "hello" });
	// do something with response here, not outside the function
	console.log(response);
})();

chrome.runtime.onMessage.addListener((message) => {
	console.log(message);
});