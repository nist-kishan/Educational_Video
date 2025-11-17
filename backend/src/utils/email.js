import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

// Brevo API configuration
const BREVO_API_URL = 'https://api.brevo.com/v3/smtp/email';
const BREVO_API_KEY = process.env.BREVO_API_KEY;

// Send email via Brevo
export const sendEmail = async (to, subject, html) => {
  try {
    if (!BREVO_API_KEY) {
      console.error('Brevo API key not configured');
      return { success: false, error: 'Email service not configured' };
    }

    const response = await axios.post(
      BREVO_API_URL,
      {
        sender: {
          name: process.env.EMAIL_FROM_NAME || 'Educational Video Platform',
          email: process.env.EMAIL_FROM || 'noreply@eduplatform.com'
        },
        to: [{ email: to }],
        subject,
        htmlContent: html
      },
      {
        headers: {
          'api-key': BREVO_API_KEY,
          'Content-Type': 'application/json'
        }
      }
    );

    console.log('Email sent successfully via Brevo:', response.data.messageId);
    return { success: true, messageId: response.data.messageId };
  } catch (error) {
    console.error('Email sending failed:', error.response?.data || error.message);
    return { success: false, error: error.response?.data?.message || error.message };
  }
};

// Send password reset email
export const sendPasswordResetEmail = async (email, resetToken, userName) => {
  const resetUrl = `${process.env.CLIENT_URL}/reset-password?token=${resetToken}`;
  
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Password Reset Request</title>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
        .button { display: inline-block; background: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
        .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
        .warning { background: #fff3cd; border: 1px solid #ffeaa7; padding: 15px; border-radius: 5px; margin: 20px 0; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>🔐 Password Reset Request</h1>
        </div>
        <div class="content">
          <p>Hello ${userName},</p>
          
          <p>We received a request to reset your password for your Educational Video Platform account.</p>
          
          <p>Click the button below to reset your password:</p>
          
          <a href="${resetUrl}" class="button">Reset Password</a>
          
          <p>Or copy and paste this link into your browser:</p>
          <p style="word-break: break-all; background: #f4f4f4; padding: 10px; border-radius: 5px;">${resetUrl}</p>
          
          <div class="warning">
            <strong>⚠️ Important:</strong>
            <ul>
              <li>This link will expire in 1 hour for security reasons</li>
              <li>If you didn't request this reset, please ignore this email</li>
              <li>Your password will remain unchanged until you create a new one</li>
            </ul>
          </div>
          
          <p>If you have any questions, please contact our support team.</p>
          
          <p>Best regards,<br>Educational Video Platform Team</p>
        </div>
        <div class="footer">
          <p>This is an automated email. Please do not reply to this email.</p>
          <p>&copy; ${new Date().getFullYear()} Educational Video Platform. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `;

  return await sendEmail(email, 'Password Reset Request - Educational Video Platform', html);
};

// Send welcome email
export const sendWelcomeEmail = async (email, userName, role) => {
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Welcome to Educational Video Platform</title>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
        .button { display: inline-block; background: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
        .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
        .features { background: white; padding: 20px; border-radius: 5px; margin: 20px 0; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>🎉 Welcome to Educational Video Platform!</h1>
        </div>
        <div class="content">
          <p>Hello ${userName},</p>
          
          <p>Welcome to Educational Video Platform! We're excited to have you join our community as a <strong>${role}</strong>.</p>
          
          <div class="features">
            <h3>🚀 What you can do now:</h3>
            <ul>
              ${role === 'student' ? `
                <li>📚 Browse and enroll in courses</li>
                <li>📹 Watch video lessons</li>
                <li>📊 Track your learning progress</li>
                <li>🏆 Earn certificates</li>
              ` : role === 'tutor' ? `
                <li>📚 Create and manage courses</li>
                <li>📹 Upload video content</li>
                <li>👥 Manage student enrollments</li>
                <li>📊 View course analytics</li>
              ` : `
                <li>👥 Manage all users</li>
                <li>📚 Oversee all courses</li>
                <li>📊 Access platform analytics</li>
                <li>⚙️ Configure platform settings</li>
              `}
            </ul>
          </div>
          
          <p>Ready to get started?</p>
          
          <a href="${process.env.CLIENT_URL}/dashboard" class="button">Go to Dashboard</a>
          
          <p>If you have any questions, our support team is here to help!</p>
          
          <p>Happy learning!<br>Educational Video Platform Team</p>
        </div>
        <div class="footer">
          <p>&copy; ${new Date().getFullYear()} Educational Video Platform. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `;

  return await sendEmail(email, 'Welcome to Educational Video Platform! 🎉', html);
};

// Send email verification email
export const sendEmailVerificationEmail = async (email, verificationToken, userName) => {
  const verificationUrl = `${process.env.CLIENT_URL}/verify-email?token=${verificationToken}`;
  
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Verify Your Email</title>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
        .button { display: inline-block; background: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
        .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
        .info { background: #e3f2fd; border: 1px solid #90caf9; padding: 15px; border-radius: 5px; margin: 20px 0; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>✉️ Verify Your Email Address</h1>
        </div>
        <div class="content">
          <p>Hello ${userName},</p>
          
          <p>Thank you for registering with Educational Video Platform! To complete your account setup, please verify your email address.</p>
          
          <p>Click the button below to verify your email:</p>
          
          <a href="${verificationUrl}" class="button">Verify Email</a>
          
          <p>Or copy and paste this link into your browser:</p>
          <p style="word-break: break-all; background: #f4f4f4; padding: 10px; border-radius: 5px;">${verificationUrl}</p>
          
          <div class="info">
            <strong>ℹ️ Note:</strong>
            <ul>
              <li>This verification link will expire in 24 hours</li>
              <li>You can request a new verification email if this one expires</li>
              <li>Some features may be limited until you verify your email</li>
            </ul>
          </div>
          
          <p>If you didn't create this account, please ignore this email.</p>
          
          <p>Best regards,<br>Educational Video Platform Team</p>
        </div>
        <div class="footer">
          <p>This is an automated email. Please do not reply to this email.</p>
          <p>&copy; ${new Date().getFullYear()} Educational Video Platform. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `;

  return await sendEmail(email, 'Verify Your Email - Educational Video Platform', html);
};

// Send account deletion confirmation email
export const sendAccountDeletionEmail = async (email, userName) => {
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Account Deleted</title>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
        .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
        .warning { background: #ffebee; border: 1px solid #ef9a9a; padding: 15px; border-radius: 5px; margin: 20px 0; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>👋 Account Deleted</h1>
        </div>
        <div class="content">
          <p>Hello ${userName},</p>
          
          <p>Your Educational Video Platform account has been successfully deleted.</p>
          
          <div class="warning">
            <strong>⚠️ Important:</strong>
            <ul>
              <li>All your personal data has been permanently removed</li>
              <li>Your course enrollments have been cancelled</li>
              <li>This action cannot be undone</li>
            </ul>
          </div>
          
          <p>If you didn't request this deletion or have any questions, please contact our support team immediately.</p>
          
          <p>We hope to see you again in the future!</p>
          
          <p>Best regards,<br>Educational Video Platform Team</p>
        </div>
        <div class="footer">
          <p>&copy; ${new Date().getFullYear()} Educational Video Platform. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `;

  return await sendEmail(email, 'Account Deleted - Educational Video Platform', html);
};
