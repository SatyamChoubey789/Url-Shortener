import { asyncHandler } from "../libs/asyncHandler.js";
import { ApiError } from "../libs/ApiError.js";
import { User } from "../models/user.model.js";
import { ApiResponse } from "../libs/ApiResponse.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import {
  sendWelcomeEmail,
  sendVerificationEmail,
  sendPasswordResetEmail,
  sendPasswordResetSuccessEmail,
  sendPasswordResetFailureEmail,
  sendSuccessEmail,
  sendFailureEmail,
} from "../utils/sendEmail.js"; // Import all email functions

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

    // Send welcome email
    await sendWelcomeEmail(email, name);

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

// Verify email address and send success email to user
const verifyEmail = asyncHandler(async (req, res) => {
  try {
    const { verificationToken } = req.params;
    if (!verificationToken) {
      throw new ApiError(400, "Verification token is required");
    }

    // Find user by verification token
    const user = await User.findOne({ verificationToken });
    if (!user) {
      // send failure email
      await sendFailureEmail(user.email, "invalid verification token");
      throw new ApiError(400, "Invalid verification token");
    }

    // Mark user as verified
    user.isVerified = true;
    user.verificationToken = undefined; // Clear verification token
    await user.save({ validateBeforeSave: false });

    // Send success email
    await sendSuccessEmail(
      user.email,
      "Your email has been successfully verified."
    );

    return res
      .status(200)
      .json(new ApiResponse(200, null, "Email verified successfully"));
  } catch (error) {
    console.error(error);
    throw new ApiError(400, "Error verifying email");
  }
});

// Request password reset
const requestPasswordReset = asyncHandler(async (req, res) => {
  const { email } = req.body;

  // Validate input
  if (!email?.trim()) {
    throw new ApiError(400, "Email is required");
  }

  // Check if user exists
  const user = await User.findOne({ email });
  if (!user) {
    throw new ApiError(400, "No account found with that email");
  }

  // Generate password reset token
  const resetToken = jwt.sign(
    { email },
    process.env.PASSWORD_RESET_TOKEN_SECRET,
    {
      expiresIn: "1h",
    }
  );

  // Store the reset token in the user's document
  user.passwordResetToken = resetToken;
  await user.save({ validateBeforeSave: false });

  // Send password reset email
  try {
    await sendPasswordResetEmail(email, resetToken);
    return res
      .status(200)
      .json({ message: "Password reset email sent successfully." });
  } catch (error) {
    console.error("Error sending password reset email:", error);
    throw new ApiError(
      500,
      "Error sending password reset email. Please try again."
    );
  }
});

// Reset password using the token
const resetPassword = asyncHandler(async (req, res) => {
  const { resetToken, newPassword } = req.body;

  // Validate input
  if (!resetToken || !newPassword?.trim()) {
    throw new ApiError(400, "Reset token and new password are required");
  }

  // Verify reset token
  let decoded;
  try {
    decoded = jwt.verify(resetToken, process.env.PASSWORD_RESET_TOKEN_SECRET);
  } catch (error) {
    throw new ApiError(400, "Invalid or expired password reset token");
  }

  // Find user by email (decoded from the reset token)
  const user = await User.findOne({ email: decoded.email });
  if (!user) {
    throw new ApiError(400, "No account found with that email");
  }

  // Check if the token matches the stored one
  if (user.passwordResetToken !== resetToken) {
    throw new ApiError(400, "Invalid password reset token");
  }

  // Hash the new password
  const hashedPassword = await bcrypt.hash(newPassword, 12);

  // Update password and clear reset token
  user.password = hashedPassword;
  user.passwordResetToken = undefined; // Clear the reset token
  await user.save();

  // Send password reset success email
  try {
    await sendPasswordResetSuccessEmail(
      user.email,
      "Your password has been successfully reset."
    );
    return res
      .status(200)
      .json({ message: "Password has been reset successfully" });
  } catch (error) {
    console.error("Error sending password reset success email:", error);
    await sendPasswordResetFailureEmail(user.email, "failed to reset password");
    throw new ApiError(
      500,
      "Error sending confirmation email. Please try again."
    );
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

export {
  registerUser,
  verifyEmail,
  loginUser,
  logoutUser,
  refreshAccessToken,
  requestPasswordReset,
  resetPassword,
};
