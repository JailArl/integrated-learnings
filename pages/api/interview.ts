// pages/api/interview.ts
// Vercel serverless function to proxy OpenAI calls

import type { NextApiRequest, NextApiResponse } from 'next';

interface InterviewRequest {
  systemPrompt: string;
  messages: Array<{ role: string; content: string }>;
}

interface InterviewResponse {
  success: boolean;
  message?: string;
  error?: string;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<InterviewResponse>
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

  const { systemPrompt, messages } = req.body as InterviewRequest;

  if (!systemPrompt || !messages) {
    return res.status(400).json({ 
      success: false, 
      error: 'Missing systemPrompt or messages' 
    });
  }

  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'gpt-4-turbo',
        messages: [
          { role: 'system', content: systemPrompt },
          ...messages,
        ],
        temperature: 0.7,
        max_tokens: 600,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      return res.status(response.status).json({
        success: false,
        error: error.error?.message || 'OpenAI API error',
      });
    }

    const data = await response.json();
    const assistantMessage = data.choices[0].message.content;

    res.status(200).json({
      success: true,
      message: assistantMessage,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to process request',
    });
  }
}
