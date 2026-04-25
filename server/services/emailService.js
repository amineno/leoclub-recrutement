const nodemailer = require('nodemailer');

// Initialize Nodemailer transporter with Gmail SMTP
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.GMAIL_EMAIL,       // e.g. leoclub.recrutement2026@gmail.com
    pass: process.env.GMAIL_APP_PASSWORD // 16-character app password (NOT your real password)
  }
});

/**
 * Reusable function to send an email via Nodemailer
 * @param {Object} options - Email options { to: string, subject: string, html: string }
 * @returns {Promise<Object>} API response
 */
exports.sendEmail = async ({ to, subject, html }) => {
  try {
    if (!process.env.GMAIL_EMAIL || !process.env.GMAIL_APP_PASSWORD) {
      console.warn('GMAIL_EMAIL or GMAIL_APP_PASSWORD is not defined in .env! Email will not be sent.');
      return null;
    }

    const mailOptions = {
      from: `"Leo Club Recruitment" <${process.env.GMAIL_EMAIL}>`, // Sender identity
      to, // Receiver
      subject,
      html
    };

    console.log(`Sending email to ${to} using Nodemailer...`);
    const info = await transporter.sendMail(mailOptions);
    console.log(`Email successfully sent! Message ID: ${info.messageId}`);
    return info;
  } catch (error) {
    console.error('Error sending email with Nodemailer:', error.message);
    throw new Error('Failed to send email');
  }
};
