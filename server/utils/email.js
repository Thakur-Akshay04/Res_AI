const nodemailer = require('nodemailer');
const logger = require('./logger');

const sendEmail = async (options) => {
  const hasSMTPConfig = 
    process.env.SMTP_HOST && 
    process.env.SMTP_PORT && 
    process.env.SMTP_USER && 
    process.env.SMTP_PASS;

  if (!hasSMTPConfig) {
    logger.warn('Email SMTP settings are not fully configured. Email was not sent through real mailer.');
    logger.info(`[EMAIL LOG MOCK]
=========================================
TO: ${options.email}
SUBJECT: ${options.subject}
MESSAGE:
${options.message}
=========================================`);
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
      from: process.env.EMAIL_FROM || 'ResuAI <noreply@resuai.com>',
      to: options.email,
      subject: options.subject,
      text: options.message,
      html: options.html,
    };

    const info = await transporter.sendMail(mailOptions);
    logger.info(`Email sent successfully: ${info.messageId}`);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    logger.error('Failed to send email: ' + error.message, error);
    throw error;
  }
};

module.exports = sendEmail;
