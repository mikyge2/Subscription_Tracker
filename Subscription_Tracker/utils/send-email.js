import { emailTemplates } from './email.template.js';
import dayjs from 'dayjs';
import transporter, { accountEmail } from '../config/nodemailer.js';

/**
 * Send a reminder email based on subscription details and email type
 * @param {Object} params - Function parameters
 * @param {string} params.to - Recipient email address
 * @param {string} params.type - Type/label of email template to use
 * @param {Object} params.subscription - Subscription data containing user & subscription info
 */
export const sendReminderEmail = async ({ to, type, subscription }) => {
    // Ensure required parameters are provided
    if (!to || !type) throw new Error('Missing required parameters');

    // Find the email template matching the requested type
    const template = emailTemplates.find((t) => t.label === type);

    // Throw error if no matching template found
    if (!template) throw new Error('Invalid email type');

    // Prepare dynamic data to populate template placeholders
    const mailInfo = {
        userName: subscription.user.name,
        subscriptionName: subscription.name,
        renewalDate: dayjs(subscription.renewalDate).format('MMM D, YYYY'),
        planName: subscription.name,
        price: `${subscription.currency} ${subscription.price} (${subscription.frequency})`,
        paymentMethod: subscription.payment,
    };

    // Generate email HTML body and subject using the selected template and data
    const message = template.generateBody(mailInfo);
    const subject = template.generateSubject(mailInfo);

    // Setup email options object
    const mailOptions = {
        from: accountEmail,  // Sender email address configured in nodemailer
        to: to,              // Recipient email address
        subject: subject,    // Email subject line
        html: message,       // Email content in HTML format
    };

    // Send the email using nodemailer transporter
    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            // Log error if sending fails
            return console.log(error, 'Error sending email');
        }
        // Log confirmation when email is sent successfully
        console.log('Email sent: ' + info.response);
    });
};
