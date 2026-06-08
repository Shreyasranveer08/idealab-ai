import { motion } from "framer-motion";
import { Zap } from "lucide-react";
import { useEffect } from "react";

export default function IntroAnimation({ onComplete }) {
  useEffect(() => {
    // The total animation duration is roughly 2.5 seconds.
    // We trigger the onComplete callback to unmount this component shortly after the fade-out starts.
    const timer = setTimeout(() => {
      onComplete();
    }, 2800);
    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <motion.div
      className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-[#050b14] overflow-hidden"
      initial={{ opacity: 1 }}
      animate={{ opacity: 1 }}
      exit={{ 
        opacity: 0,
        filter: "blur(20px)",
        scale: 1.1,
        transition: { duration: 0.8, ease: "easeInOut" }
      }}
    >
      {/* Ambient background glow behind the logo */}
      <motion.div 
        className="absolute w-[40vw] h-[40vw] max-w-[500px] max-h-[500px] rounded-full bg-primary/20 blur-[100px]"
        initial={{ opacity: 0, scale: 0.5 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 2, ease: "easeOut" }}
      />

      <div className="relative flex flex-col items-center gap-6">
        {/* Logo Icon */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 1, ease: [0.16, 1, 0.3, 1], delay: 0.2 }}
          className="bg-primary/20 p-4 rounded-3xl border border-primary/50 shadow-[0_0_50px_rgba(99,102,241,0.3),inset_0_1px_1px_rgba(255,255,255,0.2)]"
        >
          <Zap className="w-12 h-12 text-primary" />
        </motion.div>

        {/* Text */}
        <motion.div
          initial={{ opacity: 0, y: 10, filter: "blur(10px)" }}
          animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          transition={{ duration: 1, ease: "easeOut", delay: 0.6 }}
          className="text-center"
        >
          <h1 className="text-4xl font-black text-white tracking-tight flex items-center justify-center gap-2">
            IdeaLab <span className="text-primary">AI</span>
          </h1>
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 1 }}
            className="text-text/50 mt-2 text-sm font-medium tracking-widest uppercase"
          >
            Startup Intelligence
          </motion.p>
        </motion.div>
      </div>
    </motion.div>
  );
}
