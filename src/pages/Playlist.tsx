import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Music, Play, Clock, Shuffle, Heart, Plus, Trash2, Save, Edit3 } from 'lucide-react';
import Button from '../components/Button';
import Card from '../components/Card';
import { useApp } from '../contexts/AppContext';

type PlaylistSong = {
  title: string;
  artist: string;
  spotifyUrl: string;
  duration?: number;
  imageUrl?: string;
};

type Playlist = {
  _id?: string;
  name: string;
  category: 'happy' | 'sad' | 'calm' | 'energetic' | 'focused' | 'sleep';
  songs: PlaylistSong[];
  createdAt: string;
  updatedAt: string;
};

const Playlist = () => {
  const { addNotification } = useApp();
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingPlaylist, setEditingPlaylist] = useState<Playlist | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [searchParams] = useSearchParams();

  const [formData, setFormData] = useState({
    name: '',
    category: 'happy' as const,
    songs: []
  });

  const categories = [
    { id: 'happy', label: 'Happy', icon: '😊', color: 'from-yellow to-accent' },
    { id: 'sad', label: 'Sad', icon: '😢', color: 'from-primary to-peach' },
    { id: 'calm', label: 'Calm', icon: '🧘', color: 'from-lavender-light to-primary' },
    { id: 'energetic', label: 'Energetic', icon: '⚡', color: 'from-accent to-yellow' },
    { id: 'focused', label: 'Focused', icon: '🎯', color: 'from-primary to-accent' },
    { id: 'sleep', label: 'Sleep', icon: '🌙', color: 'from-primary to-peach' }
  ];

  useEffect(() => {
    loadPlaylists();
  }, []);

  // Sync selected category with URL query param (?category=happy)
  useEffect(() => {
    const cat = searchParams.get('category') || '';
    const allowed = ['happy','sad','calm','energetic','focused','sleep'];
    if (cat && allowed.includes(cat)) {
      setSelectedCategory(cat);
    }
  }, [searchParams]);

  const loadPlaylists = async () => {
    try {
      setLoading(true);
      setError(null);
      const token = localStorage.getItem('mindflow_token');
      const res = await fetch('/api/playlist', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error('Failed to load playlists');
      const data = await res.json();
      setPlaylists(data);
    } catch (e: any) {
      setError(e.message || 'Failed to load playlists');
    } finally {
      setLoading(false);
    }
  };

  const handleCreatePlaylist = async () => {
    try {
      setSaving(true);
      const token = localStorage.getItem('mindflow_token');
      const res = await fetch('/api/playlist', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json', 
          Authorization: `Bearer ${token}` 
        },
        body: JSON.stringify(formData),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Failed to create playlist');
      }

      const newPlaylist = await res.json();
      setPlaylists(prev => [newPlaylist, ...prev]);
      setShowCreateForm(false);
      setFormData({ name: '', category: 'happy', songs: [] });
      
      addNotification({
        type: 'success',
        title: 'Playlist Created!',
        message: 'Your playlist has been saved successfully.',
      });
    } catch (e: any) {
      addNotification({
        type: 'error',
        title: 'Failed to Create Playlist',
        message: e.message || 'Please try again.',
      });
    } finally {
      setSaving(false);
    }
  };

  const handleDeletePlaylist = async (id: string) => {
    try {
      const token = localStorage.getItem('mindflow_token');
      const res = await fetch(`/api/playlist/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) throw new Error('Failed to delete playlist');

      setPlaylists(prev => prev.filter(p => p._id !== id));
      
      addNotification({
        type: 'success',
        title: 'Playlist Deleted',
        message: 'Your playlist has been removed.',
      });
    } catch (e: any) {
      addNotification({
        type: 'error',
        title: 'Failed to Delete Playlist',
        message: e.message || 'Please try again.',
      });
    }
  };

  const addSong = () => {
    setFormData(prev => ({
      ...prev,
      songs: [...prev.songs, { title: '', artist: '', spotifyUrl: '' }]
    }));
  };

  const removeSong = (index: number) => {
    setFormData(prev => ({
      ...prev,
      songs: prev.songs.filter((_, i) => i !== index)
    }));
  };

  const updateSong = (index: number, field: keyof PlaylistSong, value: string) => {
    setFormData(prev => ({
      ...prev,
      songs: prev.songs.map((song, i) => 
        i === index ? { ...song, [field]: value } : song
      )
    }));
  };

  const isValidSpotifyUrl = (url: string) => {
    try {
      const u = new URL(url);
      return u.protocol === 'https:' && u.hostname.includes('open.spotify.com');
    } catch {
      return false;
    }
  };

  const isFormValid = () => {
    if (!formData.name.trim()) return false;
    if (formData.songs.length === 0) return false;
    return formData.songs.every(
      (s) => s.title.trim() && s.artist.trim() && isValidSpotifyUrl(s.spotifyUrl)
    );
  };

  const filteredPlaylists = selectedCategory 
    ? playlists.filter(p => p.category === selectedCategory)
    : playlists;

  const getTotalDuration = (songs: PlaylistSong[]) => {
    const totalMinutes = songs.length * 4; // Rough average
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
          <h1 className="text-4xl font-bold text-foreground mb-4">My Playlists</h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Create and manage your mood-based playlists with Spotify songs.
          </p>
        </div>

        {/* Category Filter */}
        <div className="mb-8">
          <div className="flex flex-wrap gap-2 justify-center">
            <button
              onClick={() => setSelectedCategory('')}
              className={`px-4 py-2 rounded-full transition-colors ${
                selectedCategory === '' 
                  ? 'bg-primary text-primary-foreground' 
                  : 'bg-muted text-muted-foreground hover:bg-secondary'
              }`}
            >
              All
            </button>
            {categories.map(cat => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-4 py-2 rounded-full transition-colors ${
                  selectedCategory === cat.id 
                    ? 'bg-primary text-primary-foreground' 
                    : 'bg-muted text-muted-foreground hover:bg-secondary'
                }`}
              >
                {cat.icon} {cat.label}
              </button>
            ))}
          </div>
        </div>

        {/* Create Playlist Button */}
        <div className="mb-8 text-center">
          <Button
            onClick={() => setShowCreateForm(true)}
            variant="therapeutic"
            className="px-8"
          >
            <Plus className="w-5 h-5 mr-2" />
            Create New Playlist
          </Button>
        </div>

        {/* Create/Edit Form */}
        {showCreateForm && (
          <Card variant="default" className="p-8 mb-8">
            <h3 className="text-2xl font-semibold text-foreground mb-6">
              {editingPlaylist ? 'Edit Playlist' : 'Create New Playlist'}
            </h3>
            
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Playlist Name
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  className="input-therapeutic w-full"
                  placeholder="Enter playlist name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Category
                </label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value as any }))}
                  className="input-therapeutic w-full"
                >
                  {categories.map(cat => (
                    <option key={cat.id} value={cat.id}>
                      {cat.icon} {cat.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <div className="flex items-center justify-between mb-4">
                  <label className="block text-sm font-medium text-foreground">
                    Songs
                  </label>
                  <Button
                    onClick={addSong}
                    variant="outline"
                    size="sm"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Add Song
                  </Button>
                </div>

                <div className="space-y-4">
                  {formData.songs.map((song, index) => (
                    <div key={index} className="grid grid-cols-1 md:grid-cols-4 gap-4 p-4 border border-border rounded-lg">
                      <input
                        type="text"
                        placeholder="Song Title"
                        value={song.title}
                        onChange={(e) => updateSong(index, 'title', e.target.value)}
                        className="input-therapeutic"
                      />
                      <input
                        type="text"
                        placeholder="Artist"
                        value={song.artist}
                        onChange={(e) => updateSong(index, 'artist', e.target.value)}
                        className="input-therapeutic"
                      />
                      <input
                        type="url"
                        placeholder="Spotify URL"
                        value={song.spotifyUrl}
                        onChange={(e) => updateSong(index, 'spotifyUrl', e.target.value)}
                        className="input-therapeutic"
                      />
                      <Button
                        onClick={() => removeSong(index)}
                        variant="outline"
                        size="sm"
                        className="text-destructive hover:bg-destructive hover:text-destructive-foreground"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex space-x-4">
                <Button
                  onClick={handleCreatePlaylist}
                  variant="therapeutic"
                  disabled={saving || !isFormValid()}
                >
                  {saving ? (
                    <div className="flex items-center">
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2"></div>
                      Saving...
                    </div>
                  ) : (
                    <>
                      <Save className="w-4 h-4 mr-2" />
                      {editingPlaylist ? 'Update Playlist' : 'Create Playlist'}
                    </>
                  )}
                </Button>
                <Button
                  onClick={() => {
                    setShowCreateForm(false);
                    setEditingPlaylist(null);
                    setFormData({ name: '', category: 'happy', songs: [] });
                  }}
                  variant="outline"
                >
                  Cancel
                </Button>
              </div>
            </div>
          </Card>
        )}

        {/* Playlists Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map(i => (
              <Card key={i} variant="default" className="p-6">
                <div className="animate-pulse">
                  <div className="h-4 bg-muted rounded mb-4"></div>
                  <div className="h-3 bg-muted rounded mb-2"></div>
                  <div className="h-3 bg-muted rounded"></div>
                </div>
              </Card>
            ))}
          </div>
        ) : filteredPlaylists.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredPlaylists.map((playlist) => {
              const categoryInfo = categories.find(c => c.id === playlist.category);
              const isExpanded = expandedId === playlist._id;
              return (
                <Card
                  key={playlist._id}
                  variant="default"
                  className="p-6 group hover:shadow-lg transition-shadow cursor-pointer"
                  onClick={() => setExpandedId(prev => (prev === playlist._id ? null : (playlist._id || null)))}
                  role="button"
                  tabIndex={0}
                  aria-expanded={isExpanded}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      setExpandedId(prev => (prev === playlist._id ? null : (playlist._id || null)));
                    }
                  }}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className={`w-12 h-12 rounded-lg bg-gradient-to-r ${categoryInfo?.color} flex items-center justify-center text-2xl`}>
                      {categoryInfo?.icon}
                    </div>
                    <div className="flex space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button
                        onClick={(e) => {
                          e.stopPropagation();
                          setEditingPlaylist(playlist);
                          setFormData({
                            name: playlist.name,
                            category: playlist.category,
                            songs: playlist.songs
                          });
                          setShowCreateForm(true);
                        }}
                        variant="outline"
                        size="sm"
                      >
                        <Edit3 className="w-4 h-4" />
                      </Button>
                      <Button
                        onClick={(e) => { e.stopPropagation(); handleDeletePlaylist(playlist._id!); }}
                        variant="outline"
                        size="sm"
                        className="text-destructive hover:bg-destructive hover:text-destructive-foreground"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                  
                  <h3 className="text-xl font-semibold text-foreground mb-2">{playlist.name}</h3>
                  <p className="text-muted-foreground text-sm mb-4 capitalize">{playlist.category}</p>
                  
                  <div className="space-y-2 text-sm text-muted-foreground">
                    <div className="flex items-center space-x-2">
                      <Music className="w-4 h-4" />
                      <span>{playlist.songs.length} songs</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Clock className="w-4 h-4" />
                      <span>{getTotalDuration(playlist.songs)}</span>
                    </div>
                  </div>

                  <div className="mt-4 pt-4 border-t border-border">
                    <div className={`space-y-2 ${isExpanded ? 'max-h-96' : 'max-h-32'} overflow-y-auto`}>
                      {(isExpanded ? playlist.songs : playlist.songs.slice(0, 3)).map((song, index) => (
                        <a
                          key={index}
                          href={song.spotifyUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={(e) => e.stopPropagation()}
                          className="block text-sm p-2 rounded hover:bg-muted transition-colors"
                        >
                          <p className="font-medium text-foreground truncate">{song.title}</p>
                          <p className="text-muted-foreground truncate">{song.artist}</p>
                        </a>
                      ))}
                      {!isExpanded && playlist.songs.length > 3 && (
                        <p className="text-xs text-muted-foreground">
                          +{playlist.songs.length - 3} more songs
                        </p>
                      )}
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        ) : (
          <Card variant="default" className="p-12 text-center">
            <Music className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-foreground mb-2">No Playlists Yet</h3>
            <p className="text-muted-foreground mb-6">
              {selectedCategory 
                ? `No ${selectedCategory} playlists found. Create one to get started!`
                : 'Create your first playlist to get started!'
              }
            </p>
            <Button
              onClick={() => setShowCreateForm(true)}
              variant="therapeutic"
            >
              <Plus className="w-5 h-5 mr-2" />
              Create Playlist
            </Button>
          </Card>
        )}

        {error && (
          <Card variant="default" className="p-6 text-center">
            <p className="text-destructive">{error}</p>
          </Card>
        )}
      </div>
    </div>
  );
};

export default Playlist;