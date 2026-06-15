# OSS First Mate

AI-powered assistant for open source maintainers. Uses Coral's SQL interface to query GitHub as a database, feeds results to an LLM, and produces actionable intelligence — all in one dashboard.

**Live:** [http://ossfirstmate.duckdns.org](http://ossfirstmate.duckdns.org)  
---

## What it does

| Feature | Description |
|---|---|
| **Issue Triage** | Fetches open issues via Coral SQL and classifies each as bug / feature / docs with priority |
| **Duplicate Detection** | Finds pairs of issues describing the same problem with confidence scores |
| **Release Notes** | Drafts a markdown changelog from merged PRs |
| **Slack Insights** | Cross-source JOIN: matches GitHub issues to Slack channel discussions |
| **Bookmarks** | Save frequently visited repos and jump to any feature in one click |
| **SQL Log** | Shows every Coral query that ran — transparent, auditable |
| **Run History** | All past runs stored in MongoDB Atlas per user |
| **Support Chat** | Built-in AI assistant to answer questions about the platform |

---

## Tech Stack

| Layer | Technology |
|---|---|
| **SQL Query Layer** | Coral v0.4.2 |
| **LLM** | Groq API — `llama-3.3-70b-versatile` (free tier) |
| **Frontend** | React + Vite + Tailwind CSS |
| **Backend** | Node.js + Express |
| **Database** | MongoDB Atlas |
| **Auth** | Google OAuth via Passport.js |
| **Messaging** | Slack Web API |
| **3D Landing** | Spline |
| **Deployment** | Docker + AWS EC2 (Ubuntu 24.04) + Nginx |

---

## Security

- Google OAuth — sign in with Gmail, no passwords stored
- API keys encrypted with AES-256 before storing in MongoDB
- Per-user rate limiting (10 requests/hour)
- SQL injection sanitization on all inputs
- Session management via MongoDB-backed express-session

---

## How Coral Powers This

Every data fetch goes through Coral's SQL interface. No custom API wrappers. No ETL.

```sql
-- Triage: fetch open issues
SELECT number, title, body, labels, created_at, state
FROM github.issues
WHERE owner = 'fastify' AND repo = 'fastify'
AND state = 'open'
ORDER BY created_at DESC
LIMIT 10;

-- Duplicate detection
SELECT number, title, body, labels, created_at
FROM github.issues
WHERE owner = 'fastify' AND repo = 'fastify'
AND state = 'open'
ORDER BY created_at DESC
LIMIT 20;

-- Release notes: merged pull requests
SELECT number, title, body, merged_at, labels
FROM github.pulls
WHERE owner = 'fastify' AND repo = 'fastify'
AND state = 'closed'
ORDER BY number DESC
LIMIT 15;
```

---

## Setup

### Prerequisites

- Node.js 20+
- MongoDB Atlas account (free)
- Groq API key (free at [console.groq.com](https://console.groq.com))
- GitHub Personal Access Token
- Coral v0.4.2 binary
- Slack Bot Token *(optional, for Slack Insights)*
- Google OAuth credentials

### Install Coral

**Mac:**
```bash
brew install withcoral/tap/coral
```

**Windows:**
Download from [Coral releases](https://github.com/withcoral/coral/releases/latest) and extract to a folder.

**Linux:**
```bash
curl -fsSL https://withcoral.com/install.sh | sh
```

### Clone and Install

```bash
git clone https://github.com/Atharva-026/oss-first-mate-coral
cd oss-first-mate-coral

cd server && npm install
cd ../client && npm install
```

### Configure Environment

Create `.env` in the root directory:

```env
GROQ_API_KEY=your_groq_key
GROQ_CHAT_KEY=your_groq_key_for_chatbot
GITHUB_TOKEN=your_github_token
MONGODB_URI=mongodb+srv://...
PORT=5000
CORAL_PATH=/path/to/coral
CLIENT_URL=http://localhost:5173
SESSION_SECRET=your_random_secret
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
ENCRYPTION_KEY=your_32_character_key
EMAIL_USER=your_gmail
EMAIL_PASS=your_gmail_app_password
```

### Add GitHub Source to Coral

```bash
coral source add github
```

### Run Locally

```bash
# Terminal 1 — backend
cd server && nodemon index.js

# Terminal 2 — frontend
cd client && npm run dev
```

Open [http://localhost:5173](http://localhost:5173)

---

## Docker Deployment

```bash
# Build and run
docker-compose up --build -d

# Open http://localhost
```

The Docker setup uses Ubuntu 24.04 as the base image (required for Coral's GLIBC 2.38/2.39 dependency) and Nginx to serve the React frontend and proxy API requests to the backend.

---

## API Keys Setup

After signing in with Google, you will be prompted to add your own API keys on first use. Keys are encrypted with AES-256 before storing. You can update them anytime from the Settings page.

- **Groq API Key** — free at [console.groq.com](https://console.groq.com)
- **GitHub Token** — create at [github.com/settings/tokens](https://github.com/settings/tokens) with `public_repo` scope
- **Slack Bot Token** — optional, needed only for Slack Insights

---

## Known Limitations

- Release notes use GitHub REST API as fallback when Coral SQL returns no results for merged PRs
- Slack Insights requires the bot to be invited to the `#github-issues` channel
- Free tier Groq allows 500k tokens/day and 30 requests/minute

---

Built by [@Atharva-026](https://github.com/Atharva-026)
