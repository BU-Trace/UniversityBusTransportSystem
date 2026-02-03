export type ChatRole = 'user' | 'model';

export type ChatHistoryItem = {
  role: ChatRole;
  text: string;
};

export type ChatRequest = {
  prompt: string;
  history?: ChatHistoryItem[];
  model?: string;
};

export type ChatResponse = {
  response: string;
};
