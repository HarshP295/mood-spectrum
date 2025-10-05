import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Save, Calendar, Sparkles } from 'lucide-react';
import MoodSelector from '../components/MoodSelector';
import Button from '../components/Button';
import Card from '../components/Card';
import { useApp } from '../contexts/AppContext';

const Journal = () => {
  const navigate = useNavigate();
  const { addNotification } = useApp();
  const [journalEntry, setJournalEntry] = useState('');
  const [selectedMood, setSelectedMood] = useState('');
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [entries, setEntries] = useState<Array<{ _id?: string; title: string; content: string; mood?: string; createdAt: string }>>([]);

  useEffect(() => {
    const loadEntries = async () => {
      try {
        setLoading(true);
        setError(null);
        const token = localStorage.getItem('mindflow_token');
        const res = await fetch('/api/journal', {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) throw new Error('Failed to fetch journal entries');
        const data = await res.json();
        setEntries(
          data.map((e: any) => ({
            _id: e._id,
            title: e.title,
            content: e.content,
            mood: e.mood,
            createdAt: e.createdAt,
          }))
        );
      } catch (e: any) {
        setError(e.message || 'Failed to load entries');
      } finally {
        setLoading(false);
      }
    };
    loadEntries();
  }, []);

  const playlistCategoryForMood = (m: string): string | null => {
    const map: Record<string, string> = {
      happy: 'happy',
      sad: 'sad',
      calm: 'calm',
      excited: 'energetic',
      anxious: 'calm',
      neutral: 'focused',
    };
    if (map[m]) return map[m];
    const allowed = ['happy','sad','calm','energetic','focused','sleep'];
    return allowed.includes(m) ? m : null;
  };

  const handleSave = async () => {
    if (!selectedMood || !journalEntry.trim()) {
      addNotification({
        type: 'warning',
        title: 'Incomplete Entry',
        message: 'Please select a mood and write your thoughts before saving.',
      });
      return;
    }

    try {
      setSaving(true);
      const token = localStorage.getItem('mindflow_token');
      const optimistic = {
        _id: `temp_${Date.now()}`,
        title: journalEntry.slice(0, 40) || 'Journal Entry',
        content: journalEntry,
        mood: selectedMood,
        createdAt: new Date().toISOString(),
      };
      setEntries((prev) => [optimistic, ...prev]);

      const res = await fetch('/api/journal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ title: optimistic.title, content: optimistic.content, mood: optimistic.mood }),
      });

      if (!res.ok) {
        setEntries((prev) => prev.filter((e) => e._id !== optimistic._id));
        throw new Error('Failed to save your entry');
      }

      const saved = await res.json();
      setEntries((prev) => [
        { _id: saved._id, title: saved.title, content: saved.content, mood: saved.mood, createdAt: saved.createdAt },
        ...prev.filter((e) => e._id !== optimistic._id),
      ]);

      setSelectedMood('');
      setJournalEntry('');

      const cat = playlistCategoryForMood(saved?.mood || selectedMood);
      addNotification({
        type: 'success',
        title: 'Entry Saved!',
        message: cat
          ? `Want music to match your mood? Explore ${cat} playlists.`
          : 'Your journal entry has been saved successfully.',
        actions: cat
          ? [{
              label: `Open ${cat.charAt(0).toUpperCase() + cat.slice(1)} Playlists`,
              action: () => navigate(`/playlist?category=${cat}`),
            }]
          : undefined,
      });
    } catch (error) {
      addNotification({
        type: 'error',
        title: 'Save Failed',
        message: 'Failed to save your entry. Please try again.',
      });
    } finally {
      setSaving(false);
    }
  };

  const getMoodIntensity = (_mood: string): number => 0; // no longer used

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
                    disabled={saving || !selectedMood || !journalEntry.trim()}
                  >
                    {saving ? (
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
            {loading ? (
              <Card variant="default" className="p-6">
                <h3 className="text-lg font-semibold text-foreground mb-4">Recent Entries</h3>
                <div className="space-y-3">
                  <div className="h-4 bg-muted rounded animate-pulse"></div>
                  <div className="h-4 bg-muted rounded animate-pulse"></div>
                  <div className="h-4 bg-muted rounded animate-pulse"></div>
                </div>
              </Card>
            ) : entries.length > 0 ? (
              <Card variant="default" className="p-6">
                <h3 className="text-lg font-semibold text-foreground mb-4">Recent Entries</h3>
                <div className="space-y-3 max-h-64 overflow-y-auto">
                  {entries.slice(0, 3).map((entry) => (
                    <div key={entry._id} className="p-3 bg-muted rounded-xl">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-foreground capitalize">
                          {entry.mood || '—'}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {new Date(entry.createdAt).toLocaleString()}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {entry.content}
                      </p>
                    </div>
                  ))}
                </div>
              </Card>
            ) : null}
            {error && (
              <p className="text-sm text-destructive">{error}</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Journal;