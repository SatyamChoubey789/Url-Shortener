import mongoose from "mongoose";


const UrlSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  originalUrl: { type: String, required: true },
  shortUrl: { type: String, required: true, unique: true },
  qrCode: { type: String },
  createdAt: { type: Date, default: Date.now },
});

export const Url = mongoose.model("Url", UrlSchema);
