import mongoose from "mongoose";

const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  avatar: { type: String },
  isVerified: { type: Boolean, default: false },
  verificationToken: { type: String },
  googleId: { type: String },
  createdAt: { type: Date, default: Date.now },
});

export const User = mongoose.model("User", UserSchema);
