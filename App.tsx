import React, { useState, useEffect, useRef, useCallback } from 'react';
import { ChatView } from './components/ChatView';
import { WordOfTheDayDisplay } from './components/WordOfTheDay';
import { ThemeToggle } from './components/ThemeToggle';
import { Message, WordOfTheDayType, SenderType } from './types';
import { GeminiService } from './services/geminiService';
import { SpeechService } from './services/speechService';
import { SYSTEM_INSTRUCTION, GEMINI_CHAT_MODEL } from './constants';
import type { ChatSession } from '@google/generative-ai';

const SAKURA_AVATAR_URL = '/assets/images/sakura-avatar.png';

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
  const aiChatSession = useRef<ChatSession | null>(null);

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
      document.body.className = 'dark';
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      document.body.className = '';
      localStorage.setItem('theme', 'light');
    }
  }, [darkMode]);

  useEffect(() => {
    console.log('API_KEY check:', !!process.env.API_KEY);
    console.log('API_KEY value:', process.env.API_KEY ? 'Present (length: ' + process.env.API_KEY.length + ')' : 'Missing');
    
    if (!process.env.API_KEY) {
      setError("API Key is not configured. Please set the GEMINI_API_KEY environment variable in .env.local file.");
      setIsInitializing(false);
      return;
    }
    try {
      geminiService.current = new GeminiService(process.env.API_KEY);
      speechService.current = new SpeechService();
      speechService.current.loadVoices();
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
        console.log('Initializing chat session...');
        aiChatSession.current = await geminiService.current.initChat(GEMINI_CHAT_MODEL, SYSTEM_INSTRUCTION);
        console.log('Chat session initialized successfully');
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
  }, [isInitializing, initializeChat]);

  const fetchWOTD = async () => {
    if (!geminiService.current) return;
    try {
      const wotd = await geminiService.current.fetchWordOfTheDay();
      setWordOfTheDay(wotd);
    } catch (e) {
      console.error("Failed to fetch Word of the Day:", e);
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
    if (!japaneseInput.trim() || isLoading || !geminiService.current || !aiChatSession.current) {
      console.log('Cannot send message:', {
        hasInput: !!japaneseInput.trim(),
        isLoading,
        hasGeminiService: !!geminiService.current,
        hasChatSession: !!aiChatSession.current
      });
      return;
    }

    console.log('Sending message:', japaneseInput);
    console.log('Gemini service available:', !!geminiService.current);
    console.log('Chat session available:', !!aiChatSession.current);

    setIsLoading(true);
    setError(null);
    addMessage(japaneseInput, SenderType.User, 'japanese');
    await translateAndAdd(japaneseInput, SenderType.User);

    try {
      const aiResponseJapanese = await geminiService.current.sendMessageToAI(aiChatSession.current, japaneseInput);
      console.log('AI Response received:', aiResponseJapanese);
      
      addMessage(aiResponseJapanese, SenderType.AI, 'japanese');
      if (speechService.current) {
        speechService.current.speakText(aiResponseJapanese, 'ja-JP');
      }
      await translateAndAdd(aiResponseJapanese, SenderType.AI);
    } catch (e) {
      console.error("AI response error:", e);
      const errorMsg = "すみません、ちょっと問題がありました。";
      addMessage(errorMsg, SenderType.AI, 'japanese');
      addMessage("Sorry, I encountered an issue.", SenderType.AI, 'english');
      setError(`Failed to get response from AI: ${e instanceof Error ? e.message : String(e)}`);
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
      <div className={`flex items-center justify-center h-screen transition-all duration-500 ${
        darkMode 
          ? 'bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900' 
          : 'bg-gradient-to-br from-pink-300 via-purple-400 to-indigo-500'
      }`}>
        <div className="text-center">
          <div className={`w-20 h-20 mb-6 mx-auto backdrop-blur-lg rounded-full flex items-center justify-center animate-pulse border-2 ${
            darkMode 
              ? 'bg-white/10 border-purple-400/30' 
              : 'bg-white/20 border-white/40'
          }`}>
            <img 
              src={SAKURA_AVATAR_URL} 
              alt="Sakura AI" 
              className="w-16 h-16 rounded-full object-cover"
              onError={(e) => {
                e.currentTarget.style.display = 'none';
                e.currentTarget.nextElementSibling!.textContent = '🌸';
              }}
            />
            <span className="text-4xl hidden">🌸</span>
          </div>
          <p className={`text-2xl font-semibold animate-pulse ${
            darkMode ? 'text-purple-200' : 'text-white'
          }`}>
            Afny AI を起動中...
          </p>
          <div className="flex justify-center mt-4 space-x-1">
            {[0, 1, 2].map((i) => (
              <div 
                key={i}
                className={`w-2 h-2 rounded-full animate-bounce ${
                  darkMode ? 'bg-purple-300/60' : 'bg-white/60'
                }`}
                style={{animationDelay: `${i * 0.1}s`}}
              />
            ))}
          </div>
        </div>
      </div>
    );
  }
  
  if (error && messages.length === 0 && error.includes("API Key")) {
     return (
      <div className={`min-h-screen flex items-center justify-center p-8 transition-all duration-500 ${
        darkMode 
          ? 'bg-gradient-to-br from-red-900 via-gray-900 to-black' 
          : 'bg-gradient-to-br from-red-400 via-pink-400 to-purple-500'
      }`}>
        <div className={`max-w-md w-full backdrop-blur-lg rounded-2xl p-8 text-center shadow-2xl border ${
          darkMode 
            ? 'bg-black/20 border-red-500/30' 
            : 'bg-white/10 border-white/30'
        }`}>
          <div className={`w-16 h-16 mx-auto mb-6 rounded-full flex items-center justify-center ${
            darkMode ? 'bg-red-900/30' : 'bg-white/20'
          }`}>
            <span className="text-3xl">⚠️</span>
          </div>
          <h1 className="text-2xl text-white font-bold mb-4">エラーが発生しました</h1>
          <p className="text-white/80 mb-6">{error}</p>
          <div className={`backdrop-blur-sm rounded-lg p-4 mb-6 text-left border ${
            darkMode 
              ? 'bg-yellow-900/20 border-yellow-600/30' 
              : 'bg-white/10 border-white/20'
          }`}>
            <p className="font-bold text-yellow-200 mb-2">APIキーの設定が必要です</p>
            <p className="text-yellow-100 text-sm">Create a <code className="bg-black/20 px-1 rounded">.env.local</code> file with:</p>
            <code className="text-yellow-100 text-sm bg-black/20 p-2 rounded mt-2 block">GEMINI_API_KEY=your_api_key_here</code>
          </div>
          <button 
            onClick={() => window.location.reload()}
            className={`w-full py-3 text-white rounded-lg transition-all duration-300 font-semibold backdrop-blur-sm border ${
              darkMode 
                ? 'bg-white/10 hover:bg-white/20 border-white/20' 
                : 'bg-white/20 hover:bg-white/30 border-white/30'
            }`}
          >
            再読み込み
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen relative overflow-hidden transition-all duration-500 ${
      darkMode 
        ? 'bg-gradient-to-br from-slate-900 via-purple-900 to-slate-800' 
        : 'bg-gradient-to-br from-pink-300 via-purple-400 to-indigo-500'
    }`}>
      {/* Animated background particles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(8)].map((_, i) => (
          <div
            key={i}
            className={`absolute w-4 h-4 rounded-full animate-float ${
              darkMode ? 'bg-purple-400/10' : 'bg-white/20'
            }`}
            style={{
              left: `${5 + i * 12}%`,
              animationDelay: `${i * 0.8}s`,
              animationDuration: `${8 + i * 0.5}s`
            }}
          />
        ))}
      </div>

      <div className="relative z-10 flex flex-col h-screen">
        {/* Header with glassmorphism */}
        <header className={`backdrop-blur-xl p-4 sticky top-0 z-50 transition-all duration-300 border-b ${
          darkMode 
            ? 'bg-black/10 border-purple-500/20' 
            : 'bg-white/10 border-white/20'
        }`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className={`w-14 h-14 rounded-full flex items-center justify-center shadow-lg border-2 transition-all duration-300 ${
                darkMode 
                  ? 'bg-purple-900/30 border-purple-400/50' 
                  : 'bg-white/20 border-white/30'
              }`}>
                <img 
                  src={SAKURA_AVATAR_URL} 
                  alt="Sakura AI" 
                  className="w-12 h-12 rounded-full object-cover"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                    e.currentTarget.nextElementSibling!.textContent = '🌸';
                  }}
                />
                <span className="text-2xl hidden">🌸</span>
              </div>
              <div>
                <h1 className={`text-2xl md:text-3xl font-bold bg-gradient-to-r bg-clip-text text-transparent ${
                  darkMode 
                    ? 'from-purple-300 to-pink-300' 
                    : 'from-white to-pink-100'
                }`}>
                  🌸 Afny AI 🌸
                </h1>
                <p className={`text-sm ${
                  darkMode ? 'text-purple-200/80' : 'text-white/90'
                }`}>
                  あなたの日本語学習パートナー
                </p>
              </div>
            </div>
            <ThemeToggle darkMode={darkMode} toggleDarkMode={toggleDarkMode} />
          </div>
        </header>
        
        {/* Word of the Day */}
        {wordOfTheDay && (
          <div className="mx-4 mt-4">
            <WordOfTheDayDisplay wordOfTheDay={wordOfTheDay} onSpeak={handleSpeakText} darkMode={darkMode} />
          </div>
        )}
        
        {/* Error message */}
        {error && !error.includes("API Key") && (
          <div className={`mx-4 mt-2 p-4 backdrop-blur-sm rounded-xl text-center border ${
            darkMode 
              ? 'bg-red-900/20 border-red-500/30 text-red-200' 
              : 'bg-white/20 border-white/30 text-white'
          }`}>
            {error} 
            <button 
              onClick={() => setError(null)} 
              className={`ml-2 font-bold underline transition-colors ${
                darkMode ? 'hover:text-red-100' : 'hover:text-pink-100'
              }`}
            >
              OK
            </button>
          </div>
        )}

        {/* Chat container */}
        <div className={`flex-1 mx-4 mb-4 mt-2 backdrop-blur-xl rounded-2xl border shadow-2xl overflow-hidden ${
          darkMode 
            ? 'bg-black/10 border-purple-500/20' 
            : 'bg-white/10 border-white/20'
        }`}>
          <ChatView
            messages={messages}
            isLoading={isLoading}
            onSendMessage={handleSendMessage}
            onVoiceInput={handleVoiceInput}
            onSpeakText={handleSpeakText}
            aiAvatarUrl={SAKURA_AVATAR_URL}
            darkMode={darkMode}
          />
        </div>
      </div>

      <style jsx>{`
        @keyframes float {
          0%, 100% { transform: translateY(100vh) rotate(0deg); opacity: 0; }
          10% { opacity: 1; }
          90% { opacity: 1; }
          50% { transform: translateY(-10px) rotate(180deg); opacity: 0.8; }
        }
        
        .animate-float {
          animation: float 6s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
};

export default App;