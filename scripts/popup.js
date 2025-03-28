// document.getElementById("showDivButton").addEventListener("click", () => {
//   chrome.tabs.query({}, (tabs) => {
//     tabs.forEach((tab) => {
//       // Ignore restricted pages
//       if (
//         tab.url.startsWith("chrome://") ||
//         tab.url.startsWith("edge://") ||
//         tab.url.includes("chrome.google.com/webstore")
//       ) {
//         console.warn("Skipping restricted page:", tab.url);
//         return;
//       }

//       // Inject content script
//       chrome.scripting.executeScript(
//         {
//           target: { tabId: tab.id },
//           files: ["contentTEST.js"],
//         },
//         () => {
//           if (chrome.runtime.lastError) {
//             console.error("Injection error:", chrome.runtime.lastError.message);
//           } else {
//             // Send message to append the div
//             chrome.tabs.sendMessage(tab.id, { action: "showDiv" });
//           }
//         }
//       );
//     });
//   });
// });

document.getElementById("showDivButton").addEventListener("click", () => {
  // Send a message to the content script to append the custom div
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    chrome.tabs.sendMessage(tabs[0].id, { action: "showDiv" });
  });
  // chrome.tabs.query({}, (tabs) => {
  //   tabs.forEach((tab) => {
  //     console.log("Tab ID:", tab.id);
  //     chrome.tabs.sendMessage(tab.id, { action: "showDiv" });
  //   });
  // });
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    if (tabs[0] && tabs[0].id) {
      chrome.runtime.sendMessage(
        {
          action: "setExtensionState",
          active: true,
        },
        () => {
          window.close(); // Close the popup
        }
      );
    }
  });
});
document.getElementById("goToDashboard").addEventListener("click", () => {
  chrome.runtime.sendMessage({ action: "redirectToDashboard" });
});
