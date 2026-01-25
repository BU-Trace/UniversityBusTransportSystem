import mongoose, { Schema } from 'mongoose';

const IssueSchema = new Schema(
  {
    issue_id: {
      type: String,
      required: true,
      unique: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
      trim: true,
    },
    category: {
      type: String,
      enum: ['bug', 'feature', 'complaint', 'other'],
      default: 'other',
    },
    status: {
      type: String,
      enum: ['open', 'in_progress', 'resolved', 'closed'],
      default: 'open',
    },
    priority: {
      type: String,
      enum: ['low', 'medium', 'high', 'urgent'],
      default: 'medium',
    },
    reporter: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    relatedBus: {
      type: Schema.Types.ObjectId,
      ref: 'Bus',
      default: null,
    },
    relatedRoute: {
      type: Schema.Types.ObjectId,
      ref: 'Route',
      default: null,
    },
    submittedByRole: {
      type: String,
      enum: ['superadmin', 'admin', 'student', 'driver'],
      required: false,
    },
  },
  { timestamps: true }
);

export const Issue = mongoose.model('Issue', IssueSchema);
