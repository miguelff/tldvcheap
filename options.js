document.addEventListener('DOMContentLoaded', function() {
  const apiKeyInput = document.getElementById('apiKey');
  const saveButton = document.getElementById('save');
  const testButton = document.getElementById('test');
  const status = document.getElementById('status');

  function showStatus(message, isError = false) {
    status.textContent = message;
    status.className = `status ${isError ? 'error' : 'success'}`;
    setTimeout(() => {
      status.textContent = '';
      status.className = '';
    }, 3000);
  }

  // Load saved API key
  chrome.storage.sync.get(['anthropicApiKey'], function(result) {
    if (result.anthropicApiKey) {
      apiKeyInput.value = result.anthropicApiKey;
    }
  });

  saveButton.addEventListener('click', function() {
    const apiKey = apiKeyInput.value.trim();
    if (!apiKey) {
      showStatus('Please enter an API key', true);
      return;
    }

    chrome.storage.sync.set({
      anthropicApiKey: apiKey
    }, function() {
      showStatus('API key saved successfully!');
    });
  });

  testButton.addEventListener('click', async function() {
    const apiKey = apiKeyInput.value.trim();
    if (!apiKey) {
      showStatus('Please enter an API key first', true);
      return;
    }

    try {
      const claude = new ClaudeClient(apiKey);
      const result = await claude.testConnection();
      
      if (result.success) {
        showStatus('API key is valid!');
      } else {
        console.log('API Error:', result.error);
        showStatus('API key test failed', true);
      }
    } catch (error) {
      console.log('Test error:', error);
      showStatus(`Connection failed: ${error.message}`, true);
    }
  });
});