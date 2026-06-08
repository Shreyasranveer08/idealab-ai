import { motion } from "framer-motion";

export default function SkeletonCard({ count = 1 }) {
  return (
    <>
      {Array.from({ length: count }).map((_, i) => (
        <motion.div 
          key={i}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="bg-card/40 border border-white/5 p-4 rounded-xl overflow-hidden relative"
        >
          <div className="absolute inset-0 -translate-x-full animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent via-white/5 to-transparent" />
          <div className="flex justify-between items-start mb-4">
            <div className="w-1/3 h-5 bg-white/10 rounded-md"></div>
            <div className="w-16 h-5 bg-white/10 rounded-md"></div>
          </div>
          <div className="space-y-2 mb-4">
            <div className="w-full h-4 bg-white/5 rounded-md"></div>
            <div className="w-5/6 h-4 bg-white/5 rounded-md"></div>
          </div>
          <div className="flex justify-between items-center">
            <div className="w-16 h-4 bg-white/10 rounded-md"></div>
            <div className="w-20 h-4 bg-white/10 rounded-md"></div>
          </div>
        </motion.div>
      ))}
    </>
  );
}
