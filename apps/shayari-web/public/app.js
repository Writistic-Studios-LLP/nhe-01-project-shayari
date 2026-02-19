const form = document.getElementById('chat-form');
const input = document.getElementById('chat-input');
const messagesEl = document.getElementById('messages');
const avatar = document.getElementById('avatar');
const voiceInputBtn = document.getElementById('voice-input');
const voiceOutputBtn = document.getElementById('voice-output');

const history = [];
let voiceOutputEnabled = true;

function addMessage(role, text) {
  const div = document.createElement('div');
  div.className = `msg ${role}`;
  div.textContent = text;
  messagesEl.appendChild(div);
  messagesEl.scrollTop = messagesEl.scrollHeight;
  history.push({ role, text });
}

function speak(text) {
  if (!voiceOutputEnabled || !('speechSynthesis' in window)) return;
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.rate = 1;
  utterance.pitch = 1.05;
  avatar.classList.add('speaking');
  utterance.onend = () => avatar.classList.remove('speaking');
  speechSynthesis.speak(utterance);
}

async function sendMessage(message) {
  addMessage('user', message);
  avatar.classList.add('thinking');

  try {
    const resp = await fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message, history }),
    });

    const data = await resp.json();
    if (!resp.ok) {
      throw new Error(data?.error || 'Request failed');
    }

    addMessage('assistant', data.reply);
    speak(data.reply);
  } catch (err) {
    addMessage('assistant', `I had a connection issue: ${err.message}`);
  } finally {
    avatar.classList.remove('thinking');
  }
}

form.addEventListener('submit', async (e) => {
  e.preventDefault();
  const message = input.value.trim();
  if (!message) return;
  input.value = '';
  await sendMessage(message);
});

voiceOutputBtn.addEventListener('click', () => {
  voiceOutputEnabled = !voiceOutputEnabled;
  voiceOutputBtn.textContent = voiceOutputEnabled ? '🔊 Speak replies' : '🔇 Muted';
});

voiceInputBtn.addEventListener('click', () => {
  const Recognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (!Recognition) {
    addMessage('assistant', 'Voice input is not supported in this browser.');
    return;
  }

  const recognition = new Recognition();
  recognition.lang = 'en-US';
  recognition.interimResults = false;
  recognition.maxAlternatives = 1;

  avatar.classList.add('listening');
  recognition.start();

  recognition.onresult = async (event) => {
    const transcript = event.results[0][0].transcript;
    await sendMessage(transcript);
  };

  recognition.onerror = (event) => {
    addMessage('assistant', `I couldn't capture voice clearly (${event.error}). Try again?`);
  };

  recognition.onend = () => {
    avatar.classList.remove('listening');
  };
});

addMessage(
  'assistant',
  'Hi, I\'m Shayari. I\'m a synthetic persona and I\'d love to chat. Ask me anything meaningful.',
);
