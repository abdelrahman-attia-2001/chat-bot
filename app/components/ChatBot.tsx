"use client";

import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FiSend } from "react-icons/fi";
import { IoMdMic } from "react-icons/io";
import { FaUser } from "react-icons/fa";
import { LuBot } from "react-icons/lu";
import { AiOutlineClose } from "react-icons/ai";

type ChatMessage = {
  role: "user" | "assistant";
  content: string;
};

type QuickReply = {
  prompt: string;
  reply: string;
  keywords?: string[];
};

const QUICK_REPLIES: QuickReply[] = [
  {
    prompt: "ما هي منصة تدوير؟",
    reply:
      "منصة تدوير هي مساحة رقمية تساعد الأفراد والشركات على عرض وبيع المواد القابلة لإعادة التدوير أو البحث عنها بسهولة داخل السوق الرقمي.",
    keywords: [
      "منصة تدوير",
      "tadweer",
      "ما هو tadweer",
      "عن الموقع",
      "منصة",
      "ما هي تدوير",
      "what is tadweer",
    ],
  },
  {
    prompt: "كيف أضيف منتج جديد؟",
    reply:
      "لإضافة منتج جديد، توجه إلى صفحة إضافة منتج، ثم املأ تفاصيل المادة مع الصور والسعر والموقع، واضغط زر الإرسال ليظهر المنتج ضمن السوق.",
    keywords: ["أضيف", "أضف منتج", "إضافة منتج", "add product", "new product"],
  },
  {
    prompt: "هل خدمة الاستلام متاحة؟",
    reply:
      "حاليًا يمكنك التنسيق مع المشتري أو البائع مباشرةً لتسليم المنتجات. نعمل على إضافة خدمة الاستلام قريبًا.",
    keywords: [
      "استلام",
      "pickup",
      "خدمة الاستلام",
      "هل يوجد استلام",
      "delivery",
    ],
  },
  {
    prompt: "أحتاج مساعدة في تسجيل الدخول",
    reply:
      "إذا واجهت مشكلة في تسجيل الدخول، جرّب إعادة تعيين كلمة المرور أو التواصل مع الدعم عبر زر تواصل معنا. نحن هنا لمساعدتك دائمًا.",
    keywords: [
      "تسجيل الدخول",
      "login",
      "signin",
      "مشكلة تسجيل",
      "لا أستطيع الدخول",
      "log in",
      "sign in",
    ],
  },
  {
    prompt: "كيف يمكنك مساعدتي؟",
    reply:
      "يمكنني مساعدتك في الإجابة على أسئلتك حول منصة تدوير، مثل كيفية إضافة منتج، أو الاستفسار عن خدماتنا، أو حل مشاكل تسجيل الدخول. فقط اطرح سؤالك!",
    keywords: ["مساعدة", "أساعدك", "تساعدني", "help"],
  },
];

const normalizeText = (text: string) =>
  text.trim().toLowerCase().replace(/\s+/g, " ");

const findQuickReply = (message: string): string | undefined => {
  const normalized = normalizeText(message);

  const exactMatch = QUICK_REPLIES.find(
    (item) => normalizeText(item.prompt) === normalized
  );
  if (exactMatch) return exactMatch.reply;

  return QUICK_REPLIES.find((item) =>
    item.keywords?.some((keyword) =>
      normalized.includes(keyword.toLowerCase())
    )
  )?.reply;
};

export default function ChatBot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [listening, setListening] = useState(false);
  const [displayedText, setDisplayedText] = useState("");

  const quickReplies = useMemo(() => QUICK_REPLIES, []);

  const sendMessage = async (message: string) => {
    if (!message.trim() || loading) return;

    const trimmedMessage = message.trim();

    // أضف رسالة المستخدم
    setMessages((prev) => [...prev, { role: "user", content: trimmedMessage }]);
    setInput("");
    setLoading(true);

    try {
      // 1) جرّب الأول الردود الجاهزة
      const quickReply = findQuickReply(trimmedMessage);
      if (quickReply) {
        setMessages((prev) => [
          ...prev,
          { role: "assistant", content: quickReply },
        ]);
        setLoading(false);
        return;
      }

      // 2) ننده على API بتاعنا في Next.js
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ message: trimmedMessage }),
      });

      if (!res.ok) {
        throw new Error("فشل الاتصال بواجهة البرمجة.");
      }

      const data = await res.json();
      const reply: string =
        data.reply ??
        "واجهت مشكلة بسيطة في فهم سؤالك، حاول إعادة صياغته من فضلك 😊";

      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: reply },
      ]);
    } catch (error) {
      console.error(error);
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content:
            "حدث خطأ أثناء الاتصال بالمساعد الذكي. حاول مرة أخرى لاحقًا 🙏",
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleQuickReply = (prompt: string) => {
    void sendMessage(prompt);
  };

  const startListening = () => {
    if (typeof window === "undefined" || loading) return;

    const SpeechRecognition =
      (window as any).SpeechRecognition ||
      (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      alert("عذرًا، متصفحك لا يدعم ميزة تحويل الصوت إلى نص.");
      return;
    }

    const recog = new SpeechRecognition();
    recog.lang = "ar-EG";
    recog.interimResults = false;

    recog.onstart = () => setListening(true);
    recog.onend = () => setListening(false);
    recog.onresult = (e: SpeechRecognitionEvent) => {
      const transcript = e.results[0][0].transcript;
      setInput(transcript);
      void sendMessage(transcript);
    };

    recog.start();
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    void sendMessage(input);
  };

  useEffect(() => {
    const last = messages[messages.length - 1];
    if (!last || last.role !== "assistant") {
      setDisplayedText("");
      return;
    }

    let index = 0;
    setDisplayedText("");
    const interval = setInterval(() => {
      index += 1;
      setDisplayedText(last.content.slice(0, index));
      if (index >= last.content.length) {
        clearInterval(interval);
      }
    }, 20);

    return () => clearInterval(interval);
  }, [messages]);

  return (
    <div className="mt-60">
      {!isOpen && (
        <motion.button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 bg-gradient-to-r from-blue-600 to-cyan-500 text-white px-6 py-3 rounded-full shadow-xl font-semibold text-base z-50 flex items-center gap-2"
          whileTap={{ scale: 0.95 }}
          whileHover={{ scale: 1.05 }}
        >
          تحدث مع المساعد 🤖
        </motion.button>
      )}

      <AnimatePresence>
        {isOpen && (
          <motion.div
            dir="rtl"
            initial={{ opacity: 0, scale: 0.92 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.92 }}
            transition={{ duration: 0.2 }}
            className="fixed bottom-6 right-6 w-[360px] h-[520px] bg-[#0b0f19] text-white rounded-2xl shadow-2xl flex flex-col border border-gray-700 overflow-hidden z-50"
          >
            <button
              onClick={() => setIsOpen(false)}
              className="absolute top-3 left-3 text-gray-300 hover:text-white transition"
              aria-label="إغلاق الدردشة"
            >
              <AiOutlineClose size={22} />
            </button>

            <div className="bg-gradient-to-r from-blue-600 to-cyan-500 p-3 text-center font-semibold text-lg flex items-center justify-center gap-2">
              <LuBot size={22} />
              مساعد تدوير الذكي
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.length === 0 && (
                <div className="text-center text-gray-300 space-y-3">
                  <p className="text-lg font-semibold">
                    أهلاً بك في مساعد تدوير الذكي! 👋
                  </p>
                  <p className="text-sm">
                    يمكنك طرح سؤالك مباشرة أو اختيار أحد الأسئلة الشائعة أدناه.
                  </p>
                  <div className="flex flex-wrap gap-2 justify-center">
                    {quickReplies.map((item) => (
                      <button
                        key={item.prompt}
                        onClick={() => handleQuickReply(item.prompt)}
                        className="px-3 py-2 text-sm bg-zinc-800 text-zinc-100 rounded-full border border-cyan-500 hover:bg-cyan-600 hover:text-white transition"
                      >
                        {item.prompt}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {messages.map((msg, index) => {
                const isUser = msg.role === "user";
                const isLastAssistant =
                  msg.role === "assistant" && index === messages.length - 1;

                return (
                  <div
                    key={`${msg.role}-${index}`}
                    className={`flex ${
                      isUser ? "justify-start" : "justify-end"
                    }`}
                  >
                    {isUser && (
                      <FaUser
                        className="text-gray-400 ml-2 mt-1 flex-shrink-0"
                        size={20}
                      />
                    )}
                    <div
                      className={`px-3 py-2 rounded-lg max-w-[75%] text-sm leading-relaxed ${
                        isUser
                          ? "bg-gradient-to-r from-blue-600 to-cyan-500 text-white"
                          : "bg-zinc-800 text-zinc-200 border border-zinc-700"
                      }`}
                    >
                      {isLastAssistant
                        ? displayedText || msg.content
                        : msg.content}
                    </div>
                    {!isUser && (
                      <LuBot
                        className="text-cyan-400 mr-2 mt-1 flex-shrink-0"
                        size={20}
                      />
                    )}
                  </div>
                );
              })}

              {loading && (
                <div className="text-center text-gray-400 animate-pulse text-sm">
                  لحظات أفكر في رد مناسب...
                </div>
              )}
            </div>

            <form
              onSubmit={handleSubmit}
              className="flex items-center border-t border-gray-700 bg-zinc-900"
            >
              <button
                type="button"
                onClick={startListening}
                className="p-3 relative"
                aria-label="تسجيل صوتي"
              >
                <IoMdMic
                  size={22}
                  className={listening ? "text-red-500" : "text-cyan-400"}
                />
                {listening && (
                  <div className="absolute inset-0 flex items-center justify-center gap-[2px]">
                    {[...Array(4)].map((_, i) => (
                      <motion.span
                        key={`mic-${i}`}
                        className="w-[3px] h-[10px] bg-red-500 rounded-sm"
                        animate={{
                          height: ["8px", "18px", "8px"],
                          opacity: [0.7, 1, 0.7],
                        }}
                        transition={{
                          duration: 0.6,
                          repeat: Infinity,
                          delay: i * 0.15,
                        }}
                      />
                    ))}
                  </div>
                )}
              </button>

              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="اكتب رسالتك هنا..."
                className="flex-1 bg-transparent outline-none p-3 text-white text-right placeholder:text-gray-500"
                disabled={loading}
              />

              <button
                type="submit"
                disabled={!input.trim()}
                className="p-3 text-white bg-cyan-600 hover:bg-cyan-700 transition disabled:opacity-40 disabled:cursor-not-allowed"
                aria-label="إرسال الرسالة"
              >
                <FiSend size={18} />
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
