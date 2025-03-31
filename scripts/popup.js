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

// - resume/pause not handled properly accross tabs. - still not functional removed that portion. DONE,
// - new ISSUE in pause/resume - if i pause from one tab i have to click resume in that tab again otherwise works but, where i paused is still in paused state.
// - new tab also gets isTracking as true
// - on reload control panel disappears in some cases, or on navigation from one page in prev page control-panel gets removed.
