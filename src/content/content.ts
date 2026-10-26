console.log("content");
// This doesn't show up on custom overriden pages
// content can only send messages
(async () => {
  const response = await browser.runtime.sendMessage({greeting: "hello"});
  // do something with response here, not outside the function
  console.log(response);
})();