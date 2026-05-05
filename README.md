# SF Validation Manager 🔷

> A React web application to manage Salesforce Account validation rules via Tooling API and OAuth 2.0.

## Features

- 🔐 **OAuth 2.0 Web Server Flow** — Secure Salesforce authentication
- 📋 **Fetch Validation Rules** — Uses Tooling API (`ValidationRule` object)
- 🔄 **Toggle Single Rules** — Activate or deactivate individual rules
- ⚡ **Bulk Enable/Disable** — Enable or disable all rules at once
- 🚀 **Deploy Changes** — Push all pending changes back to Salesforce
- 🎨 **Industrial UI** — Dark, mono-spaced interface with real-time state

---

## Prerequisites

- Node.js 18+
- A Salesforce Developer Org ([sign up free](https://developer.salesforce.com/signup))
- A Connected App configured in your Salesforce org

---

## Part 1: Salesforce Setup

### Step 1 — Create a Developer Org

1. Go to [developer.salesforce.com/signup](https://developer.salesforce.com/signup)
2. Fill in your details and sign up
3. Check your email and verify your account

### Step 2 — Create Validation Rules on Account

Go to **Setup → Object Manager → Account → Validation Rules** and create these 5 rules:

| Name | Formula | Error Message |
|------|---------|---------------|
| `Account_Name_Required` | `ISBLANK(Name)` | Account Name cannot be blank |
| `Phone_Format_Validation` | `NOT(REGEX(Phone, "\\d{10}"))` | Phone must be 10 digits |
| `Website_Must_Start_HTTPS` | `NOT(BEGINS(Website, "https://"))` | Website must start with https:// |
| `Annual_Revenue_Positive` | `AnnualRevenue < 0` | Annual Revenue cannot be negative |
| `Industry_Required` | `ISPICKVAL(Industry, "")` | Industry must be selected |

### Step 3 — Create a Connected App

1. Go to **Setup → App Manager → New Connected App**
2. Fill in:
   - **Connected App Name**: `SF Validation Manager`
   - **API Name**: `SF_Validation_Manager`
   - **Contact Email**: your email
3. Under **OAuth Settings**, check **Enable OAuth Settings**
4. **Callback URL**: `http://localhost:3000/oauth/callback`
   - For production: `https://your-deployed-domain.com/oauth/callback`
5. **Selected OAuth Scopes**: Add these:
   - `api` — Access and manage your data
   - `web` — Access web-based apps
   - `full` — Full access
   - `refresh_token, offline_access`
6. Save → note your **Consumer Key** and **Consumer Secret**

> ⚠️ Salesforce may take 2–10 minutes to activate the Connected App.

---

## Part 2: Local Development

### Step 1 — Install dependencies

```bash
npm install
```

### Step 2 — Configure environment

```bash
cp .env.example .env
```

Edit `.env`:

```env
VITE_SF_CLIENT_ID=your_consumer_key_here
VITE_SF_CLIENT_SECRET=your_consumer_secret_here
VITE_SF_LOGIN_URL=https://login.salesforce.com
VITE_SF_REDIRECT_URI=http://localhost:3000/oauth/callback
```

### Step 3 — Run the app

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

---

## Part 3: How It Works

### OAuth 2.0 Flow

```
User clicks "Connect to Salesforce"
    ↓
App redirects to: login.salesforce.com/services/oauth2/authorize
    ↓
User logs in and approves access
    ↓
Salesforce redirects to: localhost:3000/oauth/callback?code=...
    ↓
App exchanges code for access_token via POST /services/oauth2/token
    ↓
App stores access_token + instance_url in sessionStorage
    ↓
Dashboard loads, using token for all API calls
```

### Tooling API — Fetch Validation Rules

```
GET /services/data/v59.0/tooling/query
    ?q=SELECT Id, ValidationName, Active, Description, ErrorMessage 
       FROM ValidationRule 
       WHERE EntityDefinition.QualifiedApiName = 'Account'
Authorization: Bearer {access_token}
```

### Tooling API — Update (Toggle) a Validation Rule

```
PATCH /services/data/v59.0/tooling/sobjects/ValidationRule/{ruleId}
Authorization: Bearer {access_token}
Content-Type: application/json

{ "Metadata": { "active": true } }
```

---

## Part 4: Deployment

### Deploy to Vercel

```bash
npm install -g vercel
vercel
```

Set environment variables in the Vercel dashboard and update your Connected App's Callback URL.

### Deploy to Netlify

```bash
npm run build
# Drag and drop the dist/ folder to netlify.com/drop
```

### Deploy to GitHub Pages

```bash
npm run build
# Push dist/ to gh-pages branch
```

---

## Project Structure

```
src/
├── components/
│   ├── LoginPage.jsx        # OAuth login screen
│   ├── LoginPage.css
│   ├── OAuthCallback.jsx    # Handles redirect from Salesforce
│   ├── Dashboard.jsx        # Main app with all features
│   ├── Dashboard.css
│   ├── ValidationRuleCard.jsx  # Individual rule card with toggle
│   └── ValidationRuleCard.css
├── utils/
│   ├── auth.js              # OAuth helpers, session management
│   └── salesforceApi.js     # Tooling API calls
├── styles/
│   └── globals.css          # Global styles & CSS variables
├── App.jsx                  # Root — routing + session
└── main.jsx                 # Entry point
```

---

## Security Notes

- **Client Secret in Frontend**: This demo stores the client secret in env vars for simplicity. In production, proxy the token exchange through a backend server (Node.js/Express).
- **Access Token Storage**: Currently uses `sessionStorage` (cleared on tab close). For persistent sessions, use a secure backend with httpOnly cookies.
- **CORS**: Salesforce allows CORS from `localhost` by default. For production domains, add them in **Setup → CORS**.

---

## Assignment Submission

Built for: **CloudVandana — Associate Software Engineer Assignment**

Technologies: React 18, Vite, Salesforce Tooling API, OAuth 2.0 Web Server Flow
