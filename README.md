# FocusPilot 🚀

> **Smart AI-powered study planner for students.** Generate a personalized roadmap, track progress with Pomodoro & analytics, and stay on schedule with daily email reminders.

![Tech Stack](https://img.shields.io/badge/React%20+%20Vite-blue) ![Node.js](https://img.shields.io/badge/Node.js-green) ![MongoDB](https://img.shields.io/badge/MongoDB-brightgreen) ![Firebase](https://img.shields.io/badge/Firebase-orange) ![TailwindCSS](https://img.shields.io/badge/TailwindCSS-teal)

---

## ✨ Features

| Feature | Description |
|---|---|
| 🔐 **Authentication** | Email/password + Google OAuth via Firebase |
| 📅 **AI Roadmap** | Generates a personalized weekly study schedule |
| 🍅 **Pomodoro Timer** | Built-in focus session timer |
| 📊 **Analytics** | Completion rates, streaks, subject progress |
| 📧 **Email Reminders** | Welcome email + daily study digest via Nodemailer |
| 🔔 **Reminder Settings** | Choose days, time, and toggle email reminders |
| 🗓 **Calendar View** | Visual session calendar |
| 🤖 **AI Chat Assistant** | Study advice powered by OpenAI |
| 🌙 **Dark Mode** | Glassmorphism dark UI throughout |

---

## 📁 Project Structure

```
focuspilot/
├── client/                 # React + Vite frontend
│   ├── src/
│   │   ├── components/     # AppShell, Pomodoro, TaskList, StatCard …
│   │   ├── context/        # AuthContext, ToastContext
│   │   ├── pages/          # Dashboard, AuthPage, RemindersPage …
│   │   ├── services/       # api.js, firebase.js, notifications.js
│   │   └── styles.css      # TailwindCSS + custom component styles
│   ├── .env.example        # Client environment template
│   └── vite.config.js
│
├── server/                 # Node.js + Express backend
│   └── src/
│       ├── config/         # MongoDB connection
│       ├── controllers/    # Auth, Reminder, Task, Profile …
│       ├── middleware/     # JWT auth, error handling
│       ├── models/         # User, Timetable, Notification …
│       ├── routes/         # REST API routes
│       └── services/       # Email, Firebase Admin, cron jobs
│
├── package.json            # Root — runs both client & server
└── README.md
```

---

## 🚀 Quick Start

### Prerequisites

- **Node.js** v18+ ([download](https://nodejs.org))
- **npm** v9+
- Optional: **MongoDB** (Atlas or local) — app works without it using an in-memory store
- Optional: **Firebase** project — required for Google login only
- Optional: **Gmail App Password** — required for email reminders

---

### 1. Clone & Install

```bash
git clone <your-repo-url>
cd focuspilot

# Install all dependencies (client + server)
npm run install:all
```

---

### 2. Configure Environment Variables

#### Client (`client/.env`)

```bash
cp client/.env.example client/.env
```

Edit `client/.env`:

```env
VITE_API_URL=http://localhost:5000/api

# Firebase (required for Google login — leave blank to disable Google login)
VITE_FIREBASE_API_KEY=AIza...
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_APP_ID=1:123456:web:abc123
```

#### Server (`server/.env`)

```bash
cp server/src/.env.example server/.env
```

Edit `server/.env`:

```env
PORT=5000
NODE_ENV=development
CLIENT_URL=http://localhost:5173

# MongoDB Atlas connection string (optional — uses in-memory store if blank)
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/focuspilot

# JWT — CHANGE THIS to a long random string in production
JWT_SECRET=replace-with-a-long-random-secret-at-least-32-chars
JWT_EXPIRES_IN=7d

# Gmail SMTP for email reminders (optional — emails are skipped gracefully if blank)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-gmail@gmail.com
SMTP_PASS=xxxx-xxxx-xxxx-xxxx   # Gmail App Password (not your login password)
SMTP_FROM="FocusPilot <your-gmail@gmail.com>"

# OpenAI (optional — AI planner and chat)
OPENAI_API_KEY=sk-...
OPENAI_MODEL=gpt-4o-mini

# Firebase Admin SDK (optional — required for Google login verification)
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxx@your-project.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYour key here\n-----END PRIVATE KEY-----\n"
```

---

### 3. Start Development Servers

```bash
npm run dev
```

This runs **both** client and server concurrently:
- **Client:** http://localhost:5173
- **Server API:** http://localhost:5000/api

> The app works even without MongoDB, Firebase, or SMTP — each optional service degrades gracefully.

---

## 🔥 Firebase Setup (for Google Login)

1. Go to [Firebase Console](https://console.firebase.google.com/) → **Add project**
2. Enable **Authentication** → **Sign-in methods** → **Google**
3. Add `http://localhost:5173` to **Authorized domains**
4. Go to **Project settings** → copy the **web app config** into `client/.env`
5. Go to **Project settings** → **Service accounts** → **Generate new private key**
6. Copy the values into `server/.env` (`FIREBASE_PROJECT_ID`, `FIREBASE_CLIENT_EMAIL`, `FIREBASE_PRIVATE_KEY`)

> ⚠️ **Without Firebase:** Email/password login still works fully. Google login shows a user-friendly toast message instead of crashing.

---

## 📧 Email Reminders Setup (Gmail)

1. Enable **2-Step Verification** on your Gmail account
2. Go to [Google Account](https://myaccount.google.com/) → **Security** → **App passwords**
3. Create a new App Password for "Mail" → "Windows Computer" (or "Other")
4. Copy the 16-character password into `SMTP_PASS` in `server/.env`
5. Set `SMTP_USER` to your Gmail address

**Email events:**
- ✅ **Welcome email** — sent automatically when a user registers
- ⏰ **Daily digest** — sent every day at **7 AM** to opted-in users with their today's tasks
- 🔔 **Session reminders** — sent 15 minutes before study sessions

> ⚠️ **Without SMTP:** All email operations silently skip. No crash, no error shown to users.

---

## 🗄️ MongoDB Setup (Atlas)

1. Go to [MongoDB Atlas](https://cloud.mongodb.com/) → Create a free cluster
2. **Database Access** → Add a user with password
3. **Network Access** → Add `0.0.0.0/0` (or your specific IP)
4. **Connect** → Copy the connection string into `MONGODB_URI` in `server/.env`

> ⚠️ **Without MongoDB:** The app uses an in-memory store (data is lost on server restart). Fully functional for development.

---

## 📜 Available Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start both client & server (concurrent) |
| `npm run install:all` | Install all dependencies |
| `npm run seed` | Seed demo data to MongoDB |
| `npm run dev --prefix client` | Start client only |
| `npm run dev --prefix server` | Start server only |

---

## 🌐 API Endpoints

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `POST` | `/api/auth/register` | — | Create account (sends welcome email) |
| `POST` | `/api/auth/login` | — | Email/password login |
| `POST` | `/api/auth/google` | — | Google OAuth login |
| `GET` | `/api/profile` | ✅ JWT | Get current user profile |
| `POST` | `/api/timetables/generate` | ✅ JWT | Generate AI study roadmap |
| `GET` | `/api/timetables/active` | ✅ JWT | Get active timetable |
| `PATCH` | `/api/tasks/:id` | ✅ JWT | Mark task complete |
| `GET` | `/api/reminders/preferences` | ✅ JWT | Get reminder settings |
| `PUT` | `/api/reminders/preferences` | ✅ JWT | Update reminder settings |
| `GET` | `/api/notifications` | ✅ JWT | List notifications |
| `GET` | `/api/progress/analytics` | ✅ JWT | Get analytics data |
| `POST` | `/api/chat` | ✅ JWT | Ask AI assistant |
| `GET` | `/api/health` | — | Health check |

---

## 🛡️ Security Notes

- **Never** commit `.env` files — they are in `.gitignore`
- Use a strong, random `JWT_SECRET` in production (min 32 chars)
- Gmail App Password is **not** your Gmail login password
- In production, restrict `CLIENT_URL` to your actual domain

---

## 🤝 Contributing

1. Fork the repo
2. Create a feature branch: `git checkout -b feature/my-feature`
3. Commit changes: `git commit -m "feat: add my feature"`
4. Push and open a Pull Request

---

