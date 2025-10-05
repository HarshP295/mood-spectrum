import express from 'express';
import { body, query, validationResult } from 'express-validator';
import Playlist from '../models/Playlist';
import { authenticate } from '../middleware/auth';

const router = express.Router();

// @route   GET /api/playlist
// @desc    Get all playlists for the authenticated user
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
  query('category')
    .optional()
    .isIn(['happy', 'sad', 'anxious', 'neutral', 'excited', 'calm', 'angry', 'frustrated', 'grateful', 'hopeful', 'uplifting', 'reflective'])
    .withMessage('Invalid category filter'),
  query('sort')
    .optional()
    .isIn(['createdAt', '-createdAt', 'name', '-name'])
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
    const { category, sort = '-createdAt' } = req.query;

    // Build filter
    const filter: any = { userId: req.user._id };
    if (category) {
      filter.category = category;
    }

    // Get total count
    const total = await Playlist.countDocuments(filter);

    // Get playlists
    const playlists = await Playlist.find(filter)
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .select('-__v');

    // Frontend expects plain array
    res.json(playlists);

  } catch (error) {
    console.error('Get playlists error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error while fetching playlists'
    });
  }
});

// @route   GET /api/playlist/:id
// @desc    Get a specific playlist
// @access  Private
router.get('/:id', authenticate, async (req: any, res) => {
  try {
    const playlist = await Playlist.findOne({
      _id: req.params.id,
      userId: req.user._id
    }).select('-__v');

    if (!playlist) {
      return res.status(404).json({
        success: false,
        error: 'Playlist not found'
      });
    }

    res.json({
      success: true,
      data: playlist
    });

  } catch (error) {
    console.error('Get playlist error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error while fetching playlist'
    });
  }
});

// @route   POST /api/playlist
// @desc    Create a new playlist
// @access  Private
router.post('/', authenticate, [
  body('name')
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('Name must be between 1 and 100 characters'),
  body('category')
    .isIn(['happy','sad','calm','energetic','focused','sleep','anxious','neutral','excited','angry','frustrated','grateful','hopeful','uplifting','reflective'])
    .withMessage('Invalid category'),
  body('description')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Description must be less than 500 characters'),
  body('songs')
    .isArray({ min: 0, max: 100 })
    .withMessage('Songs must be an array with 0-100 items'),
  body('songs.*.title')
    .trim()
    .isLength({ min: 1, max: 200 })
    .withMessage('Song title must be between 1 and 200 characters'),
  body('songs.*.artist')
    .trim()
    .isLength({ min: 1, max: 200 })
    .withMessage('Artist name must be between 1 and 200 characters'),
  body('songs.*.spotifyUrl')
    .isURL()
    .withMessage('spotifyUrl must be a valid URL'),
  body('songs.*.duration')
    .optional()
    .isInt({ min: 0 })
    .withMessage('duration must be a positive number of seconds'),
  body('songs.*.imageUrl')
    .optional()
    .isURL()
    .withMessage('imageUrl must be a valid URL'),
  body('isPublic')
    .optional()
    .isBoolean()
    .withMessage('isPublic must be a boolean value')
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

    const { name, category, description, songs, isPublic = false } = req.body;

    // Validate category to support frontend specific categories
    const allowedCategories = ['happy','sad','calm','energetic','focused','sleep','anxious','neutral','excited','angry','frustrated','grateful','hopeful','uplifting','reflective'];
    if (!allowedCategories.includes(category)) {
      return res.status(400).json({ error: 'Invalid category' });
    }

    // Generate unique IDs for songs
    const songsWithIds = songs.map((song: any, index: number) => ({
      ...song,
      id: `song_${Date.now()}_${index}`
    }));

    const playlist = new Playlist({
      userId: req.user._id,
      name,
      category,
      description,
      songs: songsWithIds,
      isPublic
    });

    await playlist.save();

    // Frontend expects created object directly
    res.status(201).json(playlist);

  } catch (error) {
    console.error('Create playlist error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error while creating playlist'
    });
  }
});

// @route   PUT /api/playlist/:id
// @desc    Update a playlist
// @access  Private
router.put('/:id', authenticate, [
  body('name')
    .optional()
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('Name must be between 1 and 100 characters'),
  body('category')
    .optional()
    .isIn(['happy','sad','calm','energetic','focused','sleep','anxious','neutral','excited','angry','frustrated','grateful','hopeful','uplifting','reflective'])
    .withMessage('Invalid category'),
  body('description')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Description must be less than 500 characters'),
  body('songs')
    .optional()
    .isArray({ min: 0, max: 100 })
    .withMessage('Songs must be an array with 0-100 items'),
  body('songs.*.spotifyUrl')
    .optional()
    .isURL()
    .withMessage('spotifyUrl must be a valid URL'),
  body('songs.*.duration')
    .optional()
    .isInt({ min: 0 })
    .withMessage('duration must be a positive number of seconds'),
  body('songs.*.imageUrl')
    .optional()
    .isURL()
    .withMessage('imageUrl must be a valid URL'),
  body('isPublic')
    .optional()
    .isBoolean()
    .withMessage('isPublic must be a boolean value')
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

    const playlist = await Playlist.findOne({
      _id: req.params.id,
      userId: req.user._id
    });

    if (!playlist) {
      return res.status(404).json({
        success: false,
        error: 'Playlist not found'
      });
    }

    // Update fields
    const updateData = { ...req.body };
    
    // If songs are being updated, generate new IDs
    if (updateData.songs) {
      updateData.songs = updateData.songs.map((song: any, index: number) => ({
        ...song,
        id: song.id || `song_${Date.now()}_${index}`
      }));
    }

    Object.assign(playlist, updateData);
    await playlist.save();

    res.json(playlist);

  } catch (error) {
    console.error('Update playlist error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error while updating playlist'
    });
  }
});

// @route   DELETE /api/playlist/:id
// @desc    Delete a playlist
// @access  Private
router.delete('/:id', authenticate, async (req: any, res) => {
  try {
    const playlist = await Playlist.findOneAndDelete({
      _id: req.params.id,
      userId: req.user._id
    });

    if (!playlist) {
      return res.status(404).json({
        success: false,
        error: 'Playlist not found'
      });
    }

    res.json({
      success: true,
      message: 'Playlist deleted successfully'
    });

  } catch (error) {
    console.error('Delete playlist error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error while deleting playlist'
    });
  }
});

// @route   GET /api/playlist/category/:category
// @desc    Get playlists by category
// @access  Private
router.get('/category/:category', authenticate, async (req: any, res) => {
  try {
    const { category } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const filter = {
      userId: req.user._id,
      category
    };

    const total = await Playlist.countDocuments(filter);
    const playlists = await Playlist.find(filter)
      .sort('-createdAt')
      .skip(skip)
      .limit(limit)
      .select('-__v');

    res.json({
      success: true,
      data: playlists,
      pagination: {
        current: page,
        pages: Math.ceil(total / limit),
        total,
        limit
      }
    });

  } catch (error) {
    console.error('Get playlists by category error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error while fetching playlists by category'
    });
  }
});

export default router;
