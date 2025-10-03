import { WordOfTheDayType } from '../types';
import { GROQ_CHAT_MODEL } from '../constants';

interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export class ApiService {
  private chatHistory: ChatMessage[] = [];
  private apiBase: string;

  constructor() {
    // Use Netlify functions in production, localhost for dev
    this.apiBase = import.meta.env.DEV
      ? 'http://localhost:8888/.netlify/functions'
      : '/.netlify/functions';
  }

  async initChat(modelName: string, systemInstruction: string): Promise<void> {
    try {
      this.chatHistory = [
        {
          role: 'system',
          content: systemInstruction
        }
      ];
      console.log('Chat session initialized successfully');
    } catch (error) {
      console.error('Error initializing chat:', error);
      throw new Error(`Failed to initialize chat: ${error}`);
    }
  }

  async sendMessageToAI(message: string): Promise<string> {
    try {
      console.log('Sending message to API:', message);

      // Add user message to history
      this.chatHistory.push({
        role: 'user',
        content: message
      });

      const response = await fetch(`${this.apiBase}/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: this.chatHistory,
          model: GROQ_CHAT_MODEL,
          temperature: 0.7,
          max_tokens: 1000
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to get response from API');
      }

      const data = await response.json();
      const aiResponse = data.response || '';
      console.log('Received response from API:', aiResponse);

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
    try {
      console.log('Translating text:', text);

      const response = await fetch(`${this.apiBase}/translate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text,
          targetLanguage,
          model: GROQ_CHAT_MODEL
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to translate text');
      }

      const data = await response.json();
      const translatedText = data.translation || '';
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

      const response = await fetch(`${this.apiBase}/word-of-day`, {
        method: 'GET'
      });

      if (!response.ok) {
        throw new Error('Failed to fetch word of the day');
      }

      const data = await response.json();
      const wordOfDay = data.wordOfDay;

      console.log('Parsed WOTD:', wordOfDay);
      return wordOfDay;
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
