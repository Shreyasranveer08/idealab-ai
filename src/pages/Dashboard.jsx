import { motion } from "framer-motion";
import { Rocket, ArrowUpRight, TrendingUp, Calendar, Zap, Star, Target, AlertCircle, RefreshCw } from "lucide-react";
import { useState, useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import { fetchDailyBrief, fetchStartups, triggerIngestion } from "../lib/api";
import { useWorkspace } from "../contexts/WorkspaceContext";
import { AreaChart, Area, XAxis, Tooltip, ResponsiveContainer } from "recharts";
import toast from "react-hot-toast";
import SkeletonCard from "../components/SkeletonCard";
import StartupLogo from "../components/StartupLogo";

export default function Dashboard() {
  const [briefData, setBriefData] = useState(null);
  const [startups, setStartups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [ingesting, setIngesting] = useState(false);
  const { isStartupSaved, toggleSaveStartup } = useWorkspace();

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      const [briefRes, startupRes] = await Promise.all([
        fetchDailyBrief(),
        fetchStartups()
      ]);
      setBriefData(briefRes);
      setStartups(startupRes || []);
      setLoading(false);
    }
    loadData();
  }, []);

  const handleIngest = async () => {
    setIngesting(true);
    const toastId = toast.loading("Scanning Internet for new startups...");
    try {
      await triggerIngestion();
      // Reload data
      const [briefRes, startupRes] = await Promise.all([
        fetchDailyBrief(),
        fetchStartups()
      ]);
      setBriefData(briefRes);
      setStartups(startupRes || []);
      toast.success("Ingestion complete! Data updated.", { id: toastId });
    } catch (error) {
      toast.error("Failed to ingest data.", { id: toastId });
    } finally {
      setIngesting(false);
    }
  };

  const chartData = useMemo(() => {
    if (!startups.length) return [];
    const counts = {};
    startups.forEach(s => {
      if (!s.launchedAt) return;
      const d = new Date(s.launchedAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' });
      counts[d] = (counts[d] || 0) + 1;
    });
    // Return last 7 days of data
    return Object.entries(counts)
      .map(([date, count]) => ({ date, count }))
      .reverse(); // Assuming original data is newest first
  }, [startups]);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 18) return 'Good Afternoon';
    return 'Good Evening';
  };

  const topStartups = startups.filter(s => s.analysis).sort((a, b) => b.analysis.overallScore - a.analysis.overallScore).slice(0, 3);
  const topOpp = briefData?.topOpportunity;

  return (
    <div className="space-y-8 pb-12">
      <div className="flex justify-end">
        <button 
          onClick={handleIngest}
          disabled={ingesting}
          className="flex items-center gap-2 px-4 py-2 bg-primary/20 text-primary border border-primary/50 rounded-lg hover:bg-primary/30 transition-colors disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 ${ingesting ? 'animate-spin' : ''}`} />
          {ingesting ? 'Scanning Internet...' : 'Trigger Ingestion'}
        </button>
      </div>

      {/* Hero: Founder Daily Brief */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-card p-8 relative overflow-hidden"
      >
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/20 blur-[80px] rounded-full pointer-events-none" />
        
        <h1 className="text-3xl font-bold mb-2">{getGreeting()} 👋</h1>
        <p className="text-text/70 mb-6 max-w-2xl">
          {briefData?.brief?.summary || "Here's your Founder Daily Brief. We've scanned thousands of data points to find the best opportunities for you today."}
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-card/40 border border-white/5 p-5 rounded-3xl">
            <div className="flex items-center gap-3 mb-2 text-primary">
              <Rocket className="w-5 h-5" />
              <h3 className="font-semibold">Launched Today</h3>
            </div>
            <div className="text-3xl font-bold">{briefData?.newStartupsCount || 0}<span className="text-sm font-normal text-text/50 ml-2">startups</span></div>
          </div>
          
          <div className="bg-card/40 border border-white/5 p-5 rounded-3xl">
            <div className="flex items-center gap-3 mb-2 text-success">
              <TrendingIcon className="w-5 h-5" />
              <h3 className="font-semibold">Fastest Growing</h3>
            </div>
            <div className="text-xl font-bold">{briefData?.brief?.fastestGrowingNiche || 'N/A'}</div>
          </div>
          
          {briefData?.topOpportunity ? (
            <Link to={`/startup/${briefData.topOpportunity.id}`} className="bg-card/40 border border-success/20 p-5 rounded-3xl relative overflow-hidden block hover:border-success/50 transition-colors">
              <div className="absolute inset-0 bg-success/5 pointer-events-none" />
              <div className="flex items-center gap-3 mb-2 text-success">
                <Target className="w-5 h-5" />
                <h3 className="font-semibold">Top Opportunity</h3>
              </div>
              <div className="text-xl font-bold">{briefData.topOpportunity.name}</div>
              <div className="text-sm text-text/60 mt-1">{briefData.topOpportunity.analysis?.niche || 'N/A'}</div>
            </Link>
          ) : (
            <div className="bg-card/40 border border-success/20 p-5 rounded-3xl relative overflow-hidden">
              <div className="absolute inset-0 bg-success/5 pointer-events-none" />
              <div className="flex items-center gap-3 mb-2 text-success">
                <Target className="w-5 h-5" />
                <h3 className="font-semibold">Top Opportunity</h3>
              </div>
              <div className="text-xl font-bold">N/A</div>
              <div className="text-sm text-text/60 mt-1">N/A</div>
            </div>
          )}
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recommended Action */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="glass p-6 rounded-3xl"
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold">Recommended Play</h2>
            <AlertCircle className="w-5 h-5 text-warning" />
          </div>
          <div className="bg-warning/10 border border-warning/20 rounded-3xl p-5 mb-4">
            <h3 className="font-bold text-warning mb-2">Build in: {briefData?.brief?.underservedNiche || 'Underserved Niche'}</h3>
            <p className="text-sm text-text/80 leading-relaxed">
              Based on the data, this niche has low competition but steady demand. Consider building a targeted solution here to capture early market share.
            </p>
          </div>
        </motion.div>

        {/* Activity Chart */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="glass p-6 rounded-3xl flex flex-col"
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold">Startups Scanned</h2>
          </div>
          <div className="flex-1 min-h-[200px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="date" stroke="#475569" fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', borderRadius: '8px', color: '#f8fafc' }}
                  itemStyle={{ color: '#818cf8' }}
                />
                <Area type="monotone" dataKey="count" stroke="#6366f1" strokeWidth={3} fillOpacity={1} fill="url(#colorCount)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Recent High Opportunity Startups */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="glass p-6 rounded-3xl"
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold">Trending High-Score Startups</h2>
          </div>
          <div className="space-y-4">
            {topStartups.map((startup) => (
              <div key={startup.id} className="flex items-center justify-between p-4 bg-card/40 border border-white/5 rounded-3xl hover:bg-card/60 hover:border-primary/30 transition-colors cursor-pointer group">
                <div>
                  <Link to={`/startup/${startup.id}`} className="font-bold hover:text-primary transition-colors flex items-center gap-2">
                    {startup.name}
                    <button 
                      onClick={(e) => { e.preventDefault(); e.stopPropagation(); toggleSaveStartup(startup.id); }}
                      className="text-text/30 hover:text-primary transition-colors"
                    >
                      <Star className="w-4 h-4" fill={isStartupSaved(startup.id) ? "currentColor" : "none"} color={isStartupSaved(startup.id) ? "var(--color-primary)" : "currentColor"} />
                    </button>
                  </Link>
                  <p className="text-xs text-text/50">{startup.category}</p>
                </div>
                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <div className="text-sm font-bold text-success">{startup.analysis.overallScore}/100</div>
                    <div className="text-[10px] text-text/40 text-uppercase tracking-wider">Opp Score</div>
                  </div>
                </div>
              </div>
            ))}
            {topStartups.length === 0 && <div className="text-text/50">No scored startups available. Trigger ingestion to fetch data.</div>}
          </div>
        </motion.div>
      </div>

      {/* Live Feed Section */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="glass p-6 rounded-3xl"
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold flex items-center gap-2">
            <Zap className="w-5 h-5 text-primary" />
            Live Startups Feed
          </h2>
          <span className="text-xs px-2 py-1 bg-success/20 text-success rounded-full border border-success/30 flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-success animate-pulse"></span>
            Real-Time
          </span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {loading ? (
            <SkeletonCard count={6} />
          ) : startups.slice(0, 6).map((startup) => (
            <Link key={startup.id} to={`/startup/${startup.id}`} className="bg-card/40 border border-white/5 p-4 rounded-3xl hover:bg-white/5 hover:border-primary/30 transition-all group flex flex-col h-full">
              <div className="flex justify-between items-start mb-3">
                <div className="flex items-center gap-3">
                  <StartupLogo name={startup.name} url={startup.url} size="sm" />
                  <h3 className="font-bold group-hover:text-primary transition-colors line-clamp-1">{startup.name}</h3>
                </div>
                <span className="text-xs bg-white/5 px-2 py-1 rounded text-text/60 shrink-0">{startup.sources || 'Web'}</span>
              </div>
              <p className="text-sm text-text/70 line-clamp-2 mb-4 flex-grow">{startup.description}</p>
              <div className="flex justify-between items-center text-xs">
                <span className="text-primary">{startup.category || 'Tech'}</span>
                <span className="text-text/40">{startup.launchedAt ? new Date(startup.launchedAt).toLocaleDateString('en-GB') : 'Just Now'}</span>
              </div>
            </Link>
          ))}
        </div>
        {!loading && startups.length === 0 && <div className="text-text/50 text-center py-4">No startups found. Trigger ingestion to fetch live data.</div>}
      </motion.div>

    </div>
  );
}

function TrendingIcon(props) {
  return (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="22 7 13.5 15.5 8.5 10.5 2 17"></polyline>
      <polyline points="16 7 22 7 22 13"></polyline>
    </svg>
  );
}
