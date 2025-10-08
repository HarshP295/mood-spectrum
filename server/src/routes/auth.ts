import express, { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt, { Secret } from 'jsonwebtoken';
import { body, validationResult } from 'express-validator';
import User from '../models/User';
import { authenticate } from '../middleware/auth';

const router = express.Router();

/* -------------------------------------------------------------------------- */
/*                                JWT Generator                               */
/* -------------------------------------------------------------------------- */
const generateToken = (userId: string): string => {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error('JWT_SECRET is not defined');
  }

  return jwt.sign({ userId }, secret, { expiresIn: process.env.JWT_EXPIRES_IN || '7d' });
};

/* -------------------------------------------------------------------------- */
/*                               REGISTER ROUTE                               */
/* -------------------------------------------------------------------------- */
router.post(
  '/register',
  [
    body('email').isEmail().normalizeEmail().withMessage('Please provide a valid email'),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters long'),
    body('name').optional().trim().isLength({ min: 1, max: 50 }).withMessage('Name must be between 1 and 50 characters')
  ],
  async (req: Request, res: Response): Promise<Response> => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          error: 'Validation failed',
          details: errors.array()
        });
      }

      const { email, password, name } = req.body;

      // Check existing user
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return res.status(400).json({
          success: false,
          error: 'User already exists with this email'
        });
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(password, 12);

      // Create user
      const user = new User({
        email,
        password: hashedPassword,
        name: name || email.split('@')[0],
        role: 'user'
      });

      await user.save();

      // Generate token
      const token = generateToken(user.id);

      // Prepare safe user response
      const userResponse = user.toJSON();
      delete (userResponse as any).password;

      return res.status(201).json({
        success: true,
        message: 'User registered successfully',
        token,
        user: userResponse
      });
    } catch (error) {
      console.error('Registration error:', error);
      return res.status(500).json({
        success: false,
        error: 'Server error during registration'
      });
    }
  }
);

/* -------------------------------------------------------------------------- */
/*                                 LOGIN ROUTE                                */
/* -------------------------------------------------------------------------- */
router.post(
  '/login',
  [
    body('email').isEmail().normalizeEmail().withMessage('Please provide a valid email'),
    body('password').notEmpty().withMessage('Password is required')
  ],
  async (req: Request, res: Response): Promise<Response> => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          error: 'Validation failed',
          details: errors.array()
        });
      }

      const { email, password } = req.body;
      const user = await User.findOne({ email });

      if (!user) {
        return res.status(401).json({
          success: false,
          error: 'Invalid email or password'
        });
      }

      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (!isPasswordValid) {
        return res.status(401).json({
          success: false,
          error: 'Invalid email or password'
        });
      }

      const token = generateToken(user.id);
      const userResponse = user.toJSON();
      delete (userResponse as any).password;

      return res.json({
        success: true,
        message: 'Login successful',
        token,
        user: userResponse
      });
    } catch (error) {
      console.error('Login error:', error);
      return res.status(500).json({
        success: false,
        error: 'Server error during login'
      });
    }
  }
);

/* -------------------------------------------------------------------------- */
/*                                   ME ROUTE                                 */
/* -------------------------------------------------------------------------- */
router.get('/me', authenticate, async (req: any, res: Response): Promise<Response> => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    return res.json({ success: true, user });
  } catch (error) {
    console.error('Get user error:', error);
    return res.status(500).json({
      success: false,
      error: 'Server error while fetching user'
    });
  }
});

/* -------------------------------------------------------------------------- */
/*                               PROFILE UPDATE                               */
/* -------------------------------------------------------------------------- */
router.put(
  '/profile',
  authenticate,
  [
    body('name').optional().trim().isLength({ min: 1, max: 50 }).withMessage('Name must be between 1 and 50 characters'),
    body('preferences.theme')
      .optional()
      .isIn(['light', 'dark', 'system'])
      .withMessage('Theme must be light, dark, or system'),
    body('preferences.notifications')
      .optional()
      .isBoolean()
      .withMessage('Notifications must be a boolean value'),
    body('preferences.reminderTime')
      .optional()
      .matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/)
      .withMessage('Reminder time must be in HH:MM format')
  ],
  async (req: any, res: Response): Promise<Response> => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          error: 'Validation failed',
          details: errors.array()
        });
      }

      const { name, preferences } = req.body;
      const updateData: Record<string, any> = {};

      if (name) updateData.name = name;
      if (preferences) {
        updateData.preferences = { ...req.user.preferences, ...preferences };
      }

      const user = await User.findByIdAndUpdate(req.user._id, updateData, {
        new: true,
        runValidators: true
      }).select('-password');

      if (!user) {
        return res.status(404).json({
          success: false,
          error: 'User not found'
        });
      }

      return res.json({
        success: true,
        message: 'Profile updated successfully',
        user
      });
    } catch (error) {
      console.error('Update profile error:', error);
      return res.status(500).json({
        success: false,
        error: 'Server error while updating profile'
      });
    }
  }
);

export default router;
