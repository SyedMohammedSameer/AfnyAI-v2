
import React from 'react';
import { Message, SenderType } from '../types';
import { SpeakerIcon } from './icons/SpeakerIcon';

interface MessageBubbleProps {
  message: Message;
  onSpeakText: (text: string, lang: string) => void;
  aiAvatarUrl: string; // Added to receive avatar URL
}

export const MessageBubble: React.FC<MessageBubbleProps> = ({ message, onSpeakText, aiAvatarUrl }) => {
  const isUser = message.sender === SenderType.User;
  
  const bubbleBaseClasses = "p-3 md:p-4 shadow-md max-w-md lg:max-w-lg relative group transition-colors duration-300";
  const userBubbleClasses = `bg-blue-500 dark:bg-blue-600 text-white rounded-t-xl rounded-bl-xl self-end`;
  const aiBubbleClasses = `bg-pink-500 dark:bg-pink-600 text-white rounded-t-xl rounded-br-xl self-start`;
  
  const bubbleClasses = isUser ? userBubbleClasses : aiBubbleClasses;
  const containerClasses = isUser ? 'flex justify-end' : 'flex justify-start items-end space-x-2';

  return (
    <div className={`${containerClasses}`}>
      {!isUser && (
        <img 
          src={message.avatarUrl || aiAvatarUrl} 
          alt="AI Avatar" 
          className="w-8 h-8 md:w-10 md:h-10 rounded-full shadow-sm border-2 border-pink-200 dark:border-pink-400 self-start mb-1"
        />
      )}
      <div className={`${bubbleBaseClasses} ${bubbleClasses}`}>
        <p className="text-md whitespace-pre-wrap">{message.japaneseText}</p>
        {message.englishText && (
          <p className="text-xs opacity-80 dark:opacity-70 mt-1 pt-1 border-t border-white/30 dark:border-white/20">
            (EN: {message.englishText})
          </p>
        )}
        <p className="text-xs opacity-60 dark:opacity-50 mt-1 text-right">
          {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </p>
        {!isUser && message.japaneseText && (
           <button 
             onClick={() => onSpeakText(message.japaneseText, 'ja-JP')}
             className="absolute -bottom-2 -right-2 p-1.5 bg-pink-600 hover:bg-pink-700 dark:bg-pink-700 dark:hover:bg-pink-800 rounded-full opacity-0 group-hover:opacity-100 focus:opacity-100 transition-all duration-200"
             aria-label="Speak AI message"
           >
             <SpeakerIcon className="w-4 h-4 text-white" />
           </button>
        )}
      </div>
    </div>
  );
};
