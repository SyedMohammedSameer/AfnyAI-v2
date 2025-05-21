
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { ChatView } from './components/ChatView';
import { WordOfTheDayDisplay } from './components/WordOfTheDay';
import { ThemeToggle } from './components/ThemeToggle';
import { Message, WordOfTheDayType, SenderType } from './types';
import { GeminiService } from './services/geminiService';
import { SpeechService } from './services/speechService';
import { SYSTEM_INSTRUCTION, GEMINI_CHAT_MODEL } from './constants';
import type { Chat } from '@google/genai';

const SAKURA_AVATAR_URL = '/assets/images/sakura-avatar.png'; // Path to the avatar image

const App: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [wordOfTheDay, setWordOfTheDay] = useState<WordOfTheDayType | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isInitializing, setIsInitializing] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [darkMode, setDarkMode] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      const savedMode = localStorage.getItem('theme');
      if (savedMode) return savedMode === 'dark';
      return window.matchMedia('(prefers-color-scheme: dark)').matches;
    }
    return false;
  });

  const geminiService = useRef<GeminiService | null>(null);
  const speechService = useRef<SpeechService | null>(null);
  const aiChatSession = useRef<Chat | null>(null);

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [darkMode]);

  useEffect(() => {
    if (!process.env.API_KEY) {
      setError("API Key is not configured. Please set the API_KEY environment variable.");
      setIsInitializing(false);
      return;
    }
    try {
      geminiService.current = new GeminiService(process.env.API_KEY);
      speechService.current = new SpeechService();
      speechService.current.loadVoices(); // Pre-load voices
      setIsInitializing(false);
    } catch (e) {
      console.error("Initialization error:", e);
      setError("Failed to initialize services. Check console for details.");
      setIsInitializing(false);
    }
  }, []);

  const initializeChat = useCallback(async () => {
    if (geminiService.current && !aiChatSession.current) {
      try {
        aiChatSession.current = await geminiService.current.initChat(GEMINI_CHAT_MODEL, SYSTEM_INSTRUCTION);
      } catch (e) {
        console.error("Failed to initialize chat session:", e);
        setError("Could not start chat session. Please try refreshing.");
      }
    }
  }, []);

  useEffect(() => {
    if (!isInitializing && geminiService.current) {
      initializeChat();
      fetchWOTD();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isInitializing, initializeChat]);

  const fetchWOTD = async () => {
    if (!geminiService.current) return;
    // setIsLoading(true); // Not critical path for main loading
    try {
      const wotd = await geminiService.current.fetchWordOfTheDay();
      setWordOfTheDay(wotd);
    } catch (e) {
      console.error("Failed to fetch Word of the Day:", e);
      // setError("Could not fetch Word of the Day."); // Non-critical, don't block UI
    } finally {
      // setIsLoading(false);
    }
  };

  const addMessage = (text: string, sender: SenderType, language: 'japanese' | 'english') => {
    setMessages(prevMessages => {
      const lastMessage = prevMessages[prevMessages.length - 1];
      if (language === 'english' && lastMessage && lastMessage.sender === sender && !lastMessage.englishText) {
        return prevMessages.map((msg, index) => 
          index === prevMessages.length - 1 ? { ...msg, englishText: text } : msg
        );
      } else {
        const newMessage: Message = {
          id: Date.now().toString(),
          sender: sender,
          japaneseText: language === 'japanese' ? text : '',
          englishText: language === 'english' ? text : '',
          timestamp: new Date(),
          avatarUrl: sender === SenderType.AI ? SAKURA_AVATAR_URL : undefined,
        };
        return [...prevMessages, newMessage];
      }
    });
  };

  const translateAndAdd = async (japaneseText: string, sender: SenderType) => {
    if (!geminiService.current) return;
    try {
      const englishText = await geminiService.current.translateText(japaneseText, 'English');
      addMessage(englishText, sender, 'english');
    } catch (e) {
      console.error(`Translation error for ${sender}:`, e);
      addMessage(`(Translation failed)`, sender, 'english');
    }
  };

  const handleSendMessage = async (japaneseInput: string) => {
    if (!japaneseInput.trim() || isLoading || !geminiService.current || !aiChatSession.current) return;

    setIsLoading(true);
    setError(null);
    addMessage(japaneseInput, SenderType.User, 'japanese');
    await translateAndAdd(japaneseInput, SenderType.User);

    try {
      const aiResponseJapanese = await geminiService.current.sendMessageToAI(aiChatSession.current, japaneseInput);
      addMessage(aiResponseJapanese, SenderType.AI, 'japanese');
      if (speechService.current) {
        speechService.current.speakText(aiResponseJapanese, 'ja-JP');
      }
      await translateAndAdd(aiResponseJapanese, SenderType.AI);
    } catch (e) {
      console.error("AI response error:", e);
      const errorMsg = "すみません、ちょっと問題がありました。(Sorry, I encountered an issue.)";
      addMessage(errorMsg, SenderType.AI, 'japanese');
      addMessage("Sorry, I encountered an issue.", SenderType.AI, 'english');
      setError("Failed to get response from AI. Please check your connection or API key.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleVoiceInput = async () => {
    if (!speechService.current || isLoading) return;
    setIsLoading(true);
    setError(null);
    try {
      const transcript = await speechService.current.recognizeSpeech('ja-JP');
      if (transcript) {
        await handleSendMessage(transcript);
      }
    } catch (e) {
      console.error("Voice input error:", e);
      setError(`Voice recognition failed: ${e instanceof Error ? e.message : String(e)}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSpeakText = (text: string, lang: string) => {
    if (speechService.current) {
      speechService.current.speakText(text, lang);
    }
  };
  
  const toggleDarkMode = () => setDarkMode(prevMode => !prevMode);

  if (isInitializing) {
    return (
      <div className="flex items-center justify-center h-screen bg-gradient-to-br from-pink-200 via-purple-200 to-blue-200 dark:from-pink-800 dark:via-purple-800 dark:to-blue-800">
        <p className="text-2xl text-pink-600 dark:text-pink-300 font-semibold animate-pulse">SakuraChat AI を起動中...</p>
      </div>
    );
  }
  
  if (error && messages.length === 0 && error.includes("API Key")) {
     return (
      <div className="flex flex-col items-center justify-center h-screen bg-red-100 dark:bg-red-900 p-8 text-center">
        <h1 className="text-3xl text-red-600 dark:text-red-300 font-bold mb-4">エラーが発生しました</h1>
        <p className="text-red-500 dark:text-red-200 mb-6">{error}</p>
        <div className="bg-yellow-100 dark:bg-yellow-700 border-l-4 border-yellow-500 dark:border-yellow-400 text-yellow-700 dark:text-yellow-100 p-4" role="alert">
            <p className="font-bold">APIキーの設定が必要です</p>
            <p><code>API_KEY</code> 環境変数が設定されていることを確認してください。</p>
        </div>
        <button 
          onClick={() => window.location.reload()}
          className="mt-8 px-6 py-3 bg-blue-500 hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-700 text-white rounded-lg transition-colors text-lg"
        >
          再読み込み
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-pink-50 dark:bg-slate-800 text-gray-800 dark:text-gray-200 transition-colors duration-300">
      <header className="p-4 bg-white dark:bg-slate-900 shadow-md flex items-center justify-between sticky top-0 z-10 transition-colors duration-300">
        <div className="flex items-center space-x-3">
          <img src={SAKURA_AVATAR_URL} alt="Sakura AI Avatar" className="w-12 h-12 rounded-full border-2 border-pink-300 dark:border-pink-500"/>
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-pink-600 dark:text-pink-400">🌸 Afny AI 🌸</h1>
            <p className="text-xs md:text-sm text-blue-500 dark:text-blue-400">あなたの日本語学習パートナー</p>
          </div>
        </div>
        <ThemeToggle darkMode={darkMode} toggleDarkMode={toggleDarkMode} />
      </header>
      
      {wordOfTheDay && (
        <WordOfTheDayDisplay wordOfTheDay={wordOfTheDay} onSpeak={handleSpeakText} />
      )}
      
      {error && !error.includes("API Key") && (
        <div className="p-2 bg-red-100 dark:bg-red-700 text-red-700 dark:text-red-100 text-center text-sm transition-colors duration-300">
            {error} <button onClick={() => setError(null)} className="ml-2 font-bold underline">OK</button>
        </div>
      )}

      <ChatView
        messages={messages}
        isLoading={isLoading}
        onSendMessage={handleSendMessage}
        onVoiceInput={handleVoiceInput}
        onSpeakText={handleSpeakText}
        aiAvatarUrl={SAKURA_AVATAR_URL}
      />
    </div>
  );
};

export default App;
