import nodemailer from "nodemailer";

export function createTransporter() {
  if (!process.env.SMTP_USER || !process.env.SMTP_PASS) return null;
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST || "smtp.gmail.com",
    port: Number(process.env.SMTP_PORT || 587),
    secure: Number(process.env.SMTP_PORT) === 465,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });
}

export async function sendEmailReminder({ to, subject, html }) {
  const transporter = createTransporter();
  if (!transporter) {
    console.log(`📧  Email skipped for ${to}: SMTP not configured`);
    return { skipped: true };
  }

  return transporter.sendMail({
    from: process.env.SMTP_FROM || "FocusPilot <no-reply@focuspilot.app>",
    to,
    subject,
    html,
  });
}

/** Welcome email sent immediately on registration */
export async function sendWelcomeEmail({ to, name }) {
  const transporter = createTransporter();
  if (!transporter) {
    console.log(`📧  Welcome email skipped for ${to}: SMTP not configured`);
    return { skipped: true };
  }

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width,initial-scale=1" />
  <title>Welcome to FocusPilot</title>
</head>
<body style="margin:0;padding:0;background:#07111f;font-family:'Inter',Arial,sans-serif;color:#e2e8f0">
  <table width="100%" cellpadding="0" cellspacing="0" style="padding:32px 16px">
    <tr>
      <td align="center">
        <table width="100%" style="max-width:560px;background:linear-gradient(135deg,#0f1f35,#0d1a2b);border:1px solid rgba(255,255,255,0.1);border-radius:16px;overflow:hidden">
          <!-- Header -->
          <tr>
            <td style="background:linear-gradient(135deg,rgba(34,211,238,0.15),rgba(45,212,191,0.1));padding:32px;text-align:center">
              <h1 style="margin:0;font-size:28px;font-weight:800;background:linear-gradient(135deg,#22d3ee,#2dd4bf);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text">
                FocusPilot
              </h1>
              <p style="margin:8px 0 0;font-size:13px;color:#94a3b8;letter-spacing:0.1em;text-transform:uppercase">
                Smart Study Planner
              </p>
            </td>
          </tr>
          <!-- Body -->
          <tr>
            <td style="padding:32px">
              <h2 style="margin:0 0 12px;font-size:22px;font-weight:700;color:#f1f5f9">
                Welcome aboard, ${name}! 🎉
              </h2>
              <p style="margin:0 0 20px;font-size:15px;color:#94a3b8;line-height:1.6">
                Your FocusPilot account is ready. Start by generating your personalized AI study roadmap — built around your syllabus, exam dates, and goals.
              </p>
              <!-- CTA -->
              <a href="${process.env.CLIENT_URL || "http://localhost:5173"}/planner"
                 style="display:inline-block;background:linear-gradient(135deg,#22d3ee,#2dd4bf);color:#07111f;font-weight:700;font-size:14px;padding:14px 28px;border-radius:10px;text-decoration:none">
                Generate My Roadmap →
              </a>
              <!-- Features -->
              <table style="margin-top:28px;width:100%;border-spacing:0">
                ${[
                  ["📅", "AI Roadmap", "Personalized weekly schedule from your syllabus"],
                  ["⏰", "Daily Reminders", "Stay on track with email study reminders"],
                  ["🍅", "Pomodoro Timer", "Focus sessions built right into your dashboard"],
                  ["📊", "Analytics", "Track completion rates and study streaks"],
                ].map(([emoji, title, desc]) => `
                <tr>
                  <td style="padding:10px 12px;background:rgba(255,255,255,0.04);border-radius:10px;margin-bottom:8px;display:block">
                    <span style="font-size:20px">${emoji}</span>
                    <strong style="color:#f1f5f9;font-size:14px;margin-left:8px">${title}</strong>
                    <span style="color:#64748b;font-size:13px;margin-left:4px">— ${desc}</span>
                  </td>
                </tr>
                <tr><td style="height:6px"></td></tr>
                `).join("")}
              </table>
            </td>
          </tr>
          <!-- Footer -->
          <tr>
            <td style="padding:20px 32px;border-top:1px solid rgba(255,255,255,0.08);text-align:center">
              <p style="margin:0;font-size:12px;color:#475569">
                You're receiving this because you signed up at FocusPilot.<br/>
                <a href="${process.env.CLIENT_URL || "http://localhost:5173"}/reminders" style="color:#22d3ee;text-decoration:none">
                  Manage email preferences
                </a>
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;

  return transporter.sendMail({
    from: process.env.SMTP_FROM || "FocusPilot <no-reply@focuspilot.app>",
    to,
    subject: "Welcome to FocusPilot 🎉 — Let's build your study roadmap",
    html,
  });
}

/** Daily reminder digest email */
export async function sendDailyReminderEmail({ to, name, tasks = [] }) {
  const transporter = createTransporter();
  if (!transporter) {
    console.log(`📧  Daily reminder skipped for ${to}: SMTP not configured`);
    return { skipped: true };
  }

  const taskRows = tasks.length
    ? tasks
        .map(
          (t) => `<tr>
            <td style="padding:10px 12px;background:rgba(34,211,238,0.07);border-left:3px solid #22d3ee;border-radius:6px;margin-bottom:6px;display:block">
              <strong style="color:#22d3ee;font-size:14px">${t.subject || "Study"}</strong>
              <span style="color:#94a3b8;font-size:13px"> · ${t.topic || t.title || "Session"}</span>
              ${t.startTime ? `<span style="color:#64748b;font-size:12px;margin-left:8px">@ ${t.startTime}</span>` : ""}
            </td>
          </tr><tr><td style="height:6px"></td></tr>`
        )
        .join("")
    : `<tr><td style="padding:12px;color:#64748b;font-size:14px">No sessions scheduled for today — use the planner to add some!</td></tr>`;

  const html = `
<!DOCTYPE html>
<html>
<head><meta charset="UTF-8" /><meta name="viewport" content="width=device-width,initial-scale=1" /></head>
<body style="margin:0;padding:0;background:#07111f;font-family:'Inter',Arial,sans-serif;color:#e2e8f0">
  <table width="100%" cellpadding="0" cellspacing="0" style="padding:32px 16px">
    <tr>
      <td align="center">
        <table width="100%" style="max-width:560px;background:linear-gradient(135deg,#0f1f35,#0d1a2b);border:1px solid rgba(255,255,255,0.1);border-radius:16px;overflow:hidden">
          <tr>
            <td style="background:linear-gradient(135deg,rgba(34,211,238,0.12),rgba(45,212,191,0.08));padding:28px 32px">
              <h1 style="margin:0;font-size:22px;font-weight:800;color:#22d3ee">📚 FocusPilot Study Reminder</h1>
              <p style="margin:6px 0 0;font-size:13px;color:#64748b">Stay consistent with your study goals today.</p>
            </td>
          </tr>
          <tr>
            <td style="padding:28px 32px">
              <p style="margin:0 0 20px;font-size:15px;color:#94a3b8">
                Good morning, <strong style="color:#f1f5f9">${name}</strong>! Here's your study plan for today:
              </p>
              <table style="width:100%;border-spacing:0">${taskRows}</table>
              <div style="margin-top:24px">
                <a href="${process.env.CLIENT_URL || "http://localhost:5173"}"
                   style="display:inline-block;background:linear-gradient(135deg,#22d3ee,#2dd4bf);color:#07111f;font-weight:700;font-size:13px;padding:12px 24px;border-radius:8px;text-decoration:none">
                  Open Dashboard →
                </a>
              </div>
            </td>
          </tr>
          <tr>
            <td style="padding:16px 32px;border-top:1px solid rgba(255,255,255,0.06);text-align:center">
              <p style="margin:0;font-size:11px;color:#475569">
                FocusPilot Study Reminder ·
                <a href="${process.env.CLIENT_URL || "http://localhost:5173"}/reminders" style="color:#22d3ee;text-decoration:none">
                  Unsubscribe
                </a>
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;

  return transporter.sendMail({
    from: process.env.SMTP_FROM || "FocusPilot <no-reply@focuspilot.app>",
    to,
    subject: "FocusPilot Study Reminder — Stay on track today 📚",
    html,
  });
}
