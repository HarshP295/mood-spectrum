import { useState } from 'react';
import { Save, Calendar, Sparkles } from 'lucide-react';
import MoodSelector from '../components/MoodSelector';
import Button from '../components/Button';
import Card from '../components/Card';

const Journal = () => {
  const [selectedMood, setSelectedMood] = useState<string>('');
  const [journalEntry, setJournalEntry] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [savedEntries, setSavedEntries] = useState<Array<{
    id: number;
    mood: string;
    entry: string;
    date: string;
  }>>([]);

  const handleSave = async () => {
    if (!selectedMood || !journalEntry.trim()) {
      alert('Please select a mood and write your thoughts before saving.');
      return;
    }

    setIsSaving(true);
    
    // Simulate saving delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const newEntry = {
      id: Date.now(),
      mood: selectedMood,
      entry: journalEntry,
      date: new Date().toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      })
    };
    
    setSavedEntries(prev => [newEntry, ...prev]);
    setSelectedMood('');
    setJournalEntry('');
    setIsSaving(false);
    
    alert('Entry saved successfully!');
  };

  const journalPrompts = [
    "What made you smile today?",
    "Describe a challenge you overcame recently.",
    "What are three things you're grateful for right now?",
    "How did you take care of yourself today?",
    "What would you tell your past self about today?"
  ];

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-block p-4 bg-gradient-primary rounded-full mb-4 gentle-bounce">
            <Sparkles className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-foreground mb-4">Daily Journal</h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Take a moment to reflect on your day and capture your thoughts and feelings.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Journal Area */}
          <div className="lg:col-span-2 space-y-8">
            {/* Mood Selection */}
            <Card variant="default" className="p-6">
              <MoodSelector onMoodSelect={setSelectedMood} selectedMood={selectedMood} />
            </Card>

            {/* Journal Entry */}
            <Card variant="default" className="p-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-foreground">Today's Reflection</h3>
                  <div className="flex items-center text-muted-foreground">
                    <Calendar className="w-4 h-4 mr-2" />
                    <span className="text-sm">
                      {new Date().toLocaleDateString('en-US', { 
                        weekday: 'long', 
                        month: 'short', 
                        day: 'numeric' 
                      })}
                    </span>
                  </div>
                </div>
                
                <textarea
                  value={journalEntry}
                  onChange={(e) => setJournalEntry(e.target.value)}
                  placeholder="How was your day? What's on your mind? Write freely..."
                  className="input-therapeutic w-full h-64 resize-none"
                />
                
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">
                    {journalEntry.length} characters
                  </span>
                  <Button
                    onClick={handleSave}
                    variant="therapeutic"
                    disabled={isSaving || !selectedMood || !journalEntry.trim()}
                  >
                    {isSaving ? (
                      <div className="flex items-center">
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2"></div>
                        Saving...
                      </div>
                    ) : (
                      <div className="flex items-center">
                        <Save className="w-4 h-4 mr-2" />
                        Save Entry
                      </div>
                    )}
                  </Button>
                </div>
              </div>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Writing Prompts */}
            <Card variant="therapeutic" className="p-6">
              <h3 className="text-lg font-semibold text-white mb-4">Writing Prompts</h3>
              <div className="space-y-3">
                {journalPrompts.map((prompt, index) => (
                  <button
                    key={index}
                    onClick={() => setJournalEntry(prompt + ' ')}
                    className="w-full text-left p-3 bg-white/20 rounded-xl text-white/90 hover:bg-white/30 transition-colors duration-200 text-sm"
                  >
                    {prompt}
                  </button>
                ))}
              </div>
            </Card>

            {/* Recent Entries */}
            {savedEntries.length > 0 && (
              <Card variant="default" className="p-6">
                <h3 className="text-lg font-semibold text-foreground mb-4">Recent Entries</h3>
                <div className="space-y-3 max-h-64 overflow-y-auto">
                  {savedEntries.slice(0, 3).map((entry) => (
                    <div key={entry.id} className="p-3 bg-muted rounded-xl">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-foreground capitalize">
                          {entry.mood}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {entry.date}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {entry.entry}
                      </p>
                    </div>
                  ))}
                </div>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Journal;