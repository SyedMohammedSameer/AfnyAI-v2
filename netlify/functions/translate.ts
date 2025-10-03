import { Handler, HandlerEvent } from '@netlify/functions';
import Groq from 'groq-sdk';

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY || ''
});

interface TranslateRequest {
  text: string;
  targetLanguage: string;
  model: string;
}

export const handler: Handler = async (event: HandlerEvent) => {
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Method not allowed' })
    };
  }

  if (!process.env.GROQ_API_KEY) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'API key not configured' })
    };
  }

  try {
    const body: TranslateRequest = JSON.parse(event.body || '{}');

    if (!body.text) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Invalid request: text required' })
      };
    }

    const prompt = `Translate the following Japanese text to English. Provide only the English translation: ${body.text}`;

    const completion = await groq.chat.completions.create({
      messages: [
        {
          role: 'user',
          content: prompt
        }
      ],
      model: body.model || 'llama-3.3-70b-versatile',
      temperature: 0.3,
      max_tokens: 500
    });

    const translation = completion.choices[0]?.message?.content?.trim() || '';

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type'
      },
      body: JSON.stringify({
        translation,
        usage: completion.usage
      })
    };
  } catch (error) {
    console.error('Error in translate function:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({
        error: 'Failed to translate text',
        details: error instanceof Error ? error.message : String(error)
      })
    };
  }
};
