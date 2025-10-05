import mongoose, { Document, Schema } from 'mongoose';

export interface IJournal extends Document {
  userId: mongoose.Types.ObjectId;
  title: string;
  content: string;
  mood?: string;
  tags?: string[];
  isPrivate: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const JournalSchema = new Schema<IJournal>({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  title: {
    type: String,
    required: true,
    trim: true,
    maxlength: 200
  },
  content: {
    type: String,
    required: true,
    maxlength: 10000
  },
  mood: {
    type: String,
    enum: ['happy', 'sad', 'anxious', 'neutral', 'excited', 'calm', 'angry', 'frustrated', 'grateful', 'hopeful'],
    default: 'neutral'
  },
  tags: [{
    type: String,
    trim: true,
    maxlength: 50
  }],
  isPrivate: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Indexes for better query performance
JournalSchema.index({ userId: 1, createdAt: -1 });
JournalSchema.index({ mood: 1 });
JournalSchema.index({ tags: 1 });
JournalSchema.index({ createdAt: -1 });

export default mongoose.model<IJournal>('Journal', JournalSchema);
