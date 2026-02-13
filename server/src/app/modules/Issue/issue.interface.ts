import { Types } from 'mongoose';

export interface IIssue {
  _id?: string;
  issue_id?: string;
  title: string;
  description: string;
  category?: 'bug' | 'feature' | 'complaint' | 'other';
  status?: 'open' | 'in_progress' | 'resolved' | 'closed';
  priority?: 'low' | 'medium' | 'high' | 'urgent';
  reporter?: Types.ObjectId | null;
  relatedBus?: Types.ObjectId | null;
  relatedRoute?: Types.ObjectId | null;
  submittedByRole?: 'superadmin' | 'admin' | 'driver';
  contactInfo?: string;
  solution?: string;
  createdAt?: Date;
  updatedAt?: Date;
}
