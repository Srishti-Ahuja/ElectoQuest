import { initLazyLoader, logEvent, sanitize } from './utils.js';
import { login, signup, logout, googleSignIn, setOnboarded, getCurrentUser } from './auth.js';
import { updateUI, openQuest } from './ui.js';
import { initChatbot } from './chatbot.js';

const $ = id => document.getElementById(id);

function showSection(id) {
    ['auth-section', 'landing', 'dashboard'].forEach(s => {
        const el = $(s);
        if (el) el.classList.toggle('hidden', s !== id);
    });
}

function showError(elId, msg) {
    const el = $(elId);
    if (!el) return;
    el.textContent = msg;
    el.classList.remove('hidden');
}

function clearErrors() {
    ['login-error', 'signup-error'].forEach(id => {
        const el = $(id);
        if (el) { el.textContent = ''; el.classList.add('hidden'); }
    });
}

function handleLogin() {
    const u = $('login-username')?.value || '';
    const p = $('login-password')?.value || '';
    const result = login(u, p);
    if (!result.ok) return showError('login-error', result.error);
    $('display-username').textContent = getCurrentUser();
    showSection(result.onboarded ? 'dashboard' : 'landing');
    if (result.onboarded) updateUI();
}

function handleSignup() {
    const u = $('signup-username')?.value || '';
    const p = $('signup-password')?.value || '';
    const result = signup(u, p);
    if (!result.ok) return showError('signup-error', result.error);
    showError('signup-error', 'Account forged! You may now login.');
    $('signup-error').style.color = 'var(--accent)';
    setTimeout(() => { toggleAuthView(); clearErrors(); $('signup-error').style.color = ''; }, 1200);
}

function toggleAuthView() {
    $('login-view')?.classList.toggle('hidden');
    $('signup-view')?.classList.toggle('hidden');
    clearErrors();
}

function handleLogout() {
    logout();
    showSection('auth-section');
    const lu = $('login-username');
    const lp = $('login-password');
    if (lu) lu.value = '';
    if (lp) lp.value = '';
    logEvent('user_logout', {});
}

function handleBegin() {
    const stateVal = $('user-state')?.value || '';
    const pin = sanitize($('user-pincode')?.value || '');
    if (!stateVal || !pin) return alert('Please select your State and enter a Pincode.');
    if (!/^\d{6}$/.test(pin)) return alert('Pincode must be exactly 6 digits.');
    setOnboarded(stateVal, pin);
    showSection('dashboard');
    updateUI();
}

function initGoogleOneTap() {
    if (typeof google === 'undefined' || !google.accounts) return;
    google.accounts.id.initialize({
        client_id: window.__GOOGLE_CLIENT_ID__ || '',
        callback: (response) => {
            const payload = JSON.parse(atob(response.credential.split('.')[1]));
            const result = googleSignIn(payload.name || payload.email);
            if (!result.ok) return;
            $('display-username').textContent = getCurrentUser();
            showSection(result.onboarded ? 'dashboard' : 'landing');
            if (result.onboarded) updateUI();
        }
    });
    google.accounts.id.renderButton($('google-one-tap-btn'), {
        theme: 'outline', size: 'large', width: 320, text: 'signin_with', shape: 'rectangular'
    });
    google.accounts.id.prompt();
}

function bindEvents() {
    $('btn-login')?.addEventListener('click', handleLogin);
    $('btn-signup')?.addEventListener('click', handleSignup);
    $('btn-logout')?.addEventListener('click', handleLogout);
    $('btn-begin')?.addEventListener('click', handleBegin);
    $('show-signup')?.addEventListener('click', e => { e.preventDefault(); toggleAuthView(); });
    $('show-login')?.addEventListener('click', e => { e.preventDefault(); toggleAuthView(); });

    ['login-username', 'login-password', 'signup-username', 'signup-password'].forEach(id => {
        $(id)?.addEventListener('input', clearErrors);
    });

    ['login-username', 'login-password'].forEach(id => {
        $(id)?.addEventListener('keydown', e => { if (e.key === 'Enter') handleLogin(); });
    });

    document.querySelectorAll('.node').forEach(node => {
        node.addEventListener('click', () => openQuest(parseInt(node.dataset.quest)));
        node.addEventListener('keydown', e => {
            if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); openQuest(parseInt(node.dataset.quest)); }
        });
    });

    const overlay = $('modal-overlay');
    $('modal-close')?.addEventListener('click', () => overlay?.classList.add('hidden'));
    overlay?.addEventListener('click', e => { if (e.target === overlay) overlay.classList.add('hidden'); });
    document.addEventListener('keydown', e => { if (e.key === 'Escape') overlay?.classList.add('hidden'); });
}

document.addEventListener('DOMContentLoaded', () => {
    bindEvents();
    initChatbot();
    initLazyLoader();
    setTimeout(initGoogleOneTap, 500);
    logEvent('app_init', { version: '2.0.0' });
});
