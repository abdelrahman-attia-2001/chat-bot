export {};

declare global {
  interface Window {
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
  }

  interface SpeechRecognitionEvent extends Event {
    results: {
      [index: number]: {
        0: {
          transcript: string;
        };
      };
      length: number;
    };
  }
}
