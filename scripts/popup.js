const startCaptureBtn = document.getElementById("startCapturingBtn");
const stopCaptureBtn = document.getElementById("stopCapturingBtn");

function syncPopupState() {
  chrome.storage.local.get("isExtensionActive", (result) => {
    const isActive = result.isExtensionActive || false;
    startCaptureBtn.style.display = isActive ? "none" : "block";
    stopCaptureBtn.style.display = isActive ? "block" : "none";
  });
}
function updateCaptureButtons(isActive) {
  startCaptureBtn.style.display = isActive ? "none" : "block";
  stopCaptureBtn.style.display = isActive ? "block" : "none";
}

document.addEventListener("DOMContentLoaded", syncPopupState);

chrome.tabs.onActivated.addListener((activeInfo) => {
  chrome.storage.local.get("isExtensionActive", (result) => {
    updateCaptureButtons(result.isExtensionActive);
  });
});

startCaptureBtn.addEventListener("click", () => {
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    if (tabs[0]?.id) {
      chrome.runtime.sendMessage(
        { action: "setExtensionState", active: true },
        () => {
          startCaptureBtn.style.display = "none";
          stopCaptureBtn.style.display = "block";
        }
      );
    }
    // window.close();
  });
});

// stopCaptureBtn.addEventListener("click", () => {
//   chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
//     if (tabs[0]?.id) {
//       chrome.runtime.sendMessage(
//         { action: "setExtensionState", active: false },
//         () => {
//           startCaptureBtn.style.display = "block";
//           stopCaptureBtn.style.display = "none";
//         }
//       );
//     }
//   });
// });
stopCaptureBtn.addEventListener("click", async () => {
  const userConfirmed = confirm(
    "Are you sure you want to stop capturing and discard all saved steps?"
  );
  if (!userConfirmed) return;

  chrome.runtime.sendMessage({ action: "clearTrackingAndStop" }, () => {
    startCaptureBtn.style.display = "block";
    stopCaptureBtn.style.display = "none";
  });
});

chrome.storage.onChanged.addListener((changes) => {
  chrome.storage.local.get("isExtensionActive", (result) => {
    updateCaptureButtons(result.isExtensionActive);
  });
});

document.getElementById("goToDashboard").addEventListener("click", () => {
  chrome.runtime.sendMessage({ action: "redirectToDashboard" });
});
