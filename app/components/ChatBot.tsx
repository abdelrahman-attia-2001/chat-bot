"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FiSend } from "react-icons/fi";
import { IoMdMic } from "react-icons/io";
import { FaUser } from "react-icons/fa";
import { LuBot } from "react-icons/lu";
import { AiOutlineClose } from "react-icons/ai";

// ⚡️ TypeScript fix for SpeechRecognition


export default function ChatBot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<{ role: string; content: string }[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [listening, setListening] = useState(false);

  // SpeechRecognition
  const SpeechRecognition =
    typeof window !== "undefined"
      ? window.SpeechRecognition || window.webkitSpeechRecognition
      : null;

  // 🔑 Keywords for quick replies
  const quickReplies = [
    "What is this site?",
    "Who made this site?",
    "What can you do?",
    "Explain AI",
    "Tell me about yourself",
    "الموقع دا عن ايه؟",
    "مين عامل الموقع؟",
    "ايه اللي بتعمله؟",
  ];

  const sendMessage = async (message: string) => {
    if (!message.trim()) return;
    setMessages((prev) => [...prev, { role: "user", content: message }]);
    setInput("");
    setLoading(true);

    const lowerMsg = message.toLowerCase();

    // Respond locally to keywords
    const aboutPatterns = [
      "الموقع",
      "عن الموقع",
      "الويب سايت",
      "الموقع دا عن ايه",
      "بتاع ايه",
      "صاحب الموقع",
      "مين عامل الموقع",
      "مين انت",
      "who made this site",
      "what is this site",
      "about this site",
      "who are you",
      "what can you do",
      "what is ai",
      "explain ai",
      "tell me about yourself",
    ];

    if (aboutPatterns.some((p) => lowerMsg.includes(p))) {
      const reply =
        /[أ-ي]/.test(message)
          ? "أنا مساعد ذكاء اصطناعي 🤖 تم تصميمي للإجابة على الأسئلة والتفاعل معك بطريقة ذكية وسلسة! الموقع دا خاص بتجربة الذكاء الاصطناعي التفاعلي ✨"
          : "I'm an AI assistant 🤖 designed to answer questions and interact with you intelligently! This website is a smart AI experience ✨";
      setMessages((prev) => [...prev, { role: "assistant", content: reply }]);
      setLoading(false);
      return;
    }

    // Fallback: call your API
    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message }),
      });
      const data = await res.json();
      const reply = data.reply || "There was an error connecting to the AI.";
      setMessages((prev) => [...prev, { role: "assistant", content: reply }]);
    } catch {
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: "⚠️ Network error occurred." },
      ]);
    } finally {
      setLoading(false);
    }
  };

  // 🎙️ Voice recognition
  const startListening = () => {
    if (!SpeechRecognition) {
      alert("Your browser doesn't support voice recognition.");
      return;
    }

    const recog = new SpeechRecognition();
    recog.lang = "ar-EG,en-US"; // Arabic + English
    recog.interimResults = false;

    recog.onstart = () => setListening(true);
    recog.onend = () => setListening(false);
    recog.onresult = (e: SpeechRecognitionEvent) => {
      const transcript = e.results[0][0].transcript;
      setInput(transcript);
      sendMessage(transcript);
    };

    recog.start();
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sendMessage(input);
  };

  // Typing animation
  const [displayedText, setDisplayedText] = useState("");
  useEffect(() => {
    const last = messages[messages.length - 1];
    if (last?.role === "assistant") {
      let i = 0;
      const interval = setInterval(() => {
        setDisplayedText(last.content.slice(0, i));
        i++;
        if (i > last.content.length) clearInterval(interval);
      }, 20);
      return () => clearInterval(interval);
    }
  }, [messages]);

  return (
    <div className="mt-60">
      {/* Open button */}
      {!isOpen && (
        <motion.button
          onClick={() => setIsOpen(true)}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="fixed bottom-1/2 right-1/2 translate-x-1/2 translate-y-1/2 bg-gradient-to-r from-blue-600 to-cyan-500 text-white px-8 py-4 rounded-full shadow-xl font-semibold text-lg z-50"
        >
          Chat with AI 🤖
        </motion.button>
      )}

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="fixed bottom-6 right-6 w-[380px] h-[520px] bg-[#0b0f19] text-white rounded-2xl shadow-2xl flex flex-col border border-gray-700 overflow-hidden z-50"
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-blue-600 to-cyan-500 p-3 text-center font-semibold text-xl flex items-center justify-center gap-2">
              <LuBot size={22} />
              AI Assistant
            </div>

            {/* Quick replies */}
            <div className="flex flex-wrap gap-2 p-2 border-b border-gray-700">
              {quickReplies.map((q, idx) => (
                <button
                  key={idx}
                  onClick={() => sendMessage(q)}
                  className="bg-gray-700 hover:bg-gray-600 text-white px-3 py-1 rounded-full text-sm"
                >
                  {q}
                </button>
              ))}
            </div>

            {/* Chat messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {messages.length === 0 ? (
                <div className="text-center text-gray-400 space-y-2">
                  <p className="text-lg font-medium">💬 Welcome!</p>
                  <p className="text-sm">Speak or type in Arabic or English.</p>
                </div>
              ) : (
                messages.map((msg, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`flex ${
                      msg.role === "user" ? "justify-end" : "justify-start"
                    }`}
                  >
                    {msg.role === "assistant" && (
                      <LuBot className="text-cyan-400 mt-1 mr-2" size={22} />
                    )}
                    <div
                      className={`px-3 py-2 rounded-lg max-w-[75%] text-sm leading-relaxed ${
                        msg.role === "user"
                          ? "bg-gradient-to-r from-blue-600 to-cyan-500 text-white"
                          : "bg-zinc-800 text-zinc-200 border border-zinc-700"
                      }`}
                    >
                      {msg.role === "assistant" && i === messages.length - 1
                        ? displayedText
                        : msg.content}
                    </div>
                    {msg.role === "user" && (
                      <FaUser className="text-gray-400 ml-2 mt-1" size={22} />
                    )}
                  </motion.div>
                ))
              )}

              {loading && (
                <div className="text-center text-gray-400 animate-pulse">
                  Thinking...
                </div>
              )}
            </div>

            {/* Input area */}
            <form
              onSubmit={handleSubmit}
              className="flex items-center border-t border-gray-700 bg-zinc-900 relative"
            >
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Type your message..."
                className="flex-1 bg-transparent outline-none p-3 text-white"
                disabled={loading}
              />

              {/* Mic with animated sound waves */}
              <button type="button" onClick={startListening} className="p-3 relative">
                <IoMdMic
                  size={22}
                  className={`transition ${listening ? "text-red-500" : "text-cyan-400"}`}
                />
                {listening && (
                  <div className="absolute inset-0 flex items-center justify-center gap-[2px]">
                    {[...Array(4)].map((_, i) => (
                      <motion.span
                        key={i}
                        className="w-[3px] h-[10px] bg-red-500 rounded-sm"
                        animate={{
                          height: ["8px", "18px", "8px"],
                          opacity: [0.7, 1, 0.7],
                        }}
                        transition={{
                          duration: 0.5,
                          repeat: Infinity,
                          delay: i * 0.15,
                        }}
                      />
                    ))}
                  </div>
                )}
              </button>

              <button
                type="submit"
                disabled={!input.trim()}
                className="p-3 text-white bg-cyan-600 hover:bg-cyan-700 transition"
              >
                <FiSend size={18} />
              </button>
            </form>

            {/* Close button */}
            <button
              onClick={() => setIsOpen(false)}
              className="absolute top-3 right-3 text-gray-400 hover:text-white transition"
            >
              <AiOutlineClose size={22} />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
