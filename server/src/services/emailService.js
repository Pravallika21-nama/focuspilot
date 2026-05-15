import nodemailer from "nodemailer";

export function createTransporter() {
  if (!process.env.SMTP_USER || !process.env.SMTP_PASS) return null;
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT || 587),
    secure: Number(process.env.SMTP_PORT) === 465,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS
    }
  });
}

export async function sendEmailReminder({ to, subject, html }) {
  const transporter = createTransporter();
  if (!transporter) {
    console.log(`Email skipped for ${to}: SMTP not configured`);
    return { skipped: true };
  }

  return transporter.sendMail({
    from: process.env.SMTP_FROM || "FocusPilot <no-reply@example.com>",
    to,
    subject,
    html
  });
}
