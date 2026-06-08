import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceArea, ReferenceLine } from "recharts";
import { validateIdea, fetchMatrixData } from "../lib/api";
import { Send, Zap, Target, Flame, DollarSign, Activity, AlertCircle, ArrowUpRight, RefreshCw, Lock } from "lucide-react";
import { Link } from "react-router-dom";
import { usePro } from "../contexts/ProContext";
import { useWorkspace } from "../contexts/WorkspaceContext";

export default function OpportunityLab() {
  const { canUseLab, triggerUpgrade, incrementLabUsage, labUsageCount, isPro } = usePro();
  const { addValidatedIdea } = useWorkspace();
  
  const [idea, setIdea] = useState("");
  const [validating, setValidating] = useState(false);
  const [result, setResult] = useState(null);
  const [cooldown, setCooldown] = useState(0);
  const [matrixData, setMatrixData] = useState([]);

  useEffect(() => {
    async function loadData() {
      const data = await fetchMatrixData();
      setMatrixData(data || []);
    }
    loadData();
  }, []);

  useEffect(() => {
    let timer;
    if (cooldown > 0) {
      timer = setInterval(() => setCooldown(c => c - 1), 1000);
    }
    return () => clearInterval(timer);
  }, [cooldown]);

  const handleValidate = async () => {
    if (!idea.trim() || cooldown > 0) return;
    
    if (!canUseLab) {
      triggerUpgrade();
      return;
    }

    setValidating(true);
    const res = await validateIdea(idea);
    setResult(res);
    
    // Attempt to store in workspace. The backend didn't return the ID, but wait, does it?
    // Let's assume the backend validator creates the Idea and returns it, but it might not have the ID.
    // If it does, we save it.
    if (res && res.id) {
      addValidatedIdea(res.id);
    }

    incrementLabUsage();
    setValidating(false);
    setCooldown(10); // 10s cooldown
  };

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="glass p-3 border border-white/10 rounded-lg text-sm max-w-[200px] z-50">
          <p className="font-bold text-primary mb-1 truncate">{data.name}</p>
          <p className="text-text/70 text-xs mb-2">{data.category}</p>
          <p className="text-success text-xs">Score: {data.overall}</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="flex flex-col h-[calc(100vh-6rem)] -m-4 md:-m-8">
      {/* Header */}
      <div className="px-8 py-6 border-b border-white/5 bg-background/50 backdrop-blur-xl shrink-0">
        <h1 className="text-3xl font-black mb-2">Opportunity Lab</h1>
        <p className="text-text/70">Validate your startup idea and plot it against the real-world market matrix.</p>
      </div>

      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
        
        {/* Left Pane: Idea Validator */}
        <div className="w-full lg:w-1/3 border-r border-white/5 bg-card/20 flex flex-col h-full overflow-y-auto">
          <div className="p-6 space-y-6">
            
            {/* Input Form */}
            <div className="space-y-3 relative">
              {!canUseLab && (
                <div className="absolute inset-0 z-10 bg-background/80 backdrop-blur-sm rounded-xl flex flex-col items-center justify-center p-4 text-center border border-white/10">
                  <Lock className="w-8 h-8 text-primary mb-2" />
                  <h3 className="font-bold mb-1">Limit Reached</h3>
                  <p className="text-xs text-text/60 mb-3">You've used all 3 free validations.</p>
                  <button onClick={triggerUpgrade} className="bg-primary px-4 py-2 rounded-lg font-bold text-sm">Upgrade to Pro</button>
                </div>
              )}
              <div className="flex justify-between items-end">
                <label className="text-sm font-bold text-text/80 uppercase tracking-wider">Pitch Idea or Paste URL</label>
                {!isPro && <span className="text-xs font-medium text-primary bg-primary/10 px-2 py-0.5 rounded-md">{3 - labUsageCount} Free Left</span>}
              </div>
              <textarea 
                value={idea}
                onChange={(e) => setIdea(e.target.value)}
                placeholder="I want to build an AI agent that... OR https://competitor.com"
                className="w-full bg-background border border-white/10 rounded-xl p-4 min-h-[120px] focus:outline-none focus:border-primary/50 transition-colors resize-none"
              ></textarea>
              <button 
                onClick={handleValidate}
                disabled={validating || !idea.trim() || cooldown > 0}
                className="w-full bg-primary text-background font-bold py-3 rounded-xl hover:opacity-90 transition-opacity flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {validating ? (
                  <><RefreshCw className="w-5 h-5 animate-spin" /> Analyzing Market...</>
                ) : cooldown > 0 ? (
                  `Cooldown (${cooldown}s)`
                ) : (
                  <><Zap className="w-5 h-5" /> {idea.trim().startsWith('http') ? 'Analyze Website' : 'Validate Idea'}</>
                )}
              </button>
            </div>

            {/* AI Result Card */}
            {result && (
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-6"
              >
                <div className="glass-card p-6 border-t-4 border-t-primary">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <div className="text-xs text-primary font-bold uppercase tracking-wider mb-1">{result.niche}</div>
                      <h3 className="text-2xl font-black">{result.overallScore}/100</h3>
                    </div>
                    <div className="bg-success/10 text-success text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1">
                      <Activity className="w-3 h-3" /> {result.confidenceScore}% Conf
                    </div>
                  </div>
                  
                  <p className="text-sm text-text/80 leading-relaxed mb-4">{result.aiSummary}</p>
                  
                  <div className="grid grid-cols-3 gap-2 text-center text-xs border-y border-white/5 py-4 mb-4">
                    <div><div className="font-bold text-lg">{result.demandScore}</div><div className="text-text/50">Demand</div></div>
                    <div className="border-x border-white/5"><div className="font-bold text-lg">{result.competitionScore}</div><div className="text-text/50">Comp (10=Low)</div></div>
                    <div><div className="font-bold text-lg">{result.monetizationScore}</div><div className="text-text/50">Monetize</div></div>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <strong className="text-warning text-sm flex items-center gap-1"><AlertCircle className="w-4 h-4"/> Key Risks</strong>
                      <p className="text-xs text-text/70 mt-1 leading-relaxed">{result.keyRisks}</p>
                    </div>
                    <div>
                      <strong className="text-success text-sm flex items-center gap-1"><Target className="w-4 h-4"/> Advantages</strong>
                      <p className="text-xs text-text/70 mt-1 leading-relaxed">{result.advantages}</p>
                    </div>
                    <div>
                      <strong className="text-primary text-sm flex items-center gap-1"><Flame className="w-4 h-4"/> Positioning</strong>
                      <p className="text-xs text-text/70 mt-1 leading-relaxed">{result.positioning}</p>
                    </div>
                  </div>
                </div>

                {/* Competitors List */}
                <div className="space-y-3">
                  <h4 className="font-bold text-sm uppercase tracking-wider text-text/60">Top DB Competitors</h4>
                  {result.competitors?.map(comp => (
                    <Link to={`/startup/${comp.id}`} key={comp.id} className="block glass p-3 border border-white/5 rounded-xl hover:border-primary/50 transition-colors group">
                      <div className="flex justify-between items-center">
                        <span className="font-bold text-sm group-hover:text-primary transition-colors truncate pr-4">{comp.name}</span>
                        <span className="text-xs bg-white/5 px-2 py-1 rounded-md shrink-0">{comp.similarityScore}% Match</span>
                      </div>
                    </Link>
                  ))}
                  {(!result.competitors || result.competitors.length === 0) && (
                    <div className="text-xs text-text/50 italic">No direct competitors found in database.</div>
                  )}
                </div>
              </motion.div>
            )}

          </div>
        </div>

        {/* Right Pane: Market Matrix */}
        <div className="w-full lg:w-2/3 h-[500px] lg:h-full p-8 flex flex-col relative">
          <div className="flex justify-between items-end mb-6 shrink-0">
            <div>
              <h2 className="text-xl font-bold flex items-center gap-2"><Target className="text-primary" /> Market Matrix</h2>
              <p className="text-sm text-text/50">Visualizing Demand vs. Competition. Top-Right is the Blue Ocean.</p>
            </div>
            {result && (
              <div className="flex items-center gap-2 text-xs font-bold text-primary animate-pulse">
                <span className="w-3 h-3 rounded-full bg-primary shadow-[0_0_10px_var(--color-primary)]"></span>
                Your Idea Plotted
              </div>
            )}
          </div>

          <div className="flex-1 min-h-0 relative glass-card p-4">
            
            {/* Background Quadrant Labels */}
            <div className="absolute inset-4 pointer-events-none flex flex-col opacity-20">
              <div className="flex-1 flex">
                <div className="flex-1 border-r border-b border-white/10 flex items-center justify-center p-4 text-center font-black text-2xl tracking-widest uppercase">Emerging Market</div>
                <div className="flex-1 border-b border-white/10 bg-success/5 flex items-center justify-center p-4 text-center font-black text-2xl tracking-widest uppercase text-success">Hidden Gem (Blue Ocean)</div>
              </div>
              <div className="flex-1 flex">
                <div className="flex-1 border-r border-white/10 flex items-center justify-center p-4 text-center font-black text-2xl tracking-widest uppercase text-warning">Saturated Market</div>
                <div className="flex-1 flex items-center justify-center p-4 text-center font-black text-2xl tracking-widest uppercase text-text/30">Low Potential</div>
              </div>
            </div>

            <ResponsiveContainer width="100%" height="100%" minWidth={1} minHeight={1}>
              <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" />
                <XAxis 
                  type="number" 
                  dataKey="competition" 
                  name="Competition" 
                  domain={[0, 10]} 
                  tick={{ fill: '#ffffff50', fontSize: 12 }}
                  label={{ value: "Competition Score (10 = Low Competition)", position: "bottom", fill: '#ffffff50', fontSize: 12 }}
                />
                <YAxis 
                  type="number" 
                  dataKey="demand" 
                  name="Demand" 
                  domain={[0, 10]} 
                  tick={{ fill: '#ffffff50', fontSize: 12 }}
                  label={{ value: "Demand Score (10 = High Demand)", angle: -90, position: "left", fill: '#ffffff50', fontSize: 12 }}
                />
                <Tooltip content={<CustomTooltip />} cursor={{ strokeDasharray: '3 3', stroke: '#ffffff30' }} />
                
                {/* Reference Lines to divide quadrants */}
                <ReferenceLine x={5} stroke="#ffffff20" />
                <ReferenceLine y={5} stroke="#ffffff20" />

                {/* Plot existing DB startups */}
                <Scatter 
                  name="Market" 
                  data={matrixData} 
                  fill="#ffffff30" 
                  shape="circle"
                />

                {/* Plot the User's Idea if validated */}
                {result && (
                  <Scatter 
                    name="Your Idea" 
                    data={[{ name: "Your Validated Idea", category: result.niche, demand: result.demandScore, competition: result.competitionScore, overall: result.overallScore }]} 
                    fill="var(--color-primary)"
                    className="animate-pulse"
                  />
                )}
              </ScatterChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>
    </div>
  );
}
