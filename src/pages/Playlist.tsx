import { useState } from 'react';
import { Music, Play, Clock, Shuffle, Heart } from 'lucide-react';
import Button from '../components/Button';
import Card from '../components/Card';
import useMoodPlaylist from '../hooks/useMoodPlaylist';

const Playlist = () => {
  const { currentPlaylist, loading, generatePlaylist, clearPlaylist } = useMoodPlaylist();
  const [selectedMood, setSelectedMood] = useState<string>('');

  const moodOptions = [
    {
      id: 'calm',
      label: 'Calm & Relaxing',
      description: 'Peaceful tracks for meditation and relaxation',
      icon: '🧘',
      gradient: 'from-lavender-light to-primary'
    },
    {
      id: 'uplifting',
      label: 'Uplifting & Energizing',
      description: 'Boost your mood with positive vibes',
      icon: '⚡',
      gradient: 'from-yellow to-accent'
    },
    {
      id: 'reflective',
      label: 'Reflective & Thoughtful',
      description: 'Deep music for contemplation and introspection',
      icon: '🌙',
      gradient: 'from-primary to-peach'
    }
  ];

  const handleMoodSelect = (mood: string) => {
    setSelectedMood(mood);
    generatePlaylist(mood);
  };

  const formatDuration = (duration: string) => {
    return duration;
  };

  const getTotalDuration = () => {
    if (!currentPlaylist) return '0:00';
    
    // Simple calculation for demo
    const totalMinutes = currentPlaylist.songs.length * 4; // Rough average
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    
    return hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`;
  };

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-block p-4 bg-gradient-primary rounded-full mb-4 gentle-bounce">
            <Music className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-foreground mb-4">Mood-Based Playlists</h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Discover music that matches your current emotional state and helps you feel better.
          </p>
        </div>

        {!currentPlaylist ? (
          <>
            {/* Mood Selection */}
            <div className="mb-12">
              <h2 className="text-2xl font-semibold text-foreground text-center mb-8">
                How are you feeling right now?
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {moodOptions.map((mood) => (
                  <Card
                    key={mood.id}
                    variant="default"
                    className={`p-8 cursor-pointer group transition-all duration-300 ${
                      selectedMood === mood.id ? 'ring-2 ring-primary' : ''
                    }`}
                    onClick={() => handleMoodSelect(mood.id)}
                  >
                    <div className="text-center">
                      <div className={`w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-r ${mood.gradient} flex items-center justify-center text-3xl group-hover:scale-110 transition-transform duration-300`}>
                        {mood.icon}
                      </div>
                      <h3 className="text-xl font-semibold text-foreground mb-2">{mood.label}</h3>
                      <p className="text-muted-foreground text-sm leading-relaxed">{mood.description}</p>
                    </div>
                  </Card>
                ))}
              </div>
            </div>

            {/* Loading State */}
            {loading && (
              <div className="text-center">
                <div className="inline-block p-6 bg-gradient-primary rounded-full mb-4 therapeutic-pulse">
                  <Music className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-foreground mb-2">Creating Your Playlist...</h3>
                <p className="text-muted-foreground">Finding the perfect songs for your mood</p>
              </div>
            )}
          </>
        ) : (
          /* Playlist Display */
          <div className="space-y-8">
            {/* Playlist Header */}
            <Card variant="gradient" className="p-8">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-3xl font-bold text-white mb-2">
                    {currentPlaylist.mood} Playlist
                  </h2>
                  <p className="text-white/80 mb-4">{currentPlaylist.description}</p>
                  <div className="flex items-center space-x-6 text-white/70">
                    <div className="flex items-center space-x-2">
                      <Music className="w-4 h-4" />
                      <span>{currentPlaylist.songs.length} songs</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Clock className="w-4 h-4" />
                      <span>{getTotalDuration()}</span>
                    </div>
                  </div>
                </div>
                <div className="flex space-x-3">
                  <Button variant="outline" className="bg-white/20 border-white text-white hover:bg-white hover:text-primary">
                    <Shuffle className="w-5 h-5 mr-2" />
                    Shuffle
                  </Button>
                  <Button variant="outline" onClick={clearPlaylist} className="bg-white/20 border-white text-white hover:bg-white hover:text-primary">
                    New Playlist
                  </Button>
                </div>
              </div>
            </Card>

            {/* Song List */}
            <Card variant="default" className="overflow-hidden">
              <div className="p-6 border-b border-border">
                <h3 className="text-xl font-semibold text-foreground">Tracks</h3>
              </div>
              <div className="divide-y divide-border">
                {currentPlaylist.songs.map((song, index) => (
                  <div key={song.id} className="p-6 hover:bg-muted/50 transition-colors duration-200 group">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="w-12 h-12 bg-gradient-primary rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform duration-200">
                          <span className="text-white font-medium">{index + 1}</span>
                        </div>
                        <div>
                          <h4 className="font-medium text-foreground group-hover:text-primary transition-colors">
                            {song.title}
                          </h4>
                          <p className="text-muted-foreground text-sm">{song.artist}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-4">
                        <button className="p-2 rounded-full hover:bg-secondary transition-colors duration-200 opacity-0 group-hover:opacity-100">
                          <Heart className="w-5 h-5 text-muted-foreground hover:text-accent" />
                        </button>
                        <button className="p-2 rounded-full bg-primary text-primary-foreground hover:bg-primary/90 transition-colors duration-200 opacity-0 group-hover:opacity-100">
                          <Play className="w-5 h-5" />
                        </button>
                        <span className="text-muted-foreground text-sm font-medium w-12 text-right">
                          {formatDuration(song.duration)}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            {/* Demo Notice */}
            <Card variant="default" className="p-6 text-center">
              <p className="text-muted-foreground">
                🎵 This is a demo playlist. In a real app, these would be integrated with Spotify, Apple Music, or other streaming services.
              </p>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
};

export default Playlist;