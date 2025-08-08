import { useState, useEffect } from 'react';

interface Song {
  id: number;
  title: string;
  artist: string;
  duration: string;
}

interface Playlist {
  mood: string;
  songs: Song[];
  description: string;
}

const useMoodPlaylist = () => {
  const [currentPlaylist, setCurrentPlaylist] = useState<Playlist | null>(null);
  const [loading, setLoading] = useState(false);

  const playlists: Record<string, Playlist> = {
    calm: {
      mood: 'Calm',
      description: 'Peaceful tracks to help you relax and unwind',
      songs: [
        { id: 1, title: "Weightless", artist: "Marconi Union", duration: "8:08" },
        { id: 2, title: "Clair de Lune", artist: "Claude Debussy", duration: "5:25" },
        { id: 3, title: "Aqueous Transmission", artist: "Incubus", duration: "7:49" },
        { id: 4, title: "River", artist: "Eminem", duration: "5:30" },
        { id: 5, title: "Mad World", artist: "Gary Jules", duration: "3:07" }
      ]
    },
    uplifting: {
      mood: 'Uplifting',
      description: 'Energizing songs to boost your spirits',
      songs: [
        { id: 1, title: "Happy", artist: "Pharrell Williams", duration: "3:53" },
        { id: 2, title: "Good as Hell", artist: "Lizzo", duration: "2:39" },
        { id: 3, title: "Can't Stop the Feeling", artist: "Justin Timberlake", duration: "3:56" },
        { id: 4, title: "Walking on Sunshine", artist: "Katrina and the Waves", duration: "3:58" },
        { id: 5, title: "Three Little Birds", artist: "Bob Marley", duration: "3:00" }
      ]
    },
    reflective: {
      mood: 'Reflective',
      description: 'Thoughtful music for introspection and contemplation',
      songs: [
        { id: 1, title: "The Sound of Silence", artist: "Simon & Garfunkel", duration: "3:05" },
        { id: 2, title: "Hurt", artist: "Johnny Cash", duration: "3:38" },
        { id: 3, title: "Black", artist: "Pearl Jam", duration: "5:43" },
        { id: 4, title: "Mad World", artist: "Tears for Fears", duration: "3:30" },
        { id: 5, title: "The Night We Met", artist: "Lord Huron", duration: "3:28" }
      ]
    }
  };

  const generatePlaylist = async (mood: string) => {
    setLoading(true);
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    const playlist = playlists[mood.toLowerCase()];
    if (playlist) {
      setCurrentPlaylist(playlist);
    }
    
    setLoading(false);
  };

  const clearPlaylist = () => {
    setCurrentPlaylist(null);
  };

  return {
    currentPlaylist,
    loading,
    generatePlaylist,
    clearPlaylist
  };
};

export default useMoodPlaylist;