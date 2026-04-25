const SibApiV3Sdk = require('sib-api-v3-sdk');

// Initialize Brevo SDK
const defaultClient = SibApiV3Sdk.ApiClient.instance;
const apiKey = defaultClient.authentications['api-key'];
apiKey.apiKey = process.env.BREVO_API_KEY;

const apiInstance = new SibApiV3Sdk.TransactionalEmailsApi();

/**
 * Reusable function to send an email via Brevo
 * @param {Object} options - Email options { to: string, subject: string, html: string }
 * @returns {Promise<Object>} API response
 */
exports.sendEmail = async ({ to, subject, html }) => {
  try {
    if (!process.env.BREVO_API_KEY) {
      console.warn('BREVO_API_KEY is not defined. Email will not be sent.');
      return null;
    }

    const sendSmtpEmail = new SibApiV3Sdk.SendSmtpEmail();

    sendSmtpEmail.subject = subject;
    sendSmtpEmail.htmlContent = html;
    sendSmtpEmail.sender = {
      name: 'Leo Club Recruitment',
      email: 'leoclub.recrutement2026@gmail.com'
    };
    sendSmtpEmail.to = [{ email: to }];

    console.log(`Sending email to ${to} using Brevo...`);
    const result = await apiInstance.sendTransacEmail(sendSmtpEmail);
    console.log(`Email successfully sent to ${to}. Message ID: ${result.messageId}`);
    return result;
  } catch (error) {
    console.error('Error sending email with Brevo:', error.response?.body || error.message);
    throw new Error('Failed to send email');
  }
};
