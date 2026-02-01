export type NoticeType = "text" | "pdf";

export type CreateNoticeBody = {
  title?: string;
  type?: NoticeType;
  body?: string;
  fileUrl?: string;
};

export function isNonEmptyString(v: unknown): v is string {
  return typeof v === "string" && v.trim().length > 0;
}

export function isValidNoticeType(v: unknown): v is NoticeType {
  return v === "text" || v === "pdf";
}
