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
  checkIcon.style.cssText = `
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  background-color: #f56565;
  border-radius: 50%;
  margin-right: 10px;
  `;
  checkIcon.onmouseover = () => {
    checkIcon.style.backgroundColor = "#f05656";
  };
  checkIcon.onmouseout = () => {
    checkIcon.style.backgroundColor = "#f56565";
  };
  checkIcon.innerText = "Done";
  checkIcon.style.color = "white";

  newDiv.appendChild(checkIcon);
  newDiv.appendChild(createButton("Pause"));
  newDiv.appendChild(createButton("Restart"));
  const closeButton = createButton(" X ");
  // newDiv.appendChild(createButton("Cancel"));

  document.body.appendChild(newDiv);
  // const newDiv = document.createElement("div");

  // newDiv.id = "custom-div";
  // newDiv.style.cssText = `
  //   position: fixed;
  //   bottom: 20px;
  //   left: 20px;
  //   padding: 10px;
  //   background-color: green;
  //   border-radius: 8px;
  //   z-index: 9999;
  // `;

  // const closeButton = document.createElement("button");
  // closeButton.innerHTML = "X";
  // closeButton.style.cssText = `
  //   position: absolute;
  //   top: 3px;
  //   right: 7px;
  //   background: transparent;
  //   border: none;
  //   font-size: 15px;
  //   color: black;
  //   cursor: pointer;
  //   z-index: 10000;
  // `;

  closeButton.addEventListener("click", () => {
    document.body.removeChild(newDiv);
    // Disable mouse tracking when the div is removed
    disableMouseTracking();
  });

  newDiv.appendChild(closeButton);

  // const textContent = document.createElement("span");
  // textContent.innerHTML = "This is a custom div added to the webpage's body!";
  // newDiv.appendChild(textContent);

  document.body.appendChild(newDiv);

  // Enable mouse tracking when the div is visible
  enableMouseTracking();
}

// function captureScreenshot(callback) {
//   chrome.tabs.captureVisibleTab(null, { format: "png" }, (screenshotUrl) => {
//     if (chrome.runtime.lastError) {
//       console.error("Error capturing screenshot:", chrome.runtime.lastError);
//       return;
//     }
//     callback(screenshotUrl);
//   });
// }

function handleMouseClick(event) {
  const controlPanel = document.getElementById("control-panel");
  if (controlPanel && controlPanel.contains(event.target)) {
    return;
  }

  const x = event.clientX;
  const y = event.clientY;
  console.log(`Mouse clicked at coordinates: X: ${x}, Y: ${y}`);

  const pageWidth = window.innerWidth;
  const pageHeight = window.innerHeight;
  //   const pageWidth = document.documentElement.scrollWidth;
  //   const pageHeight = document.documentElement.scrollHeight;

  console.log(`Page size: Width: ${pageWidth}, Height: ${pageHeight}`);

  // Calculate the relative coordinates based on the total page size
  const relativeX = (x / pageWidth) * 100; // Relative position as percentage of the total page width
  const relativeY = (y / pageHeight) * 100; // Relative position as percentage of the total page height

  console.log(
    `Relative coordinates as percentage: X: ${relativeX}%, Y: ${relativeY}%`
  );
  //   const data = {};

  // Intercept the click event and prevent navigation temporarily
  event.preventDefault(); // Stop the link/navigation from happening immediately

  // Send a message to background script to capture screenshot
  chrome.runtime.sendMessage({ action: "captureScreenshot" }, (response) => {
    const screenshotUrl = response.screenshotUrl;
    // console.log("Screenshot captured:", screenshotUrl);

    // Optionally, you can display the screenshot URL or save it
    // Example: You could display the screenshot in a new tab
    // const img = new Image();
    // img.src = screenshotUrl;
    // document.body.appendChild(img); // Optionally append the image to the body

    // Open render.html in a new tab and send the screenshot and coordinates
    chrome.runtime.sendMessage({
      action: "openRenderTab",
      screenshotUrl: screenshotUrl,
      clickCoordinates: { x: relativeX, y: relativeY },
      //   clickCoordinates: { x, y },
    });
    data = {
      mouseCoordinates: { x, y },
      pageSize: { width: pageWidth, height: pageHeight },
      relativeCoordinates: { x: relativeX, y: relativeY },
      screenshotUrl: screenshotUrl,
    };
    sendToBackend(data);

    // After capturing the screenshot and sending data, navigate to the target URL
    // Use setTimeout to give the page time to process the data before navigating
    setTimeout(() => {
      // Perform the navigation after the delay
      if (targetUrl) {
        window.location.href = targetUrl; // or window.location.replace(targetUrl);
      }
    }, 1000); // Delay navigation by 1 second (adjust as needed)
  });
  //   // Capture screenshot when mouse is clicked
  //   captureScreenshot((screenshotUrl) => {
  //     console.log("Screenshot captured:", screenshotUrl);

  //     // Optionally, you can display the screenshot URL or save it
  //     // For now, we log the screenshot URL to the console
  //     // You can also save the screenshot in a new tab, or use it as needed
  //     // Example: You could display the screenshot in a new tab
  //     const img = new Image();
  //     img.src = screenshotUrl;
  //     document.body.appendChild(img); // Optionally append the image to the body
  //   });

  // Send data to the backend
  //   sendToBackend(data);
}

// Function to send data to the backend (remote database)
function sendToBackend(data) {
  console.log("Sending data to backend...");
  console.log(data);
  //   fetch("https://your-api-endpoint.com/saveData", {
  //     method: "POST",
  //     headers: {
  //       "Content-Type": "application/json",
  //     },
  //     body: JSON.stringify(data),
  //   })
  //     .then((response) => response.json())
  //     .then((data) => {
  //       console.log("Data successfully sent to the backend:", data);
  //     })
  //     .catch((error) => {
  //       console.error("Error sending data to the backend:", error);
  //     });
}

function enableMouseTracking() {
  document.addEventListener("click", handleMouseClick);
}

function disableMouseTracking() {
  document.removeEventListener("click", handleMouseClick);
}

// Listen for messages from popup.js
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === "showDiv") {
    appendCustomDiv();
  }
});

// function appendCustomDiv() {
//   if (document.getElementById("custom-div")) return;

//   const newDiv = document.createElement("div");

//   newDiv.id = "custom-div";
//   newDiv.style.cssText = `
//       position: fixed;
//       bottom: 20px;
//       left: 20px;
//       padding: 10px;
//       background-color: green;
//       border-radius: 8px;
//       z-index: 9999;
//     `;

//   const closeButton = document.createElement("button");
//   closeButton.innerHTML = "&#10005;";
//   closeButton.style.cssText = `
//       position: absolute;
//       top: 10px;
//       right: 10px;
//       background: transparent;
//       border: none;
//       font-size: 20px;
//       color: #fff;
//       cursor: pointer;
//     `;

//   closeButton.addEventListener("click", () => {
//     document.body.removeChild(newDiv);
//   });

//   newDiv.appendChild(closeButton);

//   const textContent = document.createElement("span");
//   textContent.innerHTML = "This is a custom div added to the webpage's body!";
//   newDiv.appendChild(textContent);

//   document.body.appendChild(newDiv);
// }

// // Listen for messages from popup.js
// chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
//   if (message.action === "showDiv") {
//     appendCustomDiv();
//   }
// });
