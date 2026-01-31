import { GoogleGenAI, type GenerateContentResponse } from '@google/genai';

import config from '../../config';
import { ChatRequest, ChatResponse } from './ai.interface';
import { chatRequestSchema } from './ai.validation';

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

export const startChat = async (payload: ChatRequest): Promise<ChatResponse> => {
  const data = chatRequestSchema.parse(payload);
  const model = data.model || 'gemini-2.5-flash';

  const response = await getClient().models.generateContent({
    model,
    contents: buildContents(data.prompt, data.history || defaultHistory),
  });

  const text = extractText(response);

  return { response: text };
};
