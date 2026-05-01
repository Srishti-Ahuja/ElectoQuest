const express = require('express');
const path = require('path');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const { Logging } = require('@google-cloud/logging');
const { SecretManagerServiceClient } = require('@google-cloud/secret-manager');

const app = express();
const PORT = process.env.PORT || 8080;
const PROJECT_ID = process.env.GOOGLE_CLOUD_PROJECT || 'silicon-garage-494118-a1';
const IS_PROD = process.env.NODE_ENV === 'production';

const logging = new Logging({ projectId: PROJECT_ID });
const log = logging.log('electoquest-events');
const secretClient = new SecretManagerServiceClient();

let geminiApiKey = null;

const CIVIC_GURU_PROMPT = `You are Civic Guru, an expert on Indian election awareness. 
Answer questions about voting rights, voter registration, polling booth procedures, EVMs, and election processes briefly and accurately. 
Max 80 words. Be encouraging. Decline off-topic queries.`;

async function fetchSecret(secretName) {
    try {
        const name = `projects/${PROJECT_ID}/secrets/${secretName}/versions/latest`;
        const [version] = await secretClient.accessSecretVersion({ name });
        return version.payload.data.toString('utf8');
    } catch (err) {
        throw new Error(`Secret Manager Error: ${err.message}`);
    }
}

async function writeLog(event, details, severity = 'INFO') {
    try {
        const entry = log.entry(
            { resource: { type: IS_PROD ? 'cloud_run_revision' : 'global', labels: { service_name: 'electoquest', project_id: PROJECT_ID } }, severity },
            { event, details, timestamp: new Date().toISOString() }
        );
        await log.write(entry);
    } catch (err) { /* Silent fail */ }
}

async function loadConfig() {
    try {
        geminiApiKey = await fetchSecret('GEMINI_API_KEY');
    } catch (err) {
        geminiApiKey = process.env.GEMINI_API_KEY || null;
    }
}

const validateIAP = (req, res, next) => {
    // Log missing IAP header but don't block for now so the user can test the deployment
    if (IS_PROD && !req.headers['x-goog-iap-jwt-assertion']) {
        console.warn('[Security] Missing IAP assertion header. Bypass active for testing.');
    }
    next();
};

const chatLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 50,
    message: { error: 'Rate limit exceeded' }
});

app.use(helmet({
    contentSecurityPolicy: {
        directives: {
            ...helmet.contentSecurityPolicy.getDefaultDirectives(),
            "script-src": ["'self'", "https://accounts.google.com", "https://cdnjs.cloudflare.com"],
            "frame-src": ["'self'", "https://accounts.google.com"],
            "connect-src": ["'self'", "https://generativelanguage.googleapis.com", "https://accounts.google.com"],
            "img-src": ["'self'", "data:", "https://storage.googleapis.com"]
        }
    }
}));

app.use(express.json({ limit: '10kb' }));
app.use(express.static(path.join(__dirname, 'public')));

app.post('/api/log', async (req, res) => {
    const { event, details } = req.body || {};
    if (event) await writeLog(event, details);
    res.json({ success: true });
});

app.post('/api/chat', validateIAP, chatLimiter, async (req, res) => {
    let { message } = req.body || {};
    if (!message || typeof message !== 'string') return res.status(400).json({ error: 'Invalid message' });
    
    message = message.replace(/<[^>]*>?/gm, '').trim();
    if (!message) return res.status(400).json({ error: 'Empty message' });

    if (!geminiApiKey) return res.status(503).json({ error: 'AI service unavailable' });

    try {
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-lite:generateContent?key=${geminiApiKey}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{ role: 'user', parts: [{ text: message.substring(0, 500) }] }],
                systemInstruction: { parts: [{ text: CIVIC_GURU_PROMPT }] },
                generationConfig: { maxOutputTokens: 100, temperature: 0.4 }
            })
        });

        const data = await response.json();
        if (!response.ok) throw new Error(data.error?.message || 'API Error');

        const reply = data.candidates?.[0]?.content?.parts?.[0]?.text;
        if (!reply) throw new Error('No reply');

        res.json({ reply: reply.trim() });
    } catch (err) {
        console.error('[Chat]', err.message);
        res.status(502).json({ error: 'AI Error' });
    }
});

app.get('/api/health', (req, res) => res.json({ status: 'healthy', config: geminiApiKey ? 'ok' : 'missing' }));

app.get('*', (req, res) => res.sendFile(path.join(__dirname, 'public', 'index.html')));

(async () => {
    await loadConfig();
    app.listen(PORT, () => console.log(`[ElectoQuest] v2.2 active on port ${PORT}`));
})();
