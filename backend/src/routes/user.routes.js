import express from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import {
  updateProfile,
  changePassword,
  deleteUser,
} from "../controllers/user.controller.js";

const userRoutes = express.Router();

// Update profile
userRoutes.route("/profile").patch(verifyJWT, updateProfile);

// Change password
userRoutes.route("/change-password").patch(verifyJWT, changePassword);

// Delete user account
userRoutes.route("/delete-account").delete(verifyJWT, deleteUser);

export { userRoutes };
