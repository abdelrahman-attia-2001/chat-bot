// types/speech.d.ts
declare global {
  interface SpeechRecognitionEvent extends Event {
    readonly results: SpeechRecognitionResultList;
  }

  interface Window {
    SpeechRecognition?: any; // type-safe ممكن تحط typeof window.SpeechRecognition بعد ما تتحقق
    webkitSpeechRecognition?: any;
  }
}

export {};
