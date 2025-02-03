import { asyncHandler } from "../libs/asyncHandler.js";
import { ApiError } from "../libs/ApiError.js";
import { User } from "../models/user.model.js";
import { ApiResponse } from "../libs/ApiResponse.js";
import { sendPasswordChangeEmail, sendProfileUpdateEmail } from "../utils/sendEmail.js"; // for sending profile update email

// Update user profile (name, email, etc.)
const updateProfile = asyncHandler(async (req, res) => {
  const { name, email } = req.body;
  const user = await User.findById(req.user._id);

  if (!user) {
    throw new ApiError(404, "User not found");
  }

  // Update name and email (add validation if necessary)
  user.name = name || user.name;
  user.email = email || user.email;

  await user.save();

  // Send profile update email
  await sendProfileUpdateEmail(user.email, user.name);

  return res
    .status(200)
    .json(new ApiResponse(200, user, "Profile updated successfully"));
});

// Change user password
const changePassword = asyncHandler(async (req, res) => {
  const { oldPassword, newPassword } = req.body;
  const user = await User.findById(req.user._id);

  if (!user) {
    throw new ApiError(404, "User not found");
  }

  // Check if the old password is correct
  const isPasswordCorrect = await user.isPasswordCorrect(oldPassword);
  if (!isPasswordCorrect) {
    throw new ApiError(400, "Incorrect old password");
  }

  // Update the password
  user.password = newPassword; // Ensure to hash it
  await user.save();

  await sendPasswordChangeEmail(user.email, user.name);

  return res
    .status(200)
    .json(new ApiResponse(200, null, "Password changed successfully"));
});

// Delete user account
const deleteUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);

  if (!user) {
    throw new ApiError(404, "User not found");
  }

  await user.remove();

  // Send account deletion email
  await sendAccountDeletionEmail(user.email, user.name);

  return res
    .status(200)
    .json(new ApiResponse(200, null, "User account deleted successfully"));
});

export { updateProfile, changePassword, deleteUser };
