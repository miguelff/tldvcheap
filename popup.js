document.addEventListener('DOMContentLoaded', function() {
  const copyButton = document.getElementById('copyTranscript');
  const summarizeButton = document.getElementById('summarizeWithClaude');
  const settingsButton = document.getElementById('settings');
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

  async function getApiKey() {
    return new Promise((resolve) => {
      chrome.storage.sync.get(['anthropicApiKey'], function(result) {
        resolve(result.anthropicApiKey || null);
      });
    });
  }


  copyButton.addEventListener('click', async () => {
    try {
      const transcript = await getTranscript();
      console.log('Copy button - transcript length:', transcript?.length || 0);
      
      if (transcript && transcript.length >= 500) {
        await navigator.clipboard.writeText(transcript);
        showStatus('Transcript copied to clipboard!');
      } else if (transcript && transcript.length < 500) {
        console.log('Transcript too short:', transcript.length, 'characters');
        showStatus('Transcript too short (less than 500 characters)', true);
      } else {
        console.log('No transcript found or page reloaded');
        showStatus('No transcript found - page may have reloaded', true);
      }
    } catch (error) {
      console.error('Copy error:', error);
      showStatus('Failed to copy transcript', true);
    }
  });

  summarizeButton.addEventListener('click', async () => {
    try {
      const apiKey = await getApiKey();
      if (!apiKey) {
        showStatus('Please configure API key in settings', true);
        return;
      }

      const transcript = await getTranscript();
      console.log('Summarize button - transcript length:', transcript?.length || 0);
      
      if (!transcript) {
        console.log('No transcript found or page reloaded');
        showStatus('No transcript found - page may have reloaded', true);
        return;
      }

      if (transcript.length < 500) {
        console.log('Transcript too short for summarization:', transcript.length, 'characters');
        showStatus('Transcript too short (less than 500 characters)', true);
        return;
      }

      showStatus('Summarizing...');
      const claude = new ClaudeClient(apiKey);
      const summary = await claude.summarizeTranscript(transcript);
      
      // Copy to clipboard first (popup has user gesture context)
      await navigator.clipboard.writeText(summary);
      
      // Show summary in centered popup on the page
      chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        chrome.tabs.sendMessage(tabs[0].id, { 
          action: 'showSummary', 
          summary: summary 
        });
      });
      
      showStatus('Summary displayed and copied!');
    } catch (error) {
      console.error('Summarize error:', error);
      showStatus('Failed to summarize transcript', true);
    }
  });

  settingsButton.addEventListener('click', () => {
    chrome.runtime.openOptionsPage();
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