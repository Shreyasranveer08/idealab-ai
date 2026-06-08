import { useState } from "react";
import { motion } from "framer-motion";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { mockTrends } from "../lib/mockData";
import { TrendingUp, TrendingDown, Activity, Calendar } from "lucide-react";

const dataByTimeframe = {
  day: [
    { name: '00:00', ai_voice: 120, nfts: 40 },
    { name: '04:00', ai_voice: 150, nfts: 30 },
    { name: '08:00', ai_voice: 200, nfts: 35 },
    { name: '12:00', ai_voice: 350, nfts: 45 },
    { name: '16:00', ai_voice: 400, nfts: 20 },
    { name: '20:00', ai_voice: 380, nfts: 15 },
  ],
  month: [
    { name: 'Week 1', ai_voice: 1200, nfts: 400 },
    { name: 'Week 2', ai_voice: 1500, nfts: 380 },
    { name: 'Week 3', ai_voice: 2100, nfts: 300 },
    { name: 'Week 4', ai_voice: 2800, nfts: 250 },
  ],
  year: [
    { name: 'Jan', ai_voice: 4000, nfts: 2400 },
    { name: 'Feb', ai_voice: 3000, nfts: 1398 },
    { name: 'Mar', ai_voice: 5000, nfts: 9800 },
    { name: 'Apr', ai_voice: 7080, nfts: 3908 },
    { name: 'May', ai_voice: 9200, nfts: 4800 },
    { name: 'Jun', ai_voice: 11000, nfts: 3800 },
    { name: 'Jul', ai_voice: 14000, nfts: 2300 },
  ]
};

export default function TrendRadar() {
  const [timeframe, setTimeframe] = useState('year');

  return (
    <div className="space-y-8 pb-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold mb-2">Trend Radar</h1>
          <p className="text-text/60">Visualize macro shifts in the startup ecosystem.</p>
        </div>
        
        <div className="flex items-center gap-2 bg-card/50 p-1.5 rounded-xl border border-white/5">
          {['day', 'month', 'year'].map(t => (
            <button
              key={t}
              onClick={() => setTimeframe(t)}
              className={`px-4 py-1.5 rounded-lg text-sm font-bold capitalize transition-all ${timeframe === t ? 'bg-primary text-background' : 'text-text/60 hover:text-text'}`}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="lg:col-span-2 glass-card p-6 min-h-[400px] flex flex-col"
        >
          <div className="flex items-center gap-3 mb-6">
            <Activity className="w-5 h-5 text-primary" />
            <h2 className="text-xl font-bold">Category Momentum</h2>
          </div>
          
          <div className="flex-1 w-full h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={dataByTimeframe[timeframe]}
                margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
              >
                <defs>
                  <linearGradient id="colorVoice" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366F1" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#6366F1" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorNft" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#ef4444" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="name" stroke="#F8FAFC50" />
                <YAxis stroke="#F8FAFC50" />
                <CartesianGrid strokeDasharray="3 3" stroke="#F8FAFC10" />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#121A2F', borderColor: '#ffffff10', borderRadius: '8px' }}
                  itemStyle={{ color: '#F8FAFC' }}
                />
                <Area type="monotone" dataKey="ai_voice" name="AI Voice Agents" stroke="#6366F1" fillOpacity={1} fill="url(#colorVoice)" />
                <Area type="monotone" dataKey="nfts" name="NFT Tools" stroke="#ef4444" fillOpacity={1} fill="url(#colorNft)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="space-y-6"
        >
          <div className="glass p-6 rounded-2xl h-full">
            <h2 className="text-xl font-bold mb-6">Market Shifts</h2>
            <div className="space-y-4">
              {mockTrends.map((trend, i) => (
                <div key={i} className="flex items-center justify-between p-3 bg-card/50 rounded-xl border border-white/5">
                  <div className="font-medium">{trend.category}</div>
                  <div className={`flex items-center gap-1 text-sm font-bold ${trend.status === 'rising' ? 'text-success' : 'text-danger text-red-500'}`}>
                    {trend.status === 'rising' ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                    {trend.growth > 0 ? '+' : ''}{trend.growth}%
                  </div>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
