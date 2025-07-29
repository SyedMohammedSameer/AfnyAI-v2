import React, { useState, useRef, useEffect } from 'react';
import { Message } from '../types';
import { MessageBubble } from './MessageBubble';
import { MicrophoneIcon } from './icons/MicrophoneIcon';
import { SendIcon } from './icons/SendIcon';
import { LoadingSpinner } from './icons/LoadingSpinner';

interface ChatViewProps {
  messages: Message[];
  isLoading: boolean;
  onSendMessage: (text: string) => void;
  onVoiceInput: () => void;
  onSpeakText: (text: string, lang: string) => void;
  aiAvatarUrl: string;
  darkMode: boolean;
}

export const ChatView: React.FC<ChatViewProps> = ({ 
  messages, 
  isLoading, 
  onSendMessage, 
  onVoiceInput, 
  onSpeakText, 
  aiAvatarUrl,
  darkMode
}) => {
  const [inputText, setInputText] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const chatContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputText.trim() && !isLoading) {
      onSendMessage(inputText);
      setInputText('');
    }
  };

  const handleVoiceClick = () => {
    setIsRecording(!isRecording);
    onVoiceInput();
    // Reset recording state after a delay (voice recognition will handle the actual state)
    setTimeout(() => setIsRecording(false), 3000);
  };

  return (
    <div className="flex flex-col h-full">
      {/* Messages area with custom scrollbar */}
      <div 
        ref={chatContainerRef} 
        className={`flex-1 overflow-y-auto p-6 space-y-6 ${
          darkMode 
            ? 'scrollbar-thin scrollbar-thumb-gray-700/50 scrollbar-track-transparent hover:scrollbar-thumb-gray-600/70' 
            : 'scrollbar-thin scrollbar-thumb-pink-400/20 scrollbar-track-transparent hover:scrollbar-thumb-pink-400/30'
        }`}
        style={{ background: 'transparent' }}
      >
        {/* Welcome message when no messages */}
        {messages.length === 0 && (
          <div className="flex items-center justify-center h-full">
            <div className={`text-center p-8 backdrop-blur-sm rounded-2xl border max-w-md transition-all duration-300 ${
              darkMode 
                ? 'bg-black/20 border-gray-800/30' 
                : 'bg-white/5 border-pink-300/20'
            }`}>
              <div className={`w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center border-2 transition-all duration-300 ${
                darkMode 
                  ? 'bg-gray-900/50 border-gray-700/50' 
                  : 'bg-pink-200/50 border-pink-400/50'
              }`}>
                <img 
                  src={aiAvatarUrl} 
                  alt="Sakura AI" 
                  className="w-14 h-14 rounded-full object-cover"
                  onError={(e) => {
                    const target = e.currentTarget;
                    target.style.display = 'none';
                    const fallback = target.nextElementSibling as HTMLElement;
                    if (fallback) {
                      fallback.style.display = 'block';
                      fallback.textContent = '🌸';
                    }
                  }}
                />
                <span className="text-3xl hidden">🌸</span>
              </div>
              <h3 className={`text-xl font-semibold mb-2 ${
                darkMode ? 'text-white' : 'text-pink-700'
              }`}>
                こんにちは！
              </h3>
              <p className={`text-sm ${
                darkMode ? 'text-gray-400' : 'text-pink-600/70'
              }`}>
                日本語で話しかけてください。Let's practice Japanese together!
              </p>
            </div>
          </div>
        )}

        {/* Message bubbles */}
        {messages.map((msg) => (
          <MessageBubble 
            key={msg.id} 
            message={msg} 
            onSpeakText={onSpeakText} 
            aiAvatarUrl={aiAvatarUrl} 
            darkMode={darkMode}
          />
        ))}

        {/* Loading indicator */}
        {isLoading && messages.length > 0 && messages[messages.length-1].sender === 'user' && (
          <div className="flex justify-start items-end space-x-3 animate-fadeIn">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center shadow-lg border-2 transition-all duration-300 ${
              darkMode 
                ? 'bg-gray-900/50 border-gray-700/50' 
                : 'bg-pink-200/50 border-pink-400/50'
            }`}>
              <img 
                src={aiAvatarUrl} 
                alt="Sakura AI" 
                className="w-8 h-8 rounded-full object-cover"
                onError={(e) => {
                  const target = e.currentTarget;
                  target.style.display = 'none';
                  const fallback = target.nextElementSibling as HTMLElement;
                  if (fallback) {
                    fallback.style.display = 'block';
                    fallback.textContent = '🌸';
                  }
                }}
              />
              <span className="text-lg hidden">🌸</span>
            </div>
            <div className={`flex items-center space-x-2 backdrop-blur-sm p-4 rounded-2xl rounded-bl-md max-w-xs border shadow-lg transition-all duration-300 ${
              darkMode 
                ? 'bg-gray-800/50 border-gray-700/50 text-gray-200' 
                : 'bg-pink-100/20 border-pink-300/30 text-pink-800'
            }`}>
              <LoadingSpinner className={`w-5 h-5 ${
                darkMode ? 'text-gray-400' : 'text-pink-500'
              }`} />
              <span className="text-sm">さくらが考えています...</span>
            </div>
          </div>
        )}
      </div>

      {/* Input area with glassmorphism */}
      <div className={`p-6 border-t backdrop-blur-sm transition-all duration-300 ${
        darkMode 
          ? 'border-gray-800/50 bg-black/20' 
          : 'border-pink-300/20 bg-white/5'
      }`}>
        <form onSubmit={handleSubmit} className="flex items-center space-x-3">
          {/* Voice input button */}
          <button
            type="button"
            onClick={handleVoiceClick}
            disabled={isLoading}
            className={`p-4 rounded-full transition-all duration-300 focus:outline-none focus:ring-2 disabled:opacity-50 transform hover:scale-105 active:scale-95 ${
              isRecording 
                ? 'bg-red-500 hover:bg-red-600 shadow-lg shadow-red-500/25 animate-pulse focus:ring-red-400' 
                : darkMode
                  ? 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-lg shadow-blue-600/25 focus:ring-blue-400'
                  : 'bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600 shadow-lg shadow-pink-500/25 focus:ring-pink-400'
            }`}
            aria-label={isRecording ? "Recording... Click to stop" : "Start voice input"}
          >
            <MicrophoneIcon className="w-6 h-6 text-white" />
          </button>

          {/* Text input */}
          <div className="flex-1 relative">
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="日本語でメッセージを入力..."
              className={`w-full p-4 backdrop-blur-sm border rounded-2xl focus:ring-2 focus:border-transparent focus:outline-none transition-all duration-300 ${
                darkMode 
                  ? 'bg-gray-900/30 border-gray-700/30 focus:ring-blue-500 text-white placeholder-gray-400' 
                  : 'bg-white/10 border-pink-300/20 focus:ring-pink-400 text-pink-800 placeholder-pink-600/60'
              }`}
              disabled={isLoading}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSubmit(e);
                }
              }}
            />
            <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-transparent via-white/5 to-transparent opacity-0 hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
          </div>

          {/* Send button */}
          <button
            type="submit"
            disabled={isLoading || !inputText.trim()}
            className={`p-4 rounded-full transition-all duration-300 focus:outline-none focus:ring-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg transform hover:scale-105 active:scale-95 ${
              darkMode 
                ? 'bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white focus:ring-emerald-400 shadow-emerald-600/25' 
                : 'bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white focus:ring-blue-400 shadow-blue-500/25'
            }`}
            aria-label="Send message"
          >
            {isLoading && inputText ? (
              <LoadingSpinner className="w-6 h-6" />
            ) : (
              <SendIcon className="w-6 h-6" />
            )}
          </button>
        </form>

        {/* Quick suggestions - only show when no messages */}
        {messages.length === 0 && (
          <div className="mt-4 flex flex-wrap gap-2 justify-center">
            {['こんにちは', 'はじめまして', 'お元気ですか？', '日本語を練習したいです'].map((suggestion) => (
              <button
                key={suggestion}
                onClick={() => setInputText(suggestion)}
                className={`px-3 py-1 text-sm backdrop-blur-sm rounded-full border transition-all duration-300 transform hover:scale-105 ${
                  darkMode 
                    ? 'bg-gray-800/20 hover:bg-gray-700/30 text-gray-300 hover:text-white border-gray-700/30' 
                    : 'bg-pink-100/10 hover:bg-pink-100/20 text-pink-700/80 hover:text-pink-800 border-pink-300/20'
                }`}
              >
                {suggestion}
              </button>
            ))}
          </div>
        )}
      </div>

      <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        .animate-fadeIn {
          animation: fadeIn 0.5s ease-out;
        }

        /* Custom scrollbar styles */
        .scrollbar-thin::-webkit-scrollbar {
          width: 6px;
        }
        
        .scrollbar-thumb-gray-700\\/50::-webkit-scrollbar-thumb {
          background: rgba(55, 65, 81, 0.5);
          border-radius: 3px;
        }
        
        .scrollbar-thumb-pink-400\\/20::-webkit-scrollbar-thumb {
          background: rgba(244, 114, 182, 0.2);
          border-radius: 3px;
        }
        
        .scrollbar-track-transparent::-webkit-scrollbar-track {
          background: transparent;
        }
        
        .hover\\:scrollbar-thumb-gray-600\\/70:hover::-webkit-scrollbar-thumb {
          background: rgba(75, 85, 99, 0.7);
        }
        
        .hover\\:scrollbar-thumb-pink-400\\/30:hover::-webkit-scrollbar-thumb {
          background: rgba(244, 114, 182, 0.3);
        }
      `}</style>
    </div>
  );
};