import jwt from "jsonwebtoken";

export function signToken(userId) {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET || "dev-secret", {
    expiresIn: process.env.JWT_EXPIRES_IN || "7d"
  });
}
