import { Request, Response } from 'express';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export const chatWithBot = async (req: Request, res: Response) => {
  try {
    const { message } = req.body;

    if (!message) {
      return res.status(400).json({
        answer: 'Message is required',
      });
    }

    const vectorStoreId = process.env.OPENAI_VECTOR_STORE_ID;
    if (!vectorStoreId) {
      return res.status(500).json({
        answer: 'Vector store not configured on server',
      });
    }

    const response = await openai.responses.create({
      model: 'gpt-4.1',
      instructions: `
You are a help chatbot for a university bus tracking named BU Trace website.
Explain how to use the site for students, drivers and admins.
Only answer using the help documentation.
Use simple steps.
If you are not sure, say you are not sure.
      `,
      input: message,
      tools: [
        {
          type: 'file_search',
          vector_store_ids: [vectorStoreId],
          max_num_results: 5,
        },
      ],
    });

    let text = "Sorry, I couldn't find an answer.";

    for (const item of response.output ?? []) {
      if (item.type === 'message') {
        for (const part of item.content ?? []) {
          if (part.type === 'output_text') {
            text = part.text;
          }
        }
      }
    }

    return res.json({ answer: text });
  } catch (error: any) {
    console.error('Chatbot error:', error);
    return res.status(500).json({
      answer: 'Something went wrong',
    });
  }
};
