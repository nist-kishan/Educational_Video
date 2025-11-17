import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import fs from 'fs';
import { v2 as cloudinary } from 'cloudinary';
import { supabaseAdmin } from '../config/supabase.js';
import { 
  generateAccessToken, 
  generateRefreshToken, 
  verifyRefreshToken,
  setTokenCookies,
  clearTokenCookies 
} from '../utils/jwt.js';
import { sendPasswordResetEmail, sendWelcomeEmail, sendEmailVerificationEmail, sendAccountDeletionEmail } from '../utils/email.js';

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
export const registerUser = async (req, res) => {
  try {
    console.log('🔍 Registration request body:', req.body);
    const { firstName, lastName, email, password, role = 'student' } = req.body;

    // Check if user already exists
    const { data: existingUser, error: checkError } = await supabaseAdmin
      .from('users')
      .select('email')
      .eq('email', email)
      .single();
    
    console.log('🔍 Existing user check:', { existingUser, checkError });

    if (checkError && checkError.code !== 'PGRST116') {
      console.error('❌ Database check error:', checkError);
      return res.status(500).json({
        success: false,
        message: 'Database error during user check'
      });
    }

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'User with this email already exists'
      });
    }

    // Hash password
    const saltRounds = parseInt(process.env.BCRYPT_SALT_ROUNDS) || 12;
    const hashedPassword = await bcrypt.hash(password, saltRounds);
    console.log('🔍 Password hashed successfully');

    // Create user in Supabase
    const userData = {
      first_name: firstName,
      last_name: lastName,
      email,
      password_hash: hashedPassword,
      role,
      email_verified: false,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    
    console.log('🔍 Attempting to create user with data:', { ...userData, password_hash: '[HASHED]' });
    
    const { data: newUser, error } = await supabaseAdmin
      .from('users')
      .insert([userData])
      .select()
      .single();

    console.log('🔍 Supabase response:', { newUser, error });

    if (error) {
      console.error('❌ Supabase error:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to create user account',
        error: error.message
      });
    }

    // Generate tokens
    const accessToken = generateAccessToken(newUser.id);
    const refreshToken = generateRefreshToken(newUser.id);

    // Store refresh token in database
    await supabaseAdmin
      .from('refresh_tokens')
      .insert([
        {
          user_id: newUser.id,
          token: refreshToken,
          expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString() // 7 days
        }
      ]);

    // Set httpOnly cookies
    setTokenCookies(res, accessToken, refreshToken);

    // Generate email verification token
    const verificationToken = crypto.randomBytes(32).toString('hex');
    const verificationTokenExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    // Store verification token
    await supabaseAdmin
      .from('email_verification_tokens')
      .insert([
        {
          user_id: newUser.id,
          token: verificationToken,
          expires_at: verificationTokenExpiry.toISOString(),
          used: false
        }
      ]);

    // Send verification email (don't wait for it)
    sendEmailVerificationEmail(email, verificationToken, `${firstName} ${lastName}`).catch(console.error);

    // Send welcome email (don't wait for it)
    sendWelcomeEmail(email, `${firstName} ${lastName}`, role).catch(console.error);

    // Remove password from response
    const { password: _, ...userResponse } = newUser;

    res.status(201).json({
      success: true,
      message: 'User registered successfully. Please verify your email.',
      user: userResponse,
      tokens: {
        accessToken,
        refreshToken
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error during registration'
    });
  }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Get user from database
    const { data: user, error } = await supabaseAdmin
      .from('users')
      .select('*')
      .eq('email', email)
      .single();

    if (error || !user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    // User is always active in current schema (no is_active field)

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password_hash);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    // Generate tokens
    const accessToken = generateAccessToken(user.id);
    const refreshToken = generateRefreshToken(user.id);

    // Store refresh token in database
    await supabaseAdmin
      .from('refresh_tokens')
      .insert([
        {
          user_id: user.id,
          token: refreshToken,
          expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
        }
      ]);

    // Update last login
    await supabaseAdmin
      .from('users')
      .update({ 
        last_login: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq('id', user.id);

    // Set httpOnly cookies
    setTokenCookies(res, accessToken, refreshToken);

    // Remove password from response
    const { password: _, ...userResponse } = user;

    res.json({
      success: true,
      message: 'Login successful',
      user: userResponse,
      tokens: {
        accessToken,
        refreshToken
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error during login'
    });
  }
};

// @desc    Refresh access token
// @route   POST /api/auth/refresh
// @access  Public
export const refreshToken = async (req, res) => {
  try {
    const refreshToken = req.cookies.refreshToken || req.body.refreshToken;

    if (!refreshToken) {
      return res.status(401).json({
        success: false,
        message: 'Refresh token required'
      });
    }

    // Verify refresh token
    const decoded = verifyRefreshToken(refreshToken);

    // Check if refresh token exists in database and is not expired
    const { data: tokenRecord, error } = await supabaseAdmin
      .from('refresh_tokens')
      .select('*')
      .eq('token', refreshToken)
      .eq('user_id', decoded.userId)
      .gte('expires_at', new Date().toISOString())
      .single();

    if (error || !tokenRecord) {
      return res.status(401).json({
        success: false,
        message: 'Invalid or expired refresh token'
      });
    }

    // Get user
    const { data: user, error: userError } = await supabaseAdmin
      .from('users')
      .select('*')
      .eq('id', decoded.userId)
      .single();

    if (userError || !user || !user.is_active) {
      return res.status(401).json({
        success: false,
        message: 'User not found or inactive'
      });
    }

    // Generate new tokens
    const newAccessToken = generateAccessToken(user.id);
    const newRefreshToken = generateRefreshToken(user.id);

    // Delete old refresh token and store new one
    await supabaseAdmin
      .from('refresh_tokens')
      .delete()
      .eq('token', refreshToken);

    await supabaseAdmin
      .from('refresh_tokens')
      .insert([
        {
          user_id: user.id,
          token: newRefreshToken,
          expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
        }
      ]);

    // Set new httpOnly cookies
    setTokenCookies(res, newAccessToken, newRefreshToken);

    // Remove password from response
    const { password: _, ...userResponse } = user;

    res.json({
      success: true,
      message: 'Tokens refreshed successfully',
      user: userResponse,
      tokens: {
        accessToken: newAccessToken,
        refreshToken: newRefreshToken
      }
    });
  } catch (error) {
    console.error('Token refresh error:', error);
    res.status(401).json({
      success: false,
      message: 'Invalid refresh token'
    });
  }
};

// @desc    Logout user
// @route   POST /api/auth/logout
// @access  Private
export const logoutUser = async (req, res) => {
  try {
    const refreshToken = req.cookies.refreshToken;

    // Delete refresh token from database if it exists
    if (refreshToken) {
      await supabaseAdmin
        .from('refresh_tokens')
        .delete()
        .eq('token', refreshToken);
    }

    // Clear httpOnly cookies
    clearTokenCookies(res);

    res.json({
      success: true,
      message: 'Logout successful'
    });
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error during logout'
    });
  }
};

// @desc    Get current user profile
// @route   GET /api/auth/profile
// @access  Private
export const getUserProfile = async (req, res) => {
  try {
    // Remove password from response
    const { password, ...userProfile } = req.user;

    res.json({
      success: true,
      user: userProfile
    });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// @desc    Update user profile
// @route   PUT /api/auth/profile
// @access  Private
export const updateUserProfile = async (req, res) => {
  try {
    let { firstName, lastName, name, email, phone, bio } = req.body;
    const userId = req.user.id;

    // Handle combined name field (split into first and last name)
    if (name && !firstName && !lastName) {
      const nameParts = name.trim().split(/\s+/);
      firstName = nameParts[0];
      lastName = nameParts.slice(1).join(' ') || '';
    }

    console.log('🔍 Update profile request:', { firstName, lastName, email, phone, bio });

    // Check if email is being changed and if it already exists
    if (email && email !== req.user.email) {
      const { data: existingUser } = await supabaseAdmin
        .from('users')
        .select('email')
        .eq('email', email)
        .neq('id', userId)
        .single();

      if (existingUser) {
        return res.status(400).json({
          success: false,
          message: 'Email already exists'
        });
      }
    }

    // Update user profile
    const updateData = {
      updated_at: new Date().toISOString()
    };

    if (firstName) updateData.first_name = firstName;
    if (lastName) updateData.last_name = lastName;
    if (email) updateData.email = email;
    if (phone) updateData.phone = phone;
    if (bio) updateData.bio = bio;

    const { data: updatedUser, error } = await supabaseAdmin
      .from('users')
      .update(updateData)
      .eq('id', userId)
      .select()
      .single();

    if (error) {
      console.error('Profile update error:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to update profile'
      });
    }

    // Remove password from response
    const { password: _, ...userResponse } = updatedUser;

    res.json({
      success: true,
      message: 'Profile updated successfully',
      user: userResponse
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// @desc    Change user password
// @route   PUT /api/auth/change-password
// @access  Private
export const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const userId = req.user.id;

    // Verify current password
    const isCurrentPasswordValid = await bcrypt.compare(currentPassword, req.user.password_hash);
    if (!isCurrentPasswordValid) {
      return res.status(400).json({
        success: false,
        message: 'Current password is incorrect'
      });
    }

    // Hash new password
    const saltRounds = parseInt(process.env.BCRYPT_SALT_ROUNDS) || 12;
    const hashedNewPassword = await bcrypt.hash(newPassword, saltRounds);

    // Update password in database
    const { error } = await supabaseAdmin
      .from('users')
      .update({ 
        password_hash: hashedNewPassword,
        updated_at: new Date().toISOString()
      })
      .eq('id', userId);

    if (error) {
      console.error('Password change error:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to change password'
      });
    }

    // Invalidate all refresh tokens for this user
    await supabaseAdmin
      .from('refresh_tokens')
      .delete()
      .eq('user_id', userId);

    res.json({
      success: true,
      message: 'Password changed successfully. Please login again.'
    });
  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// @desc    Send password reset email
// @route   POST /api/auth/forgot-password
// @access  Public
export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    // Check if user exists
    const { data: user, error } = await supabaseAdmin
      .from('users')
      .select('id, name, email')
      .eq('email', email)
      .single();

    // Always return success to prevent email enumeration
    if (error || !user) {
      return res.json({
        success: true,
        message: 'If an account with that email exists, a password reset link has been sent.'
      });
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetTokenExpiry = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    // Store reset token in database
    await supabaseAdmin
      .from('password_reset_tokens')
      .insert([
        {
          user_id: user.id,
          token: resetToken,
          expires_at: resetTokenExpiry.toISOString(),
          used: false
        }
      ]);

    // Send password reset email
    const emailResult = await sendPasswordResetEmail(email, resetToken, `${user.first_name} ${user.last_name}`);
    
    if (!emailResult.success) {
      console.error('Failed to send password reset email:', emailResult.error);
    }

    res.json({
      success: true,
      message: 'If an account with that email exists, a password reset link has been sent.'
    });
  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// @desc    Reset password with token
// @route   POST /api/auth/reset-password
// @access  Public
export const resetPassword = async (req, res) => {
  try {
    const { token, password } = req.body;

    // Find valid reset token
    const { data: resetTokenRecord, error } = await supabaseAdmin
      .from('password_reset_tokens')
      .select('*')
      .eq('token', token)
      .eq('used', false)
      .gte('expires_at', new Date().toISOString())
      .single();

    if (error || !resetTokenRecord) {
      return res.status(400).json({
        success: false,
        message: 'Invalid or expired reset token'
      });
    }

    // Hash new password
    const saltRounds = parseInt(process.env.BCRYPT_SALT_ROUNDS) || 12;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Update user password
    const { error: updateError } = await supabaseAdmin
      .from('users')
      .update({ 
        password: hashedPassword,
        updated_at: new Date().toISOString()
      })
      .eq('id', resetTokenRecord.user_id);

    if (updateError) {
      console.error('Password reset error:', updateError);
      return res.status(500).json({
        success: false,
        message: 'Failed to reset password'
      });
    }

    // Mark reset token as used
    await supabaseAdmin
      .from('password_reset_tokens')
      .update({ used: true })
      .eq('token', token);

    // Invalidate all refresh tokens for this user
    await supabaseAdmin
      .from('refresh_tokens')
      .delete()
      .eq('user_id', resetTokenRecord.user_id);

    res.json({
      success: true,
      message: 'Password reset successfully. Please login with your new password.'
    });
  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// @desc    Verify email with token
// @route   POST /api/auth/verify-email
// @access  Public
export const verifyEmail = async (req, res) => {
  try {
    const { token } = req.body;

    // Find valid verification token
    const { data: verificationTokenRecord, error } = await supabaseAdmin
      .from('email_verification_tokens')
      .select('*')
      .eq('token', token)
      .eq('used', false)
      .gte('expires_at', new Date().toISOString())
      .single();

    if (error || !verificationTokenRecord) {
      return res.status(400).json({
        success: false,
        message: 'Invalid or expired verification token'
      });
    }

    // Update user email_verified status
    const { error: updateError } = await supabaseAdmin
      .from('users')
      .update({ 
        email_verified: true,
        updated_at: new Date().toISOString()
      })
      .eq('id', verificationTokenRecord.user_id);

    if (updateError) {
      console.error('Email verification error:', updateError);
      return res.status(500).json({
        success: false,
        message: 'Failed to verify email'
      });
    }

    // Mark verification token as used
    await supabaseAdmin
      .from('email_verification_tokens')
      .update({ used: true })
      .eq('token', token);

    res.json({
      success: true,
      message: 'Email verified successfully'
    });
  } catch (error) {
    console.error('Email verification error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// @desc    Resend email verification
// @route   POST /api/auth/resend-verification-email
// @access  Public
export const resendVerificationEmail = async (req, res) => {
  try {
    const { email } = req.body;

    // Check if user exists
    const { data: user, error } = await supabaseAdmin
      .from('users')
      .select('id, name, email, email_verified')
      .eq('email', email)
      .single();

    if (error || !user) {
      return res.json({
        success: true,
        message: 'If an account with that email exists, a verification email has been sent.'
      });
    }

    // Check if email is already verified
    if (user.email_verified) {
      return res.status(400).json({
        success: false,
        message: 'Email is already verified'
      });
    }

    // Generate verification token
    const verificationToken = crypto.randomBytes(32).toString('hex');
    const verificationTokenExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    // Delete old verification tokens for this user
    await supabaseAdmin
      .from('email_verification_tokens')
      .delete()
      .eq('user_id', user.id);

    // Store new verification token
    await supabaseAdmin
      .from('email_verification_tokens')
      .insert([
        {
          user_id: user.id,
          token: verificationToken,
          expires_at: verificationTokenExpiry.toISOString(),
          used: false
        }
      ]);

    // Send verification email
    const emailResult = await sendEmailVerificationEmail(email, verificationToken, `${user.first_name} ${user.last_name}`);
    
    if (!emailResult.success) {
      console.error('Failed to send verification email:', emailResult.error);
    }

    res.json({
      success: true,
      message: 'If an account with that email exists, a verification email has been sent.'
    });
  } catch (error) {
    console.error('Resend verification email error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// @desc    Delete user account
// @route   DELETE /api/auth/account
// @access  Private
export const deleteAccount = async (req, res) => {
  try {
    const { password } = req.body;
    const userId = req.user.id;

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, req.user.password_hash);
    if (!isPasswordValid) {
      return res.status(400).json({
        success: false,
        message: 'Invalid password'
      });
    }

    // Get user email before deletion
    const userEmail = req.user.email;
    const userName = `${req.user.first_name} ${req.user.last_name}`;

    // Delete all user data (cascading deletes will handle related records)
    const { error } = await supabaseAdmin
      .from('users')
      .delete()
      .eq('id', userId);

    if (error) {
      console.error('Account deletion error:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to delete account'
      });
    }

    // Clear httpOnly cookies
    clearTokenCookies(res);

    // Send account deletion confirmation email (don't wait for it)
    sendAccountDeletionEmail(userEmail, userName).catch(console.error);

    res.json({
      success: true,
      message: 'Account deleted successfully. A confirmation email has been sent.'
    });
  } catch (error) {
    console.error('Delete account error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// @desc    Upload profile picture
// @route   POST /api/auth/upload-profile-picture
// @access  Private
export const uploadProfilePicture = async (req, res) => {
  try {
    const userId = req.user.id;
    
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No image file provided'
      });
    }

    console.log('📸 Profile picture upload request:');
    console.log('- User ID:', userId);
    console.log('- File:', {
      fieldname: req.file.fieldname,
      originalname: req.file.originalname,
      mimetype: req.file.mimetype,
      size: req.file.size,
      path: req.file.path
    });

    // Validate file type
    const allowedMimes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (!allowedMimes.includes(req.file.mimetype)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid file type. Only JPEG, PNG, GIF, and WebP are allowed.'
      });
    }

    // Validate file size (max 5MB)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (req.file.size > maxSize) {
      return res.status(400).json({
        success: false,
        message: 'File size exceeds 5MB limit'
      });
    }

    // Upload to Cloudinary
    console.log('☁️ Uploading to Cloudinary...');
    console.log('- File path:', req.file.path);
    console.log('- File size:', req.file.size);
    
    const uploadResult = await cloudinary.uploader.upload(req.file.path, {
      resource_type: 'image',
      folder: 'profile_pictures',
      public_id: `user_${userId}`,
      overwrite: true,
      quality: 'auto',
      fetch_format: 'auto'
    });

    console.log('☁️ Cloudinary upload successful:');
    console.log('- URL:', uploadResult.secure_url);
    console.log('- Public ID:', uploadResult.public_id);

    // Update user profile with avatar URL
    console.log('💾 Updating database with avatar URL...');
    const { data: updatedUser, error } = await supabaseAdmin
      .from('users')
      .update({
        avatar_url: uploadResult.secure_url,
        updated_at: new Date().toISOString()
      })
      .eq('id', userId)
      .select()
      .single();

    if (error) {
      console.error('❌ Database update error:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to update profile picture'
      });
    }

    // Delete local file
    console.log('🗑️ Deleting local file...');
    if (fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
      console.log('✅ Local file deleted');
    }

    // Remove password from response
    const { password: _, ...userResponse } = updatedUser;

    console.log('✅ Profile picture uploaded successfully');

    res.json({
      success: true,
      message: 'Profile picture updated successfully',
      user: userResponse,
      avatarUrl: uploadResult.secure_url
    });
  } catch (error) {
    console.error('❌ Profile picture upload error:', error);
    console.error('❌ Error message:', error.message);
    console.error('❌ Error stack:', error.stack);
    
    // Delete local file on error
    if (req.file) {
      try {
        if (fs.existsSync(req.file.path)) {
          fs.unlinkSync(req.file.path);
          console.log('🗑️ Local file deleted on error');
        }
      } catch (e) {
        console.error('Error deleting file:', e);
      }
    }

    res.status(500).json({
      success: false,
      message: 'Failed to upload profile picture',
      error: error.message
    });
  }
};
