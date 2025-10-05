import express from 'express';
import { query, validationResult } from 'express-validator';
import Journal from '../models/Journal';
import { authenticate } from '../middleware/auth';

const router = express.Router();

// @route   GET /api/dashboard/summary
// @desc    Get dashboard summary data
// @access  Private
router.get('/summary', authenticate, async (req: any, res) => {
  try {
    const userId = req.user._id;
    const now = new Date();
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    // Get entries this week
    const entriesThisWeek = await Journal.countDocuments({
      userId,
      createdAt: { $gte: weekAgo }
    });

    // Get most common mood
    const moodStats = await Journal.aggregate([
      { $match: { userId } },
      { $group: { _id: '$mood', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 1 }
    ]);

    const topMood = moodStats.length > 0 ? moodStats[0]._id : 'neutral';

    // Frontend expects plain object with these keys
    res.json({
      entriesThisWeek,
      topMood
    });

  } catch (error) {
    console.error('Dashboard summary error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error while fetching dashboard summary'
    });
  }
});

// @route   GET /api/dashboard/trends
// @desc    Get mood trends over time
// @access  Private
router.get('/trends', authenticate, [
  query('days')
    .optional()
    .isInt({ min: 1, max: 365 })
    .withMessage('Days must be between 1 and 365')
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

    const userId = req.user._id;
    const days = parseInt(req.query.days) || 30;
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    // Get mood trends grouped by date
    const trends = await Journal.aggregate([
      {
        $match: {
          userId,
          createdAt: { $gte: startDate }
        }
      },
      {
        $group: {
          _id: {
            date: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
            mood: '$mood'
          },
          count: { $sum: 1 }
        }
      },
      {
        $group: {
          _id: '$_id.date',
          moods: {
            $push: {
              mood: '$_id.mood',
              count: '$count'
            }
          },
          totalEntries: { $sum: '$count' }
        }
      },
      {
        $sort: { _id: 1 }
      }
    ]);

    // Format the response
    const formattedTrends = trends.map(trend => ({
      date: trend._id,
      count: trend.totalEntries,
      moods: trend.moods
    }));

    // Frontend expects an array
    res.json(formattedTrends);

  } catch (error) {
    console.error('Dashboard trends error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error while fetching mood trends'
    });
  }
});

// @route   GET /api/dashboard/mood-distribution
// @desc    Get mood distribution data
// @access  Private
router.get('/mood-distribution', authenticate, [
  query('days')
    .optional()
    .isInt({ min: 1, max: 365 })
    .withMessage('Days must be between 1 and 365')
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

    const userId = req.user._id;
    const days = parseInt(req.query.days) || 30;
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    // Get mood distribution
    const distribution = await Journal.aggregate([
      {
        $match: {
          userId,
          createdAt: { $gte: startDate }
        }
      },
      {
        $group: {
          _id: '$mood',
          count: { $sum: 1 }
        }
      },
      {
        $sort: { count: -1 }
      }
    ]);

    // Calculate percentages
    const total = distribution.reduce((sum, item) => sum + item.count, 0);
    const moodDistribution = distribution.map(item => ({
      mood: item._id,
      count: item.count,
      percentage: total > 0 ? Math.round((item.count / total) * 100) : 0
    }));

    // Frontend expects an array of { mood, count }
    res.json(moodDistribution.map(d => ({ mood: d.mood, count: d.count })));

  } catch (error) {
    console.error('Mood distribution error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error while fetching mood distribution'
    });
  }
});

// @route   GET /api/dashboard/insights
// @desc    Get personalized insights
// @access  Private
router.get('/insights', authenticate, async (req: any, res) => {
  try {
    const userId = req.user._id;
    const now = new Date();
    const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    // Get various insights
    const [
      totalEntries,
      averageMood,
      moodStreak,
      weeklyPattern
    ] = await Promise.all([
      // Total entries
      Journal.countDocuments({ userId }),
      
      // Average mood intensity (simplified calculation)
      Journal.aggregate([
        { $match: { userId, createdAt: { $gte: monthAgo } } },
        { 
          $group: { 
            _id: null, 
            avgMood: { 
              $avg: { 
                $switch: {
                  branches: [
                    { case: { $eq: ['$mood', 'happy'] }, then: 5 },
                    { case: { $eq: ['$mood', 'excited'] }, then: 4 },
                    { case: { $eq: ['$mood', 'calm'] }, then: 3 },
                    { case: { $eq: ['$mood', 'neutral'] }, then: 2 },
                    { case: { $eq: ['$mood', 'sad'] }, then: 1 }
                  ],
                  default: 0
                }
              }
            }
          }
        }
      ]),
      
      // Mood streak (simplified)
      Journal.countDocuments({ 
        userId, 
        createdAt: { $gte: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000) }
      }),
      
      // Weekly pattern
      Journal.aggregate([
        { $match: { userId, createdAt: { $gte: monthAgo } } },
        {
          $group: {
            _id: { $dayOfWeek: '$createdAt' },
            count: { $sum: 1 }
          }
        },
        { $sort: { _id: 1 } }
      ])
    ]);

    const insights = {
      totalEntries,
      averageMood: averageMood.length > 0 ? Math.round(averageMood[0].avgMood * 10) / 10 : 0,
      moodStreak: Math.min(moodStreak, 30), // Cap at 30 days
      weeklyPattern: weeklyPattern.map(day => ({
        day: day._id,
        entries: day.count
      })),
      recommendations: generateRecommendations(totalEntries, moodStreak)
    };

    res.json({
      success: true,
      data: insights
    });

  } catch (error) {
    console.error('Dashboard insights error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error while fetching insights'
    });
  }
});

// Helper function to generate recommendations
function generateRecommendations(totalEntries: number, streak: number): string[] {
  const recommendations: string[] = [];

  if (totalEntries === 0) {
    recommendations.push("Start your wellness journey by writing your first journal entry!");
  } else if (totalEntries < 5) {
    recommendations.push("Great start! Try to journal regularly to build a healthy habit.");
  } else if (streak >= 7) {
    recommendations.push("Amazing consistency! You're building a strong wellness routine.");
  } else if (streak < 3) {
    recommendations.push("Consider setting a daily reminder to help maintain your journaling habit.");
  }

  if (totalEntries > 10) {
    recommendations.push("You've been journaling for a while - consider reviewing your past entries for patterns.");
  }

  return recommendations;
}

export default router;
