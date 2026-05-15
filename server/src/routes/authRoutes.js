import { Router } from "express";
import { body } from "express-validator";
import { authStatus, forgotPassword, googleLogin, login, register } from "../controllers/authController.js";
import { asyncHandler } from "../middleware/asyncHandler.js";

const router = Router();

router.get("/status", asyncHandler(authStatus));
router.post(
  "/register",
  [
    body("name").trim().notEmpty().withMessage("Name is required"),
    body("email").isEmail().withMessage("Valid email is required"),
    body("password").isLength({ min: 8 }).withMessage("Password must be at least 8 characters")
  ],
  asyncHandler(register)
);
router.post(
  "/login",
  [
    body("email").isEmail().withMessage("Valid email is required"),
    body("password").notEmpty().withMessage("Password is required")
  ],
  asyncHandler(login)
);
router.post("/google", asyncHandler(googleLogin));
router.post("/forgot-password", body("email").isEmail().withMessage("Valid email is required"), asyncHandler(forgotPassword));

export default router;
