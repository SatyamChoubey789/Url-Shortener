import { asyncHandler } from "../libs/asyncHandler.js";
import { Url } from "../models/url.model.js";
import { nanoid } from "nanoid"; // To generate a short unique URL
import qrcode from "qrcode"; // To generate QR code
import { ApiError } from "../libs/ApiError.js";
import { ApiResponse } from "../libs/ApiResponse.js";

// Function to create a new shortened URL
const createShortUrl = asyncHandler(async (req, res) => {
  const { originalUrl } = req.body;
  const userId = req.user._id; // Assume the user is authenticated

  // Validate original URL
  if (!originalUrl || !/^https?:\/\//.test(originalUrl)) {
    throw new ApiError(400, "Invalid URL format");
  }

  // Generate a unique short URL
  const shortUrl = nanoid(8); // Generates a random short URL (8 characters)

  // Generate a QR code for the URL
  const qrCode = await qrcode.toDataURL(originalUrl); // Convert the QR code to a base64 string

  // Save the shortened URL and QR code to the database
  const url = await Url.create({
    userId,
    originalUrl,
    shortUrl,
    qrCode,
  });

  return res
    .status(201)
    .json(new ApiResponse(201, url, "Short URL created successfully"));
});

// Function to redirect from short URL to original URL
const redirectToOriginalUrl = asyncHandler(async (req, res) => {
  const { shortUrl } = req.params;

  // Find the URL in the database using the short URL
  const url = await Url.findOne({ shortUrl });
  if (!url) {
    throw new ApiError(404, "Short URL not found");
  }

  // Redirect to the original URL
  return res.redirect(url.originalUrl);
});

export { createShortUrl, redirectToOriginalUrl };
