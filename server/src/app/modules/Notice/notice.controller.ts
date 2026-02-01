import { RequestHandler } from "express";
import mongoose from "mongoose";
import Notice, { INotice, NoticeType } from "./notice.model";
import { broadcastNotice, addSseClient, removeSseClient } from "./notice.sse";

type CreateNoticeBody = {
  title: string;
  type: NoticeType;
  body?: string;
  fileUrl?: string;
};

type UpdateNoticeBody = {
  title?: string;
  type?: NoticeType;
  body?: string;
  fileUrl?: string;
};

function isValidNoticeType(v: unknown): v is NoticeType {
  return v === "text" || v === "pdf";
}

function isNonEmptyString(v: unknown): v is string {
  return typeof v === "string" && v.trim().length > 0;
}

export const getAllNotices: RequestHandler = async (_req, res) => {
  const list = await Notice.find().sort({ createdAt: -1 }).lean();
  return res.json({ success: true, data: list });
};

export const createNotice: RequestHandler<{}, unknown, CreateNoticeBody> = async (req, res) => {
  const { title, type, body, fileUrl } = req.body;

  if (!isNonEmptyString(title)) {
    return res.status(400).json({ success: false, message: "Title is required" });
  }
  if (!isValidNoticeType(type)) {
    return res.status(400).json({ success: false, message: "Invalid notice type" });
  }

  let textBody: string | null = null;
  let pdfFileUrl: string | null = null;

  if (type === "text") {
    if (!isNonEmptyString(body)) {
      return res.status(400).json({ success: false, message: "Notice text is required" });
    }
    textBody = body.trim();
  }

  if (type === "pdf") {
    if (!isNonEmptyString(fileUrl)) {
      return res.status(400).json({ success: false, message: "PDF fileUrl is required" });
    }
    pdfFileUrl = fileUrl.trim();
  }

  const doc: INotice = {
    title: title.trim(),
    type,
    body: textBody,
    fileUrl: pdfFileUrl,
    isPublished: true,
    publishedAt: new Date(),
  };

  const created = await Notice.create(doc);

  return res.status(201).json({ success: true, message: "Notice created", data: created });
};


export const publishOrUpdateNotice: RequestHandler<{ id: string }, unknown, UpdateNoticeBody> = async (
  req,
  res
) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ success: false, message: "Invalid notice id" });
  }

  const update: Partial<INotice> = {};
  const { title, type, body, fileUrl } = req.body;

  if (typeof title !== "undefined") {
    if (!isNonEmptyString(title)) {
      return res.status(400).json({ success: false, message: "Title cannot be empty" });
    }
    update.title = title.trim();
  }

  if (typeof type !== "undefined") {
    if (!isValidNoticeType(type)) {
      return res.status(400).json({ success: false, message: "Invalid notice type" });
    }
    update.type = type;
  }

  if (typeof body !== "undefined") {
    if (!isNonEmptyString(body)) {
        return res.status(400).json({ success: false, message: "Body cannot be empty" });
    }
    update.body = body.trim();
    }

    if (typeof fileUrl !== "undefined") {
    if (!isNonEmptyString(fileUrl)) {
        return res.status(400).json({ success: false, message: "fileUrl cannot be empty" });
    }
    update.fileUrl = fileUrl.trim();
    }


  update.isPublished = true;
  update.publishedAt = new Date();

  const updated = await Notice.findByIdAndUpdate(id, update, { new: true });
  if (!updated) {
    return res.status(404).json({ success: false, message: "Notice not found" });
  }

  broadcastNotice({
    id: String(updated._id),
    title: updated.title,
    type: updated.type,
    body: updated.body ?? "",
    fileUrl: updated.fileUrl ?? "",
    createdAt: updated.createdAt,
    publishedAt: updated.publishedAt,
    isPublished: updated.isPublished,
  });

  return res.json({ success: true, message: "Notice updated", data: updated });
};

export const deleteNotice: RequestHandler<{ id: string }> = async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ success: false, message: "Invalid notice id" });
  }

  const deleted = await Notice.findByIdAndDelete(id);
  if (!deleted) {
    return res.status(404).json({ success: false, message: "Notice not found" });
  }

  return res.json({ success: true, message: "Notice deleted" });
};

export const notifyAll: RequestHandler<{ id: string }> = async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ success: false, message: "Invalid notice id" });
  }

  const notice = await Notice.findById(id).lean();
  if (!notice) {
    return res.status(404).json({ success: false, message: "Notice not found" });
  }

  broadcastNotice({
    id: String(notice._id),
    title: notice.title,
    type: notice.type,
    body: notice.body ?? "",
    fileUrl: notice.fileUrl ?? "",
    createdAt: notice.createdAt,
    publishedAt: notice.publishedAt,
    isPublished: notice.isPublished,
  });

  return res.json({ success: true, message: "Notified all active users" });
};

export const sseStream: RequestHandler = async (req, res) => {
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");
  res.flushHeaders?.();

  const id = `${Date.now()}-${Math.random().toString(16).slice(2)}`;
  addSseClient(id, res);

  const ping = setInterval(() => {
    res.write(`event: ping\n`);
    res.write(`data: {}\n\n`);
  }, 25000);

  req.on("close", () => {
    clearInterval(ping);
    removeSseClient(id);
  });
};
