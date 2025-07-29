import React from 'react';
import { Message, SenderType } from '../types';
import { SpeakerIcon } from './icons/SpeakerIcon';

interface MessageBubbleProps {
  message: Message;
  onSpeakText: (text: string, lang: string) => void;
  aiAvatarUrl: string;
  darkMode: boolean;
}

export const MessageBubble: React.FC<MessageBubbleProps> = ({ message, onSpeakText, aiAvatarUrl, darkMode }) => {
  const isUser = message.sender === SenderType.User;
  
  return (
    <div 
      className={`flex items-end gap-3 animate-slideIn ${
        isUser ? 'flex-row-reverse' : 'flex-row'
      }`}
    >
      {/* Avatar */}
      {!isUser && (
        <div className={`w-10 h-10 rounded-full flex items-center justify-center shadow-lg flex-shrink-0 transition-transform duration-300 hover:scale-110 border-2 ${
          darkMode 
            ? 'bg-gray-900/50 border-gray-700/50' 
            : 'bg-pink-200/50 border-pink-400/50'
        }`}>
          <img 
            src={message.avatarUrl || aiAvatarUrl} 
            alt="AI Avatar" 
            className="w-8 h-8 rounded-full object-cover"
            onError={(e) => {
              e.currentTarget.style.display = 'none';
              e.currentTarget.nextElementSibling!.textContent = '🌸';
            }}
          />
          <span className="text-lg hidden">🌸</span>
        </div>
      )}

      {/* Message content */}
      <div className={`group relative max-w-md lg:max-w-lg ${isUser ? 'ml-auto' : 'mr-auto'}`}>
        <div
          className={`
            relative p-4 rounded-2xl backdrop-blur-sm border shadow-lg transition-all duration-300 hover:shadow-xl hover:-translate-y-1 text-white
            ${
              isUser
                ? darkMode
                  ? 'bg-gradient-to-r from-blue-700/90 to-indigo-700/90 border-blue-600/40 rounded-br-md'
                  : 'bg-gradient-to-r from-blue-500/80 to-purple-500/80 border-blue-400/30 rounded-br-md'
                : darkMode
                  ? 'bg-gradient-to-r from-gray-800/90 to-gray-700/90 border-gray-600/40 rounded-bl-md'
                  : 'bg-gradient-to-r from-pink-500/80 to-rose-500/80 border-pink-400/30 rounded-bl-md'
            }
          `}
        >
          {/* Shimmer effect */}
          <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-transparent via-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 transform -skew-x-12 animate-shimmer" />
          
          {/* Japanese text */}
          <p className="text-base font-medium leading-relaxed relative z-10 mb-2">
            {message.japaneseText}
          </p>

          {/* English translation */}
          {message.englishText && (
            <div className="relative z-10">
              <div className="w-full h-px bg-white/20 mb-2" />
              <p className="text-sm opacity-80 italic">
                (EN: {message.englishText})
              </p>
            </div>
          )}

          {/* Timestamp */}
          <p className="text-xs opacity-60 mt-2 text-right relative z-10">
            {new Date(message.timestamp).toLocaleTimeString([], { 
              hour: '2-digit', 
              minute: '2-digit' 
            })}
          </p>

          {/* Speak button for AI messages */}
          {!isUser && message.japaneseText && (
            <button 
              onClick={() => onSpeakText(message.japaneseText, 'ja-JP')}
              className={`absolute -bottom-2 -right-2 w-8 h-8 rounded-full opacity-0 group-hover:opacity-100 focus:opacity-100 transition-all duration-300 flex items-center justify-center shadow-lg transform hover:scale-110 focus:outline-none focus:ring-2 ${
                darkMode 
                  ? 'bg-white/90 hover:bg-white text-gray-700 hover:text-gray-800 focus:ring-blue-400' 
                  : 'bg-white/90 hover:bg-white text-pink-500 hover:text-pink-600 focus:ring-pink-400'
              }`}
              aria-label="Speak AI message"
            >
              <SpeakerIcon className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Message tail */}
        <div
          className={`absolute w-3 h-3 transform rotate-45 ${
            isUser
              ? darkMode
                ? 'bottom-3 -right-1 bg-gradient-to-r from-blue-700/90 to-indigo-700/90'
                : 'bottom-3 -right-1 bg-gradient-to-r from-blue-500/80 to-purple-500/80'
              : darkMode
                ? 'bottom-3 -left-1 bg-gradient-to-r from-gray-800/90 to-gray-700/90'
                : 'bottom-3 -left-1 bg-gradient-to-r from-pink-500/80 to-rose-500/80'
          }`}
        />
      </div>
    </div>
  );
};

export default MessageBubble;