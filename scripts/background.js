const LOCATION_ENDPOINT = "http://localhost:3000/api";
let isExtensionActive = false;
let currentActiveTabId = null;

async function postData(data) {
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

    return resData;
  } catch (error) {
    return { error: error, message: "Failed to send data" };
  }
}

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
    chrome.storage.local.set({ isExtensionActive: isExtensionActive });

    const getActiveTabId = (callback) => {
      chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        callback(tabs[0]?.id || null);
      });
    };

    if (isExtensionActive) {
      getActiveTabId((tabId) => {
        currentActiveTabId = tabId;

        chrome.tabs.query({}, (tabs) => {
          tabs.forEach((tab) => {
            if (tab.id) {
              // chrome.scripting.executeScript({
              //   target: { tabId: tab.id },
              //   files: ["scripts/content.js"],
              // });
              chrome.tabs.sendMessage(
                tab.id,
                { action: "initControlPanel", visible: true },
                (response) => {
                  if (chrome.runtime.lastError) {
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
    chrome.tabs.sendMessage(
      sender.tab.id,
      { action: "hideControlPanel" },
      () => {
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
            setTimeout(() => {
              chrome.tabs.sendMessage(sender.tab.id, {
                action: "showControlPanel",
              });
            }, 300);
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
    });
    return true;
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
        sendResponse({ success: false, error: error.message });
      });

    return true;
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

  chrome.tabs.sendMessage(activeInfo.tabId, {
    action: "initControlPanel",
    visible: true,
  });
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
