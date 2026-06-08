import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { fetchStartupDetail, fetchMatrixData, generateSwot } from "../lib/api";
import { ArrowLeft, ExternalLink, Calendar, Tag, AlertCircle, TrendingUp, BarChart2, DollarSign, Activity, Target, ShieldAlert, Zap, Loader2 } from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from 'recharts';
import StartupLogo from "../components/StartupLogo";

export default function StartupDetail() {
  const { id } = useParams();
  const [data, setData] = useState(null);
  const [startup, setStartup] = useState(null);
  const [matrixData, setMatrixData] = useState([]);
  const [swotData, setSwotData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [generatingSwot, setGeneratingSwot] = useState(false);

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      const data = await fetchStartupDetail(id);
      setData(data);
      setStartup(data?.startup);
      if (data?.startup?.analysis?.swotAnalysis) {
        setSwotData(JSON.parse(data.startup.analysis.swotAnalysis));
      }
      const mData = await fetchMatrixData();
      setMatrixData(mData || []);
      setLoading(false);
    }
    loadData();
  }, [id]);

  const handleGenerateSwot = async () => {
    setGeneratingSwot(true);
    try {
      const swot = await generateSwot(id);
      if (swot && !swot.error) setSwotData(swot);
      else alert(swot?.error || "Failed to generate SWOT Analysis. The AI API might be busy or rate-limited. Please try again in a minute.");
    } catch (e) {
      alert("Failed to generate SWOT Analysis. Please try again in a minute.");
    }
    setGeneratingSwot(false);
  };

  const renderEngagement = (metricsStr) => {
    if (!metricsStr) return 'N/A';
    try {
      const parsed = JSON.parse(metricsStr);
      const parts = [];
      if (parsed.points !== undefined) parts.push(`${parsed.points} pts`);
      if (parsed.upvotes !== undefined) parts.push(`${parsed.upvotes} upvotes`);
      if (parsed.stars !== undefined) parts.push(`${parsed.stars} stars`);
      if (parsed.comments !== undefined) parts.push(`${parsed.comments} comments`);
      if (parsed.reviews !== undefined) parts.push(`${parsed.reviews} reviews`);
      if (parsed.views !== undefined) parts.push(`${parsed.views} views`);
      return parts.length > 0 ? parts.join(', ') : 'Active';
    } catch (e) {
      return metricsStr;
    }
  };

  if (loading) {
    return <div className="text-center py-20 text-text/60">Loading intelligence data...</div>;
  }

  if (!data || !startup) {
    return <div className="text-center py-20 text-text/60">Startup not found.</div>;
  }

  const analysis = startup.analysis || {};

  return (
    <div className="max-w-6xl mx-auto pb-12">
      <Link to="/explore" className="inline-flex items-center gap-2 text-sm text-text/50 hover:text-primary transition-colors mb-6">
        <ArrowLeft className="w-4 h-4" /> Back to Explorer
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass-card p-8 rounded-3xl border border-white/5 relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 blur-[80px] rounded-full pointer-events-none" />
            <div className="flex justify-between items-start mb-8">
              <div className="flex items-center gap-4">
                <StartupLogo name={startup.name} url={startup.url} size="lg" />
                <div>
                  <h1 className="text-3xl font-bold mb-2">{startup.name}</h1>
                  <p className="text-primary font-medium">{analysis.niche || startup.category}</p>
                </div>
              </div>
              <a href={startup.url} target="_blank" rel="noreferrer" className="bg-primary/10 hover:bg-primary/20 text-primary px-4 py-2 rounded-3xl text-sm font-semibold flex items-center gap-2 border border-primary/20">
                Visit Website <ExternalLink className="w-4 h-4" />
              </a>
            </div>
            
            <p className="text-text/80 leading-relaxed text-lg mb-8">{startup.description}</p>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-card/50 p-4 rounded-3xl border border-white/5">
                <div className="text-text/50 text-xs font-bold uppercase tracking-wider mb-1">Launched</div>
                <div className="font-medium flex items-center gap-2"><Calendar className="w-4 h-4 text-primary" /> {new Date(startup.launchedAt).toLocaleDateString('en-GB')}</div>
              </div>
              <div className="bg-card/50 p-4 rounded-3xl border border-white/5">
                <div className="text-text/50 text-xs font-bold uppercase tracking-wider mb-1">Category</div>
                <div className="font-medium flex items-center gap-2"><Tag className="w-4 h-4 text-primary" /> {startup.category || 'N/A'}</div>
              </div>
              <div className="bg-card/50 p-4 rounded-3xl border border-white/5">
                <div className="text-text/50 text-xs font-bold uppercase tracking-wider mb-1">Pricing</div>
                <div className="font-medium flex items-center gap-2"><DollarSign className="w-4 h-4 text-primary" /> {startup.pricing || 'N/A'}</div>
              </div>
              <div className="bg-card/50 p-4 rounded-3xl border border-white/5">
                <div className="text-text/50 text-xs font-bold uppercase tracking-wider mb-1">Engagement</div>
                <div className="font-medium flex items-center gap-2 text-sm"><TrendingUp className="w-4 h-4 text-primary" /> {renderEngagement(startup.engagementMetrics)}</div>
              </div>
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass-card p-8 rounded-3xl border border-white/5 relative overflow-hidden"
          >
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold flex items-center gap-2"><Target className="w-5 h-5 text-primary"/> Competitor Battlecard</h2>
              {!swotData && (
                <button 
                  onClick={handleGenerateSwot}
                  disabled={generatingSwot}
                  className="bg-primary/20 text-primary hover:bg-primary/30 px-4 py-2 rounded-lg font-bold text-sm flex items-center gap-2 disabled:opacity-50 transition-colors"
                >
                  {generatingSwot ? <Loader2 className="w-4 h-4 animate-spin" /> : <Zap className="w-4 h-4" />}
                  Generate SWOT Analysis
                </button>
              )}
            </div>

            {swotData ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-success/5 border border-success/20 p-5 rounded-3xl">
                  <h3 className="font-bold text-success flex items-center gap-2 mb-3 uppercase text-xs tracking-wider">Strengths</h3>
                  <ul className="space-y-2">
                    {swotData.strengths.map((s, i) => <li key={i} className="text-sm text-text/80 flex items-start gap-2"><div className="w-1.5 h-1.5 bg-success rounded-full mt-1.5 shrink-0" />{s}</li>)}
                  </ul>
                </div>
                <div className="bg-danger/5 border border-danger/20 p-5 rounded-3xl">
                  <h3 className="font-bold text-danger flex items-center gap-2 mb-3 uppercase text-xs tracking-wider text-red-400">Weaknesses</h3>
                  <ul className="space-y-2">
                    {swotData.weaknesses.map((w, i) => <li key={i} className="text-sm text-text/80 flex items-start gap-2"><div className="w-1.5 h-1.5 bg-red-400 rounded-full mt-1.5 shrink-0" />{w}</li>)}
                  </ul>
                </div>
                <div className="bg-primary/5 border border-primary/20 p-5 rounded-3xl">
                  <h3 className="font-bold text-primary flex items-center gap-2 mb-3 uppercase text-xs tracking-wider">Opportunities</h3>
                  <ul className="space-y-2">
                    {swotData.opportunities.map((o, i) => <li key={i} className="text-sm text-text/80 flex items-start gap-2"><div className="w-1.5 h-1.5 bg-primary rounded-full mt-1.5 shrink-0" />{o}</li>)}
                  </ul>
                </div>
                <div className="bg-warning/5 border border-warning/20 p-5 rounded-3xl">
                  <h3 className="font-bold text-warning flex items-center gap-2 mb-3 uppercase text-xs tracking-wider">Threats</h3>
                  <ul className="space-y-2">
                    {swotData.threats.map((t, i) => <li key={i} className="text-sm text-text/80 flex items-start gap-2"><div className="w-1.5 h-1.5 bg-warning rounded-full mt-1.5 shrink-0" />{t}</li>)}
                  </ul>
                </div>
              </div>
            ) : (
              <div className="text-center p-8 border border-white/5 border-dashed rounded-3xl text-text/50">
                <ShieldAlert className="w-8 h-8 mx-auto mb-3 opacity-50" />
                <p>Run a deep AI analysis to uncover this startup's vulnerabilities.</p>
              </div>
            )}
          </motion.div>
        </div>

        {/* Sidebar Data */}
        <div className="space-y-6">
          
          {/* Opportunity Score Widget */}
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="glass-card p-6 flex flex-col items-center justify-center text-center"
          >
            <span className="text-sm font-semibold text-text/60 mb-2 uppercase tracking-wider">Opportunity Score</span>
            <div className="text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary mb-4">
              {analysis.overallScore || '--'}
            </div>
            
            <div className="w-full bg-white/5 rounded-full h-2 mb-2 overflow-hidden">
              <div 
                className="bg-gradient-to-r from-primary to-secondary h-2 rounded-full" 
                style={{ width: `${analysis.overallScore || 0}%` }}
              ></div>
            </div>

            <div className="w-full flex justify-between items-center text-xs mt-4 pt-4 border-t border-white/5">
              <span className="text-text/50 flex items-center gap-1"><Activity className="w-3 h-3"/> AI Confidence</span>
              <span className="font-bold text-success">{analysis.confidenceScore || '--'}%</span>
            </div>
          </motion.div>

          {/* Related Opportunities */}
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="glass p-6 rounded-3xl"
          >
            <h3 className="font-bold mb-4 text-sm uppercase tracking-wider text-text/60">Related in {startup.category}</h3>
            <div className="space-y-3">
              {data?.related && data.related.length > 0 ? data.related.map((rel) => (
                <Link key={rel.id} to={`/startup/${rel.id}`} className="block p-3 bg-card/40 rounded-3xl border border-white/5 hover:border-primary/30 transition-colors group">
                  <div className="flex justify-between items-start mb-1">
                    <h4 className="font-bold text-sm group-hover:text-primary transition-colors">{rel.name}</h4>
                    <span className="text-success font-black text-sm">{rel.analysis?.overallScore || '-'}</span>
                  </div>
                  <div className="text-xs text-text/50 line-clamp-1">{rel.description}</div>
                </Link>
              )) : (
                <p className="text-sm text-text/50 italic">No related opportunities found.</p>
              )}
            </div>
          </motion.div>

        </div>
      </div>
    </div>
  );
}
