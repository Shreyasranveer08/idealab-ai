import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { fetchBriefs } from "../lib/api";
import { Newspaper, ChevronRight, Hash, TrendingUp, AlertCircle } from "lucide-react";

export default function DailyBriefs() {
  const [briefs, setBriefs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      const data = await fetchBriefs();
      setBriefs(data || []);
      setLoading(false);
    }
    loadData();
  }, []);

  return (
    <div className="space-y-8 pb-12 max-w-4xl mx-auto">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-black mb-4 flex items-center justify-center gap-3"><Newspaper className="text-primary w-10 h-10" /> Intelligence Feed</h1>
        <p className="text-text/70 text-lg">Your automated daily digest of macro trends, saturated markets, and blue ocean opportunities.</p>
      </div>

      {loading ? (
        <div className="text-center text-text/50">Fetching briefs...</div>
      ) : briefs.length === 0 ? (
        <div className="glass-card p-12 text-center text-text/50 border border-white/5 border-dashed">
          No briefs generated yet. The AI Engine is still collecting data.
        </div>
      ) : (
        <div className="space-y-12">
          {briefs.map((brief, idx) => (
            <motion.article 
              key={brief.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              className="glass-card p-8 md:p-10 relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 blur-[80px] rounded-full pointer-events-none" />
              
              <header className="mb-8 border-b border-white/10 pb-6">
                <time className="text-sm font-bold text-primary uppercase tracking-widest">{new Date(brief.date).toLocaleDateString('en-GB')}</time>
                <h2 className="text-3xl font-black mt-2 leading-tight">{brief.title || "Daily Market Digest"}</h2>
              </header>

              <div className="prose prose-invert max-w-none">
                <div className="text-lg text-text/80 leading-relaxed mb-8 font-medium">
                  {brief.summary}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                  <div className="bg-success/5 border border-success/20 p-6 rounded-2xl">
                    <h3 className="text-success font-bold flex items-center gap-2 mb-3"><TrendingUp className="w-5 h-5" /> Emerging Opportunities</h3>
                    <p className="text-sm text-text/80 leading-relaxed">{brief.emergingTrends || "AI is still aggregating emerging trends data. Check back tomorrow."}</p>
                  </div>
                  <div className="bg-warning/5 border border-warning/20 p-6 rounded-2xl">
                    <h3 className="text-warning font-bold flex items-center gap-2 mb-3"><AlertCircle className="w-5 h-5" /> Saturated Markets</h3>
                    <p className="text-sm text-text/80 leading-relaxed">{brief.saturatedMarkets || "AI is currently scanning for saturated markets to avoid."}</p>
                  </div>
                </div>

                <div className="bg-card/50 border border-white/5 p-6 rounded-2xl">
                  <h3 className="font-bold flex items-center gap-2 mb-4"><Hash className="w-5 h-5 text-primary" /> Top Recommended Ideas</h3>
                  <p className="text-sm text-text/80 leading-relaxed whitespace-pre-wrap">{brief.recommendedIdeas || "We need more data to generate highly confident startup ideas. Keep the ingestion pipeline running."}</p>
                </div>
              </div>
            </motion.article>
          ))}
        </div>
      )}
    </div>
  );
}
