// Background service worker - handles ChatGPT API calls

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'chatgpt') {
    handleChatGPTRequest(request.selectedText, request.prompt)
      .then(result => sendResponse({ result }))
      .catch(error => sendResponse({ error: error.message }));
    return true; // Will respond asynchronously
  }
});

async function handleChatGPTRequest(selectedText, prompt) {
  // Get API key from storage
  const { apiKey } = await chrome.storage.sync.get('apiKey');
  
  if (!apiKey) {
    throw new Error('Please set your OpenAI API key in the extension popup first');
  }
  
  // Construct the message
  const message = `${prompt}\n\nText: "${selectedText}"`;
  
  // Call OpenAI API
  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      model: 'gpt-3.5-turbo',
      messages: [
        {
          role: 'user',
          content: message
        }
      ],
      temperature: 0.7,
      max_tokens: 500
    })
  });
  
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error?.message || 'API request failed');
  }
  
  const data = await response.json();
  return data.choices[0].message.content;
}
