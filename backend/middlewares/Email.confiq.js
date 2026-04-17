// ADVISORY: Ensure EMAIL_HOST, EMAIL_PORT, EMAIL_SECURE, EMAIL_USER, EMAIL_PASS are in your .env file
import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config(); // Ensure environment variables are loaded

const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.EMAIL_PORT, 10) || 465, // Added radix for parseInt
    secure: String(process.env.EMAIL_SECURE).toLowerCase() === 'true', // Robust boolean conversion
    auth: {
        user: 'ps19349@gmail.com',
        pass: 'lfygzgbvckgntewu'
    }
});

export default transporter;
