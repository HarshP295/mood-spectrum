import { useState, useEffect } from 'react';

interface DailyTip {
  id: number;
  title: string;
  content: string;
  category: 'mindfulness' | 'exercise' | 'sleep' | 'nutrition' | 'social';
  icon: string;
}

const useDailyTips = () => {
  const [tips, setTips] = useState<DailyTip[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate API call with setTimeout
    const fetchTips = async () => {
      setLoading(true);
      
      // Simulate delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const dailyTips: DailyTip[] = [
        {
          id: 1,
          title: "Practice Deep Breathing",
          content: "Take 5 minutes to practice the 4-7-8 breathing technique. Inhale for 4, hold for 7, exhale for 8.",
          category: "mindfulness",
          icon: "🫁"
        },
        {
          id: 2,
          title: "Gratitude Journaling",
          content: "Write down three things you're grateful for today. This simple practice can boost your mood significantly.",
          category: "mindfulness",
          icon: "📝"
        },
        {
          id: 3,
          title: "Morning Sunlight",
          content: "Spend 10 minutes outside in natural sunlight to help regulate your circadian rhythm and improve sleep.",
          category: "sleep",
          icon: "☀️"
        },
        {
          id: 4,
          title: "Mindful Walking",
          content: "Take a 15-minute walk while focusing on your surroundings. Notice the sounds, smells, and sights around you.",
          category: "exercise",
          icon: "🚶"
        },
        {
          id: 5,
          title: "Connect with Others",
          content: "Reach out to a friend or family member today. Social connections are vital for mental wellbeing.",
          category: "social",
          icon: "💝"
        }
      ];
      
      setTips(dailyTips);
      setLoading(false);
    };

    fetchTips();
  }, []);

  const refreshTips = () => {
    setTips(prevTips => [...prevTips].sort(() => Math.random() - 0.5));
  };

  return { tips, loading, refreshTips };
};

export default useDailyTips;