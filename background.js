const LOCATION_ENDPOINT = "http://localhost:3000/api";

console.log("Background script is running...");
function fetchStatus() {
  console.log("fetchStatus called...");
  fetch(LOCATION_ENDPOINT)
    // .then((response) => response.json())
    .then((data) => {
      console.log("data: ", data);
    })
    .catch((error) => {
      console.error("Fetch error: ", error);
    });
}

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === "captureScreenshot") {
    chrome.tabs.captureVisibleTab(null, { format: "png" }, (screenshotUrl) => {
      if (chrome.runtime.lastError) {
        console.error("Error capturing screenshot:", chrome.runtime.lastError);
        return;
      }
      // Send the screenshot URL back to the content script
      sendResponse({ screenshotUrl });
    });
    // Return true to indicate that the response will be sent asynchronously
    return true;
  }
  if (message.action === "fetchStatus") {
    console.log("Calling fetchStatus...");
    fetchStatus();
  }

  // for development purposes
  // if (message.action === "openRenderTab") {
  //   const { screenshotUrl, clickCoordinates } = message;

  //   // Open render.html in a new tab
  //   chrome.tabs.create({ url: chrome.runtime.getURL("render.html") }, (tab) => {
  //     // Wait for the tab to load and then send the screenshot and coordinates
  //     chrome.tabs.onUpdated.addListener(function onUpdated(tabId, changeInfo) {
  //       if (tabId === tab.id && changeInfo.status === "complete") {
  //         // Send the screenshot and coordinates to the render.html page
  //         chrome.tabs.sendMessage(tab.id, {
  //           screenshotUrl: screenshotUrl,
  //           clickCoordinates: clickCoordinates,
  //         });
  //       }
  //     });
  //   });
  // }
});
