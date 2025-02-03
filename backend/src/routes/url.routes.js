import express from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import {
  createShortUrl,
  redirectToOriginalUrl,
} from "../controllers/url.controller.js";

const urlRoutes = express.Router();

// Route to create a shortened URL
urlRoutes.route("/shorten-url").post(verifyJWT, createShortUrl);

// Route to redirect from short URL to original URL
urlRoutes.route("/shortUrl/:").get(redirectToOriginalUrl);

export { urlRoutes };
