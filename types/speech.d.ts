// types/global.d.ts

// توسيع واجهة Window لإضافة خصائص التعرف على الكلام
interface Window {
  // الواجهة القياسية (إذا كانت مدعومة)
  SpeechRecognition: typeof SpeechRecognition;
  // الواجهة المخصصة للمتصفحات التي تستخدم بادئة (مثل Chrome/Safari)
  webkitSpeechRecognition: typeof SpeechRecognition;
}

// تعريف دالة البناء (Constructor) للتعرف على الكلام
declare var SpeechRecognition: {
  prototype: SpeechRecognition;
  new (): SpeechRecognition;
};