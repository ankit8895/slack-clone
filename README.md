# Flock 💬

A full-stack real-time messaging and video calling application inspired by Slack. Built with React 19, Express 5, Stream Chat, and Stream Video — featuring Clerk authentication, background job sync via Inngest, and production deployments on Vercel.









***

## Table of Contents

- [What It Does](#what-it-does)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Environment Variables](#environment-variables)
  - [Installation](#installation)
  - [Running Locally](#running-locally)
- [Deployment](#deployment)
- [How It Works](#how-it-works)
- [Contributing](#contributing)
- [Support](#support)

***

## What It Does

Slack Clone provides a collaborative messaging platform where users can:

- **Sign up / sign in** with email, Google, or other OAuth providers via Clerk
- **Send real-time messages** in channels powered by Stream Chat
- **Start and join video calls** using Stream Video SDK
- **Auto-join public channels** when their account is created (Inngest background jobs sync users to MongoDB and Stream)
- **Navigate pages** — Home (chat), Auth, and dedicated Call pages

***

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 19, Vite 8, Tailwind CSS 4, React Router 7 |
| UI/UX | Stream Chat React SDK, Stream Video React SDK, Lucide React, React Hot Toast |
| State / Data Fetching | TanStack React Query v5, Axios |
| Auth (Frontend) | `@clerk/react` |
| Backend | Express 5, Node.js (ESM) |
| Auth (Backend) | `@clerk/express` |
| Database | MongoDB via Mongoose |
| Real-time Chat & Video | `stream-chat`, `stream-chat-react`, `@stream-io/video-react-sdk` |
| Background Jobs | Inngest (syncs Clerk webhooks → MongoDB → Stream) |
| Error Monitoring | Sentry (`@sentry/node`, `@sentry/react`) |
| Deployment | Vercel (both frontend and backend) |

***

## Project Structure

```
slack-clone/
├── backend/
│   ├── src/
│   │   ├── config/
│   │   │   ├── db.js          # MongoDB connection
│   │   │   ├── env.js         # Environment variable validation
│   │   │   ├── inngest.js     # Inngest functions (user sync/delete)
│   │   │   └── stream.js      # Stream Chat helpers & token generation
│   │   ├── controllers/
│   │   │   └── chat.controller.js
│   │   ├── middleware/
│   │   │   └── auth.middleware.js   # Clerk JWT protection
│   │   ├── models/
│   │   │   └── user.model.js
│   │   ├── routes/
│   │   │   └── chat.route.js  # GET /api/chat/token
│   │   └── server.js          # Express app entry point
│   ├── instrument.mjs         # Sentry initialization
│   ├── vercel.json
│   └── package.json
│
└── frontend/
    ├── src/
    │   ├── components/        # Reusable UI components
    │   ├── hooks/             # Custom React hooks
    │   ├── lib/               # Utility functions
    │   ├── pages/
    │   │   ├── AuthPage.jsx   # Sign in / Sign up
    │   │   ├── HomePage.jsx   # Main chat interface
    │   │   └── CallPage.jsx   # Video call room
    │   ├── providers/
    │   │   └── StreamClientProvider.jsx
    │   ├── styles/
    │   ├── App.jsx            # Routing with Clerk auth guards
    │   └── main.jsx
    ├── vercel.json
    └── package.json
```

***

## Getting Started

### Prerequisites

- **Node.js** v18+ and **npm**
- A **MongoDB** instance (MongoDB Atlas recommended)
- A **Clerk** account → [clerk.com](https://clerk.com)
- A **Stream** account → [getstream.io](https://getstream.io)
- An **Inngest** account (for webhook-based background jobs) → [inngest.com](https://inngest.com)
- *(Optional)* A **Sentry** account for error monitoring → [sentry.io](https://sentry.io)

***

### Environment Variables

#### Backend (`backend/.env`)

```env
PORT=5001
NODE_ENV=development

# MongoDB
MONGODB_URI=mongodb+srv://<user>:<password>@cluster.mongodb.net/slack-clone

# Clerk
CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...

# Stream
STREAM_API_KEY=your_stream_api_key
STREAM_SECRET_KEY=your_stream_secret_key

# Sentry (optional)
SENTRY_DSN=https://...@sentry.io/...

# Inngest
INNGEST_EVENT_KEY=your_inngest_event_key
INNGEST_SIGNING_KEY=your_inngest_signing_key

# Frontend origin for CORS
CLIENT_URL=http://localhost:5173
```

#### Frontend (`frontend/.env`)

```env
VITE_CLERK_PUBLISHABLE_KEY=pk_test_...
VITE_STREAM_API_KEY=your_stream_api_key
VITE_API_URL=http://localhost:5001
```

> **Tip:** Never commit `.env` files. Both directories are covered by `.gitignore`.

***

### Installation

```bash
# Clone the repository
git clone https://github.com/ankit8895/slack-clone.git
cd slack-clone

# Install backend dependencies
cd backend && npm install

# Install frontend dependencies
cd ../frontend && npm install
```

***

### Running Locally

Open two terminal windows:

**Terminal 1 — Backend**

```bash
cd backend
npm run dev
# Server starts at http://localhost:5001
```

The backend uses `nodemon` with the Sentry `instrument.mjs` loaded via `NODE_OPTIONS`.

**Terminal 2 — Frontend**

```bash
cd frontend
npm run dev
# Vite dev server starts at http://localhost:5173
```

**Inngest Dev Server** *(optional, for local background job testing)*

```bash
npx inngest-cli@latest dev
# Listens for Clerk webhook events forwarded to http://localhost:8288
```

Navigate to `http://localhost:5173` — you'll be redirected to the Auth page if not signed in.

***

## Deployment

Both the frontend and backend include `vercel.json` for zero-config Vercel deployments.

### Backend (Vercel)

```bash
cd backend
vercel --prod
```

Set all [backend environment variables](#backend-backendenv) in the Vercel project settings.

### Frontend (Vercel)

```bash
cd frontend
vercel --prod
```

Set all [frontend environment variables](#frontend-frontendenv) and update `CLIENT_URL` in the backend to match your production frontend URL.

### Clerk Webhook Setup

After deploying the backend, register the Inngest endpoint as a Clerk webhook:

1. Go to **Clerk Dashboard → Webhooks → Add Endpoint**
2. URL: `https://<your-backend>.vercel.app/api/inngest`
3. Subscribe to events: `user.created`, `user.deleted`

This triggers the Inngest functions that sync new users to MongoDB and Stream, and auto-add them to public channels.

***

## How It Works

```
User signs up (Clerk)
        │
        ▼
Clerk fires webhook ──► Inngest function triggered
                                │
                    ┌───────────┼───────────┐
                    ▼           ▼           ▼
              MongoDB       Stream       Public
              (create       (upsert    Channels
               User)         user)    (add member)

User opens app
        │
        ▼
Frontend fetches Stream token ──► GET /api/chat/token (Clerk JWT protected)
        │
        ▼
Stream Chat / Video SDK initialized with token
        │
        ├──► Real-time messaging (HomePage)
        └──► Video call room (CallPage via /call/:id)
```

***

## Contributing

Contributions are welcome! To get started:

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/your-feature`
3. Commit your changes: `git commit -m "feat: add your feature"`
4. Push and open a Pull Request against `main`

Please keep PRs focused and include a clear description of the problem solved. For larger changes, open an issue first to discuss the approach.

***

## Support

- **Bug reports & feature requests:** [Open a GitHub Issue](https://github.com/ankit8895/slack-clone/issues)
- **Stream Chat docs:** [getstream.io/chat/docs](https://getstream.io/chat/docs/)
- **Stream Video docs:** [getstream.io/video/docs](https://getstream.io/video/docs/)
- **Clerk docs:** [clerk.com/docs](https://clerk.com/docs)
- **Inngest docs:** [inngest.com/docs](https://inngest.com/docs)

***

## Maintainer

**ankit8895** — [github.com/ankit8895](https://github.com/ankit8895)

***

> Built as a learning project to explore real-time full-stack architecture with modern tooling.
