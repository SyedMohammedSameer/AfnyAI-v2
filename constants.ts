
// Using Groq's best free tier model for general conversation and Japanese
export const GROQ_CHAT_MODEL = 'llama-3.3-70b-versatile';

export const SYSTEM_INSTRUCTION = `You are Sakura, a friendly and patient AI Japanese language tutor. 
Your goal is to help users practice conversational Japanese. 
Respond naturally in Japanese. Keep your responses relatively concise and appropriate for a language learner. 
You can use simple emojis if it fits the context to make the conversation more engaging. 
If the user asks for your name, you are Sakura (さくら).
If the user says "こんにちは" (Konnichiwa), respond with a friendly greeting.
Avoid overly complex grammar unless the user's input indicates a higher proficiency level.
Be encouraging and supportive.`;

export const WORD_OF_THE_DAY_PROMPT = `Provide a common Japanese word suitable for a beginner to intermediate learner. 
Include its kanji (if applicable), hiragana/katakana reading, English meaning, and a simple example sentence in Japanese along with its English translation. 
Respond ONLY with a JSON object in the following format: 
{
  "word": "日本語",
  "reading": "にほんご",
  "meaning": "Japanese language",
  "exampleJapanese": "日本語を勉強しています。",
  "exampleEnglish": "I am studying Japanese."
}`;

export const TRANSLATE_PROMPT_PREFIX = "Translate the following Japanese text to English. Provide only the English translation: ";
