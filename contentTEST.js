const API_URL = "http://localhost:3000";
let Data = [];
let isTracking = false;
let badgeCount = 0;

function customBackdrop(textMessage, seconds = 1000) {
  if (document.getElementById("custom-backdrop")) return;

  // Create backdrop
  const backdrop = document.createElement("div");
  backdrop.id = "custom-backdrop";
  backdrop.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.6);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 10000;
    opacity: 0;
    transition: opacity 0.3s ease-in-out;
  `;

  // Create message container
  const message = document.createElement("div");
  message.textContent = textMessage;
  message.style.cssText = `
    color: white;
    font-size: 3rem;
    font-weight: bold;
    text-align: center;
    text-shadow: 3px 3px 10px rgba(255, 255, 255, 0.5);
    opacity: 0;
    transition: opacity 0.3s ease-in-out;
  `;

  backdrop.appendChild(message);
  document.body.appendChild(backdrop);

  // fade-in effect
  setTimeout(() => {
    backdrop.style.opacity = "1";
    message.style.opacity = "1";
  }, 10);

  setTimeout(() => removeBackdrop(), seconds);
  backdrop.addEventListener("click", removeBackdrop);

  function removeBackdrop() {
    backdrop.style.opacity = "0";
    message.style.opacity = "0";
    setTimeout(() => backdrop.remove(), 300);
  }
}

function createLoadingBackdrop() {
  if (document.getElementById("loading-backdrop")) return;

  const backdrop = document.createElement("div");
  // backdrop.innerHTML = "Processing your images...";
  backdrop.id = "loading-backdrop";
  backdrop.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.5);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 10000;
  `;

  const spinner = document.createElement("div");
  spinner.style.cssText = `
    width: 50px;
    height: 50px;
    border: 5px solid #ffffff;
    border-top: 5px solid transparent;
    border-radius: 50%;
    animation: spin 1s linear infinite;
  `;

  const style = document.createElement("style");
  style.textContent = `
    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }
  `;

  document.head.appendChild(style);
  backdrop.appendChild(spinner);
  document.body.appendChild(backdrop);
}

function showLoadingBackdrop() {
  let backdrop = document.getElementById("loading-backdrop");
  if (!backdrop) backdrop = createLoadingBackdrop();
  document.getElementById("loading-backdrop").style.display = "flex";
}

function hideLoadingBackdrop() {
  const backdrop = document.getElementById("loading-backdrop");
  if (backdrop) backdrop.remove();
}

function appendCustomDiv() {
  if (document.getElementById("control-panel")) {
    return;
  }

  const controlPanelModel = document.createElement("div");

  controlPanelModel.id = "control-panel";
  controlPanelModel.style.cssText = `
    display: flex;
    max-width: 280px;
    align-items: center;
    background-color: white;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    border-radius: 8px;
    padding: 10px;
    position: fixed;
    bottom: 20px;
    left: 20px;
    z-index: 9999;
  `;

  const createButton = (text) => {
    const button = document.createElement("button");
    button.style.cssText = `
      display: flex;
      align-items: center;  
      margin-right: 10px;
      color:rgb(150, 150, 150);
      background: transparent;
      border: none;
      cursor: pointer;
      transition: color 0.3s;
    `;
    button.onmouseover = () => {
      button.style.color = "#2d3748";
      button.style.backgroundColor = "#edf2f7";
      button.style.borderRadius = "8px";
    };
    button.onmouseout = () => {
      button.style.color = "rgb(150, 150, 150)";
      button.style.backgroundColor = "transparent";
    };

    const span = document.createElement("span");
    span.textContent = text;

    button.appendChild(span);
    return button;
  };

  // DONE - button
  const checkIcon = document.createElement("button");
  checkIcon.id = "done__button__id";

  checkIcon.style.cssText = `
    border: none;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 40px;
    height: 40px;
    background-color: rgb(255, 89, 66);
    border-radius: 50%;
    margin-right: 10px;
    position: relative;
    color: white;
    `;
  checkIcon.onmouseover = () => {
    checkIcon.style.backgroundColor = "rgb(238, 48, 27)";
  };
  checkIcon.onmouseout = () => {
    checkIcon.style.backgroundColor = "rgb(255, 89, 66)";
  };
  checkIcon.innerText = "Done";

  const badge = document.createElement("span");
  badge.textContent = badgeCount;
  badge.className = "button__badge";
  badge.id = "button__badge";
  badge.style.cssText = `
  background-color: rgb(238, 48, 27);
  border-radius: 50%;
  color: white;
  font-size: 10px;
  position: absolute;
  top: -3px;
  right: -3px;
  min-width: 16px;
  min-height: 16px;
  text-align: center;
  display: none;
  font-weight: bold;
  `;

  checkIcon.appendChild(badge);
  const pauseButton = createButton("Pause");
  const screenshotButton = createButton("Schreenshot");
  const restartButton = createButton("Restart");
  const closeButton = createButton(" X ");

  checkIcon.addEventListener("click", async () => {
    disableMouseTracking();
    chrome.runtime.sendMessage({ action: "fetchStatus" });

    const controlPanel = document.getElementById("control-panel");
    // console.log("Captured Data: ", Data);
    let currUrl = window.location.href;
    currUrl = currUrl.split("://")[1] || currUrl;
    Data.push({ urlWeAreOn: currUrl });

    try {
      await sendToBackend(Data);
    } catch (error) {
      showErrorPopup("Failed to send data to backend: " + error.message);
    }

    if (controlPanel) document.body.removeChild(controlPanelModel);
    badgeCount = 0;
    Data = [];
  });

  pauseButton.addEventListener("click", () => {
    if (isTracking) {
      customBackdrop("Paused");
      pauseButton.textContent = "PAUSED";
      disableMouseTracking();
    } else {
      pauseButton.textContent = "Pause";
      enableMouseTracking();
    }
  });

  screenshotButton.addEventListener("click", () => {
    chrome.runtime.sendMessage({ action: "downloadScreenshot" }, (response) => {
      console.log("Screenshot saved, responce: ", response);
    });
  });

  restartButton.addEventListener("click", () => {
    customBackdrop("Restarted", 500);
    badgeCount = 0;
    Data = [];
    // document.getElementById("button__badge").textContent = badgeCount;
    document.getElementById("button__badge").style.display = "none";
  });
  closeButton.addEventListener("click", () => {
    badgeCount = 0;
    Data = [];
    document.getElementById("button__badge").style.display = "none";
    document.body.removeChild(controlPanelModel);
    disableMouseTracking();
  });

  controlPanelModel.appendChild(checkIcon);
  controlPanelModel.appendChild(pauseButton);
  controlPanelModel.appendChild(screenshotButton);
  controlPanelModel.appendChild(restartButton);
  controlPanelModel.appendChild(closeButton);

  document.body.appendChild(controlPanelModel);

  enableMouseTracking();
}

function showErrorPopup(errorMessage) {
  // Remove existing popup if present
  if (document.getElementById("error-popup")) return;

  const popup = document.createElement("div");
  popup.id = "error-popup";
  popup.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    background-color:rgb(239, 221, 221);
    color:rgb(148, 39, 39);
    padding: 15px;
    border-radius: 5px;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    z-index: 10000;
    max-width: 300px;
    font-size: 14px;
    display: flex;
    align-items: center;
  `;

  const message = document.createElement("span");
  message.textContent = errorMessage;
  message.style.flex = "1";

  // const closeButton = document.createElement("button");
  // closeButton.innerHTML = "&#10006;"; // Close (X) icon
  // closeButton.style.cssText = `
  //   background: none;
  //   border: none;
  //   color: white;
  //   font-size: 16px;
  //   margin-left: 10px;
  //   cursor: pointer;
  // `;
  // closeButton.onclick = () => popup.remove();

  popup.appendChild(message);
  // popup.appendChild(closeButton);
  document.body.appendChild(popup);

  // Auto-hide after 5 seconds
  setTimeout(() => popup.remove(), 5000);
}

async function handleMouseClick(event) {
  const controlPanel = document.getElementById("control-panel");
  if (controlPanel && controlPanel.contains(event.target)) {
    return;
  }

  let textOfClickedElement = formatElementText(event.target);

  const x = event.clientX;
  const y = event.clientY;
  // console.log(`Mouse clicked at coordinates: X: ${x}, Y: ${y}`);

  const pageWidth = window.innerWidth;
  const pageHeight = window.innerHeight;
  // console.log(`Page size: Width: ${pageWidth}, Height: ${pageHeight}`);

  const relativeX = (x / pageWidth) * 100;
  const relativeY = (y / pageHeight) * 100;
  // console.log(`Relative coordinates as percentage: X: ${relativeX}%, Y: ${relativeY}%`);

  event.preventDefault();

  // let targetUrl = "";
  // if (event.target.tagName === "A" && event.target.href) {
  //   targetUrl = event.target.href;
  // }

  chrome.runtime.sendMessage({ action: "captureScreenshot" }, (response) => {
    if (chrome.runtime.lastError) {
      showErrorPopup("Failed to capture screenshot. Please try again.");
      return;
    }
    const screenshotUrl = response.screenshotUrl;
    // chrome.runtime.sendMessage({
    //   action: "openRenderTab",
    //   screenshotUrl: screenshotUrl,
    //   clickCoordinates: { x: relativeX, y: relativeY },
    // });
    const data = {
      // mouseCoordinates: { x, y },
      // pageSize: { width: pageWidth, height: pageHeight },
      title: textOfClickedElement,
      relativeCoordinates: { x: relativeX, y: relativeY },
      screenshotUrl: screenshotUrl,
    };
    // TO LOCAL ARRAY
    if (Data.length < 5) {
      badgeCount++;
      // console.log("badgeCount: ", badgeCount);
      document.getElementById("button__badge").textContent = badgeCount;
      document.getElementById("button__badge").style.display = "inline-block";
      console.log("Added to array");
      Data.push(data);
    } else {
      console.log("__Reached limit__");
      showErrorPopup("You have reached the limit of 5 images");
    }

    // if (targetUrl) {
    //   setTimeout(() => {
    //     window.location.href = targetUrl;
    //   }, 500);
    // }
  });
}

function sendToBackend(data) {
  console.log("Sending data to backend...");
  showLoadingBackdrop();

  return new Promise((resolve, reject) => {
    chrome.runtime.sendMessage({ action: "postimages", data }, (response) => {
      if (chrome.runtime.lastError) {
        // console.error("Runtime Error:", chrome.runtime.lastError);
        hideLoadingBackdrop();
        showErrorPopup("Runtime Error: " + chrome.runtime.lastError.message);
        reject(chrome.runtime.lastError);
      } else {
        // console.log("Response received from background.js:", response);
        // window.location.href = API_URL + response.data.urlToVists;
        // resolve(response);
        console.log("Response received from background.js:", response);

        if (response.success) {
          setTimeout(() => {
            // window.location.href = API_URL + response.data.urlToVists;
            const newTabUrl = API_URL + response.data.urlToVists;
            window.open(newTabUrl, "_blank");
          }, 1000);
        } else {
          showErrorPopup(response.data.message);
          // console.error(
          //   "Error in sending data to backend:",
          //   response.data.message
          // );
        }
        // TOD - ERROR POPUP
        hideLoadingBackdrop(); // Hide loading on success
        resolve(response);
      }
    });
  });
}

function enableMouseTracking() {
  isTracking = true;
  document.addEventListener("click", handleMouseClick);
}

function disableMouseTracking() {
  isTracking = false;
  document.removeEventListener("click", handleMouseClick);
}

function formatElementText(element) {
  let text = element.innerText || element.textContent || "";
  return text.length > 15
    ? `Clicked on ${text.slice(0, 15).replace(/\n/g, " ")}...`
    : `Clicked on ${text.replace(/\n/g, " ")}`;
}

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === "hideControlPanel") {
    console.log("Hiding control panel...");
    const controlPanel = document.getElementById("control-panel");
    if (controlPanel) {
      controlPanel.style.display = "none";
    }
    sendResponse({ success: true });
  }

  if (message.action === "showControlPanel") {
    console.log("Restoring control panel...");
    const controlPanel = document.getElementById("control-panel");
    if (controlPanel) {
      controlPanel.style.display = "flex";
    }
    sendResponse({ success: true });
  }
  if (message.action === "showDiv") {
    customBackdrop("Capturing Started...");
    appendCustomDiv();
  }
});

// Current - in screenshot collection each document carries
/*
 * relativeCoordinates: {x: 50, y: 50}
 * screenshotUrl: "data:image/png;base64,iVBORw0KGgoA..."
 * timestamp: 10 March 2025 at 13:34:27 UTC+5:30
 * title: "Clicked on button"
 */

// Updated - return document id only
// document carries
/*
 * guideTitle: "title of the guide"
 * guideDescription: "description of the guide"
 * guideImages: [title: "Clicked on button", description: "description", relativeCoordinates: {x: 50, y: 50}, screenshotUrl: "data:image/png;base64,iVBORw0KGgoA..."]
 */

// migrate data to local storage
