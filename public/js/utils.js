export function sanitize(input) {
    if (typeof input !== 'string') return '';
    return input
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#x27;')
        .replace(/\//g, '&#x2F;')
        .replace(/<script[\s\S]*?>[\s\S]*?<\/script>/gi, '')
        .replace(/on\w+\s*=\s*["'][^"']*["']/gi, '')
        .trim();
}

export function debounce(fn, delay = 300) {
    let timer;
    return function (...args) {
        clearTimeout(timer);
        timer = setTimeout(() => fn.apply(this, args), delay);
    };
}

const _cache = new Map();

export const cache = {
    set(key, value, ttlMs = 5 * 60 * 1000) {
        _cache.set(key, { value, expiresAt: Date.now() + ttlMs });
    },
    get(key) {
        const entry = _cache.get(key);
        if (!entry) return null;
        if (Date.now() > entry.expiresAt) {
            _cache.delete(key);
            return null;
        }
        return entry.value;
    },
    clear() {
        _cache.clear();
    }
};

export function initLazyLoader() {
    if (!('IntersectionObserver' in window)) return;
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (!entry.isIntersecting) return;
            const el = entry.target;
            if (el.dataset.src) {
                el.src = el.dataset.src;
                el.removeAttribute('data-src');
            }
            observer.unobserve(el);
        });
    }, { rootMargin: '100px' });

    document.querySelectorAll('img[loading="lazy"]').forEach(img => observer.observe(img));
}

export function animateValue(el, from, to, duration = 800) {
    if (!el) return;
    let startTs = null;
    const step = (ts) => {
        if (!startTs) startTs = ts;
        const progress = Math.min((ts - startTs) / duration, 1);
        el.textContent = Math.floor(progress * (to - from) + from);
        if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
}

export function logEvent(eventName, details = {}) {
    fetch('/api/log', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ event: eventName, details })
    }).catch(() => {});
}
