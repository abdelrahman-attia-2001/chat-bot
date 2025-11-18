"use client";

import ChatBot from "./components/ChatBot";
import { motion } from "framer-motion";
import { HiSparkles } from "react-icons/hi";
import { RiRobot2Fill } from "react-icons/ri";

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#0a0a0a] text-center px-6 relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-20 left-20 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 right-20 w-96 h-96 bg-teal-500/10 rounded-full blur-3xl"></div>
      </div>

      {/* Content */}
      <div className="relative z-10">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="inline-flex items-center justify-center w-24 h-24 bg-gradient-to-br from-emerald-600 to-teal-600 rounded-3xl mb-6 shadow-2xl shadow-emerald-500/20"
        >
          <RiRobot2Fill size={48} className="text-white" />
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="text-5xl md:text-6xl font-extrabold text-white mb-4 leading-tight"
        >
          Welcome to the Future of{" "}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-400">
            AI Interaction
          </span>
        </motion.h1>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.6 }}
          className="flex items-center justify-center gap-2 mb-6"
        >
          <HiSparkles className="text-emerald-400 text-xl" />
          <p className="text-zinc-400 text-sm font-medium">
            Powered by Advanced AI Technology
          </p>
        </motion.div>

        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.6 }}
          className="text-zinc-400 max-w-2xl mx-auto text-lg leading-relaxed mb-8"
        >
          This website features an intelligent AI assistant designed to chat,
          answer your questions, and make your experience smarter and faster.
          Just click the button below to start chatting!
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7, duration: 0.6 }}
          className="flex flex-wrap gap-4 justify-center mb-12"
        >
          <div className="flex items-center gap-2 px-4 py-2 bg-zinc-900 border border-zinc-800 rounded-full">
            <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
            <span className="text-zinc-400 text-sm">24/7 Available</span>
          </div>
          <div className="flex items-center gap-2 px-4 py-2 bg-zinc-900 border border-zinc-800 rounded-full">
            <div className="w-2 h-2 bg-teal-500 rounded-full animate-pulse"></div>
            <span className="text-zinc-400 text-sm">Instant Response</span>
          </div>
          <div className="flex items-center gap-2 px-4 py-2 bg-zinc-900 border border-zinc-800 rounded-full">
            <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
            <span className="text-zinc-400 text-sm">Smart Assistant</span>
          </div>
        </motion.div>
      </div>

      <ChatBot />
    </div>
  );
}