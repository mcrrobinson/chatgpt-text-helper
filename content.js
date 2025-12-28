// Content script - handles text selection and UI
let selectedText = '';
let textBox = null;

console.log('ChatGPT Helper: Content script loaded');

// Helper function to check if an element is an input field
function isInInputElement(element) {
  if (!element) return false;
  
  const tagName = element.tagName?.toLowerCase();
  
  // Check if it's an input, textarea, or contenteditable element
  if (tagName === 'input' || tagName === 'textarea') {
    return true;
  }
  
  // Check for contenteditable
  if (element.isContentEditable) {
    return true;
  }
  
  // Check if any parent is an input element
  let parent = element.parentElement;
  while (parent) {
    if (parent.isContentEditable) {
      return true;
    }
    parent = parent.parentElement;
  }
  
  return false;
}

// Listen for text selection
document.addEventListener('mouseup', handleTextSelection);

// Listen for CTRL+A / CMD+A
document.addEventListener('keydown', (e) => {
  if ((e.ctrlKey || e.metaKey) && e.key === 'a') {
    // Don't show popup if we're in an input field
    if (isInInputElement(document.activeElement)) {
      return;
    }
    
    // Wait a bit for the selection to complete
    setTimeout(() => {
      const selection = window.getSelection();
      const text = selection.toString().trim();
      
      if (text.length > 0) {
        selectedText = text;
        // Show box in center of viewport
        const x = window.innerWidth / 2 + window.scrollX;
        const y = window.innerHeight / 2 + window.scrollY;
        showTextBox(x, y);
      }
    }, 10);
  }
});

function handleTextSelection(e) {
  // Don't handle selection if clicking inside the textBox
  if (textBox && textBox.contains(e.target)) {
    console.log('ChatGPT Helper: Click inside box, ignoring selection handler');
    return;
  }
  
  // Don't show popup if selection is in an input field
  if (isInInputElement(e.target) || isInInputElement(document.activeElement)) {
    console.log('ChatGPT Helper: Selection in input element, ignoring');
    return;
  }
  
  const selection = window.getSelection();
  const text = selection.toString().trim();
  
  console.log('ChatGPT Helper: Text selected:', text);
  
  if (text.length > 0) {
    selectedText = text;
    console.log('ChatGPT Helper: Showing text box at', e.pageX, e.pageY);
    showTextBox(e.pageX, e.pageY);
  } else {
    hideTextBox();
  }
}

function showTextBox(x, y) {
  // Remove existing textbox if any
  hideTextBox();
  
  // Create the textbox container
  textBox = document.createElement('div');
  textBox.className = 'chatgpt-helper-box';
  textBox.innerHTML = `
    <div class="chatgpt-helper-input-row">
      <input type="text" 
             id="chatgpt-prompt-input" 
             placeholder="Ask ChatGPT..." 
             class="chatgpt-helper-input">
      <button id="chatgpt-submit-btn" class="chatgpt-helper-submit">></button>
    </div>
    <div id="chatgpt-response" class="chatgpt-helper-response" style="display:none;"></div>
    <div id="chatgpt-loading" class="chatgpt-helper-loading" style="display:none;">
      <div class="spinner"></div>
      <span>Thinking...</span>
    </div>
  `;
  
  document.body.appendChild(textBox);
  
  // Position the box near the selection
  const boxHeight = 50;
  const boxWidth = 350;
  let posX = x + 10;
  let posY = y + 10;
  
  // Keep box within viewport
  if (posX + boxWidth > window.innerWidth + window.scrollX) {
    posX = window.innerWidth + window.scrollX - boxWidth - 10;
  }
  if (posY + boxHeight > window.innerHeight + window.scrollY) {
    posY = y - boxHeight - 10;
  }
  
  textBox.style.left = posX + 'px';
  textBox.style.top = posY + 'px';
  
  console.log('ChatGPT Helper: Box positioned at', posX, posY);
  console.log('ChatGPT Helper: Box element:', textBox);
  console.log('ChatGPT Helper: Box in DOM:', document.body.contains(textBox));
  
  // Add event listeners
  document.getElementById('chatgpt-submit-btn').addEventListener('click', submitPrompt);
  const promptInput = document.getElementById('chatgpt-prompt-input');
  promptInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
      submitPrompt();
    }
  });
  
  // Handle ESC key to exit the chat box
  promptInput.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      e.preventDefault();
      hideTextBox();
    }
  });
  
  // Don't focus the input initially - preserve text selection
  const selection = window.getSelection();
  const ranges = [];
  for (let i = 0; i < selection.rangeCount; i++) {
    ranges.push(selection.getRangeAt(i));
  }
  
  // Listen for keypress to auto-focus input
  const keypressHandler = (e) => {
    // Ignore modifier keys, arrow keys, etc.
    if (e.ctrlKey || e.metaKey || e.altKey || 
        e.key.length > 1 || // Ignore special keys like Enter, Backspace, etc.
        e.key === 'Enter' || e.key === 'Escape' || e.key === 'Tab') {
      return;
    }
    
    const input = document.getElementById('chatgpt-prompt-input');
    if (input && document.activeElement !== input) {
      e.preventDefault();
      input.focus();
      input.value = e.key;
      // Position cursor at end
      input.setSelectionRange(input.value.length, input.value.length);
    }
  };
  
  document.addEventListener('keypress', keypressHandler);
  
  // Remove keypress listener if it exists
    if (textBox._keypressHandler) {
      document.removeEventListener('keypress', textBox._keypressHandler);
    }
//   textBox._keypressHandler = keypressHandler;
  
  // Close if clicking outside - use capture phase and longer delay
  setTimeout(() => {
    document.addEventListener('click', handleOutsideClick, true);
  }, 200);
}

function handleOutsideClick(e) {
  // Check if click is inside the textBox or any of its children
  if (textBox && !textBox.contains(e.target)) {
    console.log('ChatGPT Helper: Clicked outside, hiding box');
    hideTextBox();
  } else {
    console.log('ChatGPT Helper: Clicked inside box, keeping it open');
  }
}

function hideTextBox() {
  if (textBox) {
    textBox.remove();
    textBox = null;
    document.removeEventListener('click', handleOutsideClick, true);
  }
}

async function submitPrompt() {
  const input = document.getElementById('chatgpt-prompt-input');
  const prompt = input.value.trim();
  console.log('ChatGPT Helper: Submit clicked with prompt:', prompt);
  
  if (!prompt) {
    alert('Please enter a prompt');
    return;
  }
  
  const loadingEl = document.getElementById('chatgpt-loading');
  const responseEl = document.getElementById('chatgpt-response');
  const submitBtn = document.getElementById('chatgpt-submit-btn');
  
  // Temporarily remove outside click listener while processing
  document.removeEventListener('click', handleOutsideClick);
  
  // Show loading
  loadingEl.style.display = 'flex';
  responseEl.style.display = 'none';
  submitBtn.disabled = true;
  
  try {
    console.log('ChatGPT Helper: Sending message to background script');
    // Send message to background script
    const response = await chrome.runtime.sendMessage({
      action: 'chatgpt',
      selectedText: selectedText,
      prompt: prompt
    });
    
    console.log('ChatGPT Helper: Received response:', response);
    
    loadingEl.style.display = 'none';
    
    if (response.error) {
      responseEl.innerHTML = `<div class="error">${response.error}</div>`;
    } else {
      responseEl.innerHTML = `<div class="success">${formatResponse(response.result)}</div>`;
    }
    
    responseEl.style.display = 'block';
    submitBtn.disabled = false;
    
  } catch (error) {
    console.error('ChatGPT Helper: Error:', error);
    loadingEl.style.display = 'none';
    responseEl.innerHTML = `<div class="error">Error: ${error.message}</div>`;
    responseEl.style.display = 'block';
    submitBtn.disabled = false;
  }
  
  // Re-add outside click listener after a short delay
  setTimeout(() => {
    document.addEventListener('click', handleOutsideClick);
  }, 100); submitBtn.disabled = false;
}

function formatResponse(text) {
  // Basic formatting - convert newlines to br tags
  return text.replace(/\n/g, '<br>');
}
