import dotenv from 'dotenv';
import transporter from './Email.confiq.js'; // Corrected casing
import { Verification_Email_Template, Welcome_Email_Template } from './EmailTemplate.js'; // Corrected casing

dotenv.config(); // Ensure environment variables are loaded

// Corrected function name: sendVerificationEmail
export const sendVerificationEmail = async (email, verificationCode) => {
    try {
        const mailOptions = {
            from: `"Kaksha360" <ps19349@gmail.com>`, // Use environment variable for sender
            to: email,
            subject: 'Verify Your Email Address',
            text: `Your verification code is: ${verificationCode}`, // Plain text fallback
            html: Verification_Email_Template.replace('{verificationCode}', verificationCode),
        };
        const info = await transporter.sendMail(mailOptions);
        console.log('Verification Email sent successfully:', info.messageId);
    } catch (error) {
        console.error('Error sending verification email:', error);
        // Consider re-throwing or specific error handling if needed by the caller
    }
};

// Corrected function name: sendWelcomeEmail
export const sendWelcomeEmail = async (email, name) => {
    try {
        const mailOptions = {
            from: `"Kaksha360" <ps19349@gmail.com>`, // Use environment variable for sender
            to: email,
            subject: 'Welcome to Kaksha360!',
            text: `Welcome, ${name}! We're glad to have you.`, // Plain text fallback
            html: Welcome_Email_Template.replace('{name}', name),
        };
        const info = await transporter.sendMail(mailOptions);
        console.log('Welcome Email sent successfully:', info.messageId);
    } catch (error) {
        console.error('Error sending welcome email:', error);
        // Consider re-throwing or specific error handling if needed by the caller
    }
};
