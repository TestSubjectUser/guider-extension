document.getElementById("showDivButton").addEventListener("click", () => {
  // Send a message to the content script to append the custom div
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    chrome.tabs.sendMessage(tabs[0].id, { action: "showDiv" });
  });
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    if (tabs[0] && tabs[0].id) {
      chrome.runtime.sendMessage(
        {
          action: "setExtensionState",
          active: true,
        },
        () => {
          window.close(); // Close the popup
        }
      );
    }
  });
});
document.getElementById("goToDashboard").addEventListener("click", () => {
  chrome.runtime.sendMessage({ action: "redirectToDashboard" });
});
