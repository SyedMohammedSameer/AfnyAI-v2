import Groq from 'groq-sdk';
import { WordOfTheDayType } from '../types';
import { GROQ_CHAT_MODEL, WORD_OF_THE_DAY_PROMPT, TRANSLATE_PROMPT_PREFIX } from '../constants';

interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export class GroqService {
  private groq: Groq;
  private chatHistory: ChatMessage[] = [];

  constructor(apiKey: string) {
    if (!apiKey) {
      throw new Error("Groq API key is required.");
    }
    this.groq = new Groq({
      apiKey,
      dangerouslyAllowBrowser: true // Required for client-side usage
    });
  }

  async initChat(modelName: string, systemInstruction: string): Promise<void> {
    try {
      this.chatHistory = [
        {
          role: 'system',
          content: systemInstruction
        }
      ];
      console.log('Chat session initialized successfully with Groq');
    } catch (error) {
      console.error('Error initializing chat:', error);
      throw new Error(`Failed to initialize chat: ${error}`);
    }
  }

  async sendMessageToAI(message: string): Promise<string> {
    try {
      console.log('Sending message to Groq:', message);

      // Add user message to history
      this.chatHistory.push({
        role: 'user',
        content: message
      });

      const completion = await this.groq.chat.completions.create({
        messages: this.chatHistory,
        model: GROQ_CHAT_MODEL,
        temperature: 0.7,
        max_tokens: 1000,
        top_p: 1,
        stream: false
      });

      const aiResponse = completion.choices[0]?.message?.content || '';
      console.log('Received response from Groq:', aiResponse);

      // Add AI response to history
      this.chatHistory.push({
        role: 'assistant',
        content: aiResponse
      });

      return aiResponse;
    } catch (error) {
      console.error('Error sending message to AI:', error);
      throw new Error(`Failed to get response from AI model: ${error}`);
    }
  }

  async translateText(text: string, targetLanguage: string): Promise<string> {
    const prompt = `${TRANSLATE_PROMPT_PREFIX}${text}`;
    try {
      console.log('Translating text:', text);

      const completion = await this.groq.chat.completions.create({
        messages: [
          {
            role: 'user',
            content: prompt
          }
        ],
        model: GROQ_CHAT_MODEL,
        temperature: 0.3,
        max_tokens: 500
      });

      const translatedText = completion.choices[0]?.message?.content?.trim() || '';
      console.log('Translation result:', translatedText);
      return translatedText;
    } catch (error) {
      console.error('Error translating text:', error);
      throw new Error(`Failed to translate text to ${targetLanguage}: ${error}`);
    }
  }

  async fetchWordOfTheDay(): Promise<WordOfTheDayType> {
    try {
      console.log('Fetching word of the day...');

      const completion = await this.groq.chat.completions.create({
        messages: [
          {
            role: 'user',
            content: WORD_OF_THE_DAY_PROMPT
          }
        ],
        model: GROQ_CHAT_MODEL,
        temperature: 0.8,
        max_tokens: 500,
        response_format: { type: 'json_object' }
      });

      let jsonStr = completion.choices[0]?.message?.content?.trim() || '';
      console.log('Raw WOTD response:', jsonStr);

      // Remove code fences if present
      const fenceRegex = /^```(\w*)?\s*\n?(.*?)\n?\s*```$/s;
      const match = jsonStr.match(fenceRegex);
      if (match && match[2]) {
        jsonStr = match[2].trim();
      }

      const parsedData = JSON.parse(jsonStr) as WordOfTheDayType;

      // Validate required fields
      if (!parsedData.word || !parsedData.reading || !parsedData.meaning ||
          !parsedData.exampleJapanese || !parsedData.exampleEnglish) {
        throw new Error("Invalid format for Word of the Day data.");
      }

      console.log('Parsed WOTD:', parsedData);
      return parsedData;
    } catch (error) {
      console.error('Error fetching Word of the Day:', error);
      // Return fallback data instead of throwing
      return {
        word: '勉強',
        reading: 'べんきょう',
        meaning: 'Study, Learning',
        exampleJapanese: '毎日日本語を勉強しています。',
        exampleEnglish: 'I study Japanese every day.'
      };
    }
  }
}
