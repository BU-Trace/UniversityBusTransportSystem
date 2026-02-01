import mongoose, { Schema, Document, Types } from 'mongoose';

export interface IChatSession extends Document {
  userId?: Types.ObjectId; // Registered user
  sessionId?: string; // Anonymous session
  history: Array<{
    role: 'user' | 'assistant';
    content: string;
    timestamp: Date;
  }>;
  createdAt: Date;
  updatedAt: Date;
}

const ChatSessionSchema = new Schema<IChatSession>({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: false },
  sessionId: { type: String, required: false },
  history: [
    {
      role: { type: String, enum: ['user', 'assistant'], required: true },
      content: { type: String, required: true },
      timestamp: { type: Date, default: Date.now },
    },
  ],
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

ChatSessionSchema.index({ userId: 1 });
ChatSessionSchema.index({ sessionId: 1 });

export const ChatSession = mongoose.model<IChatSession>('ChatSession', ChatSessionSchema);
