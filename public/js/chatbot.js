import { sanitize, debounce } from './utils.js';

const $ = id => document.getElementById(id);

let isTyping = false;

async function sendMessage(rawText) {
    const msg = sanitize(rawText.trim());
    if (!msg || isTyping) return;
    isTyping = true;

    const input = $('chatbot-input');
    const sendBtn = $('chatbot-send');

    appendMessage(msg, 'user');
    if (input) input.value = '';
    if (sendBtn) sendBtn.disabled = true;

    const typingEl = appendTypingIndicator();

    try {
        const response = await fetch('/api/chat', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ message: msg })
        });

        const data = await response.json();
        typingEl.remove();

        if (!response.ok || data.error) {
            appendMessage(data.error || 'Something went wrong. Please try again.', 'bot error');
        } else {
            appendMessage(data.reply, 'bot');
        }
    } catch {
        typingEl.remove();
        appendMessage('Network error — please check your connection and try again.', 'bot error');
    } finally {
        isTyping = false;
        if (sendBtn) sendBtn.disabled = false;
        input?.focus();
    }
}

function appendMessage(text, role) {
    const container = $('chatbot-messages');
    if (!container) return null;
    const div = document.createElement('div');
    div.className = `chat-message ${role}`;
    const p = document.createElement('p');
    p.textContent = text;
    div.appendChild(p);
    container.appendChild(div);
    container.scrollTop = container.scrollHeight;
    return div;
}

function appendTypingIndicator() {
    const container = $('chatbot-messages');
    const div = document.createElement('div');
    div.className = 'chat-message bot typing-indicator';
    div.setAttribute('aria-label', 'Civic Guru is typing');
    div.innerHTML = '<span></span><span></span><span></span>';
    container.appendChild(div);
    container.scrollTop = container.scrollHeight;
    return div;
}

export function initChatbot() {
    const toggle = $('chatbot-toggle');
    const panel = $('chatbot-panel');
    const closeBtn = $('chatbot-close');
    const sendBtn = $('chatbot-send');
    const input = $('chatbot-input');

    if (!toggle || !panel) return;

    const openPanel = () => {
        panel.classList.remove('hidden');
        toggle.setAttribute('aria-expanded', 'true');
        input?.focus();
    };

    const closePanel = () => {
        panel.classList.add('hidden');
        toggle.setAttribute('aria-expanded', 'false');
    };

    toggle.addEventListener('click', () => {
        panel.classList.contains('hidden') ? openPanel() : closePanel();
    });

    closeBtn?.addEventListener('click', closePanel);

    const debouncedSend = debounce(() => {
        const val = input?.value || '';
        if (val.trim()) sendMessage(val);
    }, 300);

    sendBtn?.addEventListener('click', debouncedSend);

    input?.addEventListener('keydown', e => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            debouncedSend();
        }
    });
}
