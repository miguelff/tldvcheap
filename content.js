function extractTranscript() {
  const transcriptElement = document.querySelector('.group\\/root-player');
  if (transcriptElement) {
    return transcriptElement.innerText;
  }
  return null;
}

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'getTranscript') {
    const transcript = extractTranscript();
    sendResponse({ transcript: transcript });
  }
});

window.addEventListener('load', () => {
  const transcriptElement = document.querySelector('.group\\/root-player');
  if (transcriptElement) {
    chrome.runtime.sendMessage({ 
      action: 'transcriptAvailable',
      available: true 
    });
  }
});