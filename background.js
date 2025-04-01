const LOCATION_ENDPOINT = "http://localhost:3000/api";
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
      visible: true,
    });
  }
});

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === "setExtensionState") {
    isExtensionActive = message.active;

    // Get active tab ID safely
    const getActiveTabId = (callback) => {
      chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        callback(tabs[0]?.id || null);
      });
    };

    if (isExtensionActive) {
      // Get ID from either sender or active tab
      getActiveTabId((tabId) => {
        currentActiveTabId = tabId;

        // Initialize in all tabs
        chrome.tabs.query({}, (tabs) => {
          tabs.forEach((tab) => {
            if (tab.id) {
              chrome.scripting.executeScript({
                target: { tabId: tab.id },
                files: ["contentTEST.js"],
              });
              chrome.tabs.sendMessage(
                tab.id,
                { action: "initControlPanel", visible: true },
                (response) => {
                  if (chrome.runtime.lastError) {
                    /* Silently ignore tabs without content script */
                  }
                }
              );
            }
          });
        });
      });
    } else {
      // Hide in all tabs
      chrome.tabs.query({}, (tabs) => {
        tabs.forEach((tab) => {
          if (tab.id) {
            chrome.tabs.sendMessage(
              tab.id,
              { action: "hideControlPanel" },
              (response) => {
                if (chrome.runtime.lastError) {
                  /* Silently ignore tabs without content script */
                }
              }
            );
          }
        });
      });
    }
    sendResponse({ success: true });
  }
  if (message.action === "syncTrackingState") {
    chrome.storage.local.set({ isTracking: message.isTracking }, () => {
      chrome.tabs.query({}, (tabs) => {
        tabs.forEach((tab) => {
          if (tab.id) {
            chrome.tabs.sendMessage(tab.id, {
              action: "updateTrackingState",
              isTracking: message.isTracking,
            });
          }
        });
      });
    });
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
    // pass tab title from here
    chrome.tabs.sendMessage(
      sender.tab.id,
      { action: "hideControlPanel" },
      () => {
        // console.log("tab title: ", sender.tab.title);
        const tabTitle = sender.tab.title;
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
            sendResponse({ screenshotUrl, tabTitle });
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
  chrome.storage.local.set({
    screenshotData: [],
    badgeCount: 0,
    isTracking: false,
  });
});

chrome.tabs.onActivated.addListener((activeInfo) => {
  if (!isExtensionActive) return;

  // Force re-initialization when switching tabs
  chrome.tabs.sendMessage(activeInfo.tabId, {
    action: "initControlPanel",
    visible: true,
  });
  // chrome.tabs.sendMessage(activeInfo.tabId, {
  //   action: "updateBadgeFromStorage",
  // });
});

chrome.webNavigation.onCompleted.addListener((details) => {
  if (!isExtensionActive) return;

  chrome.tabs.sendMessage(
    details.tabId,
    {
      action: "initControlPanel",
      visible: true,
    },
    () => {
      if (chrome.runtime.lastError) {
      }
    }
  );
});
