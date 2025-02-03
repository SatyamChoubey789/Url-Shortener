import express from "express";
import {
  loginUser,
  logoutUser,
  registerUser,
  verifyEmail,
  refreshAccessToken,
  requestPasswordReset,
  resetPassword,
} from "../controllers/auth.controller.js";

import { verifyJWT } from "../middlewares/auth.middleware.js";

const authRoutes = express.Router();

// Register route
authRoutes.route("/register").post(registerUser);

// Verify email route
authRoutes.route("/verify-email/:verificationToken").post(verifyEmail);

// Login route
authRoutes.route("/login").post(loginUser);

// Logout route, protected by JWT verification
authRoutes.route("/logout").post(verifyJWT, logoutUser);

// Refresh access token route
authRoutes.route("/refresh-token").post(refreshAccessToken);

// Request password reset (Send email with token)
authRoutes.route("/request-password-reset").post(verifyJWT,requestPasswordReset);

// Reset password using token
authRoutes.route("/reset-password").patch(verifyJWT,resetPassword);

export { authRoutes };
