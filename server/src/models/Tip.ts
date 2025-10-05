import mongoose, { Document, Schema } from 'mongoose';

export interface ITip extends Document {
  title: string;
  content: string;
  category: 'mindfulness' | 'exercise' | 'sleep' | 'nutrition' | 'social' | 'general';
  tags: string[];
  isActive: boolean;
  createdBy: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const TipSchema = new Schema<ITip>({
  title: {
    type: String,
    required: true,
    trim: true,
    maxlength: 200
  },
  content: {
    type: String,
    required: true,
    maxlength: 2000
  },
  category: {
    type: String,
    required: true,
    enum: ['mindfulness', 'exercise', 'sleep', 'nutrition', 'social', 'general'],
    default: 'general'
  },
  tags: [{
    type: String,
    trim: true,
    maxlength: 50
  }],
  isActive: {
    type: Boolean,
    default: true
  },
  createdBy: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, {
  timestamps: true
});

// Indexes for better query performance
TipSchema.index({ category: 1, isActive: 1 });
TipSchema.index({ tags: 1 });
TipSchema.index({ createdAt: -1 });

export default mongoose.model<ITip>('Tip', TipSchema);
