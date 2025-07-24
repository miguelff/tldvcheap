function extractTranscript() {
  const transcriptElement = document.querySelector(".group\\/root-player");
  if (transcriptElement) {
    const text = transcriptElement.innerText.trim();
    console.log("Extracted transcript length:", text.length);
    console.log("Transcript preview:", text.substring(0, 100) + "...");
    return text;
  }
  return null;
}


function waitForTranscript() {
  return new Promise((resolve) => {
    const transcript = extractTranscript();
    console.log("Transcript found with", transcript?.length || 0, "characters");
    resolve(transcript);
  });
}

function showPopup(content, title = 'Result') {
  // Remove existing popup if any
  const existingPopup = document.getElementById('tldv-summary-popup');
  if (existingPopup) {
    existingPopup.remove();
  }

  // Create popup overlay
  const overlay = document.createElement('div');
  overlay.id = 'tldv-summary-popup';
  overlay.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.5);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 10000;
    font-family: Arial, sans-serif;
  `;

  // Create popup content
  const popup = document.createElement('div');
  popup.style.cssText = `
    background: white;
    padding: 30px;
    border-radius: 10px;
    max-width: 600px;
    max-height: 80vh;
    overflow-y: auto;
    position: relative;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
  `;

  // Create close button
  const closeButton = document.createElement('button');
  closeButton.innerHTML = '×';
  closeButton.style.cssText = `
    position: absolute;
    top: 10px;
    right: 15px;
    background: none;
    border: none;
    font-size: 24px;
    cursor: pointer;
    color: #666;
    padding: 0;
    width: 30px;
    height: 30px;
    display: flex;
    align-items: center;
    justify-content: center;
  `;

  // Create title
  const titleElement = document.createElement('h3');
  titleElement.textContent = title;
  titleElement.style.cssText = `
    margin: 0 0 20px 0;
    color: #333;
    font-size: 20px;
  `;

  // Create content text
  const contentText = document.createElement('div');
  contentText.textContent = content;
  contentText.style.cssText = `
    line-height: 1.6;
    color: #444;
    margin-bottom: 20px;
    white-space: pre-wrap;
  `;

  // Create copy status
  const copyStatus = document.createElement('div');
  copyStatus.textContent = 'Content copied to clipboard!';
  copyStatus.style.cssText = `
    background: #dff0d8;
    color: #3c763d;
    padding: 10px;
    border-radius: 4px;
    text-align: center;
    font-size: 14px;
  `;

  // Assemble popup
  popup.appendChild(closeButton);
  popup.appendChild(titleElement);
  popup.appendChild(contentText);
  popup.appendChild(copyStatus);
  overlay.appendChild(popup);

  // Close handlers
  const closePopup = () => {
    overlay.remove();
  };

  closeButton.addEventListener('click', closePopup);
  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) closePopup();
  });

  document.addEventListener('keydown', function escapeHandler(e) {
    if (e.key === 'Escape') {
      closePopup();
      document.removeEventListener('keydown', escapeHandler);
    }
  });

  // Add to page
  document.body.appendChild(overlay);

  // Content is already copied by popup script
  copyStatus.textContent = 'Content copied to clipboard!';
}

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "getTranscript") {
    waitForTranscript().then((transcript) => {
      sendResponse({ transcript: transcript });
    });
    return true; // Keep message channel open for async response
  }
  
  if (request.action === "showPopup") {
    showPopup(request.content, request.title);
    sendResponse({ success: true });
  }
});
