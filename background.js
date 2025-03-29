// const LOCATION_ENDPOINT = "http://localhost:3000/api";
// const LOCATION_ENDPOINT = "https://localhost:3000/api";
let isExtensionActive = false;
let currentActiveTabId = null;

console.log("Background script is running...");
function fetchStatus() {
  console.log("fetchStatus called...");
  fetch(LOCATION_ENDPOINT)
    .then((data) => {
      console.log("data: ", data);
    })
    .catch((error) => {
      console.error("Fetch error: ", error);
    });
}

async function postData(data) {
  console.log("sending image data...");
  try {
    const response = await fetch(`${LOCATION_ENDPOINT}/save-screenshot`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    const resData = await response.json();
    if (!response.ok) {
      throw new Error(
        resData.error || `HTTP error! Status: ${response.status}`
      );
    }
    console.log("resData: ", resData);

    return resData;
  } catch (error) {
    console.error("Error:", error);
    return { error: "Failed to send data", message: error.message };
  }
}

// Handle new tab creation
chrome.tabs.onCreated.addListener((tab) => {
  if (isExtensionActive) {
    chrome.tabs.sendMessage(tab.id, {
      action: "initControlPanel",
      visible: false,
    });
  }
});

// Update tab title when it changes
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (isExtensionActive && changeInfo.title && tabId === currentActiveTabId) {
    chrome.tabs.sendMessage(tabId, {
      action: "updateTabTitle",
      tabTitle: tab.title,
    });
  }
});

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === "setExtensionState") {
    isExtensionActive = message.active;
    if (isExtensionActive) {
      currentActiveTabId = sender.tab.id;
      // Initialize in all tabs
      chrome.tabs.query({}, (tabs) => {
        tabs.forEach((tab) => {
          if (tab.id) {
            chrome.tabs.sendMessage(tab.id, {
              action: "initControlPanel",
              visible: tab.id === sender.tab.id,
            });
          }
        });
      });
    } else {
      // Hide in all tabs
      chrome.tabs.query({}, (tabs) => {
        tabs.forEach((tab) => {
          if (tab.id) {
            chrome.tabs.sendMessage(tab.id, {
              action: "hideControlPanel",
            });
          }
        });
      });
    }
    sendResponse({ success: true });
  }

  if (message.action === "redirectToDashboard") {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs.length > 0 && tabs[0].id) {
        chrome.tabs.update(tabs[0].id, {
          url: `${LOCATION_ENDPOINT}/dashboard`,
        });
      }
    });
  }
  if (message.action === "captureScreenshot") {
    // ask to hide
    chrome.tabs.sendMessage(
      sender.tab.id,
      { action: "hideControlPanel" },
      () => {
        chrome.tabs.captureVisibleTab(
          null,
          { format: "png" },
          (screenshotUrl) => {
            if (chrome.runtime.lastError) {
              console.error(
                "Error capturing screenshot:",
                chrome.runtime.lastError
              );
              return;
            }
            // restore control panel by asking to content scr
            setTimeout(() => {
              chrome.tabs.sendMessage(sender.tab.id, {
                action: "showControlPanel",
              });
            }, 300);
            // Send the screenshot URL back to the content script
            sendResponse({ screenshotUrl });
          }
        );
      }
    );
    return true;
  }
  if (message.action === "downloadScreenshot") {
    chrome.tabs.captureVisibleTab(null, { format: "png" }, (screenshotUrl) => {
      if (chrome.runtime.lastError) {
        console.error("Error capturing screenshot:", chrome.runtime.lastError);
        sendResponse({
          success: false,
          error: "Failed to capture screenshot",
        });
        return;
      }

      chrome.downloads.download(
        {
          url: screenshotUrl,
          filename: `guider-screenshot-${Date.now()}.png`,
          saveAs: false,
        },
        () => {
          if (chrome.runtime.lastError) {
            console.error(
              "Error downloading screenshot:",
              chrome.runtime.lastError
            );
            sendResponse({
              success: false,
              error: "Failed to download screenshot",
            });
            return;
          }

          sendResponse({ success: true });
        }
      );

      // add step after download
    });

    // Return true to indicate response will be sent asynchronously
    return true;
  }
  if (message.action === "fetchStatus") {
    console.log("Calling fetchStatus...");
    fetchStatus();
  }
  if (message.action === "postimages") {
    console.log("Calling postimages...");
    postData(message.data)
      .then((response) => {
        if (response.error) {
          sendResponse({ success: false, data: response });
        }
        sendResponse({ success: true, data: response });
      })
      .catch((error) => {
        console.error("Error in postData:", error);
        sendResponse({ success: false, error: error.message });
      });

    return true; //keeps the connection open for async response
  }
});

chrome.runtime.onInstalled.addListener(() => {
  chrome.storage.local.set({ screenshotData: [], badgeCount: 0 });
});
