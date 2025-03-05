// will give - Base64 Image String
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
