import { motion } from "framer-motion";
import { Filter, ChevronDown, Activity, Users, DollarSign, Search, TrendingUp, Star } from "lucide-react";
import { useState, useEffect } from "react";
import { fetchStartups } from "../lib/api";
import { Link, useSearchParams } from "react-router-dom";
import { useWorkspace } from "../contexts/WorkspaceContext";

export default function StartupExplorer() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [startups, setStartups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState(searchParams.get("q") || "");
  const { isStartupSaved, toggleSaveStartup } = useWorkspace();

  useEffect(() => {
    const q = searchParams.get("q");
    if (q !== null) setSearchQuery(q);
  }, [searchParams]);

  useEffect(() => {
    async function load() {
      const data = await fetchStartups();
      setStartups(data || []);
      setLoading(false);
    }
    load();
  }, []);

  if (loading) return <div className="p-8">Loading startups...</div>;

  const MotionLink = motion.create(Link);

  return (
    <div className="space-y-6 pb-12">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold mb-2">Startup Explorer</h1>
          <p className="text-text/60">Discover and analyze new launches across the web.</p>
        </div>
        <div className="flex gap-3 w-full md:w-auto">
          <div className="relative flex-1 md:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text/50" />
            <input 
              type="text" 
              placeholder="Search startups..." 
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setSearchParams(e.target.value ? { q: e.target.value } : {});
              }}
              className="w-full pl-10 pr-4 py-2 bg-card border border-white/10 rounded-lg focus:outline-none focus:border-primary/50 transition-colors text-sm"
            />
          </div>
          <button className="flex items-center gap-2 px-4 py-2 bg-card border border-white/10 rounded-lg hover:bg-white/5 transition-colors shrink-0">
            <Filter className="w-4 h-4" />
            <span className="text-sm hidden sm:inline">Filter</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {startups
          .filter(s => s.name.toLowerCase().includes(searchQuery.toLowerCase()) || (s.description && s.description.toLowerCase().includes(searchQuery.toLowerCase())))
          .map((startup, i) => (
          <MotionLink 
            to={`/startup/${startup.id}`}
            key={startup.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: (i % 10) * 0.1 }}
            className="glass-card overflow-hidden group hover:border-primary/30 transition-colors block"
          >
            <div className="p-6">
              <div className="flex justify-between items-start mb-4">
                <div className="w-12 h-12 bg-card rounded-xl border border-white/10 flex items-center justify-center font-bold text-xl text-primary">
                  {startup.name.charAt(0)}
                </div>
                <div className="flex gap-2">
                  <div className={`px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1 ${
                    startup.engagementScore > 70 ? 'bg-success/20 text-success' : 'bg-white/5 text-text/60'
                  }`}>
                    <TrendingUp className="w-3 h-3" /> {startup.engagementScore}
                  </div>
                  <button 
                    onClick={(e) => { e.preventDefault(); e.stopPropagation(); toggleSaveStartup(startup.id); }}
                    className={`p-1.5 rounded-full border transition-colors ${
                      isStartupSaved(startup.id) ? 'bg-primary/20 border-primary text-primary' : 'bg-transparent border-white/10 text-text/40 hover:text-text'
                    }`}
                  >
                    <Star className="w-4 h-4" fill={isStartupSaved(startup.id) ? "currentColor" : "none"} />
                  </button>
                </div>
              </div>

              <div className="mb-4">
                <h3 className="text-xl font-bold mb-1">{startup.name}</h3>
                <span className="inline-block px-2 py-1 bg-white/5 border border-white/10 rounded text-xs text-text/70 mb-3">
                  {startup.category || 'Uncategorized'}
                </span>
                
                {/* Opportunity Score Badge */}
                {startup.analysis && (
                  <div className="flex flex-col items-end">
                    <div className={`text-2xl font-black ${startup.analysis.overallScore >= 80 ? 'text-success' : 'text-warning'}`}>
                      {startup.analysis.overallScore}
                    </div>
                    <div className="text-[10px] text-text/50 uppercase tracking-widest font-semibold">Opp Score</div>
                  </div>
                )}
              </div>

              <p className="text-sm text-text/80 mb-6 line-clamp-2">
                {startup.description}
              </p>

              {/* Detailed Scores */}
              {startup.analysis && (
                <div className="grid grid-cols-3 gap-2 mb-6 p-3 bg-background/50 rounded-xl border border-white/5">
                  <div className="text-center">
                    <Activity className="w-4 h-4 mx-auto mb-1 text-primary/70" />
                    <div className="text-xs text-text/50 mb-1">Demand</div>
                    <div className="text-sm font-bold">{startup.analysis.demandScore}/10</div>
                  </div>
                  <div className="text-center border-l border-r border-white/5">
                    <Users className="w-4 h-4 mx-auto mb-1 text-secondary/70" />
                    <div className="text-xs text-text/50 mb-1">Comp</div>
                    <div className="text-sm font-bold">{startup.analysis.competitionScore}/10</div>
                  </div>
                  <div className="text-center">
                    <DollarSign className="w-4 h-4 mx-auto mb-1 text-success/70" />
                    <div className="text-xs text-text/50 mb-1">Monetize</div>
                    <div className="text-sm font-bold">{startup.analysis.monetizationScore}/10</div>
                  </div>
                </div>
              )}

              {startup.analysis && (
                <div className="space-y-3">
                  <div className="flex justify-between items-center text-sm border-b border-white/5 pb-2 mb-2">
                    <span className="text-text/60">AI Confidence:</span>
                    <span className={`font-bold ${startup.analysis.confidenceScore >= 80 ? 'text-success' : 'text-warning'}`}>{startup.analysis.confidenceScore}%</span>
                  </div>
                  <div className="text-sm">
                    <span className="font-semibold text-primary mr-2">AI Analysis:</span>
                    <span className="text-text/70">{startup.analysis.aiSummary}</span>
                  </div>
                </div>
              )}
              
              {!startup.analysis && (
                <div className="text-sm text-text/50 italic">Analysis pending...</div>
              )}
            </div>
            <div className="border-t border-white/5 bg-white/[0.02] p-4 flex justify-between items-center text-xs text-text/50">
              <span className="truncate max-w-[150px]">Source: {startup.sources}</span>
              <span className="text-primary group-hover:underline">View Details</span>
            </div>
          </MotionLink>
        ))}
        {startups.filter(s => s.name.toLowerCase().includes(searchQuery.toLowerCase()) || (s.description && s.description.toLowerCase().includes(searchQuery.toLowerCase()))).length === 0 && (
          <div className="col-span-1 md:col-span-2 xl:col-span-3 text-center text-text/50 py-12">
            No startups found matching your search.
          </div>
        )}
      </div>
    </div>
  );
}
