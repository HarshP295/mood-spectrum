import { useState } from 'react';
import { Smile, Frown, Heart, Meh, Zap } from 'lucide-react';
import Card from './Card';

interface MoodSelectorProps {
  onMoodSelect: (mood: string) => void;
  selectedMood?: string;
}

const MoodSelector = ({ onMoodSelect, selectedMood }: MoodSelectorProps) => {
  const moods = [
    { id: 'happy', label: 'Happy', icon: Smile, color: 'text-yellow', bg: 'bg-yellow/20' },
    { id: 'sad', label: 'Sad', icon: Frown, color: 'text-primary', bg: 'bg-primary/20' },
    { id: 'anxious', label: 'Anxious', icon: Zap, color: 'text-peach', bg: 'bg-peach/20' },
    { id: 'neutral', label: 'Neutral', icon: Meh, color: 'text-muted-foreground', bg: 'bg-muted' },
    { id: 'excited', label: 'Excited', icon: Heart, color: 'text-accent', bg: 'bg-accent/20' },
  ];

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-foreground">How are you feeling today?</h3>
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {moods.map(({ id, label, icon: Icon, color, bg }) => (
          <Card
            key={id}
            variant="mood"
            className={`p-4 cursor-pointer text-center transition-all duration-300 ${
              selectedMood === id 
                ? 'border-primary bg-primary/10 scale-105' 
                : 'hover:bg-secondary/50'
            }`}
            onClick={() => onMoodSelect(id)}
          >
            <div className={`w-12 h-12 mx-auto mb-2 rounded-full ${bg} flex items-center justify-center mood-float`}>
              <Icon className={`w-6 h-6 ${color}`} />
            </div>
            <p className="text-sm font-medium text-foreground">{label}</p>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default MoodSelector;