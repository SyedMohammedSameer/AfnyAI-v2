
import { GoogleGenAI, GenerateContentResponse, Chat } from '@google/genai';
import { WordOfTheDayType } from '../types';
import { GEMINI_CHAT_MODEL, GEMINI_TRANSLATE_MODEL, WORD_OF_THE_DAY_PROMPT, TRANSLATE_PROMPT_PREFIX } from '../constants';

export class GeminiService {
  private ai: GoogleGenAI;

  constructor(apiKey: string) {
    if (!apiKey) {
      throw new Error("Gemini API key is required.");
    }
    this.ai = new GoogleGenAI({ apiKey });
  }

  async initChat(modelName: string, systemInstruction: string): Promise<Chat> {
    const chat: Chat = this.ai.chats.create({
      model: modelName,
      config: {
        systemInstruction: systemInstruction,
      },
    });
    return chat;
  }

  async sendMessageToAI(chat: Chat, message: string): Promise<string> {
    try {
      const response: GenerateContentResponse = await chat.sendMessage({ message });
      return response.text;
    } catch (error) {
      console.error('Error sending message to AI:', error);
      throw new Error('Failed to get response from AI model.');
    }
  }

  async translateText(text: string, targetLanguage: string): Promise<string> {
    // For simplicity, we'll use English as the target language
    // The prompt needs to be specific for translation.
    const prompt = `${TRANSLATE_PROMPT_PREFIX}${text}`;
    try {
      const response: GenerateContentResponse = await this.ai.models.generateContent({
        model: GEMINI_TRANSLATE_MODEL,
        contents: prompt,
      });
      return response.text.trim();
    } catch (error) {
      console.error('Error translating text:', error);
      throw new Error(`Failed to translate text to ${targetLanguage}.`);
    }
  }

  async fetchWordOfTheDay(): Promise<WordOfTheDayType> {
    try {
      const response: GenerateContentResponse = await this.ai.models.generateContent({
        model: GEMINI_CHAT_MODEL, // Can use chat model for this structured JSON task
        contents: WORD_OF_THE_DAY_PROMPT,
        config: {
          responseMimeType: "application/json",
        }
      });

      let jsonStr = response.text.trim();
      const fenceRegex = /^```(\w*)?\s*\n?(.*?)\n?\s*```$/s;
      const match = jsonStr.match(fenceRegex);
      if (match && match[2]) {
        jsonStr = match[2].trim();
      }
      
      const parsedData = JSON.parse(jsonStr) as WordOfTheDayType;
      if (parsedData.word && parsedData.reading && parsedData.meaning && parsedData.exampleJapanese && parsedData.exampleEnglish) {
        return parsedData;
      } else {
        throw new Error("Invalid format for Word of the Day data.");
      }
    } catch (error) {
      console.error('Error fetching Word of the Day:', error);
      // Fallback or re-throw
      throw new Error('Failed to fetch Word of the Day from AI model.');
    }
  }
}
