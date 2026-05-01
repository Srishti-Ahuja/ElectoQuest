import { QUESTS, QUEST_ICONS, ASSET_BASE } from './quests.js';
import { animateValue, logEvent } from './utils.js';
import { getState, getCurrentUser, completeQuest } from './auth.js';

const $ = id => document.getElementById(id);

export function updateUI() {
    const state = getState();
    const xpCounter = $('xp-counter');
    const topBar = $('top-progress-bar');
    const topContainer = $('top-progress-container');

    animateValue(xpCounter, parseInt(xpCounter.textContent) || 0, state.totalXP, 800);

    const pct = (state.completedQuests.length / Object.keys(QUESTS).length) * 100;
    if (topBar) {
        topBar.style.width = `${pct}%`;
        if (topContainer) topContainer.setAttribute('aria-valuenow', Math.round(pct));
    }

    const progressFill = $('progress-bar');
    if (progressFill) progressFill.style.width = `${pct}%`;

    document.querySelectorAll('.node').forEach(node => {
        const qId = parseInt(node.dataset.quest);
        const quest = QUESTS[qId];
        if (!quest) return;
        const icon = node.querySelector('i');
        if (state.completedQuests.includes(qId)) {
            node.className = 'node completed';
            node.setAttribute('aria-disabled', 'false');
            node.setAttribute('tabindex', '0');
            if (icon) icon.className = 'fas fa-check';
        } else {
            const unlocked = qId === 1 || state.completedQuests.includes(qId - 1);
            node.className = unlocked ? 'node unlocked' : 'node locked';
            node.setAttribute('aria-disabled', unlocked ? 'false' : 'true');
            node.setAttribute('tabindex', unlocked ? '0' : '-1');
            if (icon) icon.className = `fas ${QUEST_ICONS[qId] || 'fa-star'}`;
        }
    });

    document.querySelectorAll('.badge-item').forEach(b => b.classList.remove('earned'));
    state.completedQuests.forEach(qId => {
        if (QUESTS[qId]) {
            const el = $(QUESTS[qId].badge);
            if (el) el.classList.add('earned');
        }
    });
}

export function triggerLevelUp() {
    const overlay = $('level-up-overlay');
    if (!overlay) return;
    overlay.classList.add('active');
    overlay.setAttribute('aria-hidden', 'false');
    setTimeout(() => {
        overlay.classList.remove('active');
        overlay.setAttribute('aria-hidden', 'true');
    }, 2200);
}

export function openQuest(qId) {
    const state = getState();
    const quest = QUESTS[qId];
    if (!quest) return;
    const isCompleted = state.completedQuests.includes(qId);
    const isUnlocked = qId === 1 || state.completedQuests.includes(qId - 1);
    if (!isUnlocked && !isCompleted) return;

    logEvent('challenge_started', { username: getCurrentUser(), quest_id: qId });

    const overlay = $('modal-overlay');
    const content = $('modal-content');

    const badgeImgCompleted = `<img loading="lazy" src="${ASSET_BASE}/${quest.badge}.png" style="width:80px;" class="shimmer" alt="${quest.title} Badge">`;
    const badgeImgLocked = `<img loading="lazy" src="${ASSET_BASE}/${quest.badge}.png" style="width:80px;filter:grayscale(1) opacity(0.3)" alt="${quest.title} Badge Locked">`;
    const xpDisplay = `<div><h4 style="font-size:0.7rem;color:var(--text-dim);">CIVIC XP</h4><p style="font-size:1.8rem;font-weight:800;color:var(--secondary);">+${quest.xp}</p></div>`;
    const rewardRow = (img) => `<div style="margin-top:2rem;display:flex;align-items:center;gap:1.5rem;justify-content:center;">${img}${xpDisplay}</div>`;

    let html = `<h2 class="modal-title" id="modal-title">${quest.title}</h2><p class="modal-desc">${quest.desc}</p>`;

    if (isCompleted) {
        html += `<p class="quest-status">QUEST FULFILLED</p>${rewardRow(badgeImgCompleted)}`;
        content.innerHTML = html;
        overlay.classList.remove('hidden');
        return;
    }

    html += `<div class="mcq-container" id="mcq-form" role="group" aria-label="Quest Challenge Questions">`;
    quest.questions.forEach((q, idx) => {
        html += `<div class="mcq-question-block" data-idx="${idx}">
            <p class="mcq-q-text" id="q-text-${idx}">${idx + 1}. ${q.q}</p>
            <div class="mcq-options" role="radiogroup" aria-labelledby="q-text-${idx}">
                ${q.options.map((opt, oi) => `<button class="mcq-opt" data-opt="${oi}" role="radio" aria-checked="false" tabindex="0">${opt}</button>`).join('')}
            </div>
        </div>`;
    });
    html += `</div><button id="btn-complete-quest" class="btn-primary" disabled aria-disabled="true">Complete Quest &amp; Earn Reward</button>${rewardRow(badgeImgLocked)}`;

    content.innerHTML = html;
    overlay.classList.remove('hidden');

    const selections = new Array(quest.questions.length).fill(-1);
    document.querySelectorAll('.mcq-question-block').forEach(block => {
        const qIdx = parseInt(block.dataset.idx);
        const opts = block.querySelectorAll('.mcq-opt');
        opts.forEach(opt => {
            opt.onclick = () => {
                if (selections[qIdx] === quest.questions[qIdx].ans) return;
                opts.forEach(o => { o.classList.remove('selected', 'wrong', 'correct'); o.setAttribute('aria-checked', 'false'); });
                opt.classList.add('selected');
                opt.setAttribute('aria-checked', 'true');
                const val = parseInt(opt.dataset.opt);
                if (val === quest.questions[qIdx].ans) {
                    opt.classList.add('correct');
                    selections[qIdx] = val;
                } else {
                    opt.classList.add('wrong');
                    logEvent('quiz_failed', { username: getCurrentUser(), quest_id: qId, question: qIdx });
                    setTimeout(() => { opt.classList.remove('selected', 'wrong'); opt.setAttribute('aria-checked', 'false'); }, 800);
                }
                const allCorrect = selections.every((s, i) => s === quest.questions[i].ans);
                if (allCorrect) {
                    const btn = $('btn-complete-quest');
                    btn.disabled = false;
                    btn.setAttribute('aria-disabled', 'false');
                }
            };
        });
    });

    $('btn-complete-quest').onclick = () => {
        completeQuest(qId, quest.xp);
        logEvent('circuit_completed', { username: getCurrentUser(), quest_id: qId });
        updateUI();
        overlay.classList.add('hidden');
        triggerLevelUp();
    };
}
