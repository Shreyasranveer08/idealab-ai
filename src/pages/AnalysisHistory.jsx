import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { fetchTopStartups } from "../lib/api";
import { Calendar, TrendingUp } from "lucide-react";
import { Link } from "react-router-dom";

export default function AnalysisHistory() {
  const [timeframe, setTimeframe] = useState('7');
  const [topStartups, setTopStartups] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      const data = await fetchTopStartups(timeframe);
      setTopStartups(data || []);
      setLoading(false);
    }
    loadData();
  }, [timeframe]);

  // Aggregate mock chart data based on loaded top startups to simulate average score over time
  // In a full production app, this would query historical DailyBrief tables
  const chartData = [
    { date: 'Day 1', avgScore: 65, avgDemand: 6 },
    { date: 'Day 2', avgScore: 68, avgDemand: 7 },
    { date: 'Day 3', avgScore: 71, avgDemand: 7 },
    { date: 'Day 4', avgScore: 70, avgDemand: 6 },
    { date: 'Day 5', avgScore: 75, avgDemand: 8 },
    { date: 'Day 6', avgScore: 78, avgDemand: 8 },
    { date: 'Today', avgScore: 82, avgDemand: 9 },
  ];

  return (
    <div className="space-y-8 pb-12">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold mb-2">Analysis History</h1>
          <p className="text-text/60">Macro intelligence and top historical opportunities.</p>
        </div>
        <div className="flex gap-2 bg-card/50 p-1 rounded-xl border border-white/5">
          {['7', '30', 'all'].map(t => (
            <button
              key={t}
              onClick={() => setTimeframe(t)}
              className={`px-4 py-2 rounded-lg text-sm transition-all ${timeframe === t ? 'bg-primary text-white font-medium' : 'hover:bg-white/5 text-text/60'}`}
            >
              {t === 'all' ? 'All Time' : `${t} Days`}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="lg:col-span-2 glass-card p-6 min-h-[400px] flex flex-col"
        >
          <div className="flex items-center gap-3 mb-6">
            <TrendingUp className="w-5 h-5 text-primary" />
            <h2 className="text-xl font-bold">Opportunity Score Trends</h2>
          </div>
          
          <div className="flex-1 w-full h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#F8FAFC10" />
                <XAxis dataKey="date" stroke="#F8FAFC50" />
                <YAxis stroke="#F8FAFC50" domain={['dataMin - 10', 'dataMax + 10']} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#121A2F', borderColor: '#ffffff10', borderRadius: '8px' }}
                  itemStyle={{ color: '#F8FAFC' }}
                />
                <Line type="monotone" dataKey="avgScore" name="Avg Opp Score" stroke="#6366F1" strokeWidth={3} dot={{ fill: '#6366F1', strokeWidth: 2 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="space-y-6"
        >
          <div className="glass p-6 rounded-2xl h-full overflow-y-auto">
            <div className="flex items-center gap-2 mb-6">
              <Calendar className="w-5 h-5 text-secondary" />
              <h2 className="text-xl font-bold">Top by Period</h2>
            </div>
            
            {loading ? (
              <div className="text-text/50">Loading top opportunities...</div>
            ) : (
              <div className="space-y-4">
                {topStartups.slice(0, 5).map((startup, i) => (
                  <Link to={`/startup/${startup.id}`} key={startup.id} className="block p-3 bg-card/40 rounded-xl border border-white/5 group hover:border-primary/30 transition-colors">
                    <div className="flex justify-between items-start mb-1">
                      <h4 className="font-bold text-sm group-hover:text-primary transition-colors">{startup.name}</h4>
                      <span className="text-success font-black text-sm">{startup.analysis?.overallScore}</span>
                    </div>
                    <div className="text-xs text-text/50">{startup.analysis?.niche || startup.category}</div>
                  </Link>
                ))}
                {topStartups.length === 0 && <div className="text-text/50 text-sm">No data for this period.</div>}
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
