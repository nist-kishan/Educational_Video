import { body, validationResult } from 'express-validator';

// Handle validation errors
export const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    console.log('❌ Validation errors:', errors.array());
    console.log('❌ Request body:', req.body);
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array().map(error => ({
        field: error.path,
        message: error.msg,
        value: error.value
      }))
    });
  }
  console.log('✅ Validation passed');
  next();
};

// Register validation rules
export const validateRegister = [
  body('firstName')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('First name must be between 2 and 50 characters')
    .matches(/^[a-zA-Z\s]+$/)
    .withMessage('First name can only contain letters and spaces'),
  
  body('lastName')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Last name must be between 2 and 50 characters')
    .matches(/^[a-zA-Z\s]+$/)
    .withMessage('Last name can only contain letters and spaces'),
  
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email address'),
  
  body('password')
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters long')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]+$/)
    .withMessage('Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character'),
  
  body('role')
    .optional()
    .isIn(['student', 'tutor'])
    .withMessage('Role must be either student or tutor'),
  
  handleValidationErrors
];

// Login validation rules
export const validateLogin = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email address'),
  
  body('password')
    .notEmpty()
    .withMessage('Password is required'),
  
  handleValidationErrors
];

// Update profile validation rules
export const validateUpdateProfile = [
  body('name')
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Name must be between 2 and 50 characters')
    .matches(/^[a-zA-Z\s]+$/)
    .withMessage('Name can only contain letters and spaces'),
  
  body('email')
    .optional()
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email address'),
  
  body('phone')
    .optional()
    .isMobilePhone()
    .withMessage('Please provide a valid phone number'),
  
  body('bio')
    .optional()
    .isLength({ max: 500 })
    .withMessage('Bio cannot exceed 500 characters'),
  
  handleValidationErrors
];

// Change password validation rules
export const validateChangePassword = [
  body('currentPassword')
    .notEmpty()
    .withMessage('Current password is required'),
  
  body('newPassword')
    .isLength({ min: 8 })
    .withMessage('New password must be at least 8 characters long')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]+$/)
    .withMessage('New password must contain at least one uppercase letter, one lowercase letter, one number, and one special character'),
  
  body('confirmPassword')
    .custom((value, { req }) => {
      if (value !== req.body.newPassword) {
        throw new Error('Password confirmation does not match new password');
      }
      return true;
    }),
  
  handleValidationErrors
];

// Forgot password validation rules
export const validateForgotPassword = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email address'),
  
  handleValidationErrors
];

// Reset password validation rules
export const validateResetPassword = [
  body('token')
    .notEmpty()
    .withMessage('Reset token is required'),
  
  body('password')
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters long')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]+$/)
    .withMessage('Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character'),
  
  body('confirmPassword')
    .custom((value, { req }) => {
      if (value !== req.body.password) {
        throw new Error('Password confirmation does not match password');
      }
      return true;
    }),
  
  handleValidationErrors
];

// Verify email validation rules
export const validateVerifyEmail = [
  body('token')
    .notEmpty()
    .withMessage('Verification token is required'),
  
  handleValidationErrors
];

// Resend verification email validation rules
export const validateResendVerificationEmail = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email address'),
  
  handleValidationErrors
];

// Delete account validation rules
export const validateDeleteAccount = [
  body('password')
    .notEmpty()
    .withMessage('Password is required to delete account'),
  
  handleValidationErrors
];

// Course validation rules
export const validateCourse = [
  body('name')
    .trim()
    .isLength({ min: 3, max: 100 })
    .withMessage('Course name must be between 3 and 100 characters'),
  
  body('description')
    .trim()
    .isLength({ min: 3, max: 1000 })
    .withMessage('Description must be between 3 and 1000 characters'),
  
  body('price')
    .isFloat({ min: 0 })
    .withMessage('Price must be a valid number greater than or equal to 0'),
  
  body('category')
    .trim()
    .notEmpty()
    .withMessage('Category is required'),
  
  body('playlist_name')
    .trim()
    .matches(/^[a-zA-Z0-9_]+$/)
    .withMessage('Playlist name can only contain letters, numbers, and underscores')
    .isLength({ min: 3, max: 50 })
    .withMessage('Playlist name must be between 3 and 50 characters'),
  
  body('prerequisites')
    .optional()
    .isArray()
    .withMessage('Prerequisites must be an array'),
  
  body('syllabus')
    .optional()
    .isArray()
    .withMessage('Syllabus must be an array'),
  
  body('motive')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Motive must not exceed 500 characters'),
  
  body('modules')
    .optional()
    .isArray()
    .withMessage('Modules must be an array'),
  
  // Validate modules array content if provided
  body('modules.*.title')
    .if(body('modules').exists())
    .trim()
    .isLength({ min: 3, max: 100 })
    .withMessage('Module title must be between 3 and 100 characters'),
  
  body('modules.*.videos')
    .optional()
    .isArray()
    .withMessage('Module videos must be an array'),
  
  body('modules.*.videos.*.title')
    .if(body('modules.*.videos').exists())
    .trim()
    .isLength({ min: 3, max: 100 })
    .withMessage('Video title must be between 3 and 100 characters'),
  
  body('modules.*.videos.*.duration')
    .if(body('modules.*.videos').exists())
    .isInt({ min: 0 })
    .withMessage('Video duration must be a positive integer'),
  
  body('modules.*.assignments')
    .optional()
    .isArray()
    .withMessage('Module assignments must be an array'),
  
  body('modules.*.assignments.*.title')
    .if(body('modules.*.assignments').exists())
    .trim()
    .isLength({ min: 3, max: 100 })
    .withMessage('Assignment title must be between 3 and 100 characters'),
  
  body('modules.*.assignments.*.instructions')
    .if(body('modules.*.assignments').exists())
    .trim()
    .isLength({ min: 10, max: 2000 })
    .withMessage('Assignment instructions must be between 10 and 2000 characters'),
  
  handleValidationErrors
];

// Video validation rules
export const validateVideo = [
  body('title')
    .trim()
    .isLength({ min: 3, max: 100 })
    .withMessage('Video title must be between 3 and 100 characters'),
  
  body('url')
    .trim()
    .isURL()
    .withMessage('Please provide a valid video URL'),
  
  body('duration')
    .isInt({ min: 1 })
    .withMessage('Duration must be a positive integer (in seconds)'),
  
  body('description')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Description must not exceed 500 characters'),
  
  body('order')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Order must be a positive integer'),
  
  handleValidationErrors
];

// Assignment validation rules
export const validateAssignment = [
  body('title')
    .trim()
    .notEmpty()
    .withMessage('Assignment title is required')
    .isLength({ min: 3, max: 100 })
    .withMessage('Assignment title must be between 3 and 100 characters'),
  
  body('instructions')
    .trim()
    .notEmpty()
    .withMessage('Instructions are required')
    .isLength({ min: 3, max: 2000 })
    .withMessage('Instructions must be between 3 and 2000 characters'),
  
  body('description')
    .optional({ checkFalsy: true })
    .trim()
    .isLength({ max: 500 })
    .withMessage('Description must not exceed 500 characters'),
  
  body('dueDate')
    .optional({ checkFalsy: true })
    .custom((value) => {
      if (value && isNaN(Date.parse(value))) {
        throw new Error('Due date must be a valid date');
      }
      return true;
    }),
  
  body('order')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Order must be a positive integer'),
  
  handleValidationErrors
];
