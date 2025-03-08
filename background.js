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

async function postData(data) {
  console.log("sending image data...");
  try {
    const response = await fetch(`${LOCATION_ENDPOINT}/save-screenshot`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    const resData = await response.json();
    // const res = await response.json();
    console.log("resData: ", resData);
    // console.log("response.body: ", JSON.stringify(resData.body));

    return resData;
  } catch (error) {
    console.error("Error:", error);
    return { error: "Failed to send data", message: error.message };
  }
}

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
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
  if (message.action === "postimages") {
    console.log("Calling postimages...");
    postData(message.data)
      .then((response) => {
        // console.log("postData response:", response);
        if (response.error) {
          sendResponse({ success: false, data: response });
        }
        sendResponse({ success: true, data: response });
      })
      .catch((error) => {
        console.error("Error in postData:", error);
        sendResponse({ success: false, error: error.message });
      });

    return true; // IMPORTANT: This keeps the connection open for async response
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
