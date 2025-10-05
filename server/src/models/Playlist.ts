import mongoose, { Document, Schema } from 'mongoose';

export interface ISong {
  id: string;
  title: string;
  artist: string;
  spotifyUrl: string;
  duration?: number; // seconds (optional)
  imageUrl?: string;
}

export interface IPlaylist extends Document {
  userId: mongoose.Types.ObjectId;
  name: string;
  category: string;
  description?: string;
  songs: ISong[];
  isPublic: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const SongSchema = new Schema<ISong>({
  id: {
    type: String,
    required: true
  },
  title: {
    type: String,
    required: true,
    trim: true,
    maxlength: 200
  },
  artist: {
    type: String,
    required: true,
    trim: true,
    maxlength: 200
  },
  spotifyUrl: {
    type: String,
    required: true,
    trim: true
  },
  duration: {
    type: Number,
  },
  imageUrl: {
    type: String,
    trim: true
  }
}, { _id: false });

const PlaylistSchema = new Schema<IPlaylist>({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  name: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100
  },
  category: {
    type: String,
    required: true,
    // Extended categories to match frontend usage
    enum: ['happy', 'sad', 'anxious', 'neutral', 'excited', 'calm', 'angry', 'frustrated', 'grateful', 'hopeful', 'uplifting', 'reflective', 'energetic', 'focused', 'sleep'],
    default: 'neutral'
  },
  description: {
    type: String,
    trim: true,
    maxlength: 500
  },
  songs: [SongSchema],
  isPublic: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

// Indexes for better query performance
PlaylistSchema.index({ userId: 1, createdAt: -1 });
PlaylistSchema.index({ category: 1 });
PlaylistSchema.index({ isPublic: 1 });

export default mongoose.model<IPlaylist>('Playlist', PlaylistSchema);
