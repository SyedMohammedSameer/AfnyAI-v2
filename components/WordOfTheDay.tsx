
import React from 'react';
import { WordOfTheDayType } from '../types';
import { SpeakerIcon } from './icons/SpeakerIcon';

interface WordOfTheDayProps {
  wordOfTheDay: WordOfTheDayType;
  onSpeak: (text: string, lang: string) => void;
}

export const WordOfTheDayDisplay: React.FC<WordOfTheDayProps> = ({ wordOfTheDay, onSpeak }) => {
  return (
    <div className="p-4 bg-white/80 dark:bg-slate-700/80 backdrop-blur-sm shadow-lg m-2 sm:m-4 rounded-xl border border-pink-200 dark:border-pink-700 transition-colors duration-300">
      <h2 className="text-xl font-semibold text-pink-600 dark:text-pink-400 mb-3 text-center">今日の言葉 (Word of the Day)</h2>
      <div className="text-center mb-2">
        <span className="text-3xl sm:text-4xl font-bold text-blue-600 dark:text-blue-400">{wordOfTheDay.word}</span>
        <button 
            onClick={() => onSpeak(wordOfTheDay.word, 'ja-JP')} 
            className="ml-2 p-1 text-blue-500 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 inline-flex items-center justify-center"
            aria-label={`Speak word ${wordOfTheDay.word}`}
        >
            <SpeakerIcon className="w-5 h-5"/>
        </button>
      </div>
      <p className="text-center text-lg text-gray-700 dark:text-gray-300 mb-1">[{wordOfTheDay.reading}]</p>
      <p className="text-center text-md text-gray-600 dark:text-gray-400 mb-3">{wordOfTheDay.meaning}</p>
      
      <div className="mt-2 pt-2 border-t border-pink-200 dark:border-pink-600">
        <p className="text-sm text-gray-700 dark:text-gray-300 font-medium">例文 (Example):</p>
        <p className="text-md text-blue-700 dark:text-blue-300 mt-1">
          {wordOfTheDay.exampleJapanese}
          <button 
            onClick={() => onSpeak(wordOfTheDay.exampleJapanese, 'ja-JP')} 
            className="ml-1 p-1 text-blue-500 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 inline-flex items-center justify-center"
            aria-label="Speak example sentence"
            >
            <SpeakerIcon className="w-4 h-4"/>
          </button>
        </p>
        <p className="text-sm text-gray-500 dark:text-gray-400 italic">({wordOfTheDay.exampleEnglish})</p>
      </div>
    </div>
  );
};
