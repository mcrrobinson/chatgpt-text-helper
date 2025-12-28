# ChatGPT Text Helper - Chrome Extension

A Chrome extension that lets you highlight text on any webpage and interact with ChatGPT instantly.

## Features

- 🖱️ Highlight any text on a webpage
- 💬 Enter natural language prompts like "summarize this", "explain this", "translate to Spanish"
- ⚡ Get instant responses from ChatGPT
- 🎨 Clean, modern UI that appears near your selection

## Installation

1. **Get an OpenAI API Key**
   - Go to [OpenAI Platform](https://platform.openai.com/api-keys)
   - Create an account or sign in
   - Generate a new API key

2. **Load the Extension in Chrome**
   - Open Chrome and navigate to `chrome://extensions/`
   - Enable "Developer mode" (toggle in top-right corner)
   - Click "Load unpacked"
   - Select the `chatgpt-wrapper` folder

3. **Configure Your API Key**
   - Click the extension icon in your browser toolbar
   - Enter your OpenAI API key
   - Click "Save API Key"

## Usage

1. Navigate to any webpage
2. Highlight/select any text
3. A ChatGPT Helper box will appear
4. Enter your prompt (e.g., "summarize this", "explain like I'm 5", "translate to French")
5. Press Enter or click "Send"
6. Wait for ChatGPT's response

## Example Prompts

- "Summarize this in 2 sentences"
- "Explain this concept"
- "Translate to Spanish"
- "What does this mean?"
- "Give me the key points"
- "Simplify this"
- "Find any errors in this code"

## Files Structure

```
chatgpt-wrapper/
├── manifest.json       # Extension configuration
├── content.js          # Handles text selection and UI
├── content.css         # Styles for the popup box
├── background.js       # Handles ChatGPT API calls
├── popup.html          # Settings popup UI
├── popup.js            # Settings popup logic
└── README.md           # This file
```

## Privacy & Security

- Your API key is stored locally in Chrome's sync storage
- Highlighted text and prompts are sent directly to OpenAI's API
- No data is stored or sent to any third-party servers
- You have full control over what text you send to ChatGPT

## Cost

This extension uses the OpenAI API, which requires payment. Typical costs are:
- GPT-3.5-turbo: ~$0.002 per request (very affordable)
- Check [OpenAI Pricing](https://openai.com/pricing) for current rates

## Customization

You can modify the extension to:
- Change the AI model (edit `background.js`, line with `model: 'gpt-3.5-turbo'`)
- Adjust response length (edit `max_tokens` in `background.js`)
- Customize the UI colors (edit `content.css`)
- Add preset prompts

## Troubleshooting

**"Please set your OpenAI API key" error:**
- Make sure you've added your API key in the extension popup

**"API request failed" error:**
- Check that your API key is valid
- Ensure you have credits in your OpenAI account
- Check your internet connection

**Extension not appearing:**
- Make sure you've loaded the extension in `chrome://extensions/`
- Try refreshing the webpage

## License

MIT License - feel free to modify and use as you wish!
