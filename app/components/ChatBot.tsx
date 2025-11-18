"use client";

import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FiSend } from "react-icons/fi";
import { IoMdMic } from "react-icons/io";
import { FaUser } from "react-icons/fa";
import { LuBot } from "react-icons/lu";
import { AiOutlineClose } from "react-icons/ai";
import { BiMessageRoundedDots } from "react-icons/bi";

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

    setMessages((prev) => [...prev, { role: "user", content: trimmedMessage }]);
    setInput("");
    setLoading(true);

    try {
      const quickReply = findQuickReply(trimmedMessage);
      if (quickReply) {
        setMessages((prev) => [
          ...prev,
          { role: "assistant", content: quickReply },
        ]);
        setLoading(false);
        return;
      }

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
        "واجهت مشكلة بسيطة في فهم سؤالك، حاول إعادة صياغته من فضلك";

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
            "حدث خطأ أثناء الاتصال بالمساعد الذكي. حاول مرة أخرى لاحقًا",
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
          className="fixed bottom-8 right-8 bg-gradient-to-r from-emerald-600 to-teal-600 text-white px-7 py-4 rounded-2xl shadow-2xl font-bold text-base z-50 flex items-center gap-3 hover:shadow-emerald-500/30 transition-all duration-300"
          whileTap={{ scale: 0.95 }}
          whileHover={{ scale: 1.05 }}
        >
          <BiMessageRoundedDots size={24} />
          <span>تحدث مع المساعد</span>
        </motion.button>
      )}

      <AnimatePresence>
        {isOpen && (
          <motion.div
            dir="rtl"
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className="fixed bottom-8 right-8 w-[420px] h-[600px] bg-[#0a0a0a] text-white rounded-3xl shadow-2xl flex flex-col border border-zinc-800 overflow-hidden z-50"
          >
            <button
              onClick={() => setIsOpen(false)}
              className="absolute top-4 left-4 text-zinc-500 hover:text-white hover:bg-zinc-800 p-2 rounded-full transition-all duration-200 z-10"
              aria-label="إغلاق الدردشة"
            >
              <AiOutlineClose size={20} />
            </button>

            <div className="bg-gradient-to-r from-emerald-600 to-teal-600 p-5 flex items-center justify-center gap-3">
              <LuBot size={28} />
              <span className="font-bold text-xl">مساعد تدوير الذكي</span>
            </div>

            <div className="flex-1 overflow-y-auto p-5 space-y-5 bg-[#0f0f0f]">
              {messages.length === 0 && (
                <div className="text-center text-zinc-400 space-y-5 mt-8">
                  <div className="inline-flex items-center justify-center w-20 h-20 bg-zinc-900 rounded-full border-2 border-emerald-500/30 mb-2">
                    <LuBot size={40} className="text-emerald-500" />
                  </div>
                  <p className="text-xl font-bold text-white">
                    أهلاً بك في مساعد تدوير الذكي
                  </p>
                  <p className="text-sm text-zinc-500 px-4">
                    يمكنك طرح سؤالك مباشرة أو اختيار أحد الأسئلة الشائعة أدناه
                  </p>
                  <div className="flex flex-wrap gap-2 justify-center px-3">
                    {quickReplies.map((item) => (
                      <motion.button
                        key={item.prompt}
                        onClick={() => handleQuickReply(item.prompt)}
                        className="px-4 py-2.5 text-sm bg-zinc-900 text-zinc-300 rounded-xl border border-zinc-800 hover:bg-zinc-800 hover:border-emerald-500/50 hover:text-white transition-all duration-200"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        {item.prompt}
                      </motion.button>
                    ))}
                  </div>
                </div>
              )}

              {messages.map((msg, index) => {
                const isUser = msg.role === "user";
                const isLastAssistant =
                  msg.role === "assistant" && index === messages.length - 1;

                return (
                  <motion.div
                    key={`${msg.role}-${index}`}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                    className={`flex gap-3 ${
                      isUser ? "justify-start" : "justify-end"
                    }`}
                  >
                    {isUser && (
                      <div className="flex-shrink-0 w-9 h-9 rounded-full bg-gradient-to-br from-blue-600 to-blue-500 flex items-center justify-center">
                        <FaUser size={16} />
                      </div>
                    )}
                    <div
                      className={`px-5 py-3 rounded-2xl max-w-[75%] text-sm leading-relaxed ${
                        isUser
                          ? "bg-blue-600 text-white rounded-tr-sm"
                          : "bg-zinc-900 text-zinc-200 border border-zinc-800 rounded-tl-sm"
                      }`}
                    >
                      {isLastAssistant
                        ? displayedText || msg.content
                        : msg.content}
                    </div>
                    {!isUser && (
                      <div className="flex-shrink-0 w-9 h-9 rounded-full bg-gradient-to-br from-emerald-600 to-teal-600 flex items-center justify-center">
                        <LuBot size={18} />
                      </div>
                    )}
                  </motion.div>
                );
              })}

              {loading && (
                <div className="flex justify-center items-center gap-2">
                  <motion.div
                    className="w-2 h-2 bg-emerald-500 rounded-full"
                    animate={{ scale: [1, 1.5, 1], opacity: [0.5, 1, 0.5] }}
                    transition={{ duration: 1, repeat: Infinity, delay: 0 }}
                  />
                  <motion.div
                    className="w-2 h-2 bg-emerald-500 rounded-full"
                    animate={{ scale: [1, 1.5, 1], opacity: [0.5, 1, 0.5] }}
                    transition={{ duration: 1, repeat: Infinity, delay: 0.2 }}
                  />
                  <motion.div
                    className="w-2 h-2 bg-emerald-500 rounded-full"
                    animate={{ scale: [1, 1.5, 1], opacity: [0.5, 1, 0.5] }}
                    transition={{ duration: 1, repeat: Infinity, delay: 0.4 }}
                  />
                </div>
              )}
            </div>

            <form
              onSubmit={handleSubmit}
              className="flex items-center border-t border-zinc-800 bg-[#0a0a0a] p-3 gap-2"
            >
              <motion.button
                type="button"
                onClick={startListening}
                className="p-3 rounded-xl hover:bg-zinc-900 transition-all duration-200 relative"
                aria-label="تسجيل صوتي"
                whileTap={{ scale: 0.9 }}
              >
                <IoMdMic
                  size={24}
                  className={listening ? "text-red-500" : "text-emerald-500"}
                />
                {listening && (
                  <div className="absolute inset-0 flex items-center justify-center gap-[2px]">
                    {[...Array(4)].map((_, i) => (
                      <motion.span
                        key={`mic-${i}`}
                        className="w-[3px] h-[12px] bg-red-500 rounded-full"
                        animate={{
                          height: ["8px", "20px", "8px"],
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
              </motion.button>

              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="اكتب رسالتك هنا..."
                className="flex-1 bg-zinc-900 outline-none px-4 py-3 text-white text-right placeholder:text-zinc-600 rounded-xl border border-zinc-800 focus:border-emerald-500/50 transition-all duration-200"
                disabled={loading}
              />

              <motion.button
                type="submit"
                disabled={!input.trim()}
                className="p-3 text-white bg-emerald-600 hover:bg-emerald-700 transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed rounded-xl"
                aria-label="إرسال الرسالة"
                whileTap={{ scale: 0.9 }}
              >
                <FiSend size={20} />
              </motion.button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}