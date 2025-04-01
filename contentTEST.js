// let Data = [];
// let badgeCount = 0;
let iframeRef = null;
const IMAGE_LIMIT = 10;
// let isTracking = false;
const API_URL = "http://localhost:3000";
// const API_URL = "https://localhost:3000";
let navigationInterceptorActive = false;

function interceptLinkClicks() {
  if (navigationInterceptorActive) return;
  navigationInterceptorActive = true;

  document.addEventListener("click", async (event) => {
    const anchor = event.target.closest("a");
    if (!anchor || !isTracking) return;

    event.preventDefault();
    const href = anchor.href;
    const title = anchor.textContent.trim() || new URL(href).hostname;

    const { Data, badgeCount } = await getStorageData();
    if (Data.length >= IMAGE_LIMIT) {
      showErrorPopup(`Navigation limit (${IMAGE_LIMIT}) reached`);
      return;
    }

    const newCount = badgeCount + 1;
    Data.push({
      title: `Navigated to ${title}`,
      description: href,
      relativeCoordinates: null,
      screenshotUrl: null,
    });
    await updateStorageData(Data, newCount);

    window.location.href = href;
  });
}
// UTILITY
async function getStorageData() {
  return new Promise((resolve) => {
    chrome.storage.local.get(["screenshotData", "badgeCount"], (result) => {
      resolve({
        Data: result.screenshotData || [],
        badgeCount: result.badgeCount || 0,
      });
    });
  });
}
// Pause/Resume actions
async function getPRAction() {
  return new Promise((resolve) => {
    chrome.storage.local.get(["isTracking"], (result) => {
      resolve({
        isTracking: result.isTracking,
      });
    });
  });
}
async function setPRAction(newTrackingStatus) {
  return new Promise((resolve) => {
    chrome.storage.local.set(
      {
        isTracking: newTrackingStatus,
      },
      () => resolve()
    );
  });
}
async function updateStorageData(newData, newCount) {
  return new Promise((resolve) => {
    chrome.storage.local.set(
      {
        screenshotData: newData,
        badgeCount: newCount,
      },
      () => resolve()
    );
  });
}
async function clearStorageData() {
  return new Promise((resolve) => {
    chrome.storage.local.set(
      {
        screenshotData: [],
        badgeCount: 0,
        isTracking: false,
      },
      () => resolve()
    );
  });
}
function updateBadgeDisplay(count) {
  const doc = iframeRef?.contentDocument || iframeRef?.contentWindow?.document;
  const badge = doc?.getElementById("button__badge");
  if (badge) {
    badge.textContent = count;
    badge.style.display = count > 0 ? "inline-block" : "none";
  }
}
// storge change listner
chrome.storage.onChanged.addListener((changes) => {
  if (changes.badgeCount) {
    updateBadgeDisplay(changes.badgeCount.newValue);
  }
  if (changes.isTracking) {
    isTracking = changes.isTracking.newValue;
    const doc =
      iframeRef?.contentDocument || iframeRef?.contentWindow?.document;
    const pauseButton = doc?.getElementById("pause__button__id span");
    if (pauseButton) {
      pauseButton.textContent = isTracking ? "Pause" : "Resume";
    }
    if (isTracking) {
      interceptLinkClicks();
    }
  }
});

// function enableMouseTracking() {
//   chrome.storage.local.set({ isTracking: true });
// }
// function disableMouseTracking() {
//   chrome.storage.local.set({ isTracking: false });
// }
// chrome.storage.local.get(["isTracking"], (result) => {
//   isTracking = result.isTracking || false;
//   if (isTracking) {
//     document.addEventListener("click", handleMouseClick);
//   }
// });

function logTabTitle(title) {
  console.log(`Current tab title: ${title}`);
}

// async function initControlPanel() {
//   if (!iframeRef) {
//     await appendCustomDiv();
//   }
//   const doc = iframeRef.contentDocument || iframeRef.contentWindow.document;
//   const controlPanel = doc.getElementById("control-panel");

//   chrome.storage.local.get(["isTracking"], (result) => {
//     isTracking = result.isTracking || false;
//     if (controlPanel) {
//       controlPanel.style.display = isExtensionActive ? "flex" : "none";
//     }
//   });
//   // if (controlPanel) {
//   //   controlPanel.style.display = visible ? "flex" : "none";
//   // } else {
//   //   console.log("Control panel not found, initControlPanel function");
//   // }
// }

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

function showConfirmationPopup(
  TopMessage,
  subMessage,
  buttonText = "Cancel Capturing"
) {
  return new Promise((resolve) => {
    const backdrop = document.createElement("div");
    backdrop.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(0, 0, 0, 0.5);
      z-index: 10001;
      display: flex;
      justify-content: center;
      align-items: center;
    `;

    const container = document.createElement("div");
    container.style.cssText = `
  padding: 20px;
`;

    const heading = document.createElement("h1");
    heading.textContent = TopMessage;
    heading.style.cssText = `
  width: 350px;
  margin: 0px;
  padding: 30px;
  background-image: repeating-linear-gradient(135deg, #f04b51, #f04b51 24px, #f2545b 0, #f2545b 48px);
  color: white;
`;

    const actionContainer = document.createElement("div");
    actionContainer.style.cssText = `
  background: white;
`;

    const subHeading = document.createElement("p");
    subHeading.textContent = subMessage;
    subHeading.style.cssText = `
  margin: 0px 0px 20px 10px;
  padding-top: 20px;
  color: gray;
  display: block;
  margin-left: 10px;
`;

    const cancelBtn = document.createElement("button");
    cancelBtn.textContent = buttonText;
    cancelBtn.style.cssText = `
  padding: 5px;
  background-color: #ff7a59;
  border: 1px solid gray;
  border-radius: 5px;
  margin: 10px;
  font-size: small;
`;

    const notCancelBtn = document.createElement("button");
    notCancelBtn.textContent = "Cancel";
    notCancelBtn.style.cssText = `
  color: black;
  padding: 5px;
  background-color: #eaf0f6;
  border: 1px solid gray;
  border-radius: 5px;
  font-size: small;
`;

    cancelBtn.addEventListener("click", () => {
      document.body.removeChild(backdrop);
      resolve(true);
    });

    notCancelBtn.addEventListener("click", () => {
      document.body.removeChild(backdrop);
      resolve(false);
    });

    actionContainer.appendChild(subHeading);
    actionContainer.appendChild(cancelBtn);
    actionContainer.appendChild(notCancelBtn);
    container.appendChild(heading);
    container.appendChild(actionContainer);
    backdrop.appendChild(container);
    document.body.appendChild(backdrop);
  });
}

async function appendCustomDiv() {
  return new Promise(async (resolve, reject) => {
    if (window.self !== window.top) return;

    if (document.getElementById("control-panel-iframe")) {
      iframeRef = document.getElementById("control-panel-iframe");
      return;
    }

    const createControlPanel = async (doc) => {
      const { badgeCount } = await getStorageData();

      const controlPanelModel = doc.createElement("div");
      controlPanelModel.id = "control-panel";
      controlPanelModel.style.cssText = `
        display: flex;
        align-items: center;
        border-radius: 8px;
        position: fixed;
        bottom: 0px;
        z-index: 9999;
      `;

      // Create button helper function
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

      // Create done button
      const checkIcon = doc.createElement("button");
      checkIcon.id = "done__button__id";
      checkIcon.style.cssText = `
        border: none;
        display: flex;
        align-items: center;
        justify-content: center;
        width: 50px;
        height: 50px;
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
        top: 0px;
        right: -3px;
        min-width: 16px;
        min-height: 16px;
        text-align: center;
        display: ${badgeCount > 0 ? "inline-block" : "none"};
        font-weight: bold;
      `;

      checkIcon.appendChild(badge);

      const pauseButton = createButton(
        "Pause",
        `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#969696" stroke-width="4" stroke-linecap="butt">
          <line x1="7" y1="5" x2="7" y2="19"></line>
          <line x1="17" y1="5" x2="17" y2="19"></line>
        </svg>`
      );
      pauseButton.id = "pause__button__id";

      const screenshotButton = createButton(
        "Screenshot",
        `<svg xmlns="http://www.w3.org/2000/svg" x="0px" y="0px" width="20" height="20" viewBox="0,0,256,256">
          <g fill="#969696" fill-rule="nonzero" stroke="none" stroke-width="1" stroke-linecap="butt" stroke-linejoin="miter" stroke-miterlimit="10" stroke-dasharray="" stroke-dashoffset="0" font-family="none" font-weight="none" font-size="none" text-anchor="none" style="mix-blend-mode: normal"><g transform="scale(10.66667,10.66667)"><path d="M4,4c-1.09306,0 -2,0.90694 -2,2v12c0,1.09306 0.90694,2 2,2h16c1.09306,0 2,-0.90694 2,-2v-12c0,-1.09306 -0.90694,-2 -2,-2zM4,6h16v12h-16zM14.5,11l-3.5,4l-2.5,-2.5l-2.72266,3.5h12.47266z"></path></g></g>
        </svg>`
      );

      const restartButton = createButton(
        "Restart",
        `<svg xmlns="http://www.w3.org/2000/svg" x="0px" y="0px" width="20" height="20" viewBox="0,0,256,256">
          <g fill="#969696" fill-rule="nonzero" stroke="none" stroke-width="none" stroke-linecap="butt" stroke-linejoin="none" stroke-miterlimit="10" stroke-dasharray="" stroke-dashoffset="0" font-family="none" font-weight="none" font-size="none" text-anchor="none" style="mix-blend-mode: normal"><path transform="scale(8.53333,8.53333)" d="M26.94922,14h3.05078l-4,6l-4,-6h2.95117c-0.50018,-5.06207 -4.75461,-9 -9.95117,-9c-2.4834,0 -4.74593,0.90009 -6.49414,2.39453c-0.26947,0.24712 -0.65232,0.32748 -0.99842,0.20959c-0.3461,-0.1179 -0.60027,-0.41526 -0.66286,-0.77549c-0.06258,-0.36023 0.0764,-0.7259 0.36245,-0.95363c2.09579,-1.79156 4.82437,-2.875 7.79297,-2.875c6.27784,0 11.43793,4.85166 11.94922,11zM8,16h-2.95117c0.50018,5.06207 4.75461,9 9.95117,9c2.4834,0 4.74593,-0.90009 6.49414,-2.39453c0.26947,-0.24712 0.65232,-0.32749 0.99842,-0.20959c0.3461,0.1179 0.60028,0.41526 0.66286,0.7755c0.06258,0.36023 -0.0764,0.7259 -0.36245,0.95363c-2.09579,1.79156 -4.82437,2.875 -7.79297,2.875c-6.27784,0 -11.43792,-4.85166 -11.94922,-11h-3.05078l4,-6z" id="strokeMainSVG" stroke="#969696" stroke-width="2" stroke-linejoin="round"></path><g transform="scale(8.53333,8.53333)" stroke="none" stroke-width="1" stroke-linejoin="miter"><path d="M15,3c-2.9686,0 -5.69718,1.08344 -7.79297,2.875c-0.28605,0.22772 -0.42503,0.59339 -0.36245,0.95363c0.06258,0.36023 0.31676,0.6576 0.66286,0.77549c0.3461,0.1179 0.72895,0.03753 0.99842,-0.20959c1.74821,-1.49444 4.01074,-2.39453 6.49414,-2.39453c5.19656,0 9.45099,3.93793 9.95117,9h-2.95117l4,6l4,-6h-3.05078c-0.51129,-6.14834 -5.67138,-11 -11.94922,-11zM4,10l-4,6h3.05078c0.51129,6.14834 5.67138,11 11.94922,11c2.9686,0 5.69718,-1.08344 7.79297,-2.875c0.28605,-0.22772 0.42504,-0.59339 0.36245,-0.95363c-0.06258,-0.36023 -0.31676,-0.6576 -0.66286,-0.7755c-0.3461,-0.1179 -0.72895,-0.03753 -0.99842,0.20959c-1.74821,1.49444 -4.01074,2.39453 -6.49414,2.39453c-5.19656,0 -9.45099,-3.93793 -9.95117,-9h2.95117z"></path></g></g>
        </svg>`
      );

      const closeButton = createButton(
        "",
        `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <line x1="18" y1="6" x2="6" y2="18"></line>
          <line x1="6" y1="6" x2="18" y2="18"></line>
        </svg>`
      );

      // btn event listeners
      checkIcon.addEventListener("click", async () => {
        disableMouseTracking();
        const { Data } = await getStorageData();
        if (!Data || Data.length < 2) {
          showErrorPopup("you have to click atleast 1 or more images.");
          return;
        }
        chrome.runtime.sendMessage({ action: "fetchStatus" });

        let currUrl = window.location.href;
        currUrl = currUrl.split("://")[1] || currUrl;
        Data.push({ urlWeAreOn: currUrl });

        try {
          await sendToBackend(Data);
          await clearStorageData();
          await setPRAction(false);
          chrome.runtime.sendMessage({
            action: "setExtensionState",
            // hiding this pnl from tabs
            active: false,
          });
          // controlPanelModel.remove();
        } catch (error) {
          showErrorPopup("Failed to send data to backend: " + error.message);
        }
      });

      pauseButton.addEventListener("click", async () => {
        const { isTracking } = await getPRAction();
        const newTrackingStatus = !isTracking;
        await setPRAction(newTrackingStatus);
        chrome.runtime.sendMessage({
          action: "syncTrackingState",
          isTracking: !isTracking,
        });
        // if (isTracking) {
        //   customBackdrop("Paused");
        //   pauseButton.querySelector("span").textContent = "resume";
        //   disableMouseTracking();
        // } else {
        //   pauseButton.querySelector("span").textContent = "Pause";
        //   enableMouseTracking();
        // }
        customBackdrop(newTrackingStatus ? "Resumed" : "Paused");
      });

      screenshotButton.addEventListener("click", async () => {
        chrome.runtime.sendMessage(
          { action: "downloadScreenshot" },
          (response) => {
            handleMouseClick;
            console.log("Screenshot saved, responce: ", response);
          }
        );
        chrome.runtime.sendMessage(
          { action: "captureScreenshot" },
          async (response) => {
            if (chrome.runtime.lastError) {
              showErrorPopup("Failed to capture screenshot. Please try again.");
              return;
            }
            const { Data, badgeCount } = await getStorageData();
            console.log("badgeCount: ", badgeCount);
            const screenshotUrl = response.screenshotUrl;
            const data = {
              title: "",
              relativeCoordinates: null,
              screenshotUrl: screenshotUrl,
            };
            if (Data.length < IMAGE_LIMIT) {
              const newCount = badgeCount + 1;
              Data.push(data);
              await updateStorageData(Data, newCount);
              doc.getElementById("button__badge").textContent = newCount;
              doc.getElementById("button__badge").style.display =
                "inline-block";
            } else {
              showErrorPopup(
                `You have reached the limit of ${IMAGE_LIMIT} images`
              );
            }
          }
        );
      });

      restartButton.addEventListener("click", async () => {
        disableMouseTracking();
        const confirmed = await showConfirmationPopup(
          "Restart Capturing",
          "Are you sure you want to restart?",
          "Restart Capturing"
        );
        if (confirmed) {
          customBackdrop("Restarted", 500);
          await clearStorageData();
          doc.getElementById("button__badge").style.display = "none";
        }
        setTimeout(() => {
          enableMouseTracking();
        }, 500);
      });

      closeButton.addEventListener("click", async () => {
        disableMouseTracking();
        const confirmed = await showConfirmationPopup(
          "Cancel Capturing",
          "Are you sure you want to close?"
        );
        if (confirmed) {
          await clearStorageData();
          doc.getElementById("button__badge").style.display = "none";
          controlPanelModel.style.display = "none";
          disableMouseTracking();
          chrome.runtime.sendMessage({
            action: "setExtensionState",
            active: false, // This triggers hideControlPanel in all tabs
          });
        } else {
          setTimeout(() => {
            enableMouseTracking();
          }, 500);
        }
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

      return controlPanelModel;
    };

    if (iframeRef) {
      console.log("iframeRef exists: ", iframeRef);
      const doc = iframeRef.contentDocument || iframeRef.contentWindow.document;
      let controlPanel = doc.getElementById("control-panel");

      if (!controlPanel) {
        controlPanel = await createControlPanel(doc);
        doc.body.appendChild(controlPanel);
      } else {
        const { badgeCount } = await getStorageData();
        const badge = doc.getElementById("button__badge");
        if (badge) {
          badge.textContent = badgeCount;
          badge.style.display = badgeCount > 0 ? "inline-block" : "none";
        }
      }

      enableMouseTracking();
      resolve(iframeRef);
      return;
    }

    const iframe = document.createElement("iframe");
    iframe.id = "control-panel-iframe";
    iframe.style.cssText = `
      position: fixed;
      bottom: 6px;
      left: 20px;
      width: 400px;
      height: 50px;
      border: none;
      z-index: 9999;
      border-radius: 8px;
      background: transparent;
    `;
    iframe.setAttribute("allowTransparency", "true");

    document.body.appendChild(iframe);
    iframeRef = iframe;

    iframe.onload = async function () {
      console.log("Iframe loaded, attempting to append control panel...");
      const doc = iframe.contentDocument || iframe.contentWindow.document;
      const controlPanel = await createControlPanel(doc);
      doc.body.appendChild(controlPanel);

      const { badgeCount } = await getStorageData();
      const badge = doc.getElementById("button__badge");
      if (badge) {
        badge.textContent = badgeCount;
        badge.style.display = badgeCount > 0 ? "inline-block" : "none";
      }

      enableMouseTracking();
      resolve(iframeRef);
    };
  });
}

function showErrorPopup(errorMessage) {
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

  popup.appendChild(message);
  document.body.appendChild(popup);

  setTimeout(() => popup.remove(), 5000);
}

async function handleMouseClick(event) {
  const doc = iframeRef?.contentDocument || iframeRef?.contentWindow?.document;
  if (!doc) return;

  const controlPanel = doc.getElementById("control-panel");
  if (controlPanel?.contains(event.target)) return;

  const { isTracking } = await getPRAction();
  console.log("isTracking in handle mouse click: ", isTracking);
  if (!isTracking) return;

  let textOfClickedElement = formatElementText(event.target);
  const x = event.clientX;
  const y = event.clientY;
  const pageWidth = window.innerWidth;
  const pageHeight = window.innerHeight;
  const relativeX = (x / pageWidth) * 100;
  const relativeY = (y / pageHeight) * 100;

  // event.preventDefault();

  chrome.runtime.sendMessage(
    { action: "captureScreenshot" },
    async (response) => {
      if (chrome.runtime.lastError) {
        showErrorPopup("Failed to capture screenshot. Please try again.");
        return;
      }
      const { Data, badgeCount } = await getStorageData();
      const screenshotUrl = response.screenshotUrl;
      const data = {
        title: textOfClickedElement,
        relativeCoordinates: { x: relativeX, y: relativeY },
        screenshotUrl: screenshotUrl,
      };
      if (Data.length < IMAGE_LIMIT) {
        const newCount = badgeCount + 1;
        Data.push(data);
        await updateStorageData(Data, newCount);
        const badge = doc.getElementById("button__badge");
        if (badge) {
          badge.textContent = newCount;
          badge.style.display = "inline-block";
        }
      } else {
        console.log("__Reached limit__");
        showErrorPopup(`You have reached the limit of ${IMAGE_LIMIT} images`);
      }
    }
  );
}

function sendToBackend(data) {
  console.log("Sending data to backend...");
  showLoadingBackdrop();

  return new Promise((resolve, reject) => {
    chrome.runtime.sendMessage({ action: "postimages", data }, (response) => {
      if (chrome.runtime.lastError) {
        hideLoadingBackdrop();
        showErrorPopup("Runtime Error: " + chrome.runtime.lastError.message);
        reject(chrome.runtime.lastError);
      } else {
        console.log("Response received from background.js:", response);

        if (response.success) {
          setTimeout(() => {
            const newTabUrl = API_URL + response.data.urlToVists;
            window.open(newTabUrl, "_blank");
          }, 1000);
        } else {
          showErrorPopup(response.data.message);
        }
        hideLoadingBackdrop(); // Hide loading on success
        resolve(response);
      }
    });
  });
}

async function enableMouseTracking() {
  // isTracking = true;
  await setPRAction(true);
  document.addEventListener("click", handleMouseClick);
}

async function disableMouseTracking() {
  // isTracking = false;
  await setPRAction(false);
  document.removeEventListener("click", handleMouseClick);
}

function formatElementText(element) {
  let text = element.innerText || element.textContent || "highlighted area";
  return text.length > 16
    ? `Click on ${text.slice(0, 16).replace(/\n/g, " ")}...`
    : `Click on ${text.replace(/\n/g, " ")}`;
}
chrome.runtime.onMessage.addListener(async (message, sender, sendResponse) => {
  if (message.action === "updateBadgeFromStorage") {
    const { badgeCount } = await getStorageData();
    updateBadgeDisplay(badgeCount);

    const { isTracking } = await getPRAction();
    await setPRAction(isTracking);
  }
  if (message.action === "updateTrackingState") {
    const isTracking = message.isTracking;
    const doc =
      iframeRef?.contentDocument || iframeRef?.contentWindow?.document;
    const pauseButton = doc?.querySelector("#pause__button__id span");
    if (pauseButton) {
      pauseButton.textContent = isTracking ? "Pause" : "Resume";
    }
  }
  if (message.action === "initControlPanel") {
    // Retry initialization if iframe isn't ready
    if (!iframeRef) {
      await appendCustomDiv();
    }
    const doc = iframeRef.contentDocument || iframeRef.contentWindow.document;
    const controlPanel = doc.getElementById("control-panel");

    // chrome.storage.local.get(["isTracking"], (result) => {
    //   isTracking = result.isTracking || false;
    if (controlPanel) {
      controlPanel.style.display = message.visible ? "flex" : "none";
    }
    // });

    sendResponse({ success: true });
  } else if (message.action === "updateTabTitle") {
    if (message.tabTitle) {
      logTabTitle(message.tabTitle);
    } else {
      chrome.runtime.sendMessage({ action: "getTabTitle" }, (response) => {
        if (response.tabTitle) {
          logTabTitle(response.tabTitle);
        }
      });
    }
    sendResponse({ success: true });
  }

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
