# tl;dv Transcript Summarizer

## Installation

1. Open Chrome and navigate to `chrome://extensions/`
2. Enable "Developer mode" (toggle in top-right corner)
3. Click "Load unpacked" button
4. Select this folder
5. The extension icon will appear in your Chrome toolbar

## Configuration

Before using the summarization feature, you need to configure your Anthropic API key:

1. Get an API key from [Anthropic Console](https://console.anthropic.com/)
2. Right-click the extension icon and select "Options"
3. Enter your API key (starts with `sk-ant-`)
4. Click "Save" to store the key
5. Optionally click "Test Connection" to verify the key works

## Usage

1. Navigate to any tl;dv recording page (tldv.io)
2. Click the extension icon in your toolbar
3. Choose an option:
   - **Copy Transcript**: Copies transcript text to clipboard
   - **Summarize with Claude**: Uses Claude Sonnet to summarize the transcript
   - **Settings**: Opens configuration page for API key setup