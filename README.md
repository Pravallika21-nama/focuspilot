# FocusPilot

FocusPilot is a full-stack study productivity app built for internship demos and free-tier deployment. It generates personalized timetables, tracks progress, sends reminders, and includes a polished futuristic dashboard.

## Tech Stack

- Frontend: React, Vite, Tailwind CSS, Framer Motion, React Router, Axios
- Backend: Node.js, Express.js, MongoDB Atlas, JWT, bcrypt
- AI: OpenAI API, with deterministic fallback planner when no API key is configured
- Notifications: Browser Notification API, Nodemailer email reminders, node-cron scheduled checks
- Deployment: Vercel frontend, Render backend, MongoDB Atlas database

## Features

- JWT signup/login plus Google login placeholder endpoint for Firebase or Google OAuth integration
- Forgot password demo flow
- AI timetable generation from subjects, exam dates, weak subjects, difficulty, priorities, preferred times, and breaks
- Daily and weekly schedules, revision plan, productivity suggestions, and break intervals
- Browser notification permission flow and local 15-minute reminders
- Email reminder API and cron reminder processor
- Dashboard with today tasks, upcoming exams, streaks, quote, progress, and analytics
- Interactive calendar, task editing/completion/deletion, Pomodoro timer, AI chat assistant
- Export or download timetable as PDF using browser print
- Demo seed data and sample generated timetable

## Folder Structure

```text
client/
  src/
    components/
    context/
    data/
    pages/
    services/
    utils/
server/
  config/
  controllers/
  middleware/
  models/
  routes/
  services/
  utils/
```

## Environment Setup

1. Install Node.js 18 or newer.
2. Create a MongoDB Atlas database and copy the connection string.
3. Create a Firebase project and enable Google Authentication.
4. Copy `server/.env.example` to `server/.env`.
5. Copy `client/.env.example` to `client/.env`.
6. Fill in your values.

## Google Login Setup

In Firebase Console:

1. Create or open a Firebase project.
2. Go to Authentication.
3. Enable the Google sign-in provider.
4. Add `localhost` for local development and your Vercel domain for deployment in authorized domains.

Frontend Firebase values go in `client/.env`:

```bash
VITE_FIREBASE_API_KEY=your-web-api-key
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_APP_ID=your-web-app-id
```

Backend Firebase Admin values go in `server/.env`:

```bash
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@your-project.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
```

After this, students can log in with their own Gmail account. The backend verifies the Google token and stores that Gmail address as the notification email.

## Reminder Email Setup

To send reminders to the logged-in Gmail/email address, configure SMTP in `server/.env`:

```bash
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-sender@gmail.com
SMTP_PASS=your-gmail-app-password
SMTP_FROM="FocusPilot <your-sender@gmail.com>"
```

Use a Gmail App Password, not your normal Gmail password. The app creates daily study reminders and exam countdown reminders when a timetable is generated.

## Run Locally

```bash
npm run install:all
npm run seed
npm run dev
```

Frontend: `http://localhost:5173`

Backend: `http://localhost:5000`

## Demo Login

After seeding:

- Email: `demo@student.com`
- Password: `Demo@12345`

## API Overview

- `GET /api/auth/status`
- `POST /api/auth/register`
- `POST /api/auth/login`
- `POST /api/auth/google`
- `POST /api/auth/forgot-password`
- `GET /api/profile`
- `PUT /api/profile`
- `POST /api/timetables/generate`
- `GET /api/timetables`
- `PATCH /api/tasks/:id`
- `DELETE /api/tasks/:id`
- `GET /api/progress/analytics`
- `POST /api/notifications/test-email`
- `GET /api/notifications`
- `POST /api/chat`

## Deployment

### Backend on Render

1. Push this repo to GitHub.
2. Create a new Render Web Service from the repo.
3. Set root directory to `server`.
4. Build command: `npm install`
5. Start command: `npm start`
6. Add environment variables from `server/.env.example`.
7. Set `CLIENT_URL` to your Vercel frontend URL.

### Frontend on Vercel

1. Create a new Vercel project from the repo.
2. Set root directory to `client`.
3. Build command: `npm run build`
4. Output directory: `dist`
5. Add `VITE_API_URL` pointing to the Render backend URL plus `/api`.

## Notes for a 90-Second Demo

1. Login with the demo user.
2. Show the dashboard cards, streak, and calendar.
3. Generate a timetable from the AI Planner form.
4. Mark a task complete and show analytics update.
5. Trigger browser notifications and open the Pomodoro/chat panels.

See [ROADMAP.md](./ROADMAP.md) for a feature-by-feature explanation and next-step roadmap.
