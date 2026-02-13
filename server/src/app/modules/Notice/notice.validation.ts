import { NoticeType, NoticePriority, NoticeStatus } from './notice.interface';

export type CreateNoticeBody = {
  title?: string;
  type?: NoticeType;
  priority?: NoticePriority;
  status?: NoticeStatus;
  body?: string;
  fileUrl?: string;
};

export function isNonEmptyString(v: unknown): v is string {
  return typeof v === 'string' && v.trim().length > 0;
}

export function isValidNoticeType(v: unknown): v is NoticeType {
  return v === 'text' || v === 'pdf';
}

export function isValidPriority(v: unknown): v is NoticePriority {
  return v === 'low' || v === 'medium' || v === 'high';
}

export function isValidStatus(v: unknown): v is NoticeStatus {
  return v === 'draft' || v === 'published';
}
