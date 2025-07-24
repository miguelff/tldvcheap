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

function ensureTranscriptParam() {
  // Find all buttons in the document
  const allButtons = document.querySelectorAll("button");
  console.log("Found total buttons:", allButtons.length);

  for (const button of allButtons) {
    // Check if button has data-active=false
    const dataActive = button.getAttribute("data-active");
    
    if (dataActive === "false") {
      // Look for descendant p element with specific text
      const pElements = button.querySelectorAll("p");
      
      for (const p of pElements) {
        const text = p.textContent.trim();
        console.log("Found p element with text:", text);
        
        if (text === "Transcript" || text === "Transcripción") {
          console.log("Found transcript button with data-active=false");
          console.log("NOTE: Extensions cannot programmatically click buttons due to Chrome security restrictions");
          console.log("Please manually click the transcript button to enable transcription");
          
          // Highlight the button to help user find it
          button.style.border = "3px solid red";
          button.style.boxShadow = "0 0 10px red";
          
          setTimeout(() => {
            button.style.border = "";
            button.style.boxShadow = "";
          }, 5000);
          
          return false; // Return false since we can't actually click it
        }
      }
    }
  }

  console.log("No transcript button with data-active=false found");
  return false; // No click needed
}

function waitForTranscript(maxAttempts = 10, interval = 500) {
  return new Promise((resolve) => {
    // First check if we need to click transcript button
    const buttonClicked = ensureTranscriptParam();

    let attempts = 0;
    const startDelay = buttonClicked ? 2000 : 500; // Wait longer if button was clicked

    const checkForTranscript = () => {
      if (attempts === 0) {
        const waitTime = buttonClicked ? 2000 : 500;
        console.log(`Waiting ${waitTime}ms for transcript to load...`);
        setTimeout(checkForTranscript, waitTime);
        attempts++;
        return;
      }

      const transcript = extractTranscript();
      if (transcript && transcript.trim().length > 0) {
        console.log("Transcript found with", transcript.length, "characters");
        resolve(transcript);
        return;
      }

      attempts++;
      if (attempts < maxAttempts) {
        console.log(`Attempt ${attempts}: transcript not found, retrying...`);
        setTimeout(checkForTranscript, interval);
      } else {
        console.log("Max attempts reached, no transcript found");
        resolve(null);
      }
    };

    checkForTranscript();
  });
}

function showSummaryPopup(summary) {
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
  const title = document.createElement('h3');
  title.textContent = 'Summary';
  title.style.cssText = `
    margin: 0 0 20px 0;
    color: #333;
    font-size: 20px;
  `;

  // Create summary text
  const summaryText = document.createElement('div');
  summaryText.textContent = summary;
  summaryText.style.cssText = `
    line-height: 1.6;
    color: #444;
    margin-bottom: 20px;
    white-space: pre-wrap;
  `;

  // Create copy status
  const copyStatus = document.createElement('div');
  copyStatus.textContent = 'Summary copied to clipboard!';
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
  popup.appendChild(title);
  popup.appendChild(summaryText);
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

  // Summary is already copied by popup script
  copyStatus.textContent = 'Summary copied to clipboard!';
}

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "getTranscript") {
    waitForTranscript().then((transcript) => {
      sendResponse({ transcript: transcript });
    });
    return true; // Keep message channel open for async response
  }
  
  if (request.action === "showSummary") {
    showSummaryPopup(request.summary);
    sendResponse({ success: true });
  }
});
