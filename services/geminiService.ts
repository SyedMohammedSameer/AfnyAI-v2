import { GoogleGenerativeAI, GenerativeModel, ChatSession } from '@google/generative-ai';
import { WordOfTheDayType } from '../types';
import { GEMINI_CHAT_MODEL, GEMINI_TRANSLATE_MODEL, WORD_OF_THE_DAY_PROMPT, TRANSLATE_PROMPT_PREFIX } from '../constants';

export class GeminiService {
  private genAI: GoogleGenerativeAI;

  constructor(apiKey: string) {
    if (!apiKey) {
      throw new Error("Gemini API key is required.");
    }
    this.genAI = new GoogleGenerativeAI(apiKey);
  }

  async initChat(modelName: string, systemInstruction: string): Promise<ChatSession> {
    try {
      const model = this.genAI.getGenerativeModel({ 
        model: modelName,
        systemInstruction: systemInstruction
      });
      
      const chat = model.startChat({
        history: [],
        generationConfig: {
          maxOutputTokens: 1000,
          temperature: 0.7,
        },
      });
      
      console.log('Chat session initialized successfully');
      return chat;
    } catch (error) {
      console.error('Error initializing chat:', error);
      throw new Error(`Failed to initialize chat: ${error}`);
    }
  }

  async sendMessageToAI(chat: ChatSession, message: string): Promise<string> {
    try {
      console.log('Sending message to Gemini:', message);
      const result = await chat.sendMessage(message);
      const response = await result.response;
      const text = response.text();
      console.log('Received response from Gemini:', text);
      return text;
    } catch (error) {
      console.error('Error sending message to AI:', error);
      throw new Error(`Failed to get response from AI model: ${error}`);
    }
  }

  async translateText(text: string, targetLanguage: string): Promise<string> {
    const prompt = `${TRANSLATE_PROMPT_PREFIX}${text}`;
    try {
      console.log('Translating text:', text);
      const model = this.genAI.getGenerativeModel({ model: GEMINI_TRANSLATE_MODEL });
      const result = await model.generateContent(prompt);
      const response = await result.response;
      const translatedText = response.text().trim();
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
      const model = this.genAI.getGenerativeModel({ 
        model: GEMINI_CHAT_MODEL,
        generationConfig: {
          responseMimeType: "application/json",
        }
      });

      const result = await model.generateContent(WORD_OF_THE_DAY_PROMPT);
      const response = await result.response;
      let jsonStr = response.text().trim();
      
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