import mongoose, { Document, Schema } from 'mongoose';

export interface IChatMessage extends Document {
  roomId: string;
  userId: mongoose.Types.ObjectId;
  content: string;
  sender: 'user' | 'peer' | 'moderator';
  reactions?: Record<string, number>;
  isEdited: boolean;
  editedAt?: Date;
  createdAt: Date;
}

export interface IChatRoom extends Document {
  id: string;
  name: string;
  description: string;
  isActive: boolean;
  memberCount: number;
  createdAt: Date;
  updatedAt: Date;
}

const ChatMessageSchema = new Schema<IChatMessage>({
  roomId: {
    type: String,
    required: true,
    trim: true
  },
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  content: {
    type: String,
    required: true,
    trim: true,
    maxlength: 1000
  },
  sender: {
    type: String,
    enum: ['user', 'peer', 'moderator'],
    default: 'user'
  },
  reactions: {
    type: Map,
    of: Number,
    default: new Map()
  },
  isEdited: {
    type: Boolean,
    default: false
  },
  editedAt: {
    type: Date
  }
}, {
  timestamps: true
});

const ChatRoomSchema = new Schema<IChatRoom>({
  id: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  name: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100
  },
  description: {
    type: String,
    required: true,
    trim: true,
    maxlength: 500
  },
  isActive: {
    type: Boolean,
    default: true
  },
  memberCount: {
    type: Number,
    default: 0,
    min: 0
  }
}, {
  timestamps: true
});

// Indexes for better query performance
ChatMessageSchema.index({ roomId: 1, createdAt: -1 });
ChatMessageSchema.index({ userId: 1 });
ChatRoomSchema.index({ id: 1 });
ChatRoomSchema.index({ isActive: 1 });

export const ChatMessage = mongoose.model<IChatMessage>('ChatMessage', ChatMessageSchema);
export const ChatRoom = mongoose.model<IChatRoom>('ChatRoom', ChatRoomSchema);
