import { RequestHandler } from 'express';
import mongoose from 'mongoose';
import Notice from './notice.model';
import { INotice, NoticeType, NoticePriority, NoticeStatus } from './notice.interface';
import { broadcastNotice, addSseClient, removeSseClient } from './notice.sse';
import webpush from 'web-push';
import config from '../../config';
import { PushService } from '../Push/push.service';

// Configure web-push with VAPID keys
if (config.vapid.public_key && config.vapid.private_key) {
  webpush.setVapidDetails(
    config.vapid.email || 'mailto:mimam22.cse@bu.ac.bd',
    config.vapid.public_key,
    config.vapid.private_key
  );
}

const sendPushNotification = async (notice: any) => {
  const subscriptions = await PushService.getAllSubscriptions();
  const notificationPayload = JSON.stringify({
    title: notice.title,
    body: notice.type === 'text' ? notice.body : 'A new PDF notice is available.',
    icon: '/static/logo.png',
    data: {
      url: '/dashboard/notice',
      id: notice._id,
    },
  });

  const pushPromises = subscriptions.map((sub) =>
    webpush.sendNotification(sub.subscription as any, notificationPayload).catch((err: any) => {
      console.error('Error sending push notification:', err);
      if (err.statusCode === 410 || err.statusCode === 404) {
        // Subscription has expired or is no longer valid
        PushService.unsubscribe(sub.subscription.endpoint);
      }
    })
  );

  await Promise.all(pushPromises);
};

type CreateNoticeBody = {
  title: string;
  type: NoticeType;
  priority?: NoticePriority;
  status?: NoticeStatus;
  body?: string;
  fileUrl?: string;
};

type UpdateNoticeBody = {
  title?: string;
  type?: NoticeType;
  priority?: NoticePriority;
  status?: NoticeStatus;
  body?: string;
  fileUrl?: string;
};

function isValidNoticeType(v: unknown): v is NoticeType {
  return v === 'text' || v === 'pdf';
}

function isValidPriority(v: unknown): v is NoticePriority {
  return v === 'low' || v === 'medium' || v === 'high';
}

function isValidStatus(v: unknown): v is NoticeStatus {
  return v === 'draft' || v === 'published';
}

function isNonEmptyString(v: unknown): v is string {
  return typeof v === 'string' && v.trim().length > 0;
}

export const getAllNotices: RequestHandler = async (req, res) => {
  const { page = 1, limit = 10, searchTerm, status, priority } = req.query;

  const query: any = {};

  if (searchTerm) {
    query.$or = [
      { title: { $regex: searchTerm, $options: 'i' } },
      { body: { $regex: searchTerm, $options: 'i' } },
    ];
  }

  if (status) query.status = status;
  if (priority) query.priority = priority;

  const skip = (Number(page) - 1) * Number(limit);

  const list = await Notice.find(query)
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(Number(limit))
    .lean();

  const total = await Notice.countDocuments(query);

  return res.json({
    success: true,
    data: list,
    meta: {
      total,
      page: Number(page),
      limit: Number(limit),
      totalPages: Math.ceil(total / Number(limit)),
    },
  });
};

export const createNotice: RequestHandler<{}, unknown, CreateNoticeBody> = async (req, res) => {
  const { title, type, priority, status, body, fileUrl } = req.body;

  if (!isNonEmptyString(title)) {
    return res.status(400).json({ success: false, message: 'Title is required' });
  }
  if (!isValidNoticeType(type)) {
    return res.status(400).json({ success: false, message: 'Invalid notice type' });
  }

  let textBody: string | null = null;
  let pdfFileUrl: string | null = null;

  if (type === 'text') {
    if (!isNonEmptyString(body)) {
      return res.status(400).json({ success: false, message: 'Notice text is required' });
    }
    textBody = body.trim();
  }

  if (type === 'pdf') {
    if (!isNonEmptyString(fileUrl)) {
      return res.status(400).json({ success: false, message: 'PDF fileUrl is required' });
    }
    pdfFileUrl = fileUrl.trim();
  }

  const doc: Partial<INotice> = {
    title: title.trim(),
    type,
    priority: priority || 'medium',
    status: status || 'published',
    body: textBody,
    fileUrl: pdfFileUrl,
    isPublished: status !== 'draft',
    publishedAt: status !== 'draft' ? new Date() : null,
    createdBy: new mongoose.Types.ObjectId((req as any).user.userId),
  };

  const created = await Notice.create(doc);

  if (created.status === 'published') {
    broadcastNotice({
      id: String(created._id),
      title: created.title,
      type: created.type,
      body: created.body ?? '',
      fileUrl: created.fileUrl ?? '',
      createdAt: created.createdAt,
      publishedAt: created.publishedAt,
      isPublished: created.isPublished,
    });
    // Trigger Push Notification
    sendPushNotification(created);
  }

  return res.status(201).json({ success: true, message: 'Notice created', data: created });
};

export const publishOrUpdateNotice: RequestHandler<
  { id: string },
  unknown,
  UpdateNoticeBody
> = async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ success: false, message: 'Invalid notice id' });
  }

  const update: Partial<INotice> = {};
  const { title, type, priority, status, body, fileUrl } = req.body;

  if (typeof title !== 'undefined') {
    if (!isNonEmptyString(title)) {
      return res.status(400).json({ success: false, message: 'Title cannot be empty' });
    }
    update.title = title.trim();
  }

  if (typeof type !== 'undefined') {
    if (!isValidNoticeType(type)) {
      return res.status(400).json({ success: false, message: 'Invalid notice type' });
    }
    update.type = type;
  }

  if (typeof priority !== 'undefined') {
    if (!isValidPriority(priority)) {
      return res.status(400).json({ success: false, message: 'Invalid priority' });
    }
    update.priority = priority;
  }

  if (typeof status !== 'undefined') {
    if (!isValidStatus(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status' });
    }
    update.status = status;
    if (status === 'published') {
      update.isPublished = true;
      update.publishedAt = new Date();
    }
  }

  if (typeof body !== 'undefined') {
    update.body = body ? body.trim() : null;
  }

  if (typeof fileUrl !== 'undefined') {
    update.fileUrl = fileUrl ? fileUrl.trim() : null;
  }

  const updated = await Notice.findByIdAndUpdate(id, update, { new: true });
  if (!updated) {
    return res.status(404).json({ success: false, message: 'Notice not found' });
  }

  if (updated.status === 'published') {
    broadcastNotice({
      id: String(updated._id),
      title: updated.title,
      type: updated.type,
      body: updated.body ?? '',
      fileUrl: updated.fileUrl ?? '',
      createdAt: updated.createdAt,
      publishedAt: updated.publishedAt,
      isPublished: updated.isPublished,
    });
    // Trigger Push Notification
    sendPushNotification(updated);
  }

  return res.json({ success: true, message: 'Notice updated', data: updated });
};

export const deleteNotice: RequestHandler<{ id: string }> = async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ success: false, message: 'Invalid notice id' });
  }

  const deleted = await Notice.findByIdAndDelete(id);
  if (!deleted) {
    return res.status(404).json({ success: false, message: 'Notice not found' });
  }

  return res.json({ success: true, message: 'Notice deleted' });
};

export const notifyAll: RequestHandler<{ id: string }> = async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ success: false, message: 'Invalid notice id' });
  }

  const notice = await Notice.findById(id).lean();
  if (!notice) {
    return res.status(404).json({ success: false, message: 'Notice not found' });
  }

  broadcastNotice({
    id: String(notice._id),
    title: notice.title,
    type: notice.type,
    body: notice.body ?? '',
    fileUrl: notice.fileUrl ?? '',
    createdAt: notice.createdAt,
    publishedAt: notice.publishedAt,
    isPublished: notice.isPublished,
  });

  return res.json({ success: true, message: 'Notified all active users' });
};

export const sseStream: RequestHandler = async (req, res) => {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.flushHeaders?.();

  const id = `${Date.now()}-${Math.random().toString(16).slice(2)}`;
  addSseClient(id, res);

  const ping = setInterval(() => {
    res.write(`event: ping\n`);
    res.write(`data: {}\n\n`);
  }, 25000);

  req.on('close', () => {
    clearInterval(ping);
    removeSseClient(id);
  });
};
