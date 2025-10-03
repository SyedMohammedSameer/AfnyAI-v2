import React from 'react';
import { WordOfTheDayType } from '../types';
import { SpeakerIcon } from './icons/SpeakerIcon';

interface WordOfTheDayProps {
  wordOfTheDay: WordOfTheDayType;
  onSpeak: (text: string, lang: string) => void;
  darkMode: boolean;
}

export const WordOfTheDayDisplay: React.FC<WordOfTheDayProps> = ({ wordOfTheDay, onSpeak, darkMode }) => {
  return (
    <div className={`backdrop-blur-xl rounded-xl border shadow-lg p-2 sm:p-3 transition-all duration-300 hover:shadow-xl relative overflow-hidden group ${
      darkMode
        ? 'bg-gray-900/20 border-gray-800/50'
        : 'bg-white/10 border-pink-300/20'
    }`}>
      {/* Animated background shimmer */}
      <div className={`absolute inset-0 bg-gradient-to-r opacity-0 group-hover:opacity-100 transition-opacity duration-700 transform -skew-x-12 animate-shimmer ${
        darkMode 
          ? 'from-transparent via-white/5 to-transparent' 
          : 'from-transparent via-white/5 to-transparent'
      }`} />
      
      {/* Header */}
      <div className="text-center mb-2 relative z-10">
        <h2 className={`text-xs sm:text-sm font-semibold bg-gradient-to-r bg-clip-text text-transparent ${
          darkMode
            ? 'from-white to-gray-300'
            : 'from-pink-600 to-purple-600'
        }`}>
          今日の言葉
        </h2>
      </div>

      {/* Main word section - Horizontal layout on mobile */}
      <div className="flex items-center justify-between mb-2 relative z-10">
        <div className="flex items-center gap-1.5 sm:gap-2">
          <span className={`text-xl sm:text-2xl md:text-3xl font-bold bg-gradient-to-r bg-clip-text text-transparent ${
            darkMode
              ? 'from-white to-gray-200'
              : 'from-pink-600 to-purple-600'
          }`}>
            {wordOfTheDay.word}
          </span>
          <button
            onClick={() => onSpeak(wordOfTheDay.word, 'ja-JP')}
            className={`p-1 sm:p-1.5 backdrop-blur-sm rounded-full transition-all duration-300 transform hover:scale-110 focus:outline-none focus:ring-1 ${
              darkMode
                ? 'bg-gray-800/30 hover:bg-gray-700/40 text-gray-200 hover:text-white focus:ring-blue-400'
                : 'bg-pink-100/20 hover:bg-pink-100/30 text-pink-700 hover:text-pink-800 focus:ring-pink-400'
            }`}
            aria-label={`Speak word ${wordOfTheDay.word}`}
          >
            <SpeakerIcon className="w-3 h-3 sm:w-4 sm:h-4"/>
          </button>
        </div>

        <div className="text-right">
          <p className={`text-xs sm:text-sm font-medium ${
            darkMode ? 'text-gray-300' : 'text-pink-700/70'
          }`}>
            {wordOfTheDay.reading}
          </p>
          <p className={`text-xs font-medium ${
            darkMode ? 'text-gray-400' : 'text-pink-600/60'
          }`}>
            {wordOfTheDay.meaning}
          </p>
        </div>
      </div>

      {/* Example section - More compact */}
      <div className={`relative z-10 backdrop-blur-sm rounded-lg p-1.5 sm:p-2 border ${
        darkMode
          ? 'bg-black/20 border-gray-800/30'
          : 'bg-white/5 border-white/10'
      }`}>
        <div className="flex items-start gap-1 sm:gap-1.5">
          <p className={`text-xs sm:text-sm font-medium leading-snug flex-1 ${
            darkMode ? 'text-white' : 'text-pink-200'
          }`}>
            {wordOfTheDay.exampleJapanese}
          </p>
          <button
            onClick={() => onSpeak(wordOfTheDay.exampleJapanese, 'ja-JP')}
            className={`flex-shrink-0 p-0.5 sm:p-1 rounded-full transition-all duration-300 transform hover:scale-110 focus:outline-none focus:ring-1 ${
              darkMode
                ? 'bg-gray-700/30 hover:bg-gray-600/40 text-gray-300 hover:text-white focus:ring-blue-400'
                : 'bg-white/10 hover:bg-white/20 text-white/70 hover:text-white focus:ring-pink-400'
            }`}
            aria-label="Speak example sentence"
          >
            <SpeakerIcon className="w-3 h-3"/>
          </button>
        </div>

        <p className={`text-xs italic mt-1 pl-2 border-l ${
          darkMode
            ? 'text-gray-400 border-gray-700/50'
            : 'text-white/50 border-white/20'
        }`}>
          {wordOfTheDay.exampleEnglish}
        </p>
      </div>

      {/* Decorative elements - smaller */}
      <div className={`absolute top-1 right-1 sm:top-2 sm:right-2 text-2xl sm:text-3xl select-none pointer-events-none ${
        darkMode ? 'text-gray-800/20' : 'text-pink-300/20'
      }`}>
        🌸
      </div>

      <style jsx>{`
        @keyframes shimmer {
          0% { transform: translateX(-100%) skewX(-12deg); }
          100% { transform: translateX(200%) skewX(-12deg); }
        }
        
        .animate-shimmer {
          animation: shimmer 2s ease-in-out infinite;
        }

        .hover\\:shadow-3xl:hover {
          box-shadow: 0 35px 60px -12px rgba(0, 0, 0, 0.4);
        }
      `}</style>
    </div>
  );
};