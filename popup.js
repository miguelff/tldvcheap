document.addEventListener('DOMContentLoaded', function() {
  const copyButton = document.getElementById('copyTranscript');
  const summarizeButton = document.getElementById('summarizeWithChatGPT');
  const status = document.getElementById('status');

  function showStatus(message, isError = false) {
    status.textContent = message;
    status.className = isError ? 'error' : 'success';
    setTimeout(() => {
      status.textContent = '';
      status.className = '';
    }, 3000);
  }

  async function getTranscript() {
    return new Promise((resolve) => {
      chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        chrome.tabs.sendMessage(tabs[0].id, { action: 'getTranscript' }, (response) => {
          resolve(response?.transcript || null);
        });
      });
    });
  }

  copyButton.addEventListener('click', async () => {
    try {
      const transcript = await getTranscript();
      if (transcript) {
        await navigator.clipboard.writeText(transcript);
        showStatus('Transcript copied to clipboard!');
      } else {
        showStatus('No transcript found on this page', true);
      }
    } catch (error) {
      showStatus('Failed to copy transcript', true);
    }
  });

  summarizeButton.addEventListener('click', async () => {
    try {
      const transcript = await getTranscript();
      if (transcript) {
        const prompt = `Please summarize the following transcript from a tl;dv recording:\n\n${transcript}`;
        await navigator.clipboard.writeText(prompt);
        
        // Open ChatGPT in a new tab
        chrome.tabs.create({ url: 'https://chat.openai.com' });
        showStatus('Prompt copied! ChatGPT opened in new tab');
      } else {
        showStatus('No transcript found on this page', true);
      }
    } catch (error) {
      showStatus('Failed to prepare ChatGPT prompt', true);
    }
  });

  // Check if we're on a tldv.io page
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    if (!tabs[0].url.includes('tldv.io')) {
      copyButton.disabled = true;
      summarizeButton.disabled = true;
      showStatus('This extension only works on tldv.io pages', true);
    }
  });
});