let Data = [];
let badgeCount = 0;
let iframeRef = null;
const IMAGE_LIMIT = 10;
let isTracking = false;
const API_URL = "http://localhost:3000";
// const API_URL = "https://localhost:3000";

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
  return new Promise((resolve, reject) => {
    if (window.self !== window.top) return;

    if (iframeRef) {
      console.log("iframeRef exists: ", iframeRef);
      const doc = iframeRef.contentDocument || iframeRef.contentWindow.document;
      let controlPanel = doc.getElementById("control-panel");

      if (controlPanel) {
        // Panel exists, just show it
        controlPanel.style.display = "flex";
        resolve(iframeRef);
      } else {
        // Panel was removed, recreate it
        // controlPanel = createControlPanel(doc);
        // doc.body.appendChild(controlPanel);
        resolve(iframeRef);
      }
      return;
    }
    // if (document.getElementById("control-panel")) {
    //   return;
    // }
    // Create iframe
    const iframe = document.createElement("iframe");
    iframe.id = "control-panel-iframe";
    iframe.style.cssText = `
  position: fixed;
  bottom: 6px;
  left: 20px;
  width: 385px;
  height: 50px;
  border: none;
  z-index: 9999;
  border-radius: 8px;
  background: transparent;
`;
    iframe.setAttribute("allowTransparency", "true");

    // iframe.srcdoc = `
    //     <html>
    //     <head>
    //       <style>
    //         html, body {
    //           margin: 0;
    //           padding: 0;
    //           background: none !important;
    //         }
    //         iframe {
    //           background: none !important;
    //           border: none !important;
    //         }
    //       </style>
    //     </head>
    //     <body>
    //     </body>
    //     </html>
    //   `;

    document.body.appendChild(iframe);
    document.body.style.backgroundColor = "transparent"; // Ensure parent respects transparency

    iframeRef = iframe;

    // Wait for iframe to load
    iframe.onload = function () {
      console.log("Iframe loaded, attempting to append control panel...");

      const doc = iframe.contentDocument || iframe.contentWindow.document;

      const controlPanelModel = doc.createElement("div");

      controlPanelModel.id = "control-panel";
      controlPanelModel.style.cssText = `
      display: flex;
      align-items: center;
      border-radius: 8px;
      position: fixed;
      bottom: 6px;
      z-index: 9999;
      `;
      // background-color: white;
      //   box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);

      const createButton = (text, iconSvg) => {
        const button = doc.createElement("button");
        button.style.cssText = `
      display: flex;
      align-items: center;  
      justify-content: center;
      color:rgb(150, 150, 150);
      background: transparent;
      border: none;
      cursor: pointer;
      transition: color 0.5s;
      padding: 11px;
      border-radius: 8px;
      gap: 5px;
    `;
        button.onmouseover = () => {
          button.style.color = "#2d3748";
          button.style.backgroundColor = "#edf2f7";
          // button.style.borderRadius = "8px";
        };
        button.onmouseout = () => {
          button.style.color = "rgb(150, 150, 150)";
          button.style.backgroundColor = "transparent";
        };

        button.innerHTML = iconSvg;

        const span = doc.createElement("span");
        span.textContent = text;

        button.appendChild(span);
        return button;
      };

      // DONE - button
      const checkIcon = doc.createElement("button");
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
    margin-right: 5px;
    position: relative;
    color: white;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.3);
    `;
      checkIcon.onmouseover = () => {
        checkIcon.style.backgroundColor = "rgb(238, 48, 27)";
      };
      checkIcon.onmouseout = () => {
        checkIcon.style.backgroundColor = "rgb(255, 89, 66)";
      };
      // checkIcon.innerText = "Done";
      checkIcon.innerHTML = `
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
    <polyline points="20 6 9 17 4 12"></polyline>
  </svg>
`;

      const badge = doc.createElement("span");
      badge.textContent = badgeCount;
      badge.className = "button__badge";
      badge.id = "button__badge";
      badge.style.cssText = `
      background-color: #fff;
      border-radius: 50%;
      color: black;
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
      const pauseButton = createButton(
        "Pause",
        `  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#969696" stroke-width="4" stroke-linecap="butt">
    <line x1="7" y1="5" x2="7" y2="19"></line>
    <line x1="17" y1="5" x2="17" y2="19"></line>
</svg>

  `
      );
      const screenshotButton = createButton(
        "Screenshot",
        `
        <svg xmlns="http://www.w3.org/2000/svg" x="0px" y="0px" width="20" height="20" viewBox="0,0,256,256">
<g fill="#969696" fill-rule="nonzero" stroke="none" stroke-width="1" stroke-linecap="butt" stroke-linejoin="miter" stroke-miterlimit="10" stroke-dasharray="" stroke-dashoffset="0" font-family="none" font-weight="none" font-size="none" text-anchor="none" style="mix-blend-mode: normal"><g transform="scale(10.66667,10.66667)"><path d="M4,4c-1.09306,0 -2,0.90694 -2,2v12c0,1.09306 0.90694,2 2,2h16c1.09306,0 2,-0.90694 2,-2v-12c0,-1.09306 -0.90694,-2 -2,-2zM4,6h16v12h-16zM14.5,11l-3.5,4l-2.5,-2.5l-2.72266,3.5h12.47266z"></path></g></g>
</svg>
      `
      );
      const restartButton = createButton(
        "Restart",
        `
        <svg xmlns="http://www.w3.org/2000/svg" x="0px" y="0px" width="20" height="20" viewBox="0,0,256,256">
<g fill="#969696" fill-rule="nonzero" stroke="none" stroke-width="none" stroke-linecap="butt" stroke-linejoin="none" stroke-miterlimit="10" stroke-dasharray="" stroke-dashoffset="0" font-family="none" font-weight="none" font-size="none" text-anchor="none" style="mix-blend-mode: normal"><path transform="scale(8.53333,8.53333)" d="M26.94922,14h3.05078l-4,6l-4,-6h2.95117c-0.50018,-5.06207 -4.75461,-9 -9.95117,-9c-2.4834,0 -4.74593,0.90009 -6.49414,2.39453c-0.26947,0.24712 -0.65232,0.32748 -0.99842,0.20959c-0.3461,-0.1179 -0.60027,-0.41526 -0.66286,-0.77549c-0.06258,-0.36023 0.0764,-0.7259 0.36245,-0.95363c2.09579,-1.79156 4.82437,-2.875 7.79297,-2.875c6.27784,0 11.43793,4.85166 11.94922,11zM8,16h-2.95117c0.50018,5.06207 4.75461,9 9.95117,9c2.4834,0 4.74593,-0.90009 6.49414,-2.39453c0.26947,-0.24712 0.65232,-0.32749 0.99842,-0.20959c0.3461,0.1179 0.60028,0.41526 0.66286,0.7755c0.06258,0.36023 -0.0764,0.7259 -0.36245,0.95363c-2.09579,1.79156 -4.82437,2.875 -7.79297,2.875c-6.27784,0 -11.43792,-4.85166 -11.94922,-11h-3.05078l4,-6z" id="strokeMainSVG" stroke="#969696" stroke-width="2" stroke-linejoin="round"></path><g transform="scale(8.53333,8.53333)" stroke="none" stroke-width="1" stroke-linejoin="miter"><path d="M15,3c-2.9686,0 -5.69718,1.08344 -7.79297,2.875c-0.28605,0.22772 -0.42503,0.59339 -0.36245,0.95363c0.06258,0.36023 0.31676,0.6576 0.66286,0.77549c0.3461,0.1179 0.72895,0.03753 0.99842,-0.20959c1.74821,-1.49444 4.01074,-2.39453 6.49414,-2.39453c5.19656,0 9.45099,3.93793 9.95117,9h-2.95117l4,6l4,-6h-3.05078c-0.51129,-6.14834 -5.67138,-11 -11.94922,-11zM4,10l-4,6h3.05078c0.51129,6.14834 5.67138,11 11.94922,11c2.9686,0 5.69718,-1.08344 7.79297,-2.875c0.28605,-0.22772 0.42504,-0.59339 0.36245,-0.95363c-0.06258,-0.36023 -0.31676,-0.6576 -0.66286,-0.7755c-0.3461,-0.1179 -0.72895,-0.03753 -0.99842,0.20959c-1.74821,1.49444 -4.01074,2.39453 -6.49414,2.39453c-5.19656,0 -9.45099,-3.93793 -9.95117,-9h2.95117z"></path></g></g>
</svg>
      `
      );
      const closeButton = createButton(
        "",
        `
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <line x1="18" y1="6" x2="6" y2="18"></line>
          <line x1="6" y1="6" x2="18" y2="18"></line>
        </svg>
      `
      );

      checkIcon.addEventListener("click", async () => {
        disableMouseTracking();
        // console.log("Data: ", Data);
        if (!Data || Data.length < 2) {
          showErrorPopup("you have to click atleast 1 or more images.");
          return;
        }
        chrome.runtime.sendMessage({ action: "fetchStatus" });

        const controlPanel = doc.getElementById("control-panel");
        // console.log("Captured Data: ", Data);
        let currUrl = window.location.href;
        currUrl = currUrl.split("://")[1] || currUrl;
        Data.push({ urlWeAreOn: currUrl });

        try {
          await sendToBackend(Data);
        } catch (error) {
          showErrorPopup("Failed to send data to backend: " + error.message);
        }

        if (controlPanel) doc.body.removeChild(controlPanelModel);
        badgeCount = 0;
        Data = [];
      });

      pauseButton.addEventListener("click", () => {
        if (isTracking) {
          customBackdrop("Paused");
          pauseButton.querySelector("span").textContent = "resume";
          // pauseButton.textContent = "resume";
          disableMouseTracking();
        } else {
          pauseButton.querySelector("span").textContent = "Pause";
          // pauseButton.textContent = "Pause";
          enableMouseTracking();
        }
      });

      screenshotButton.addEventListener("click", () => {
        chrome.runtime.sendMessage(
          { action: "downloadScreenshot" },
          (response) => {
            handleMouseClick;
            console.log("Screenshot saved, responce: ", response);
          }
        );
        chrome.runtime.sendMessage(
          { action: "captureScreenshot" },
          (response) => {
            if (chrome.runtime.lastError) {
              showErrorPopup("Failed to capture screenshot. Please try again.");
              return;
            }
            const screenshotUrl = response.screenshotUrl;
            const data = {
              title: "",
              relativeCoordinates: null,
              screenshotUrl: screenshotUrl,
            };
            if (Data.length < IMAGE_LIMIT) {
              badgeCount++;
              doc.getElementById("button__badge").textContent = badgeCount;
              doc.getElementById("button__badge").style.display =
                "inline-block";
              console.log("Added to array");
              Data.push(data);
            } else {
              console.log("__Reached limit__");
              showErrorPopup("You have reached the limit of 5 images");
            }
          }
        );
      });

      restartButton.addEventListener("click", () => {
        customBackdrop("Restarted", 500);
        badgeCount = 0;
        Data = [];
        // doc.getElementById("button__badge").textContent = badgeCount;
        doc.getElementById("button__badge").style.display = "none";
      });

      closeButton.addEventListener("click", () => {
        badgeCount = 0;
        Data = [];
        doc.getElementById("button__badge").style.display = "none";
        // doc.body.removeChild(controlPanelModel);
        controlPanelModel.style.display = "none";
        disableMouseTracking();
      });

      const buttonsPanel = doc.createElement("div");
      buttonsPanel.id = "buttons-panel";
      buttonsPanel.style.cssText = `
       background-color: white;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
            border-radius: 0.5rem;
            display: flex;
            align-items: center;
            justify-content: space-between;
            width: 100%;
            overflow: hidden;
        `;

      controlPanelModel.appendChild(checkIcon);
      buttonsPanel.appendChild(pauseButton);
      buttonsPanel.appendChild(screenshotButton);
      buttonsPanel.appendChild(restartButton);
      buttonsPanel.appendChild(closeButton);

      controlPanelModel.appendChild(buttonsPanel);

      buttonsPanel.style.opacity = "0";
      buttonsPanel.pointerEvents = "none";
      buttonsPanel.style.transition = "opacity 0.3s ease";

      // Manage visibility on hover
      let hideTimeout;
      checkIcon.addEventListener("mouseenter", () => {
        clearTimeout(hideTimeout);
        buttonsPanel.style.opacity = "1";
        buttonsPanel.pointerEvents = "auto";
        buttonsPanel.style.pointerEvents = "auto";
      });

      controlPanelModel.addEventListener("mouseleave", () => {
        hideTimeout = setTimeout(() => {
          buttonsPanel.style.opacity = "0";
          buttonsPanel.pointerEvents = "none";
          buttonsPanel.style.pointerEvents = "none";
        }, 500);
      });

      doc.body.appendChild(controlPanelModel);
    };
    enableMouseTracking();
    resolve(iframeRef);
  });
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
  const doc = iframeRef.contentDocument || iframeRef.contentWindow.document;
  const controlPanel = doc.getElementById("control-panel");
  if (controlPanel && controlPanel.contains(event.target)) return;
  // if (iframeRef && iframeRef.contains(event.target)) return;

  let textOfClickedElement = formatElementText(event.target);
  // console.log("Text of clicked element: ", textOfClickedElement);

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
    if (Data.length < IMAGE_LIMIT) {
      badgeCount++;
      // console.log("badgeCount: ", badgeCount);
      doc.getElementById("button__badge").textContent = badgeCount;
      doc.getElementById("button__badge").style.display = "inline-block";
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
  let text =
    element.innerText || element.textContent || "Click on highlighted area";
  return text.length > 15
    ? `Click on ${text.slice(0, 15).replace(/\n/g, " ")}...`
    : `Click on ${text.replace(/\n/g, " ")}`;
}

chrome.runtime.onMessage.addListener(async (message, sender, sendResponse) => {
  // if (!iframeRef) {
  //   console.log("Iframe not found. Creating it now...");
  //   await appendCustomDiv();
  // }
  if (message.action === "showDiv") {
    console.log("Showing control panel...");
    sendResponse({ success: true });
    await appendCustomDiv();
  }

  if (iframeRef) {
    const doc = iframeRef.contentDocument || iframeRef.contentWindow.document;
    if (!doc) {
      console.warn("iframe document is not available.");
      sendResponse({ success: false, error: "iframe document not available" });
      return;
    }

    if (message.action === "hideControlPanel") {
      console.log("Hiding control panel...");
      const controlPanel = doc.getElementById("control-panel");
      if (controlPanel) {
        controlPanel.style.display = "none";
      }
      sendResponse({ success: true });
    }

    if (message.action === "showControlPanel") {
      console.log("Restoring control panel...");
      const controlPanel = doc.getElementById("control-panel");
      if (controlPanel) {
        controlPanel.style.display = "flex";
      }
      sendResponse({ success: true });
    }
  }

  // if (message.action === "showDiv") {
  //   customBackdrop("Capturing Started...");
  //   appendCustomDiv();
  // }
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
