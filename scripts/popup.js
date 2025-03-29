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

// - when i click on checkIcon for submitting control panel only gets removed from current tab only not from all the tabs.
// - when i switch to other tabs my badge does not get updated stays same, whenever i click in any tab my badge count should be updated and displayed that count in every tab.
// - also pause button only pauses in current tab not all the tabs.
