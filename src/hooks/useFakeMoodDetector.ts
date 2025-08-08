import { useState, useEffect } from 'react';

interface MoodDetection {
  mood: string;
  confidence: number;
  suggestions: string[];
  emoji: string;
}

const useFakeMoodDetector = () => {
  const [detection, setDetection] = useState<MoodDetection | null>(null);
  const [isDetecting, setIsDetecting] = useState(false);
  const [cameraActive, setCameraActive] = useState(false);

  const possibleDetections: MoodDetection[] = [
    {
      mood: 'Happy',
      confidence: 87,
      suggestions: ['Keep up the positive energy!', 'Share your joy with others', 'Try some uplifting music'],
      emoji: '😊'
    },
    {
      mood: 'Calm',
      confidence: 92,
      suggestions: ['Great job staying centered', 'Practice some meditation', 'Enjoy this peaceful moment'],
      emoji: '😌'
    },
    {
      mood: 'Focused',
      confidence: 78,
      suggestions: ['You look concentrated', 'Take breaks when needed', 'Stay hydrated'],
      emoji: '🧘'
    },
    {
      mood: 'Tired',
      confidence: 85,
      suggestions: ['Consider taking a rest', 'Try some gentle stretching', 'Ensure good sleep tonight'],
      emoji: '😴'
    },
    {
      mood: 'Thoughtful',
      confidence: 81,
      suggestions: ['Journaling might help', 'Talk to someone you trust', 'Take time to process'],
      emoji: '🤔'
    }
  ];

  const startDetection = async () => {
    setIsDetecting(true);
    setCameraActive(true);
    setDetection(null);

    // Simulate processing time
    await new Promise(resolve => setTimeout(resolve, 3000));

    // Randomly select a mood detection
    const randomDetection = possibleDetections[Math.floor(Math.random() * possibleDetections.length)];
    setDetection(randomDetection);
    setIsDetecting(false);
  };

  const stopCamera = () => {
    setCameraActive(false);
    setDetection(null);
    setIsDetecting(false);
  };

  const resetDetection = () => {
    setDetection(null);
    setIsDetecting(false);
  };

  return {
    detection,
    isDetecting,
    cameraActive,
    startDetection,
    stopCamera,
    resetDetection
  };
};

export default useFakeMoodDetector;