const nodemailer = require('nodemailer');
const logger = require('./logger');

// Masks email for safe logging — no regex to avoid ReDoS risk.
// where two overlapping .* quantifiers cause catastrophic backtracking on inputs
// that contain no '@' character.
const maskEmail = (email) => {
  const str = String(email);
  const atIdx = str.indexOf('@');
  if (atIdx < 0) return '**';
  return str.slice(0, Math.min(2, atIdx)) + '***' + str.slice(atIdx);
};

const sendEmail = async (options) => {
  const hasSMTPConfig = 
    process.env.SMTP_HOST && 
    process.env.SMTP_PORT && 
    process.env.SMTP_USER && 
    process.env.SMTP_PASS;

  if (!hasSMTPConfig) {
    logger.warn('Email SMTP settings are not fully configured. Email was not sent through real mailer.');
    logger.info({
      message: '[EMAIL LOG MOCK] Email not sent — SMTP not configured',
      to: maskEmail(options.email),
      subject: String(options.subject).replace(/[\n\r]/g, '_'),
      body: String(options.message).replace(/[\n\r]/g, ' ')
    });
    return { success: false, mock: true };
  }

  try {
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT, 10) || 587,
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    const mailOptions = {
      from: process.env.EMAIL_FROM || 'ResuCraft <noreply@resucraft.com>',
      to: options.email,
      subject: options.subject,
      text: options.message,
      html: options.html,
    };

    const info = await transporter.sendMail(mailOptions);
    logger.info({ message: 'Email sent successfully', messageId: String(info.messageId) });
    return { success: true, messageId: info.messageId };
  } catch (error) {
    logger.error({ message: 'Failed to send email', error: error.message });
    throw error;
  }
};

module.exports = sendEmail;
