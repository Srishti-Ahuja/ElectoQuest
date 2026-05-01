# ElectoQuest v2.0 🗳️⚡

**ElectoQuest** is a production-grade, gamified civic awareness platform that transforms India's voter education into an immersive quest experience. It combines a dark neon aesthetic, AI-powered assistance, and Google Cloud infrastructure to maximize engagement and accessibility.

---

## 🌟 Feature Highlights

| Feature | Details |
|---|---|
| **AI Civic Guru** | Floating chatbot powered by Gemini 1.5 Flash (Vertex AI). Answers election queries in under 100 tokens. |
| **Google One-Tap Login** | Seamless Firebase/Google Identity Platform sign-in alongside username/password auth. |
| **8-Quest Spiral Map** | Sequential, unlock-gated quest nodes with MCQ challenges and XP rewards. |
| **Badge Armory** | 5 collectible digital badges earned upon quest completion. |
| **Lazy Loading** | All badge images and heavy assets are deferred via `IntersectionObserver`. |
| **Input Sanitization** | All user inputs are stripped of HTML/script injection vectors before processing. |
| **Debouncing** | Chatbot input debounced at 300 ms to reduce redundant API calls. |
| **In-Memory Cache** | TTL-based client-side cache for frequently accessed election data. |
| **Cloud Logging** | All events streamed to Google Cloud Logging via a `/api/log` endpoint. |
| **Secret Manager** | API keys injected at runtime via Google Cloud Secret Manager (never hardcoded). |
| **IAP-Ready Backend** | Server validates `x-goog-iap-jwt-assertion` headers in production. |
| **Cloud Build CI/CD** | Automated build → push → deploy pipeline via `cloudbuild.yaml`. |

---

## 🏗️ Architecture

```
ElectoQuest/
├── public/                  # Static frontend (served by Express)
│   ├── index.html           # Semantic HTML with ARIA labels + One-Tap
│   ├── style_v4.css         # Design system (neon dark theme + chatbot)
│   └── js/
│       ├── app.js           # Main entry point — wires all modules
│       ├── auth.js          # Login / signup / Google Sign-In / logout
│       ├── chatbot.js       # Civic Guru AI chatbot UI + API calls
│       ├── quests.js        # Quest data definitions & constants
│       ├── ui.js            # DOM rendering, modal, XP animation
│       └── utils.js         # sanitize / debounce / cache / lazy-load
├── server.js                # Express backend (Logging, Secret Manager, Chat API)
├── Dockerfile               # Multi-stage secure container (non-root user)
├── cloudbuild.yaml          # Cloud Build CI/CD pipeline
├── package.json             # Dependencies + minification scripts
└── .gitignore               # Excludes node_modules, .env, test artifacts
```

---

## 🔐 Security

- **Google Cloud IAP** — Backend validates `x-goog-iap-jwt-assertion` header on protected routes (`/api/chat`) in production.
- **Secret Manager** — `GEMINI_API_KEY` is fetched at runtime from Secret Manager; never stored in source or environment files.
- **XSS Prevention** — A `sanitize()` utility strips `<script>`, event handlers, and HTML entities from all user-supplied inputs before rendering or API dispatch.
- **Non-root Docker user** — Container runs as the `node` user to minimize privilege escalation risk.
- **`.gitignore`** — Ensures `.env`, `node_modules`, and test artifacts never reach the repository.

---

## 🤖 AI Chatbot — Civic Guru

- **Model:** `gemini-1.5-flash` (Free Tier)
- **Persona:** Civic Guru — an expert on Indian election law, voting rights, and ECI procedures.
- **Budget Control:** `max_output_tokens: 100` caps cost within the $3 free credit limit.
- **Debounce:** 300 ms debounce on input prevents redundant API calls.
- **Endpoint:** `POST /api/chat` — server-side proxy keeps API key off the client.

---

## ⚙️ Google Cloud Services Used

| Service | Purpose |
|---|---|
| **Cloud Run** | Serverless container hosting |
| **Cloud Build** | Automated CI/CD via `cloudbuild.yaml` |
| **Secret Manager** | Secure API key injection at runtime |
| **Cloud Logging** | Structured event logging (`electoquest-events`) |
| **Cloud Monitoring** | Observability via log-based metrics |
| **Vertex AI (Gemini)** | Gemini 2.0 Flash chatbot backend |
| **Cloud Storage** | Badge image assets hosting |
| **Google Identity** | One-Tap / OAuth 2.0 login |
| **IAP** | Identity-Aware Proxy for Cloud Run security |

---

### Deploy via Cloud Build
```bash
gcloud builds submit --config cloudbuild.yaml
```

This triggers the automated pipeline:
1. **Build** Docker image tagged with `$SHORT_SHA`
2. **Push** to Google Container Registry
3. **Deploy** to Cloud Run (`asia-south1`, 512Mi, max 5 instances)

---

## 🗺️ The Quest Map (8 Nodes)

| # | Quest | XP | Badge |
|---|---|---|---|
| 1 | Registration | 100 | Civic Scribe |
| 2 | Polling Station | 200 | Pathfinder |
| 3 | Candidates | 300 | Truth Seeker |
| 4 | Manifestos | 400 | Law Keeper |
| 5 | Voting Plan | 500 | Guardian |
| 6 | BLO Connect | 600 | Civic Scribe |
| 7 | Awareness | 700 | Pathfinder |
| 8 | Final Pillar | 1000 | Guardian |

---

## 🧪 Testing

```bash
npm install
npx playwright install --with-deps chromium
npx playwright test
```

---

## 🛠️ Tech Stack

- **Frontend:** Vanilla HTML5 · CSS3 (custom design system) · ES Modules (no bundler)
- **Backend:** Node.js · Express.js
- **AI:** Google Vertex AI — Gemini 1.5 Flash
- **Auth:** Google Identity Platform (One-Tap) + localStorage
- **Cloud:** Cloud Run · Cloud Build · Secret Manager · Cloud Logging · Cloud Storage

---

*Created with 💙 for the future of civic engagement — ElectoQuest v2.0*