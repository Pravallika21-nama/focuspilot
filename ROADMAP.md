# FocusPilot Roadmap

This roadmap explains what was built, why it exists, and how each part can be shown in an internship demo.

## 1. Authentication

Built:
- Email/password signup and login using JWT.
- Password hashing with bcrypt on the backend.
- Protected frontend routes.
- Google login through Firebase Authentication.
- Backend verification of Firebase Google ID tokens with Firebase Admin.

How it works:
- The student clicks "Continue with Google".
- Firebase opens the Google account picker.
- The frontend receives a Firebase ID token.
- The backend verifies the token, creates or finds the user, then issues the app JWT.
- The user email from Google becomes the email used for reminder notifications.

Next improvements:
- Add Firebase password reset email flow.
- Add account deletion and session revocation.
- Add refresh tokens for longer-lived sessions.

## 2. AI Timetable Generation

Built:
- User inputs for subjects, exam dates, daily hours, weak subjects, difficulty, priority, break preference, and preferred study time.
- OpenAI integration for personalized plans.
- Local fallback planner if no OpenAI API key is configured.

How it works:
- The backend sends structured study inputs to OpenAI.
- The response is parsed into daily schedule, weekly schedule, revision plan, suggestions, and productivity score.
- The timetable is saved in MongoDB.

Next improvements:
- Add topic-level syllabus import.
- Add adaptive replanning when tasks are missed.
- Add stronger JSON schema validation for AI responses.

## 3. Reminder Notifications

Built:
- Browser Notification API permission request after login.
- Browser reminders 15 minutes before study sessions.
- Email reminders for daily timetable sessions.
- Exam countdown email reminders 7 days, 3 days, and 1 day before exams.
- `node-cron` processor that checks pending reminders every 5 minutes.
- Nodemailer SMTP service for sending reminders.

How it works:
- Timetable generation creates notification records in MongoDB.
- Browser reminders are scheduled locally in the student’s browser.
- Email reminders are processed by the backend cron job and sent to the user’s Gmail/email.

Next improvements:
- Add queue service such as BullMQ for production scale.
- Add user-specific timezone support.
- Add Twilio WhatsApp reminders when credentials are configured.

## 4. Dashboard

Built:
- Welcome section.
- Today’s study tasks.
- Upcoming exams.
- Study streak.
- Productivity score.
- Motivational quote.
- Pomodoro timer.
- AI coach assistant.

How it works:
- The dashboard loads the latest timetable.
- Tasks can be marked complete.
- Completed tasks update progress records.

Next improvements:
- Add real streak recalculation logic per day.
- Add dashboard filters for exam week and weak subjects.

## 5. Calendar

Built:
- 21-day interactive calendar view.
- Exam date highlights.
- Study session highlights.
- Completed task indicators.

How it works:
- The frontend maps timetable sessions and demo exam data onto calendar days.

Next improvements:
- Add Google Calendar export.
- Add drag-and-drop rescheduling.

## 6. Progress Analytics

Built:
- Weekly hours.
- Completed tasks.
- Consistency tracker.
- Average focus score.
- Study hours graph.
- Subject-wise progress bars.

How it works:
- Marking a task complete updates `StudyProgress`.
- Analytics API aggregates completed minutes, tasks, and focus scores.

Next improvements:
- Add Recharts for richer graphs.
- Add monthly performance reports.

## 7. Task Management

Built:
- Mark tasks complete/incomplete.
- Add custom sessions through the backend.
- Delete tasks through the backend.
- Edit task fields through the patch API.

Next improvements:
- Add full edit modal in the UI.
- Add recurring custom study sessions.

## 8. Export and Download

Built:
- Print-to-PDF export from the planner page.
- JSON study plan download.

Next improvements:
- Add branded PDF generation on the backend.
- Add CSV export for calendar imports.

## 9. Deployment

Built:
- Vercel-ready frontend.
- Render-ready backend.
- MongoDB Atlas connection support.
- Environment templates for client and server.

Next improvements:
- Add GitHub Actions CI.
- Add production logging and health checks.

## 90-Second Demo Flow

1. Login with Google using your own Gmail account.
2. Show that the profile email matches the Gmail account.
3. Generate a plan with weak subjects and upcoming exam dates.
4. Show the generated timetable and revision suggestions.
5. Open dashboard and mark a task complete.
6. Show calendar highlights and analytics.
7. Explain that browser reminders appear 15 minutes before sessions and email reminders go to the Gmail address.
