import express from 'express';
import { body, query, validationResult } from 'express-validator';
import Journal from '../models/Journal';
import { authenticate } from '../middleware/auth';

const router = express.Router();

// @route   GET /api/journal
// @desc    Get all journal entries for the authenticated user
// @access  Private
router.get('/', authenticate, [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100'),
  query('mood')
    .optional()
    .isIn(['happy', 'sad', 'anxious', 'neutral', 'excited', 'calm', 'angry', 'frustrated', 'grateful', 'hopeful'])
    .withMessage('Invalid mood filter'),
  query('sort')
    .optional()
    .isIn(['createdAt', '-createdAt', 'updatedAt', '-updatedAt'])
    .withMessage('Invalid sort field')
], async (req: any, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        error: 'Validation failed',
        details: errors.array()
      });
    }

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    const { mood, sort = '-createdAt' } = req.query;

    // Build filter
    const filter: any = { userId: req.user._id };
    if (mood) {
      filter.mood = mood;
    }

    // Get total count
    const total = await Journal.countDocuments(filter);

    // Get journal entries
    const entries = await Journal.find(filter)
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .select('-__v');

    // Frontend expects a plain array here
    res.json(entries);

  } catch (error) {
    console.error('Get journal entries error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error while fetching journal entries'
    });
  }
});

// @route   GET /api/journal/:id
// @desc    Get a specific journal entry
// @access  Private
router.get('/:id', authenticate, async (req: any, res) => {
  try {
    const entry = await Journal.findOne({
      _id: req.params.id,
      userId: req.user._id
    }).select('-__v');

    if (!entry) {
      return res.status(404).json({
        success: false,
        error: 'Journal entry not found'
      });
    }

    res.json({
      success: true,
      data: entry
    });

  } catch (error) {
    console.error('Get journal entry error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error while fetching journal entry'
    });
  }
});

// @route   POST /api/journal
// @desc    Create a new journal entry
// @access  Private
router.post('/', authenticate, [
  body('title')
    .trim()
    .isLength({ min: 1, max: 200 })
    .withMessage('Title must be between 1 and 200 characters'),
  body('content')
    .trim()
    .isLength({ min: 1, max: 10000 })
    .withMessage('Content must be between 1 and 10000 characters'),
  body('mood')
    .optional()
    .isIn(['happy', 'sad', 'anxious', 'neutral', 'excited', 'calm', 'angry', 'frustrated', 'grateful', 'hopeful'])
    .withMessage('Invalid mood value'),
  body('tags')
    .optional()
    .isArray()
    .withMessage('Tags must be an array'),
  body('tags.*')
    .optional()
    .trim()
    .isLength({ min: 1, max: 50 })
    .withMessage('Each tag must be between 1 and 50 characters'),
  body('isPrivate')
    .optional()
    .isBoolean()
    .withMessage('isPrivate must be a boolean value')
], async (req: any, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        error: 'Validation failed',
        details: errors.array()
      });
    }

    const { title, content, mood, tags, isPrivate = true } = req.body;

    const entry = new Journal({
      userId: req.user._id,
      title,
      content,
      mood,
      tags: tags || [],
      isPrivate
    });

    await entry.save();

    // Frontend expects the created entry object directly
    res.status(201).json(entry);

  } catch (error) {
    console.error('Create journal entry error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error while creating journal entry'
    });
  }
});

// @route   PUT /api/journal/:id
// @desc    Update a journal entry
// @access  Private
router.put('/:id', authenticate, [
  body('title')
    .optional()
    .trim()
    .isLength({ min: 1, max: 200 })
    .withMessage('Title must be between 1 and 200 characters'),
  body('content')
    .optional()
    .trim()
    .isLength({ min: 1, max: 10000 })
    .withMessage('Content must be between 1 and 10000 characters'),
  body('mood')
    .optional()
    .isIn(['happy', 'sad', 'anxious', 'neutral', 'excited', 'calm', 'angry', 'frustrated', 'grateful', 'hopeful'])
    .withMessage('Invalid mood value'),
  body('tags')
    .optional()
    .isArray()
    .withMessage('Tags must be an array'),
  body('tags.*')
    .optional()
    .trim()
    .isLength({ min: 1, max: 50 })
    .withMessage('Each tag must be between 1 and 50 characters'),
  body('isPrivate')
    .optional()
    .isBoolean()
    .withMessage('isPrivate must be a boolean value')
], async (req: any, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        error: 'Validation failed',
        details: errors.array()
      });
    }

    const entry = await Journal.findOne({
      _id: req.params.id,
      userId: req.user._id
    });

    if (!entry) {
      return res.status(404).json({
        success: false,
        error: 'Journal entry not found'
      });
    }

    // Update fields
    const updateData = req.body;
    Object.assign(entry, updateData);
    await entry.save();

    res.json({
      success: true,
      message: 'Journal entry updated successfully',
      data: entry
    });

  } catch (error) {
    console.error('Update journal entry error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error while updating journal entry'
    });
  }
});

// @route   DELETE /api/journal/:id
// @desc    Delete a journal entry
// @access  Private
router.delete('/:id', authenticate, async (req: any, res) => {
  try {
    const entry = await Journal.findOneAndDelete({
      _id: req.params.id,
      userId: req.user._id
    });

    if (!entry) {
      return res.status(404).json({
        success: false,
        error: 'Journal entry not found'
      });
    }

    res.json({
      success: true,
      message: 'Journal entry deleted successfully'
    });

  } catch (error) {
    console.error('Delete journal entry error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error while deleting journal entry'
    });
  }
});

export default router;
