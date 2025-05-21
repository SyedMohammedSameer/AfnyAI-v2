
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
}

export const ChatView: React.FC<ChatViewProps> = ({ messages, isLoading, onSendMessage, onVoiceInput, onSpeakText, aiAvatarUrl }) => {
  const [inputText, setInputText] = useState('');
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

  return (
    <div className="flex flex-col flex-grow overflow-hidden p-2 sm:p-4 space-y-4">
      <div ref={chatContainerRef} className="flex-grow overflow-y-auto space-y-4 p-2 rounded-lg bg-white/30 dark:bg-slate-700/30 shadow-inner chat-scrollbar transition-colors duration-300">
        {messages.map((msg) => (
          <MessageBubble key={msg.id} message={msg} onSpeakText={onSpeakText} aiAvatarUrl={aiAvatarUrl} />
        ))}
        {isLoading && messages.length > 0 && messages[messages.length-1].sender === 'user' && (
          <div className="flex justify-start items-center space-x-2 ml-2">
             <img src={aiAvatarUrl} alt="AI Avatar" className="w-8 h-8 rounded-full shadow"/>
            <div className="flex items-center space-x-2 bg-pink-200 dark:bg-pink-700 text-pink-700 dark:text-pink-200 p-3 rounded-lg max-w-xs lg:max-w-md shadow">
              <LoadingSpinner className="w-5 h-5 text-pink-500 dark:text-pink-300" />
              <span>さくらが考えています...</span>
            </div>
          </div>
        )}
      </div>
      <form onSubmit={handleSubmit} className="flex items-center space-x-2 p-2 bg-white dark:bg-slate-700 rounded-full shadow-lg transition-colors duration-300">
        <button
          type="button"
          onClick={onVoiceInput}
          disabled={isLoading}
          className="p-3 rounded-full text-pink-500 hover:bg-pink-100 dark:text-pink-400 dark:hover:bg-slate-600 focus:outline-none focus:ring-2 focus:ring-pink-400 dark:focus:ring-pink-500 disabled:opacity-50 transition-colors"
          aria-label="Start voice input"
        >
          <MicrophoneIcon className="w-6 h-6" />
        </button>
        <input
          type="text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder="日本語でメッセージを入力..."
          className="flex-grow p-3 border-none rounded-full focus:ring-2 focus:ring-blue-400 dark:focus:ring-blue-500 focus:outline-none bg-gray-50 dark:bg-slate-600 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-300 transition-colors duration-300"
          disabled={isLoading}
        />
        <button
          type="submit"
          disabled={isLoading || !inputText.trim()}
          className="p-3 rounded-full bg-blue-500 text-white hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-400 dark:focus:ring-blue-500 disabled:opacity-50 transition-colors"
          aria-label="Send message"
        >
          {isLoading && inputText ? <LoadingSpinner className="w-6 h-6" /> : <SendIcon className="w-6 h-6" />}
        </button>
      </form>
    </div>
  );
};
