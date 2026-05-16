import { validationResult } from "express-validator";
import mongoose from "mongoose";
import { verifyGoogleIdToken } from "../services/firebaseAdmin.js";
import { listLoginEvents, recordLoginEvent } from "../services/loginRecordStore.js";
import { createUser, findUserByEmail, normalizeUser, updateUser, verifyUserPassword } from "../services/userStore.js";
import { sendWelcomeEmail } from "../services/emailService.js";
import { signToken } from "../utils/token.js";

function authResponse(user) {
  const safeUser = normalizeUser(user);
  return {
    token: signToken(safeUser.id),
    user: {
      id: safeUser.id,
      name: safeUser.name,
      email: safeUser.email,
      avatar: safeUser.avatar,
      streak: safeUser.streak,
      preferredStudyTime: safeUser.preferredStudyTime,
      dailyStudyHours: safeUser.dailyStudyHours
    }
  };
}

export async function register(req, res) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(422).json({ errors: errors.array() });

  const exists = await findUserByEmail(req.body.email);
  if (exists) return res.status(409).json({ message: "Email already registered" });

  const user = await createUser(req.body);
  await recordLoginEvent({ userId: user.id || user._id, email: user.email, provider: "local", action: "register" });

  // Send welcome email (non-blocking — doesn't fail the request if email fails)
  sendWelcomeEmail({ to: user.email, name: user.name }).catch((err) =>
    console.warn("Welcome email failed:", err.message)
  );

  res.status(201).json(authResponse(user));
}


export async function login(req, res) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(422).json({ errors: errors.array() });

  const user = await findUserByEmail(req.body.email, { includePassword: true });
  if (!user || !(await verifyUserPassword(user, req.body.password))) {
    return res.status(401).json({ message: "Invalid email or password" });
  }
  const updated = await updateUser(user, { lastActiveDate: new Date() });
  await recordLoginEvent({ userId: user.id || user._id, email: user.email, provider: "local", action: "login" });
  res.json(authResponse(updated || user));
}

export async function googleLogin(req, res) {
  try {
    const { idToken } = req.body;

    if (!idToken) {
      return res.status(422).json({ message: "Google ID token is required" });
    }

    const decoded = await verifyGoogleIdToken(idToken);
    const googleProfile = {
      email: decoded.email,
      name: decoded.name || decoded.email?.split("@")[0],
      avatar: decoded.picture
    };

    const { email, name, avatar } = googleProfile;
    if (!email || !name) return res.status(422).json({ message: "Google profile is required" });

    let user = await findUserByEmail(email);
    if (!user) {
      user = await createUser({ email, name, avatar, provider: "google" });
    } else {
      user = await updateUser(user, {
        name: user.name || name,
        avatar: user.avatar || avatar,
        provider: user.provider === "local" ? "local" : "google",
        lastActiveDate: new Date()
      });
    }
    await recordLoginEvent({ userId: user.id || user._id, email: user.email, provider: "google", action: "google-login" });
    res.json(authResponse(user));
  } catch (error) {
    res.status(401).json({ message: error.message || "Google authentication failed" });
  }
}

export async function loginHistory(req, res) {
  const logins = await listLoginEvents(req.user.id || req.user._id);
  res.json({ logins });
}

export async function forgotPassword(req, res) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(422).json({ errors: errors.array() });

  res.json({
    message: "If the email exists, a password reset link will be sent. Connect Firebase or your email provider for production reset links."
  });
}

export async function authStatus(_req, res) {
  res.json({
    databaseConnected: mongoose.connection.readyState === 1,
    firebaseProjectConfigured: Boolean(process.env.FIREBASE_PROJECT_ID),
    firebaseServiceAccountConfigured: Boolean(process.env.FIREBASE_CLIENT_EMAIL && process.env.FIREBASE_PRIVATE_KEY),
    jwtConfigured: Boolean(process.env.JWT_SECRET),
    smtpConfigured: Boolean(process.env.SMTP_USER && process.env.SMTP_PASS)
  });
}
