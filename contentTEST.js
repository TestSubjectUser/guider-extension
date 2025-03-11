const API_URL = "http://localhost:3000";
let Data = [];
let isTracking = false;
let badgeCount = 0;

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
  createLoadingBackdrop();
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

  const newDiv = document.createElement("div");

  newDiv.id = "control-panel";
  newDiv.style.cssText = `
    display: flex;
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
    background-color: #f56565;
    border-radius: 50%;
    margin-right: 10px;
    position: relative;
    color: white;
    `;
  checkIcon.onmouseover = () => {
    checkIcon.style.backgroundColor = "#f05656";
  };
  checkIcon.onmouseout = () => {
    checkIcon.style.backgroundColor = "#f56565";
  };
  checkIcon.innerText = "Done";

  const badge = document.createElement("span");
  badge.textContent = badgeCount;
  badge.className = "button__badge";
  badge.id = "button__badge";
  badge.style.cssText = `
  background-color: #f05656;
  border-radius: 50%;
  color: white;
  font-size: 10px;
  position: absolute;
  top: -3px;
  right: -3px;
  min-width: 16px;
  min-height: 16px;
  text-align: center;
  display: none; /* Initially hidden */
  font-weight: bold;
  `;

  checkIcon.appendChild(badge);
  const pauseButton = createButton("Pause");
  const restartButton = createButton("Restart");
  const closeButton = createButton(" X ");

  checkIcon.addEventListener("click", () => {
    disableMouseTracking();

    chrome.runtime.sendMessage({ action: "fetchStatus" });

    const controlPanel = document.getElementById("control-panel");
    // console.log("Captured Data: ", Data);
    let currUrl = window.location.href;
    currUrl = currUrl.split("://")[1] || currUrl;
    Data.push({ urlWeAreOn: currUrl });
    sendToBackend(Data);
    if (controlPanel) document.body.removeChild(newDiv);
    badgeCount = 0;
    Data = [];
  });

  closeButton.addEventListener("click", () => {
    badgeCount = 0;
    Data = [];
    document.getElementById("button__badge").style.display = "none";
    document.body.removeChild(newDiv);
    disableMouseTracking();
  });
  restartButton.addEventListener("click", () => {
    badgeCount = 0;
    Data = [];
    // document.getElementById("button__badge").textContent = badgeCount;
    document.getElementById("button__badge").style.display = "none";
  });
  pauseButton.addEventListener("click", () => {
    if (isTracking) {
      pauseButton.textContent = "PAUSED";
      disableMouseTracking();
    } else {
      pauseButton.textContent = "Pause";
      enableMouseTracking();
    }
  });

  newDiv.appendChild(checkIcon);
  newDiv.appendChild(pauseButton);
  newDiv.appendChild(restartButton);
  newDiv.appendChild(closeButton);

  document.body.appendChild(newDiv);

  enableMouseTracking();
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
  chrome.runtime.sendMessage({ action: "captureScreenshot" }, (response) => {
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
    }

    setTimeout(() => {
      if (typeof targetUrl !== "undefined" && targetUrl) {
        window.location.href = targetUrl;
      }
      // else {
      //   console.warn("skipping redirecsn");
      // }
    }, 1000);
  });
}

function sendToBackend(data) {
  console.log("Sending data to backend...");
  showLoadingBackdrop();

  return new Promise((resolve, reject) => {
    chrome.runtime.sendMessage({ action: "postimages", data }, (response) => {
      if (chrome.runtime.lastError) {
        console.error("Runtime Error:", chrome.runtime.lastError);
        hideLoadingBackdrop();
        return reject(chrome.runtime.lastError);
      } else {
        // console.log("Response received from background.js:", response);
        // window.location.href = API_URL + response.data.urlToVists;
        // resolve(response);
        console.log("Response received from background.js:", response);
        setTimeout(() => {
          // window.location.href = API_URL + response.data.urlToVists;
          const newTabUrl = API_URL + response.data.urlToVists;
          window.open(newTabUrl, "_blank");
        }, 1000);
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
  }
});

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === "showDiv") appendCustomDiv();
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
