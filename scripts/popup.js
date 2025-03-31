document.getElementById("showDivButton").addEventListener("click", () => {
  // Send a message to the content script to append the custom div
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    chrome.tabs.sendMessage(tabs[0].id, { action: "showDiv" });
  });
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    if (tabs[0]?.id) {
      chrome.runtime.sendMessage(
        {
          action: "setExtensionState",
          active: true,
        },
        () => {
          window.close();
        }
      );
    }
  });
});
document.getElementById("goToDashboard").addEventListener("click", () => {
  chrome.runtime.sendMessage({ action: "redirectToDashboard" });
});

// TODO

// - new tab also gets isTracking as true
