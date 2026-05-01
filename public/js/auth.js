import { sanitize, logEvent } from './utils.js';

let users = {};
let currentUser = null;
let state = { completedQuests: [], totalXP: 0, userLocation: { state: '', pincode: '' }, onboarded: false };

const STORAGE_KEY = 'electoquest_users';

function loadUsers() {
    try {
        const raw = localStorage.getItem(STORAGE_KEY);
        users = raw ? JSON.parse(raw) : {};
    } catch {
        localStorage.removeItem(STORAGE_KEY);
        users = {};
    }
}

function saveUsers() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(users));
}

export function saveCurrentState() {
    if (currentUser && users[currentUser]) {
        users[currentUser].state = state;
        saveUsers();
    }
}

export function getCurrentUser() { return currentUser; }
export function getState() { return state; }

export function login(username, password) {
    const u = sanitize(username);
    const p = password;
    if (!u || !p) return { ok: false, error: 'Username and password required.' };
    if (!users[u] || users[u].password !== p) return { ok: false, error: 'Invalid username or password.' };
    currentUser = u;
    state = users[u].state;
    logEvent('user_login', { username: u });
    return { ok: true, onboarded: state.onboarded };
}

export function signup(username, password) {
    const u = sanitize(username);
    const p = password;
    if (!u || !p) return { ok: false, error: 'Please fill in all fields.' };
    if (u.length < 3) return { ok: false, error: 'Username must be at least 3 characters.' };
    if (p.length < 6) return { ok: false, error: 'Password must be at least 6 characters.' };
    if (users[u]) return { ok: false, error: 'Username already taken.' };
    users[u] = { password: p, state: { completedQuests: [], totalXP: 0, userLocation: { state: '', pincode: '' }, onboarded: false } };
    saveUsers();
    return { ok: true };
}

export function googleSignIn(displayName) {
    const u = sanitize(displayName || 'GoogleUser');
    if (!users[u]) {
        users[u] = { password: '__google__', state: { completedQuests: [], totalXP: 0, userLocation: { state: '', pincode: '' }, onboarded: false } };
        saveUsers();
    }
    currentUser = u;
    state = users[u].state;
    logEvent('google_signin', { username: u });
    return { ok: true, onboarded: state.onboarded };
}

export function logout() {
    currentUser = null;
    state = { completedQuests: [], totalXP: 0, userLocation: { state: '', pincode: '' }, onboarded: false };
}

export function setOnboarded(stateCode, pincode) {
    state.userLocation = { state: sanitize(stateCode), pincode: sanitize(pincode) };
    state.onboarded = true;
    saveCurrentState();
}

export function completeQuest(qId, xp) {
    if (!state.completedQuests.includes(qId)) {
        state.completedQuests.push(qId);
        state.totalXP += xp;
        saveCurrentState();
    }
}

loadUsers();
