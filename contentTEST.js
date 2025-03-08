// // Array to store clicked data
// let clickedData = [];

// function appendCustomDiv() {
//   if (document.getElementById("control-panel")) {
//     return;
//   }

//   const newDiv = document.createElement("div");

//   newDiv.id = "control-panel";
//   newDiv.style.cssText = `
//     display: flex;
//     align-items: center;
//     background-color: white;
//     box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
//     border-radius: 8px;
//     padding: 10px;
//     position: fixed;
//     bottom: 20px;
//     left: 20px;
//     z-index: 9999;
//   `;

//   const createButton = (text) => {
//     const button = document.createElement("button");
//     button.style.cssText = `
//       display: flex;
//       align-items: center;
//       margin-right: 10px;
//       color: #4a5568;
//       background: transparent;
//       border: none;
//       cursor: pointer;
//       transition: color 0.3s;
//     `;
//     button.onmouseover = () => {
//       button.style.color = "#2d3748";
//       button.style.backgroundColor = "#edf2f7";
//     };
//     button.onmouseout = () => {
//       button.style.color = "#4a5568";
//       button.style.backgroundColor = "transparent";
//     };

//     const span = document.createElement("span");
//     span.textContent = text;

//     button.appendChild(span);

//     return button;
//   };

//   // DONE - button
//   const checkIcon = document.createElement("button");
//   checkIcon.style.cssText = `
//     display: flex;
//     align-items: center;
//     justify-content: center;
//     width: 40px;
//     height: 40px;
//     background-color: #f56565;
//     border-radius: 50%;
//     margin-right: 10px;
//   `;
//   checkIcon.onmouseover = () => {
//     checkIcon.style.backgroundColor = "#f05656";
//   };
//   checkIcon.onmouseout = () => {
//     checkIcon.style.backgroundColor = "#f56565";
//   };
//   checkIcon.innerText = "Done";
//   checkIcon.style.color = "white";

//   // Pause, restart, and close buttons
//   const pauseButton = createButton("Pause");
//   const restartButton = createButton("Restart");
//   const closeButton = createButton(" X ");

//   // Handle close button click
//   closeButton.addEventListener("click", () => {
//     document.body.removeChild(newDiv);
//     disableMouseTracking();
//   });

//   // Append buttons to the control panel
//   newDiv.appendChild(checkIcon);
//   newDiv.appendChild(pauseButton);
//   newDiv.appendChild(restartButton);
//   newDiv.appendChild(closeButton);

//   document.body.appendChild(newDiv);

//   // Enable mouse tracking when the div is appended
//   enableMouseTracking();

//   // Add event listener for the "Done" button
//   checkIcon.addEventListener("click", () => {
//     console.log("Captured Data: ", clickedData);
//     if (controlPanel) {
//       return;
//     }
//   });
// }

// function handleMouseClick(event) {
//   const controlPanel = document.getElementById("control-panel");
//   if (controlPanel && controlPanel.contains(event.target)) {
//     // return;

//   }

//   const x = event.clientX;
//   const y = event.clientY;
//   const pageWidth = window.innerWidth;
//   const pageHeight = window.innerHeight;
//   const relativeX = (x / pageWidth) * 100;
//   const relativeY = (y / pageHeight) * 100;

//   // Store the clicked data in the array
//   clickedData.push({
//     mouseCoordinates: { x, y },
//     pageSize: { width: pageWidth, height: pageHeight },
//     relativeCoordinates: { x: relativeX, y: relativeY },
//   });

//   console.log(`Mouse clicked at coordinates: X: ${x}, Y: ${y}`);
//   console.log(`Relative coordinates as percentage: X: ${relativeX}%, Y: ${relativeY}%`);

//   event.preventDefault();
// }

// function enableMouseTracking() {
//   document.addEventListener("click", handleMouseClick);
// }

// function disableMouseTracking() {
//   document.removeEventListener("click", handleMouseClick);
// }

// // Listen for messages to show the control panel
// chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
//   if (message.action === "showDiv") {
//     appendCustomDiv();
//   }
// });

// CLEANED CODE
const api = "http://localhost:3000/api";
let Data = [];
let isTracking = false;
let badgeCount = 0;

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
      color: #4a5568;
      background: transparent;
      background-color: #fff;
      border: none;
      cursor: pointer;
      transition: color 0.3s;
    `;
    button.onmouseover = () => {
      button.style.color = "#2d3748";
      button.style.backgroundColor = "#edf2f7";
    };
    button.onmouseout = () => {
      button.style.color = "#4a5568";
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
  background-color: #d94e4e;
  border-radius: 50%;
  color: white;
  padding: 2px 2px;
  font-size: 10px;
  position: absolute;
  top: -7px;
  right: -7px;
  min-width: 16px;
  min-height: 16px;
  text-align: center;
  display: none; /* Initially hidden */
  font-weight: bold;
  `;

  // checkIcon.addEventListener("click", () => {
  //   badgeCount++;
  //   badge.textContent = badgeCount;
  //   badge.style.display = "inline-block"; // Show badge when count > 0
  // });

  checkIcon.appendChild(badge);
  const pauseButton = createButton("Pause");
  const restartButton = createButton("Restart");
  const closeButton = createButton(" X ");

  checkIcon.addEventListener("click", () => {
    disableMouseTracking();

    chrome.runtime.sendMessage({
      action: "fetchStatus",
    });

    const controlPanel = document.getElementById("control-panel");
    // console.log("Captured Data: ", Data);
    sendToBackend(Data);
    if (controlPanel) {
      document.body.removeChild(newDiv);
    }
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
  // document.getElementById("done__button__id").addEventListener("click", () => {
  // })
  // try {
  //   const response = await fetch(`${api}`);
  //   console.log("response: ", response);
  // } catch (error) {
  //   console.log("error: ", error);
  // }

  const controlPanel = document.getElementById("control-panel");
  if (controlPanel && controlPanel.contains(event.target)) {
    return;
  }

  const clickedElement = event.target;
  let textOfClickedElement =
    clickedElement.innerText || clickedElement.textContent || "";
  if (textOfClickedElement.length > 15) {
    textOfClickedElement = textOfClickedElement.slice(0, 15) + "...";
  }
  textOfClickedElement = textOfClickedElement.replace(/\n/g, " ");
  // console.log("Text of clicked element:", textOfClickedElement);
  textOfClickedElement = "clicked on " + textOfClickedElement;

  const x = event.clientX;
  const y = event.clientY;
  // console.log(`Mouse clicked at coordinates: X: ${x}, Y: ${y}`);

  const pageWidth = window.innerWidth;
  const pageHeight = window.innerHeight;

  // console.log(`Page size: Width: ${pageWidth}, Height: ${pageHeight}`);

  const relativeX = (x / pageWidth) * 100;
  const relativeY = (y / pageHeight) * 100;

  // console.log(
  //   `Relative coordinates as percentage: X: ${relativeX}%, Y: ${relativeY}%`
  // );

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

  return new Promise((resolve, reject) => {
    chrome.runtime.sendMessage(
      { action: "postimages", data: data },
      (response) => {
        if (chrome.runtime.lastError) {
          console.error("Runtime Error:", chrome.runtime.lastError);
          reject(chrome.runtime.lastError);
        } else {
          console.log("Response received from background.js:", response);
          window.location.href =
            "http://localhost:3000" + response.data.urlToVists;
          resolve(response);
        }
      }
    );
  });

  // console.log(data);
  // STORE IN LOCAL STORAGE
  // localStorage.setItem("capturedData", JSON.stringify(data));
  // fetch("http://localhost:3000/api/saveData", {
  //   method: "POST",
  //   headers: {
  //     "Content-Type": "application/json",
  //   },
  //   body: JSON.stringify(data),
  // })
  //   .then((response) => response.json())
  //   .then((data) => {
  //     console.log("Data saved successfully:", data);
  //   })
  //   .catch((error) => {
  //     console.error("Error sending data:", error);
  //   });
}

function enableMouseTracking() {
  isTracking = true;
  document.addEventListener("click", handleMouseClick);
}

function disableMouseTracking() {
  isTracking = false;
  document.removeEventListener("click", handleMouseClick);
}

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === "showDiv") {
    appendCustomDiv();
  }
});
