import express from 'express';
import { body, query, validationResult } from 'express-validator';
import Tip from '../models/Tip';
import { authenticate, requireAdmin, optionalAuth } from '../middleware/auth';
import { getWebSocketManager } from '../config/websocket';

const router = express.Router();

// @route   GET /api/tips
// @desc    Get all tips (public endpoint)
// @access  Public
router.get('/', [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100'),
  query('category')
    .optional()
    .isIn(['mindfulness', 'exercise', 'sleep', 'nutrition', 'social', 'general'])
    .withMessage('Invalid category filter'),
  query('tags')
    .optional()
    .isString()
    .withMessage('Tags must be a string'),
  query('sort')
    .optional()
    .isIn(['createdAt', '-createdAt', 'title', '-title'])
    .withMessage('Invalid sort field')
], async (req, res) => {
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
    const { category, tags, sort = '-createdAt' } = req.query;

    // Build filter
    const filter: any = { isActive: true };
    if (category) {
      filter.category = category;
    }
    if (tags) {
      const tagArray = tags.split(',').map((tag: string) => tag.trim());
      filter.tags = { $in: tagArray };
    }

    // Get total count
    const total = await Tip.countDocuments(filter);

    // Get tips
    const tips = await Tip.find(filter)
      .populate('createdBy', 'name email')
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .select('-__v');

    res.json({
      success: true,
      data: {
        items: tips,
        pagination: {
          current: page,
          pages: Math.ceil(total / limit),
          total,
          limit
        }
      }
    });

  } catch (error) {
    console.error('Get tips error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error while fetching tips'
    });
  }
});

// @route   GET /api/tips/:id
// @desc    Get a specific tip
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    const tip = await Tip.findOne({
      _id: req.params.id,
      isActive: true
    })
    .populate('createdBy', 'name email')
    .select('-__v');

    if (!tip) {
      return res.status(404).json({
        success: false,
        error: 'Tip not found'
      });
    }

    res.json({
      success: true,
      data: tip
    });

  } catch (error) {
    console.error('Get tip error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error while fetching tip'
    });
  }
});

// @route   POST /api/tips
// @desc    Create a new tip (admin only)
// @access  Private (Admin)
router.post('/', authenticate, requireAdmin, [
  body('title')
    .trim()
    .isLength({ min: 1, max: 200 })
    .withMessage('Title must be between 1 and 200 characters'),
  body('content')
    .trim()
    .isLength({ min: 1, max: 2000 })
    .withMessage('Content must be between 1 and 2000 characters'),
  body('category')
    .isIn(['mindfulness', 'exercise', 'sleep', 'nutrition', 'social', 'general'])
    .withMessage('Invalid category'),
  body('tags')
    .optional()
    .isArray()
    .withMessage('Tags must be an array'),
  body('tags.*')
    .optional()
    .trim()
    .isLength({ min: 1, max: 50 })
    .withMessage('Each tag must be between 1 and 50 characters'),
  body('isActive')
    .optional()
    .isBoolean()
    .withMessage('isActive must be a boolean value')
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

    const { title, content, category, tags, isActive = true } = req.body;

    const tip = new Tip({
      title,
      content,
      category,
      tags: tags || [],
      isActive,
      createdBy: req.user._id
    });

    await tip.save();

    // Broadcast to WebSocket clients
    try {
      const wsManager = getWebSocketManager();
      wsManager.broadcastTipCreated(tip);
    } catch (wsError) {
      console.warn('WebSocket broadcast failed:', wsError);
    }

    res.status(201).json({
      success: true,
      message: 'Tip created successfully',
      data: tip
    });

  } catch (error) {
    console.error('Create tip error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error while creating tip'
    });
  }
});

// @route   PUT /api/tips/:id
// @desc    Update a tip (admin only)
// @access  Private (Admin)
router.put('/:id', authenticate, requireAdmin, [
  body('title')
    .optional()
    .trim()
    .isLength({ min: 1, max: 200 })
    .withMessage('Title must be between 1 and 200 characters'),
  body('content')
    .optional()
    .trim()
    .isLength({ min: 1, max: 2000 })
    .withMessage('Content must be between 1 and 2000 characters'),
  body('category')
    .optional()
    .isIn(['mindfulness', 'exercise', 'sleep', 'nutrition', 'social', 'general'])
    .withMessage('Invalid category'),
  body('tags')
    .optional()
    .isArray()
    .withMessage('Tags must be an array'),
  body('tags.*')
    .optional()
    .trim()
    .isLength({ min: 1, max: 50 })
    .withMessage('Each tag must be between 1 and 50 characters'),
  body('isActive')
    .optional()
    .isBoolean()
    .withMessage('isActive must be a boolean value')
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

    const tip = await Tip.findById(req.params.id);

    if (!tip) {
      return res.status(404).json({
        success: false,
        error: 'Tip not found'
      });
    }

    // Update fields
    const updateData = req.body;
    Object.assign(tip, updateData);
    await tip.save();

    // Broadcast to WebSocket clients
    try {
      const wsManager = getWebSocketManager();
      wsManager.broadcastTipUpdated(tip);
    } catch (wsError) {
      console.warn('WebSocket broadcast failed:', wsError);
    }

    res.json({
      success: true,
      message: 'Tip updated successfully',
      data: tip
    });

  } catch (error) {
    console.error('Update tip error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error while updating tip'
    });
  }
});

// @route   DELETE /api/tips/:id
// @desc    Delete a tip (admin only)
// @access  Private (Admin)
router.delete('/:id', authenticate, requireAdmin, async (req: any, res) => {
  try {
    const tip = await Tip.findByIdAndDelete(req.params.id);

    if (!tip) {
      return res.status(404).json({
        success: false,
        error: 'Tip not found'
      });
    }

    // Broadcast to WebSocket clients
    try {
      const wsManager = getWebSocketManager();
      wsManager.broadcastTipDeleted(tip._id.toString());
    } catch (wsError) {
      console.warn('WebSocket broadcast failed:', wsError);
    }

    res.json({
      success: true,
      message: 'Tip deleted successfully'
    });

  } catch (error) {
    console.error('Delete tip error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error while deleting tip'
    });
  }
});

// @route   GET /api/tips/category/:category
// @desc    Get tips by category
// @access  Public
router.get('/category/:category', [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100')
], async (req, res) => {
  try {
    const { category } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const filter = {
      category,
      isActive: true
    };

    const total = await Tip.countDocuments(filter);
    const tips = await Tip.find(filter)
      .populate('createdBy', 'name email')
      .sort('-createdAt')
      .skip(skip)
      .limit(limit)
      .select('-__v');

    res.json({
      success: true,
      data: {
        items: tips,
        pagination: {
          current: page,
          pages: Math.ceil(total / limit),
          total,
          limit
        }
      }
    });

  } catch (error) {
    console.error('Get tips by category error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error while fetching tips by category'
    });
  }
});

// @route   GET /api/tips/random
// @desc    Get random tips
// @access  Public
router.get('/random', [
  query('limit')
    .optional()
    .isInt({ min: 1, max: 10 })
    .withMessage('Limit must be between 1 and 10'),
  query('category')
    .optional()
    .isIn(['mindfulness', 'exercise', 'sleep', 'nutrition', 'social', 'general'])
    .withMessage('Invalid category filter')
], async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 3;
    const { category } = req.query;

    const filter: any = { isActive: true };
    if (category) {
      filter.category = category;
    }

    const tips = await Tip.aggregate([
      { $match: filter },
      { $sample: { size: limit } },
      {
        $lookup: {
          from: 'users',
          localField: 'createdBy',
          foreignField: '_id',
          as: 'createdBy',
          pipeline: [
            { $project: { name: 1, email: 1 } }
          ]
        }
      },
      { $unwind: '$createdBy' }
    ]);

    res.json({
      success: true,
      data: tips
    });

  } catch (error) {
    console.error('Get random tips error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error while fetching random tips'
    });
  }
});

export default router;
