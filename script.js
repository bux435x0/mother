const API_KEY_STORAGE_KEY = 'mother-gemini-key';
const THREAD_STORAGE_KEY = 'mother-thread';
const MODEL_NAME = 'gemini-1.5-flash-latest';
const BASE_SYSTEM_PROMPT = `You are the "Mother" mainframe aboard the USCSS Nostromo. Respond in a calm, clipped tone reminiscent of a late 1970s computer terminal. Provide concise, informative replies formatted in uppercase headings followed by explanatory text.`;

const overlay = document.getElementById('api-overlay');
const apiInput = document.getElementById('api-key-input');
const saveApiBtn = document.getElementById('api-save');
const cancelApiBtn = document.getElementById('api-cancel');
const resetKeyBtn = document.getElementById('reset-key');
const clearThreadBtn = document.getElementById('clear-thread');
const form = document.getElementById('input-form');
const userInput = document.getElementById('user-input');
const output = document.getElementById('output');
const template = document.getElementById('message-template');

let apiKey = null;
let thread = null;
let isSending = false;

function init() {
  apiKey = localStorage.getItem(API_KEY_STORAGE_KEY);
  const storedThread = localStorage.getItem(THREAD_STORAGE_KEY);
  thread = storedThread ? reviveThread(JSON.parse(storedThread)) : createNewThread();

  renderThread();

  if (!apiKey) {
    showOverlay(true);
  } else {
    showOverlay(false);
    logSystem('AUTHENTICATION TOKEN LOADED. INTERFACE READY.');
  }
}

function createNewThread() {
  const newThread = {
    id: `thread-${Date.now()}`,
    messages: [],
    log: []
  };
  persistThread(newThread);
  return newThread;
}

function reviveThread(parsed) {
  return {
    id: parsed.id || `thread-${Date.now()}`,
    messages: Array.isArray(parsed.messages) ? parsed.messages : [],
    log: Array.isArray(parsed.log)
      ? parsed.log
      : (Array.isArray(parsed.messages)
        ? parsed.messages.map(entry => ({
            role: entry.role,
            text: entry.parts?.map(part => part.text).join('\n') || '',
            timestamp: new Date().toISOString()
          }))
        : [])
  };
}

function persistThread(currentThread = thread) {
  localStorage.setItem(THREAD_STORAGE_KEY, JSON.stringify(currentThread));
}

function showOverlay(visible) {
  overlay.classList.toggle('visible', visible);
  if (visible) {
    apiInput.value = '';
    apiInput.focus();
  }
}

function logSystem(text) {
  const systemMessage = {
    role: 'system',
    text,
    timestamp: new Date().toISOString()
  };
  addMessageToDisplay(systemMessage);
}

function addMessageToDisplay(message) {
  const clone = template.content.cloneNode(true);
  const timestampEl = clone.querySelector('.timestamp');
  const roleEl = clone.querySelector('.role');
  const textEl = clone.querySelector('.text');

  timestampEl.textContent = formatTimestamp(message.timestamp);
  roleEl.textContent = formatRole(message.role);
  textEl.textContent = message.text;

  output.appendChild(clone);
  output.scrollTop = output.scrollHeight;
}

function formatTimestamp(iso) {
  const date = iso ? new Date(iso) : new Date();
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
}

function formatRole(role) {
  switch (role) {
    case 'user':
      return 'CREW';
    case 'model':
      return 'MOTHER';
    case 'system':
    default:
      return 'SYSTEM';
  }
}

function handleApiSave() {
  const key = apiInput.value.trim();
  if (!key) {
    logSystem('NO API KEY ENTERED. AUTHENTICATION REQUIRED.');
    return;
  }
  apiKey = key;
  localStorage.setItem(API_KEY_STORAGE_KEY, apiKey);
  showOverlay(false);
  logSystem('API KEY ACCEPTED. ACCESS GRANTED.');
}

function handleApiCancel() {
  const stored = localStorage.getItem(API_KEY_STORAGE_KEY);
  if (stored) {
    apiKey = stored;
    showOverlay(false);
    logSystem('STORED API KEY RETRIEVED. ACCESS GRANTED.');
  } else {
    logSystem('NO STORED API KEY. INPUT REQUIRED.');
  }
}

async function handleSubmit(event) {
  event.preventDefault();
  if (isSending) return;
  if (!apiKey) {
    logSystem('API KEY MISSING. INITIATE AUTHENTICATION.');
    showOverlay(true);
    return;
  }

  const text = userInput.value.trim();
  if (!text) return;

  const userMessage = {
    role: 'user',
    text,
    timestamp: new Date().toISOString()
  };
  appendToThread(userMessage);
  addMessageToDisplay(userMessage);
  userInput.value = '';

  await sendToGemini(text);
}

function appendToThread(message) {
  const timestamp = message.timestamp || new Date().toISOString();
  thread.messages.push({ role: message.role, parts: [{ text: message.text }] });
  thread.log.push({ role: message.role, text: message.text, timestamp });
  persistThread();
}

function resetThread() {
  thread = createNewThread();
  output.innerHTML = '';
  logSystem('CONVERSATION THREAD PURGED. READY FOR NEW QUERIES.');
}

function clearMessagesFromDisplay() {
  output.innerHTML = '';
}

async function sendToGemini(latestUserText) {
  isSending = true;
  setSendingState(true);

  const requestBody = {
    systemInstruction: {
      role: 'user',
      parts: [{ text: BASE_SYSTEM_PROMPT }]
    },
    contents: thread.messages
  };

  try {
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${MODEL_NAME}:generateContent?key=${encodeURIComponent(apiKey)}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(requestBody)
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const data = await response.json();
    const text = data?.candidates?.[0]?.content?.parts?.map(part => part.text).join('\n').trim();

    if (!text) {
      throw new Error('No response from model');
    }

    const modelMessage = {
      role: 'model',
      text,
      timestamp: new Date().toISOString()
    };

    appendToThread(modelMessage);
    addMessageToDisplay(modelMessage);
  } catch (error) {
    logSystem(`TRANSMISSION ERROR: ${error.message.toUpperCase()}.`);
  } finally {
    isSending = false;
    setSendingState(false);
  }
}

function setSendingState(state) {
  userInput.disabled = state;
  form.querySelector('button[type="submit"]').disabled = state;
  form.querySelector('button[type="submit"]').textContent = state ? 'PROCESSING' : 'TRANSMIT';
}

function renderThread() {
  clearMessagesFromDisplay();

  if (!thread.log || thread.log.length === 0) {
    logSystem('NO PRIOR COMMUNICATION LOGGED. AWAITING INPUT.');
    return;
  }

  for (const entry of thread.log) {
    addMessageToDisplay(entry);
  }
}

saveApiBtn.addEventListener('click', handleApiSave);
cancelApiBtn.addEventListener('click', handleApiCancel);
resetKeyBtn.addEventListener('click', () => {
  localStorage.removeItem(API_KEY_STORAGE_KEY);
  apiKey = null;
  showOverlay(true);
  logSystem('API KEY RESET. AUTHENTICATION REQUIRED.');
});
clearThreadBtn.addEventListener('click', resetThread);
form.addEventListener('submit', handleSubmit);

document.addEventListener('DOMContentLoaded', init);
