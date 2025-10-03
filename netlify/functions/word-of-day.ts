import { Handler, HandlerEvent } from '@netlify/functions';
import Groq from 'groq-sdk';

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY || ''
});

const WORD_OF_THE_DAY_PROMPT = `Provide a common Japanese word suitable for a beginner to intermediate learner.
Include its kanji (if applicable), hiragana/katakana reading, English meaning, and a simple example sentence in Japanese along with its English translation.
Respond ONLY with a JSON object in the following format:
{
  "word": "日本語",
  "reading": "にほんご",
  "meaning": "Japanese language",
  "exampleJapanese": "日本語を勉強しています。",
  "exampleEnglish": "I am studying Japanese."
}`;

export const handler: Handler = async (event: HandlerEvent) => {
  if (event.httpMethod !== 'GET' && event.httpMethod !== 'POST') {
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
    const completion = await groq.chat.completions.create({
      messages: [
        {
          role: 'user',
          content: WORD_OF_THE_DAY_PROMPT
        }
      ],
      model: 'llama-3.3-70b-versatile',
      temperature: 0.8,
      max_tokens: 500,
      response_format: { type: 'json_object' }
    });

    let jsonStr = completion.choices[0]?.message?.content?.trim() || '';

    // Remove code fences if present
    const fenceRegex = /^```(\w*)?\s*\n?(.*?)\n?\s*```$/s;
    const match = jsonStr.match(fenceRegex);
    if (match && match[2]) {
      jsonStr = match[2].trim();
    }

    const parsedData = JSON.parse(jsonStr);

    // Validate required fields
    if (!parsedData.word || !parsedData.reading || !parsedData.meaning ||
        !parsedData.exampleJapanese || !parsedData.exampleEnglish) {
      throw new Error("Invalid format for Word of the Day data.");
    }

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type'
      },
      body: JSON.stringify({
        wordOfDay: parsedData,
        usage: completion.usage
      })
    };
  } catch (error) {
    console.error('Error in word-of-day function:', error);

    // Return fallback data
    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type'
      },
      body: JSON.stringify({
        wordOfDay: {
          word: '勉強',
          reading: 'べんきょう',
          meaning: 'Study, Learning',
          exampleJapanese: '毎日日本語を勉強しています。',
          exampleEnglish: 'I study Japanese every day.'
        },
        fallback: true
      })
    };
  }
};
