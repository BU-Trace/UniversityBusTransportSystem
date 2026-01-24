import mongoose, { Schema } from 'mongoose';

const NotificationSchema = new Schema(
  {
    notification_id: {
      type: String,
      required: true,
      unique: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    message: {
      type: String,
      required: true,
      trim: true,
    },
    category: {
      type: String,
      enum: ['system', 'alert', 'reminder'],
      default: 'system',
    },
    recipient: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    targetRole: {
      type: String,
      enum: ['superadmin', 'admin', 'student', 'driver', 'all'],
      default: 'all',
    },
    isRead: {
      type: Boolean,
      default: false,
    },
    sentAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

export const Notification = mongoose.model('Notification', NotificationSchema);
