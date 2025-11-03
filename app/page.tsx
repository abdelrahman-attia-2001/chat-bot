"use client";

import ChatBot from "./components/ChatBot";
import { motion } from "framer-motion";

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-gray-950 via-gray-900 to-black text-center px-6">
      <motion.h1
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="text-4xl md:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-500 mb-4"
      >
        Welcome to the Future of AI Interaction 🤖
      </motion.h1>

      <motion.p
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 0.6 }}
        className="text-gray-300 max-w-xl text-lg leading-relaxed"
      >
        This website features an intelligent AI assistant designed to chat,
        answer your questions, and make your experience smarter and faster.
        Just click the button below to start chatting!
      </motion.p>

      <ChatBot  />
    </div>
  );
}
