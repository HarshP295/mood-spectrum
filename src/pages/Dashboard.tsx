import { useState, useEffect } from 'react';
import { TrendingUp, Calendar, Brain, Target, RefreshCw } from 'lucide-react';
import Card from '../components/Card';
import Button from '../components/Button';
import useDailyTips from '../hooks/useDailyTips';
import { useMood } from '../contexts/MoodContext';

const Dashboard = () => {
  const { tips, loading, refreshTips } = useDailyTips();
  const { state: moodState } = useMood();

  // Use real mood data from context, fallback to mock data
  const moodData = moodState.stats.moodTrends.length > 0 
    ? moodState.stats.moodTrends.map((trend, index) => ({
        day: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'][index] || trend.date.slice(-3),
        mood: trend.mood,
        value: trend.intensity
      }))
    : [
        { day: 'Mon', mood: 'happy', value: 8 },
        { day: 'Tue', mood: 'neutral', value: 6 },
        { day: 'Wed', mood: 'sad', value: 4 },
        { day: 'Thu', mood: 'happy', value: 7 },
        { day: 'Fri', mood: 'excited', value: 9 },
        { day: 'Sat', mood: 'calm', value: 8 },
        { day: 'Sun', mood: 'happy', value: 8 },
      ];

  // Use real stats from context
  const stats = {
    avgMood: moodState.stats.averageMood || 7.1,
    entriesThisWeek: moodState.stats.entriesThisWeek || 0,
    streakDays: moodState.stats.streakDays || 0,
    improvementScore: 85 // This could be calculated based on mood trends
  };

  const getMoodColor = (mood: string) => {
    const colors = {
      happy: 'bg-yellow',
      sad: 'bg-primary',
      anxious: 'bg-peach',
      neutral: 'bg-muted',
      excited: 'bg-accent',
      calm: 'bg-lavender-light'
    };
    return colors[mood as keyof typeof colors] || 'bg-muted';
  };

  const getMoodEmoji = (mood: string) => {
    const emojis = {
      happy: '😊',
      sad: '😢',
      anxious: '😰',
      neutral: '😐',
      excited: '🤩',
      calm: '😌'
    };
    return emojis[mood as keyof typeof emojis] || '😐';
  };

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-block p-4 bg-gradient-primary rounded-full mb-4 therapeutic-pulse">
            <TrendingUp className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-foreground mb-4">Your Wellness Dashboard</h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Track your progress and discover insights about your mental health journey.
          </p>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          <Card variant="default" className="p-6 text-center">
            <div className="w-12 h-12 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <Brain className="w-6 h-6 text-primary" />
            </div>
            <h3 className="text-2xl font-bold text-foreground mb-1">{stats.avgMood}/10</h3>
            <p className="text-sm text-muted-foreground">Average Mood</p>
          </Card>

          <Card variant="default" className="p-6 text-center">
            <div className="w-12 h-12 bg-accent/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <Calendar className="w-6 h-6 text-accent" />
            </div>
            <h3 className="text-2xl font-bold text-foreground mb-1">{stats.entriesThisWeek}</h3>
            <p className="text-sm text-muted-foreground">Entries This Week</p>
          </Card>

          <Card variant="default" className="p-6 text-center">
            <div className="w-12 h-12 bg-yellow/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <Target className="w-6 h-6 text-yellow" />
            </div>
            <h3 className="text-2xl font-bold text-foreground mb-1">{stats.streakDays}</h3>
            <p className="text-sm text-muted-foreground">Day Streak</p>
          </Card>

          <Card variant="default" className="p-6 text-center">
            <div className="w-12 h-12 bg-peach/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <TrendingUp className="w-6 h-6 text-peach" />
            </div>
            <h3 className="text-2xl font-bold text-foreground mb-1">{stats.improvementScore}%</h3>
            <p className="text-sm text-muted-foreground">Improvement Score</p>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Mood Trends */}
          <Card variant="default" className="p-6">
            <h3 className="text-xl font-semibold text-foreground mb-6">Weekly Mood Trends</h3>
            <div className="space-y-4">
              {moodData.map((day, index) => (
                <div key={day.day} className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <span className="text-2xl">{getMoodEmoji(day.mood)}</span>
                    <div>
                      <p className="font-medium text-foreground">{day.day}</p>
                      <p className="text-sm text-muted-foreground capitalize">{day.mood}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-24 h-2 bg-muted rounded-full overflow-hidden">
                      <div 
                        className={`h-full rounded-full transition-all duration-500 ${getMoodColor(day.mood)}`}
                        style={{ 
                          width: `${(day.value / 10) * 100}%`,
                          animationDelay: `${index * 100}ms`
                        }}
                      ></div>
                    </div>
                    <span className="text-sm font-medium text-foreground w-8">{day.value}/10</span>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {/* AI Suggestions */}
          <Card variant="therapeutic" className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-white">Daily Wellness Tips</h3>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={refreshTips}
                className="bg-white/20 border-white/30 text-white hover:bg-white/30"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Refresh
              </Button>
            </div>
            
            {loading ? (
              <div className="space-y-4">
                {[1, 2, 3].map(i => (
                  <div key={i} className="bg-white/20 rounded-xl p-4 animate-pulse">
                    <div className="h-4 bg-white/30 rounded mb-2"></div>
                    <div className="h-3 bg-white/20 rounded"></div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="space-y-4">
                {tips.slice(0, 3).map((tip) => (
                  <div key={tip.id} className="bg-white/20 rounded-xl p-4 hover:bg-white/30 transition-colors duration-200">
                    <div className="flex items-start space-x-3">
                      <span className="text-2xl">{tip.icon}</span>
                      <div>
                        <h4 className="font-semibold text-white mb-1">{tip.title}</h4>
                        <p className="text-white/80 text-sm leading-relaxed">{tip.content}</p>
                        <span className="inline-block mt-2 px-2 py-1 bg-white/20 rounded-full text-xs text-white/70 capitalize">
                          {tip.category}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;