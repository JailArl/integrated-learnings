import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(
  req: VercelRequest,
  res: VercelResponse
) {
  if (req.method !== 'POST') {
    res.status(405).json({ success: false, error: 'Method not allowed' });
    return;
  }

  const { systemPrompt, messages } = req.body;

  if (!systemPrompt || !messages) {
    res.status(400).json({ 
      success: false, 
      error: 'Missing systemPrompt or messages' 
    });
    return;
  }

  const apiKey = process.env.OPENAI_API_KEY;
  
  if (!apiKey) {
    res.status(500).json({ 
      success: false, 
      error: 'OpenAI API key not configured on server' 
    });
    return;
  }

  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
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
      res.status(response.status).json({
        success: false,
        error: error.error?.message || 'OpenAI API error',
      });
      return;
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
