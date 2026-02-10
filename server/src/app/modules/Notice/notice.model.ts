import mongoose, { Schema } from "mongoose";

export type NoticeType = "text" | "pdf";

export interface INotice {
  title: string;
  type: NoticeType;
  body?: string | null;
  fileUrl?: string | null;
  isPublished: boolean;
  publishedAt?: Date | null;
  createdAt?: Date;
  updatedAt?: Date;
}

const noticeSchema = new Schema<INotice>(
  {
    title: { type: String, required: true, trim: true },
    type: { type: String, enum: ["text", "pdf"], required: true },

    body: { type: String, default: null },
    fileUrl: { type: String, default: null },

    isPublished: { type: Boolean, default: true },
    publishedAt: { type: Date, default: () => new Date() },
  },
  { timestamps: true }
);

const Notice = mongoose.model<INotice>("Notice", noticeSchema);
export default Notice;
