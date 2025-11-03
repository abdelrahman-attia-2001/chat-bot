// توسيع واجهة Window لإضافة خصائص التعرف على الكلام
interface Window {
  SpeechRecognition: typeof SpeechRecognition;
  webkitSpeechRecognition: typeof SpeechRecognition;
}

// تعريف دالة البناء (Constructor) للتعرف على الكلام
declare var SpeechRecognition: {
  prototype: SpeechRecognition;
  new (): SpeechRecognition;
};
