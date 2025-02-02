import { asyncHandler } from "../libs/asyncHandler.js";
import { ApiError } from "../libs/ApiError.js";
import { User } from "../models/user.model.js";
import { uploadOnCloudinary } from "../utils/cloundinary.js";
import { ApiResponse } from "../libs/ApiResponse.js";
import jwt from "jsonwebtoken";
import { sendVerificationEmail } from "../utils/sendEmail.js"; // Correct function import

// Helper function to generate access and refresh tokens
const generateAccessAndRefreshTokens = async (userId) => {
  try {
    const user = await User.findById(userId);
    const accessToken = user.generateAccessToken();
    const refreshToken = user.generateRefreshToken();

    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false });

    return { accessToken, refreshToken };
  } catch (error) {
    throw new ApiError(
      400,
      "Something went wrong while generating refresh and access token"
    );
  }
};

// Register a new user
const registerUser = asyncHandler(async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Validate inputs
    if ([email, name, password].some((field) => field?.trim() === "")) {
      throw new ApiError(400, "All fields are required");
    }

    // Check if user already exists
    const userExists = await User.findOne({
      $or: [{ email: email }, { name: name }],
    });
    if (userExists) {
      throw new ApiError(400, "User already exists");
    }

    // Handle avatar upload
    const avatarLocalPath = req.files?.avatar[0]?.path;
    if (!avatarLocalPath) {
      throw new ApiError(400, "Avatar file is required");
    }
    const avatar = await uploadOnCloudinary(avatarLocalPath);
    if (!avatar) {
      throw new ApiError(400, "Failed to upload avatar");
    }

    // Create verification token
    const verificationToken = jwt.sign(
      { email },
      process.env.VERIFICATION_TOKEN_SECRET,
      {
        expiresIn: "1h",
      }
    );

    // Create user
    const user = await User.create({
      name,
      avatar: avatar.url,
      email,
      password,
      verificationToken,
    });

    const createdUser = await User.findById(user._id).select(
      "-password -refreshToken"
    );

    if (!createdUser) {
      throw new ApiError(500, "Error registering user");
    }

    // Send verification email
    await sendVerificationEmail(email, verificationToken);

    return res
      .status(201)
      .json(
        new ApiResponse(
          200,
          createdUser,
          "User registered successfully. Please verify your email."
        )
      );
  } catch (error) {
    console.error(error);
    throw new ApiError(400, "Something went wrong during registration");
  }
});

// Verify email address
const verifyEmail = asyncHandler(async (req, res) => {
  try {
    const { verificationToken } = req.body;
    if (!verificationToken) {
      throw new ApiError(400, "Verification token is required");
    }

    // Find user by verification token
    const user = await User.findOne({ verificationToken });
    if (!user) {
      throw new ApiError(400, "Invalid verification token");
    }

    // Mark user as verified
    user.isVerified = true;
    user.verificationToken = undefined; // Clear verification token
    await user.save({ validateBeforeSave: false });

    return res
      .status(200)
      .json(new ApiResponse(200, null, "Email verified successfully"));
  } catch (error) {
    throw new ApiError(400, "Error verifying email");
  }
});

// Login user
const loginUser = asyncHandler(async (req, res) => {
  try {
    const { email, password } = req.body;

    if ([email, password].some((field) => field?.trim() === "")) {
      throw new ApiError(400, "Email and password are required");
    }

    const user = await User.findOne({ email });
    if (!user) {
      throw new ApiError(400, "Invalid credentials");
    }

    const isPasswordCorrect = await user.isPasswordCorrect(password);
    if (!isPasswordCorrect) {
      throw new ApiError(400, "Invalid credentials");
    }

    const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(
      user._id
    );

    return res
      .status(200)
      .json(
        new ApiResponse(200, { accessToken, refreshToken }, "Login successful")
      );
  } catch (error) {
    throw new ApiError(400, "Something went wrong during login");
  }
});

// Logout user
const logoutUser = asyncHandler(async (req, res) => {
  try {
    // Clear the user's refresh token
    const user = await User.findById(req.user._id);
    user.refreshToken = undefined;
    await user.save();

    return res
      .status(200)
      .json(new ApiResponse(200, null, "Logged out successfully"));
  } catch (error) {
    throw new ApiError(400, "Something went wrong during logout");
  }
});

// Refresh access token
const refreshAccessToken = asyncHandler(async (req, res) => {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) {
      throw new ApiError(400, "Refresh token is required");
    }

    // Verify the refresh token
    const decoded = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);
    const user = await User.findById(decoded._id);
    if (!user || user.refreshToken !== refreshToken) {
      throw new ApiError(400, "Invalid refresh token");
    }

    // Generate a new access token
    const accessToken = user.generateAccessToken();
    return res
      .status(200)
      .json(
        new ApiResponse(
          200,
          { accessToken },
          "Access token refreshed successfully"
        )
      );
  } catch (error) {
    throw new ApiError(400, "Error refreshing access token");
  }
});

export { registerUser, verifyEmail, loginUser, logoutUser, refreshAccessToken };
