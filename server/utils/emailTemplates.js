/**
 * Email template generators for Res_AI
 */

/**
 * Returns the HTML email template for password reset requests
 * @param {string} resetUrl - The password reset link
 * @returns {string} HTML string
 */
const getPasswordResetTemplate = (resetUrl) => `
  <div style="font-family: 'Inter', Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e5e7eb; border-radius: 12px; background-color: #ffffff;">
    <h2 style="color: #111827; font-size: 24px; font-weight: 700; margin-bottom: 16px;">Password Reset Request</h2>
    <p style="color: #4b5563; font-size: 16px; line-height: 1.5; margin-bottom: 24px;">
      You requested to reset your ResuAI password. Click the button below to choose a new password. This link is only valid for 15 minutes.
    </p>
    <div style="text-align: center; margin-bottom: 24px;">
      <a href="${resetUrl}" style="background-color: #4f46e5; color: #ffffff; padding: 12px 24px; font-size: 16px; font-weight: 600; text-decoration: none; border-radius: 8px; display: inline-block;">
        Reset Password
      </a>
    </div>
    <p style="color: #6b7280; font-size: 14px; margin-bottom: 24px;">
      If the button above doesn't work, copy and paste this URL into your browser:
    </p>
    <p style="word-break: break-all; background-color: #f3f4f6; padding: 12px; border-radius: 6px; font-family: monospace; font-size: 14px; color: #374151; margin-bottom: 24px;">
      ${resetUrl}
    </p>
    <hr style="border: 0; border-top: 1px solid #e5e7eb; margin-bottom: 24px;" />
    <p style="color: #9ca3af; font-size: 12px;">
      If you did not request a password reset, you can safely ignore this email.
    </p>
  </div>
`;

module.exports = {
  getPasswordResetTemplate
};
