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
    <div className={`backdrop-blur-xl rounded-2xl border shadow-2xl p-6 transition-all duration-300 hover:shadow-3xl hover:-translate-y-1 relative overflow-hidden group ${
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
      <div className="text-center mb-6 relative z-10">
        <h2 className={`text-xl font-bold bg-gradient-to-r bg-clip-text text-transparent mb-2 ${
          darkMode 
            ? 'from-white to-gray-300' 
            : 'from-pink-600 to-purple-600'
        }`}>
          今日の言葉 (Word of the Day)
        </h2>
        <div className={`w-16 h-px mx-auto ${
          darkMode 
            ? 'bg-gradient-to-r from-gray-600 to-gray-400' 
            : 'bg-gradient-to-r from-pink-400 to-purple-400'
        }`} />
      </div>

      {/* Main word section */}
      <div className="text-center mb-6 relative z-10">
        <div className="inline-flex items-center gap-3 group/word">
          <span className={`text-4xl sm:text-5xl font-black bg-gradient-to-r bg-clip-text text-transparent drop-shadow-lg ${
            darkMode 
              ? 'from-white to-gray-200' 
              : 'from-pink-600 to-purple-600'
          }`}>
            {wordOfTheDay.word}
          </span>
          <button 
            onClick={() => onSpeak(wordOfTheDay.word, 'ja-JP')} 
            className={`p-2 backdrop-blur-sm rounded-full transition-all duration-300 transform hover:scale-110 focus:outline-none focus:ring-2 ${
              darkMode 
                ? 'bg-gray-800/30 hover:bg-gray-700/40 text-gray-200 hover:text-white focus:ring-blue-400' 
                : 'bg-pink-100/20 hover:bg-pink-100/30 text-pink-700 hover:text-pink-800 focus:ring-pink-400'
            }`}
            aria-label={`Speak word ${wordOfTheDay.word}`}
          >
            <SpeakerIcon className="w-5 h-5"/>
          </button>
        </div>
        
        <p className={`text-lg mt-2 font-medium ${
          darkMode ? 'text-gray-300' : 'text-pink-700/70'
        }`}>
          [{wordOfTheDay.reading}]
        </p>
        
        <p className={`text-base mt-1 font-medium ${
          darkMode ? 'text-gray-400' : 'text-pink-600/60'
        }`}>
          {wordOfTheDay.meaning}
        </p>
      </div>

      {/* Example section */}
      <div className={`relative z-10 backdrop-blur-sm rounded-xl p-4 border ${
        darkMode 
          ? 'bg-black/20 border-gray-800/30' 
          : 'bg-white/5 border-white/10'
      }`}>
        <p className={`text-sm font-semibold mb-3 flex items-center gap-2 ${
          darkMode ? 'text-gray-200' : 'text-white/80'
        }`}>
          <span className={`w-2 h-2 rounded-full ${
            darkMode 
              ? 'bg-gradient-to-r from-blue-400 to-cyan-400' 
              : 'bg-gradient-to-r from-pink-400 to-purple-400'
          }`}></span>
          例文 (Example):
        </p>
        
        <div className="space-y-2">
          <div className="flex items-start gap-2">
            <p className={`text-base font-medium leading-relaxed ${
              darkMode ? 'text-white' : 'text-pink-200'
            }`}>
              {wordOfTheDay.exampleJapanese}
            </p>
            <button 
              onClick={() => onSpeak(wordOfTheDay.exampleJapanese, 'ja-JP')} 
              className={`flex-shrink-0 p-1.5 rounded-full transition-all duration-300 transform hover:scale-110 focus:outline-none focus:ring-2 mt-0.5 ${
                darkMode 
                  ? 'bg-gray-700/30 hover:bg-gray-600/40 text-gray-300 hover:text-white focus:ring-blue-400' 
                  : 'bg-white/10 hover:bg-white/20 text-white/70 hover:text-white focus:ring-pink-400'
              }`}
              aria-label="Speak example sentence"
            >
              <SpeakerIcon className="w-4 h-4"/>
            </button>
          </div>
          
          <p className={`text-sm italic pl-2 border-l-2 ${
            darkMode 
              ? 'text-gray-400 border-gray-700/50' 
              : 'text-white/50 border-white/20'
          }`}>
            {wordOfTheDay.exampleEnglish}
          </p>
        </div>
      </div>

      {/* Decorative elements */}
      <div className={`absolute top-4 right-4 text-6xl select-none pointer-events-none ${
        darkMode ? 'text-gray-800/30' : 'text-pink-300/20'
      }`}>
        🌸
      </div>
      <div className={`absolute bottom-4 left-4 text-4xl select-none pointer-events-none ${
        darkMode ? 'text-gray-800/20' : 'text-purple-300/20'
      }`}>
        ✨
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