import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  service: "Gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// Send a welcome email to the user
export const sendWelcomeEmail = async (email, name) => {
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: "Welcome to our website!",
    html: `<p>Welcome, ${name}!</p>
           <p>Thank you for joining our community.</p>`,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log("Welcome email sent");
  } catch (error) {
    console.error("Error sending welcome email:", error);
  }
};

// Send a verification email to the user
export const sendVerificationEmail = async (email, token) => {
  const verificationLink = `${process.env.FRONTEND_URL}/verify-email?token=${token}`;

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: "Verify Your Email",
    html: `<p>Click the link below to verify your email:</p>
           <a href="${verificationLink}">${verificationLink}</a>`,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log("Verification email sent");
  } catch (error) {
    console.error("Error sending verification email:", error);
  }
};

// Send a success email to when user is verified
export const sendSuccessEmail = async (email, message) => {
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: "Success your email has been verified",
    html: `<p>${message}</p>`,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log("Success email sent");
  } catch (error) {
    console.error("Error sending success email:", error);
  }
};

// Send a failure email to the user when verification fails
export const sendFailureEmail = async (email, message) => {
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: "Failed to verify your email",
    html: `<p>${message}</p>`,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log("Failure email sent");
  } catch (error) {
    console.error("Error sending failure email:", error);
  }
};

// Send a password reset email to the user
export const sendPasswordResetEmail = async (email, token) => {
  const resetLink = `${process.env.FRONTEND_URL}/reset-password?token=${token}`;

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: "Reset Your Password",
    html: `<p>Click the link below to reset your password:</p>
           <a href="${resetLink}">${resetLink}</a>`,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log("Password reset email sent");
  } catch (error) {
    console.error("Error sending password reset email:", error);
  }
};

// Send a password reset success email to the user
export const sendPasswordResetSuccessEmail = async (email, message) => {
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: "Success your password has been reset",
    html: `<p>${message}</p>`,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log("Password reset success email sent");
  } catch (error) {
    console.error("Error sending password reset success email:", error);
  }
};

// Send a password reset failure email to the user
export const sendPasswordResetFailureEmail = async (email, message) => {
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: "Failed to reset your password",
    html: `<p>${message}</p>`,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log("Password reset failure email sent");
  } catch (error) {
    console.error("Error sending password reset failure email:", error);
  }
};

// Send profile update email to user
export const sendProfileUpdateEmail = async (email, name) => {
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: "Your profile has been updated",
    html: `<p>Dear ${name},</p>
           <p>Your profile has been successfully updated. If you did not make this change, please contact us immediately.</p>`,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log("Profile update email sent");
  } catch (error) {
    console.error("Error sending profile update email:", error);
  }
};

// Send account deletion email to user
export const sendAccountDeletionEmail = async (email, name) => {
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: "Your account has been deleted",
    html: `<p>Dear ${name},</p>
           <p>We regret to inform you that your account has been permanently deleted. If you did not request this, please contact support immediately.</p>`,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log("Account deletion email sent");
  } catch (error) {
    console.error("Error sending account deletion email:", error);
  }
};

// Send mail user exsisting password have been changed from user profile
export const sendPasswordChangeEmail = async (email, name) => {
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: "Your password has been changed",
    html: `<p>Dear ${name},</p>
           <p>Your password has been successfully changed. If you did not make this change, please contact us immediately.</p>`,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log("Password change email sent");
  } catch (error) {
    console.error("Error sending password change email:", error);
  }
};











