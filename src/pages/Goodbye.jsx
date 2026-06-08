import { motion } from "framer-motion";
import { Zap, LogIn } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function Goodbye() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-watery-animated flex flex-col items-center justify-center p-6 text-center relative overflow-hidden">
      {/* Background dark overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent to-[#050b14]/90 pointer-events-none" />
      
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="glass-card max-w-md w-full p-10 rounded-3xl relative z-10 border border-white/10 shadow-2xl flex flex-col items-center"
      >
        <div className="bg-primary/20 p-4 rounded-2xl mb-6 shadow-[inset_0_1px_1px_rgba(255,255,255,0.2)]">
          <Zap className="w-10 h-10 text-primary animate-pulse" />
        </div>
        
        <h1 className="text-3xl font-bold mb-3 text-text tracking-tight">
          See you soon! 👋
        </h1>
        <p className="text-text/70 mb-8 leading-relaxed">
          Thank you for using IdeaLab AI. We'll keep analyzing startups and finding new opportunities while you're away.
        </p>
        
        <button
          onClick={() => navigate('/auth')}
          className="w-full py-3.5 px-4 bg-primary hover:bg-primary/90 text-white font-bold rounded-xl shadow-[0_0_20px_rgba(99,102,241,0.3)] transition-all flex items-center justify-center gap-2"
        >
          <LogIn className="w-5 h-5" />
          Log back in
        </button>
      </motion.div>
    </div>
  );
}
