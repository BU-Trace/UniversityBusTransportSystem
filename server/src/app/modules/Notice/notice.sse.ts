import { Response } from "express";

type SSEClient = {
  id: string;
  res: Response;
};

const clients = new Map<string, SSEClient>();

export function addSseClient(id: string, res: Response) {
  clients.set(id, { id, res });
}

export function removeSseClient(id: string) {
  clients.delete(id);
}

export function broadcastNotice(payload: unknown) {
  const data = JSON.stringify(payload);

  for (const { res } of clients.values()) {
    // event name: "notice"
    res.write(`event: notice\n`);
    res.write(`data: ${data}\n\n`);
  }
}
