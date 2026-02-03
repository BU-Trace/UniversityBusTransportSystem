import { GoogleGenAI, type GenerateContentResponse } from '@google/genai';

import config from '../../config';

import { ChatRequest, ChatResponse } from './ai.interface';
import { chatRequestSchema } from './ai.validation';
import { ChatSession, IChatSession } from './ai.model';

const defaultHistory = [
  { role: 'user' as const, text: 'Hello' },
  { role: 'model' as const, text: 'Great to meet you. What would you like to know?' },
];

let client: GoogleGenAI | null = null;

const getClient = () => {
  if (!config.gemini_api_key) {
    throw new Error('GEMINI_API_KEY is not configured');
  }

  if (!client) {
    client = new GoogleGenAI({ apiKey: config.gemini_api_key });
  }

  return client;
};

type ContentPart = { text: string };
type ContentItem = { role: 'user' | 'model'; parts: ContentPart[] };

const buildContents = (prompt: string, history: typeof defaultHistory): ContentItem[] => {
  const normalizedHistory: ContentItem[] = history.map((item) => ({
    role: item.role,
    parts: [{ text: item.text }],
  }));

  return [...normalizedHistory, { role: 'user', parts: [{ text: prompt }] }];
};

const extractText = (response: GenerateContentResponse): string => {
  const rawText = (response as { text?: string | (() => string) }).text;

  if (typeof rawText === 'function') {
    return rawText();
  }

  if (typeof rawText === 'string') {
    return rawText;
  }

  if ('output_text' in response && typeof response.output_text === 'string') {
    return response.output_text;
  }

  if (Array.isArray(response.candidates)) {
    const firstCandidate = response.candidates[0];
    const firstPart = firstCandidate?.content?.parts?.[0];
    if (firstPart && 'text' in firstPart && typeof firstPart.text === 'string') {
      return firstPart.text;
    }
  }

  return '';
};


// Helper to get or create a chat session (by userId or sessionId)
export const getOrCreateChatSession = async ({ userId, sessionId }: { userId?: string; sessionId?: string; }) => {
  let session: IChatSession | null = null;
  if (userId) {
    session = await ChatSession.findOne({ userId });
    if (!session) {
      session = await ChatSession.create({ userId, history: [] });
    }
  } else if (sessionId) {
    session = await ChatSession.findOne({ sessionId });
    if (!session) {
      session = await ChatSession.create({ sessionId, history: [] });
    }
  }
  return session;
};

// Save a chat message to the session
export const saveChatMessage = async ({ userId, sessionId, role, content }: { userId?: string; sessionId?: string; role: 'user' | 'assistant'; content: string; }) => {
  const session = await getOrCreateChatSession({ userId, sessionId });
  if (!session) return;
  session.history.push({ role, content, timestamp: new Date() });
  session.updatedAt = new Date();
  await session.save();
};

// Main chat logic with persistence
export const startChat = async (payload: ChatRequest, userId?: string, sessionId?: string): Promise<ChatResponse> => {
  const data = chatRequestSchema.parse(payload);
  const model = data.model || 'gemini-2.5-flash';

  // Save user message
  await saveChatMessage({ userId, sessionId, role: 'user', content: data.prompt });

  // Build history for model (fetch from DB if available)
  let history = data.history || defaultHistory;
  const session = await getOrCreateChatSession({ userId, sessionId });
  if (session && session.history.length > 0) {
    // Convert DB history to model format
    history = session.history.map((item) => ({
      role: item.role === 'assistant' ? 'model' : 'user',
      text: item.content,
    }));
  }

  const response = await getClient().models.generateContent({
    model,
    contents: buildContents(data.prompt, history),
  });

  const text = extractText(response);

  // Save assistant response
  await saveChatMessage({ userId, sessionId, role: 'assistant', content: text });

  return { response: text };
};
