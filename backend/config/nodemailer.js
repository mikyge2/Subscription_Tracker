// Import nodemailer library to send emails
import nodemailer from 'nodemailer';

// Import email password from environment variables
import { EMAIL_PASSWORD } from "./env.js";

// Define the email address from which emails will be sent
export const accountEmail = 'michaelgetuk@gmail.com';

// Create a transporter object using Gmail SMTP service
const transporter = nodemailer.createTransport({
    service: 'gmail',  // Use Gmail as email service provider
    auth: {
        user: accountEmail,    // Gmail account email
        pass: EMAIL_PASSWORD,  // Password or app-specific password for the Gmail account
    }
});

// Export the configured transporter for use in other modules to send emails
export default transporter;
