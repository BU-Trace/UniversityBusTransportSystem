import { Model, Types } from 'mongoose';

export type NoticeType = 'text' | 'pdf';
export type NoticePriority = 'low' | 'medium' | 'high';
export type NoticeStatus = 'draft' | 'published';

export interface INotice {
  title: string;
  type: NoticeType;
  priority: NoticePriority;
  status: NoticeStatus;
  body: string | null;
  fileUrl: string | null;

  isPublished: boolean;
  publishedAt: Date | null;

  createdBy: Types.ObjectId | null;

  createdAt?: Date;
  updatedAt?: Date;
}

export type NoticeModel = Model<INotice>;
