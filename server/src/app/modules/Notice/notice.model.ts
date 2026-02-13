import mongoose, { Schema } from 'mongoose';
import { INotice } from './notice.interface';

const noticeSchema = new Schema<INotice>(
  {
    title: { type: String, required: true, trim: true },
    type: { type: String, enum: ['text', 'pdf'], required: true },
    priority: {
      type: String,
      enum: ['low', 'medium', 'high'],
      default: 'medium',
    },
    status: {
      type: String,
      enum: ['draft', 'published'],
      default: 'published',
    },

    body: { type: String, default: null },
    fileUrl: { type: String, default: null },

    isPublished: { type: Boolean, default: true },
    publishedAt: { type: Date, default: () => new Date() },
    createdBy: { type: Schema.Types.ObjectId, ref: 'User', default: null },
  },
  { timestamps: true }
);

const Notice = mongoose.model<INotice>('Notice', noticeSchema);
export default Notice;
