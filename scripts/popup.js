const startCaptureBtn = document.getElementById("showDivButton");
const stopCaptureBtn = document.getElementById("stopDivButton");

startCaptureBtn.addEventListener("click", () => {
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    if (tabs[0]?.id) {
      chrome.runtime.sendMessage(
        { action: "setExtensionState", active: true },
        () => {
          // startCaptureBtn.style.display = "none";
          // stopCaptureBtn.style.display = "block";
          window.close();
        }
      );
    }
  });
});

// stopCaptureBtn.addEventListener("click", () => {
//   chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
//     if (tabs[0]?.id) {
//       chrome.tabs.sendMessage(tabs[0].id, {
//         action: "showStopConfirmation"
//       }, async (confirmed) => {
//         if (confirmed) {
//           chrome.runtime.sendMessage(
//             { action: "setExtensionState", active: false },
//             () => {
//               startCaptureBtn.style.display = "block";
//               stopCaptureBtn.style.display = "none";
//               window.close();
//             }
//           );
//         }
//       });
//     }
//   });
// });

// chrome.storage.local.get("isExtensionActive", (result) => {
//   const isActive = result.isExtensionActive || false;
//   startCaptureBtn.style.display = isActive ? "none" : "block";
//   stopCaptureBtn.style.display = isActive ? "block" : "none";
// });

document.getElementById("goToDashboard").addEventListener("click", () => {
  chrome.runtime.sendMessage({ action: "redirectToDashboard" });
});
