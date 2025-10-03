import React, { useState, useEffect, useRef, useCallback } from 'react';
import { ChatView } from './components/ChatView';
import { WordOfTheDayDisplay } from './components/WordOfTheDay';
import { ThemeToggle } from './components/ThemeToggle';
import { Message, WordOfTheDayType, SenderType } from './types';
import { ApiService } from './services/apiService';
import { SpeechService } from './services/speechService';
import { SYSTEM_INSTRUCTION, GROQ_CHAT_MODEL } from './constants';

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

  const apiService = useRef<ApiService | null>(null);
  const speechService = useRef<SpeechService | null>(null);

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
      document.body.className = 'dark bg-black';
      document.body.style.backgroundColor = '#000000';
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      document.body.className = 'bg-gradient-to-br from-pink-300 via-purple-400 to-indigo-500';
      document.body.style.backgroundColor = '';
      localStorage.setItem('theme', 'light');
    }
  }, [darkMode]);

  useEffect(() => {
    try {
      // API service doesn't need API key on frontend - it's secured in Netlify functions
      apiService.current = new ApiService();
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
    if (apiService.current) {
      try {
        console.log('Initializing chat session...');
        await apiService.current.initChat(GROQ_CHAT_MODEL, SYSTEM_INSTRUCTION);
        console.log('Chat session initialized successfully');
      } catch (e) {
        console.error("Failed to initialize chat session:", e);
        setError("Could not start chat session. Please try refreshing.");
      }
    }
  }, []);

  useEffect(() => {
    if (!isInitializing && apiService.current) {
      initializeChat();
      fetchWOTD();
    }
  }, [isInitializing, initializeChat]);

  const fetchWOTD = async () => {
    if (!apiService.current) return;
    try {
      const wotd = await apiService.current.fetchWordOfTheDay();
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
    if (!apiService.current) return;
    try {
      const englishText = await apiService.current.translateText(japaneseText, 'English');
      addMessage(englishText, sender, 'english');
    } catch (e) {
      console.error(`Translation error for ${sender}:`, e);
      addMessage(`(Translation failed)`, sender, 'english');
    }
  };

  const handleSendMessage = async (japaneseInput: string) => {
    if (!japaneseInput.trim() || isLoading || !apiService.current) {
      console.log('Cannot send message:', {
        hasInput: !!japaneseInput.trim(),
        isLoading,
        hasApiService: !!apiService.current
      });
      return;
    }

    console.log('Sending message:', japaneseInput);
    console.log('API service available:', !!apiService.current);

    setIsLoading(true);
    setError(null);
    addMessage(japaneseInput, SenderType.User, 'japanese');
    await translateAndAdd(japaneseInput, SenderType.User);

    try {
      const aiResponseJapanese = await apiService.current.sendMessageToAI(japaneseInput);
      console.log('AI Response received:', aiResponseJapanese);

      addMessage(aiResponseJapanese, SenderType.AI, 'japanese');

      // Auto-play AI response after user interaction (message send)
      if (speechService.current && aiResponseJapanese) {
        console.log('Auto-playing AI response');
        // Small delay to ensure message is rendered
        setTimeout(() => {
          if (speechService.current) {
            speechService.current.speakText(aiResponseJapanese, 'ja-JP');
          }
        }, 200);
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
      console.log('handleSpeakText called with:', { text: text.substring(0, 50), lang });
      speechService.current.speakText(text, lang);
    } else {
      console.error('Speech service not available');
    }
  };
  
  const toggleDarkMode = () => setDarkMode(prevMode => !prevMode);

  if (isInitializing) {
    return (
      <div className={`flex items-center justify-center h-screen transition-all duration-500 ${
        darkMode 
          ? 'bg-black' 
          : 'bg-gradient-to-br from-pink-300 via-purple-400 to-indigo-500'
      }`}>
        <div className="text-center">
          <div className={`w-20 h-20 mb-6 mx-auto backdrop-blur-lg rounded-full flex items-center justify-center animate-pulse border-2 ${
            darkMode 
              ? 'bg-gray-900/50 border-gray-700/30' 
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
            darkMode ? 'text-white' : 'text-white'
          }`}>
            Sakura AI を起動中...
          </p>
          <div className="flex justify-center mt-4 space-x-1">
            {[0, 1, 2].map((i) => (
              <div 
                key={i}
                className={`w-2 h-2 rounded-full animate-bounce ${
                  darkMode ? 'bg-gray-400/60' : 'bg-white/60'
                }`}
                style={{animationDelay: `${i * 0.1}s`}}
              />
            ))}
          </div>
        </div>
      </div>
    );
  }
  

  return (
    <div className={`min-h-screen relative overflow-hidden transition-all duration-500 ${
      darkMode 
        ? 'bg-black' 
        : 'bg-gradient-to-br from-pink-300 via-purple-400 to-indigo-500'
    }`}>
      {/* Animated background particles - subtle for dark mode */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(6)].map((_, i) => (
          <div
            key={i}
            className={`absolute w-3 h-3 rounded-full animate-float ${
              darkMode ? 'bg-gray-800/20' : 'bg-white/20'
            }`}
            style={{
              left: `${5 + i * 15}%`,
              animationDelay: `${i * 1.2}s`,
              animationDuration: `${10 + i * 0.5}s`
            }}
          />
        ))}
      </div>

      <div className="relative z-10 flex flex-col h-screen">
        {/* Header with glassmorphism */}
        <header className={`backdrop-blur-xl p-3 sm:p-4 sticky top-0 z-50 transition-all duration-300 border-b ${
          darkMode
            ? 'bg-black/50 border-gray-800/50'
            : 'bg-white/10 border-white/20'
        }`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2 sm:space-x-3 md:space-x-4">
              <div className={`w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 rounded-full flex items-center justify-center shadow-lg border-2 transition-all duration-300 ${
                darkMode
                  ? 'bg-gray-900/50 border-gray-700/50'
                  : 'bg-white/20 border-white/30'
              }`}>
                <img
                  src={SAKURA_AVATAR_URL}
                  alt="Sakura AI"
                  className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 rounded-full object-cover"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                    e.currentTarget.nextElementSibling!.textContent = '🌸';
                  }}
                />
                <span className="text-xl sm:text-2xl hidden">🌸</span>
              </div>
              <div>
                <h1 className={`text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold bg-gradient-to-r bg-clip-text text-transparent ${
                  darkMode
                    ? 'from-white to-gray-300'
                    : 'from-white to-pink-100'
                }`}>
                  Sakura AI
                </h1>
                <p className={`text-xs sm:text-sm hidden sm:block ${
                  darkMode ? 'text-gray-400' : 'text-white/90'
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
          <div className="mx-2 sm:mx-3 md:mx-4 mt-1.5 sm:mt-2">
            <WordOfTheDayDisplay wordOfTheDay={wordOfTheDay} onSpeak={handleSpeakText} darkMode={darkMode} />
          </div>
        )}

        {/* Error message */}
        {error && !error.includes("API Key") && (
          <div className={`mx-2 sm:mx-3 md:mx-4 mt-2 p-3 sm:p-4 backdrop-blur-sm rounded-xl text-center border text-sm sm:text-base ${
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
        <div className={`flex-1 mx-2 sm:mx-3 md:mx-4 mb-2 sm:mb-3 md:mb-4 mt-1.5 sm:mt-2 backdrop-blur-xl rounded-xl sm:rounded-2xl border shadow-2xl overflow-hidden ${
          darkMode
            ? 'bg-gray-900/10 border-gray-800/50'
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
          animation: float 8s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
};

export default App;