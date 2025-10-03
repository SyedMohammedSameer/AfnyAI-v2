
// Fix for: Cannot find name 'SpeechRecognition', 'SpeechRecognitionEvent', 'SpeechRecognitionErrorEvent'
// Add necessary Web Speech API type definitions
interface SpeechRecognitionErrorEvent extends Event {
    readonly error: string; // Simplified from DOMException name strings
    readonly message: string;
}

interface SpeechRecognitionAlternative {
    readonly transcript: string;
    readonly confidence: number;
}

interface SpeechRecognitionResult {
    readonly isFinal: boolean;
    readonly length: number;
    item(index: number): SpeechRecognitionAlternative;
    [index: number]: SpeechRecognitionAlternative;
}

interface SpeechRecognitionResultList {
    readonly length: number;
    item(index: number): SpeechRecognitionResult;
    [index: number]: SpeechRecognitionResult;
}

interface SpeechRecognitionEvent extends Event {
    readonly resultIndex: number;
    readonly results: SpeechRecognitionResultList;
    // readonly interpretation?: any; // Non-standard
    // readonly emma?: Document | null; // Non-standard
}

interface SpeechGrammar {
    src: string;
    weight: number;
}
// declare var SpeechGrammar: { // Not strictly needed if not creating instances directly
//     prototype: SpeechGrammar;
//     new(): SpeechGrammar;
// };

interface SpeechGrammarList {
    readonly length: number;
    item(index: number): SpeechGrammar;
    [index: number]: SpeechGrammar;
    addFromString(string: string, weight?: number): void;
    addFromURI(src: string, weight?: number): void;
}
// declare var SpeechGrammarList: { // Not strictly needed if not creating instances directly
//     prototype: SpeechGrammarList;
//     new(): SpeechGrammarList;
// };


interface SpeechRecognition extends EventTarget {
    grammars: SpeechGrammarList;
    lang: string;
    continuous: boolean;
    interimResults: boolean;
    maxAlternatives: number;
    // serviceURI: string; // Deprecated

    start(): void;
    stop(): void;
    abort(): void;

    onaudiostart: ((this: SpeechRecognition, ev: Event) => any) | null;
    onaudioend: ((this: SpeechRecognition, ev: Event) => any) | null;
    onend: ((this: SpeechRecognition, ev: Event) => any) | null;
    onerror: ((this: SpeechRecognition, ev: SpeechRecognitionErrorEvent) => any) | null;
    onnomatch: ((this: SpeechRecognition, ev: SpeechRecognitionEvent) => any) | null;
    onresult: ((this: SpeechRecognition, ev: SpeechRecognitionEvent) => any) | null;
    onsoundstart: ((this: SpeechRecognition, ev: Event) => any) | null;
    onsoundend: ((this: SpeechRecognition, ev: Event) => any) | null;
    onspeechstart: ((this: SpeechRecognition, ev: Event) => any) | null;
    onspeechend: ((this: SpeechRecognition, ev: Event) => any) | null;
    onstart: ((this: SpeechRecognition, ev: Event) => any) | null;
}

interface SpeechRecognitionStatic {
    new(): SpeechRecognition;
}

// Augment the Window interface to inform TypeScript about these properties
declare global {
    interface Window {
        SpeechRecognition?: SpeechRecognitionStatic;
        webkitSpeechRecognition?: SpeechRecognitionStatic;
        SpeechGrammarList?: { new(): SpeechGrammarList }; // If needed elsewhere
        webkitSpeechGrammarList?: { new(): SpeechGrammarList }; // If needed elsewhere
    }
}

export class SpeechService {
  private speechRecognition: SpeechRecognition | null;
  private speechSynthesis: SpeechSynthesis;

  constructor() {
    // Fix for: Property 'SpeechRecognition' does not exist on type 'Window & typeof globalThis'.
    // Access via augmented Window interface, (window as any) no longer needed for webkitSpeechRecognition.
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    this.speechRecognition = SpeechRecognition ? new SpeechRecognition() : null;
    this.speechSynthesis = window.speechSynthesis;

    if (this.speechRecognition) {
      this.speechRecognition.continuous = false;
      this.speechRecognition.interimResults = false;
    }
  }

  recognizeSpeech(lang: string): Promise<string> {
    return new Promise((resolve, reject) => {
      if (!this.speechRecognition) {
        reject(new Error('Speech recognition not supported by this browser.'));
        return;
      }

      this.speechRecognition.lang = lang;
      // Fix for: Cannot find name 'SpeechRecognitionEvent'. Uses declared interface now.
      this.speechRecognition.onresult = (event: SpeechRecognitionEvent) => {
        const transcript = event.results[0][0].transcript;
        resolve(transcript);
      };

      // Fix for: Cannot find name 'SpeechRecognitionErrorEvent'. Uses declared interface now.
      this.speechRecognition.onerror = (event: SpeechRecognitionErrorEvent) => {
        reject(new Error(`Speech recognition error: ${event.error}`));
      };
      
      this.speechRecognition.onnomatch = () => {
        reject(new Error('Speech not recognized.'));
      };

      try {
        this.speechRecognition.start();
      } catch (e: any) { // Catch as any or unknown for broader error object compatibility
        reject(new Error(`Could not start speech recognition: ${e.message || e}`));
      }
    });
  }

  speakText(text: string, lang: string): void {
    if (!this.speechSynthesis || !text) {
      console.warn('Speech synthesis not available or no text to speak.');
      return;
    }

    try {
      // Cancel any ongoing speech
      this.speechSynthesis.cancel();

      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = lang;
      utterance.rate = 0.9; // Slightly slower for better comprehension
      utterance.pitch = 1.0;
      utterance.volume = 1.0;

      // Attempt to find a suitable voice
      const voices = this.speechSynthesis.getVoices();
      let japaneseVoice = voices.find(voice => voice.lang === lang);

      // If specific lang voice not found, try with lang prefix (e.g., 'ja' for 'ja-JP')
      if (!japaneseVoice && lang.includes('-')) {
          japaneseVoice = voices.find(voice => voice.lang.startsWith(lang.split('-')[0]));
      }

      if (japaneseVoice) {
        utterance.voice = japaneseVoice;
        console.log('Using voice:', japaneseVoice.name);
      } else {
        console.warn(`No voice found for language: ${lang}. Using default.`);
      }

      utterance.onstart = () => {
        console.log('Speech started');
      };

      utterance.onend = () => {
        console.log('Speech ended');
      };

      utterance.onerror = (event) => {
        console.error('Speech synthesis error:', event.error, event);
      };

      // Small delay to ensure previous speech is cancelled
      setTimeout(() => {
        this.speechSynthesis.speak(utterance);
        console.log('Speaking:', text.substring(0, 50) + '...');
      }, 100);
    } catch (error) {
      console.error('Error in speakText:', error);
    }
  }

  // Call this function early, e.g., on a user interaction, to populate voices list
  loadVoices() {
    // The voices list is often populated asynchronously.
    // Listening to 'voiceschanged' is more reliable.
    const populateVoices = () => {
        this.speechSynthesis.getVoices();
    };
    populateVoices(); // Initial attempt
    if (this.speechSynthesis.onvoiceschanged !== undefined) {
        this.speechSynthesis.onvoiceschanged = populateVoices;
    }
  }
}