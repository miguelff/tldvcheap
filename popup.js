document.addEventListener('DOMContentLoaded', function() {
  const copyButton = document.getElementById('copyTranscript');
  const summarizeButton = document.getElementById('summarizeWithClaude');
  const settingsButton = document.getElementById('settings');
  const status = document.getElementById('status');

  let isOperationInProgress = false;

  function showStatus(message, isError = false) {
    status.textContent = message;
    status.className = isError ? 'error' : 'success';
    setTimeout(() => {
      status.textContent = '';
      status.className = '';
    }, 3000);
  }

  function setOperationInProgress(inProgress) {
    isOperationInProgress = inProgress;
    copyButton.disabled = inProgress;
    summarizeButton.disabled = inProgress;
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
    if (isOperationInProgress) return;
    
    try {
      setOperationInProgress(true);
      const transcript = await getTranscript();
      console.log('Copy button - transcript length:', transcript?.length || 0);
      
      if (!transcript) {
        console.log('No transcript found');
        showStatus('No transcript found - make sure transcripts are visible on page', true);
        setOperationInProgress(false);
        return;
      }

      if (transcript.length < 500) {
        console.log('Transcript too short:', transcript.length, 'characters');
        showStatus('Transcript too short (less than 500 characters)', true);
        setOperationInProgress(false);
        return;
      }

      const excerpt = transcript.substring(0, 50) + '...';
      showStatus(`"${excerpt}" copied to clipboard`);
      
      await navigator.clipboard.writeText(transcript);
      
      // Show full transcript in popup
      chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        chrome.tabs.sendMessage(tabs[0].id, { 
          action: 'showPopup', 
          content: transcript,
          title: 'Copied Transcript'
        });
      });
      
      setOperationInProgress(false);
    } catch (error) {
      console.error('Copy error:', error);
      showStatus('Failed to copy transcript', true);
      setOperationInProgress(false);
    }
  });

  summarizeButton.addEventListener('click', async () => {
    if (isOperationInProgress) return;
    
    try {
      setOperationInProgress(true);
      
      const apiKey = await getApiKey();
      if (!apiKey) {
        showStatus('Please configure API key in settings', true);
        setOperationInProgress(false);
        return;
      }

      const transcript = await getTranscript();
      console.log('Summarize button - transcript length:', transcript?.length || 0);
      
      if (!transcript) {
        console.log('No transcript found');
        showStatus('No transcript found - make sure transcripts are visible on page', true);
        setOperationInProgress(false);
        return;
      }

      if (transcript.length < 500) {
        console.log('Transcript too short for summarization:', transcript.length, 'characters');
        showStatus('Transcript too short (less than 500 characters)', true);
        setOperationInProgress(false);
        return;
      }

      const excerpt = transcript.substring(0, 50) + '...';
      showStatus(`"${excerpt}" is being summarized`);
      
      const claude = new ClaudeClient(apiKey);
      const summary = await claude.summarizeTranscript(transcript);
      
      // Copy to clipboard first (popup has user gesture context)
      await navigator.clipboard.writeText(summary);
      
      // Show summary in centered popup on the page
      chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        chrome.tabs.sendMessage(tabs[0].id, { 
          action: 'showPopup', 
          content: summary,
          title: 'Summary'
        });
      });
      
      showStatus('Summary displayed and copied!');
      setOperationInProgress(false);
    } catch (error) {
      console.error('Summarize error:', error);
      showStatus('Failed to summarize transcript', true);
      setOperationInProgress(false);
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