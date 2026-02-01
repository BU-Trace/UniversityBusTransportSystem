"use client";

import React, { useEffect, useRef } from "react";
import { toast } from "sonner";

type NoticeType = "text" | "pdf";

type NoticeEvent = {
  id: string;
  title: string;
  type: NoticeType;
  body?: string;
  fileUrl?: string;
  createdAt?: string;
};

const BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5000/api/v1";

export default function NoticeLiveAlert() {
  const esRef = useRef<EventSource | null>(null);

  useEffect(() => {
    const url = `${BASE_URL}/notice/stream`;
    const es = new EventSource(url);
    esRef.current = es;

    es.addEventListener("notice", (ev: MessageEvent) => {
      try {
        const data = JSON.parse(ev.data) as NoticeEvent;
        toast(
          `New Notice: ${data.title}`,
          {
            description:
              data.type === "text"
                ? (data.body ?? "").slice(0, 120)
                : "A PDF notice was published.",
            action:
              data.type === "pdf" && data.fileUrl
                ? {
                    label: "Open",
                    onClick: () => window.open(data.fileUrl, "_blank", "noopener,noreferrer"),
                  }
                : undefined,
            duration: 8000,
          }
        );
      } catch {
      }
    });

    es.onerror = () => {
    };

    return () => {
      es.close();
      esRef.current = null;
    };
  }, []);

  return null;
}
