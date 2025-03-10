function renderImageAndBubble(screenshotUrl, x, y) {
  const imageContainer = document.getElementById("image-container");

  // Create image element
  const screenshotImage = new Image();
  screenshotImage.src = screenshotUrl;
  screenshotImage.alt = "Screenshot";

  // Append the image to the container
  imageContainer.appendChild(screenshotImage);

  // Set the image to fit within the viewport (scale it)
  screenshotImage.style.maxWidth = "100%";
  screenshotImage.style.maxHeight = "100vh"; // Fit the image height to the viewport height
  screenshotImage.style.objectFit = "contain"; // Maintain aspect ratio

  // Add event listener to calculate the image size when it's fully loaded
  screenshotImage.onload = function () {
    // Get the actual dimensions of the image
    const imageWidth = screenshotImage.naturalWidth;
    const imageHeight = screenshotImage.naturalHeight;

    // Calculate the absolute X and Y positions based on the image's size
    const absoluteX = (x / 100) * imageWidth;
    const absoluteY = (y / 100) * imageHeight;

    const bubble = document.createElement("div");
    bubble.classList.add("bubble");

    bubble.style.left = `${absoluteX - 25}px`; // Center the bubble at the click point
    bubble.style.top = `${absoluteY - 25}px`; // Center the bubble at the click point

    imageContainer.appendChild(bubble);
  };
}

// Listen for : message from content.js
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.screenshotUrl && message.clickCoordinates) {
    const { screenshotUrl, clickCoordinates } = message;

    renderImageAndBubble(screenshotUrl, clickCoordinates.x, clickCoordinates.y);
  }
});
