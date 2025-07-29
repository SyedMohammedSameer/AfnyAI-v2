export enum SenderType {
  User = 'user',
  AI = 'ai',
}

export interface Message {
  id: string;
  sender: SenderType;
  japaneseText: string;
  englishText?: string;
  timestamp: Date;
  avatarUrl?: string;
}

export interface WordOfTheDayType {
  word: string;
  reading: string;
  meaning: string;
  exampleJapanese: string;
  exampleEnglish: string;
}

// For Gemini API request parts
export interface TextPart {
  text: string;
}

export interface InlineDataPart {
  inlineData: {
    mimeType: string;
    data: string;
  };
}

export type ContentPart = TextPart | InlineDataPart;