const CONSTANTS = require("../constants");

const generatePasswordResetTemplate = (username, resetUrl) => {
  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="text-align: center; margin-bottom: 30px;">
        <h1 style="color: #1e40af; margin: 0;">ASTUMSJ Library</h1>
        <p style="color: #6b7280; margin: 5px 0;">Password Reset Request</p>
      </div>
      
      <div style="background-color: #f8fafc; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
        <h2 style="color: #1f2937; margin-top: 0;">Hello ${username},</h2>
        <p style="color: #4b5563; line-height: 1.6;">
          We received a request to reset your password for your ASTUMSJ Library account. 
          If you made this request, click the button below to reset your password.
        </p>
      </div>
      
      <div style="text-align: center; margin: 30px 0;">
        <a href="${resetUrl}" 
           style="background-color: #1e40af; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: bold;">
          Reset Password
        </a>
      </div>
      
      <div style="background-color: #fef3c7; padding: 15px; border-radius: 6px; margin: 20px 0;">
        <p style="color: #92400e; margin: 0; font-size: 14px;">
          <strong>Important:</strong> This link will expire in ${CONSTANTS.PASSWORD_RESET.TOKEN_EXPIRY_MINUTES} minutes for security reasons.
        </p>
      </div>
      
      <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb;">
        <p style="color: #6b7280; font-size: 14px; margin: 0;">
          If you didn't request this password reset, please ignore this email. Your password will remain unchanged.
        </p>
        <p style="color: #6b7280; font-size: 14px; margin: 10px 0 0 0;">
          If the button doesn't work, copy and paste this link into your browser:<br>
          <a href="${resetUrl}" style="color: #1e40af; word-break: break-all;">${resetUrl}</a>
        </p>
      </div>
    </div>
  `;
};

module.exports = {
  generatePasswordResetTemplate
};
