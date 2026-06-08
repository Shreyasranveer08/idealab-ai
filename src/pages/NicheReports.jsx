import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { fetchNiches, fetchNicheReports, generateNicheReport } from "../lib/api";
import { RefreshCw, BookOpen, Clock, Activity, Target, AlertCircle, CheckCircle2, Lock } from "lucide-react";
import { usePro } from "../contexts/ProContext";

export default function NicheReports() {
  const { canUseNicheReports, triggerUpgrade, incrementNicheUsage, isPro, nicheReportUsageCount } = usePro();
  const [niches, setNiches] = useState([]);
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedNiche, setSelectedNiche] = useState(null);
  const [generating, setGenerating] = useState(false);
  const [activeReport, setActiveReport] = useState(null);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    setLoading(true);
    const [nichesRes, reportsRes] = await Promise.all([
      fetchNiches(),
      fetchNicheReports()
    ]);
    setNiches(nichesRes || []);
    setReports(reportsRes || []);
    
    if (reportsRes && reportsRes.length > 0) {
      setActiveReport(reportsRes[0]);
      setSelectedNiche(reportsRes[0].niche);
    } else if (nichesRes && nichesRes.length > 0) {
      setSelectedNiche(nichesRes[0].name);
    }
    setLoading(false);
  }

  async function handleGenerate() {
    if (!selectedNiche) return;
    
    if (!canUseNicheReports) {
      triggerUpgrade();
      return;
    }

    setGenerating(true);
    const newReport = await generateNicheReport(selectedNiche);
    if (newReport) {
      const updatedReports = await fetchNicheReports();
      setReports(updatedReports || []);
      setActiveReport(newReport);
      incrementNicheUsage();
    }
    setGenerating(false);
  }

  function selectReport(report) {
    setActiveReport(report);
    setSelectedNiche(report.niche);
  }

  if (loading) return <div className="p-8">Loading deep niche data...</div>;

  return (
    <div className="space-y-8 pb-12">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold mb-2">Deep Niche Reports</h1>
          <p className="text-text/70 max-w-2xl">
            AI-generated intelligence completely grounded in our live startup database. Compare historical snapshots and discover underserved opportunities.
          </p>
        </div>
        
        <div className="flex items-center gap-4 glass-card p-2 rounded-xl">
          {!isPro && <span className="text-xs font-bold text-primary px-2 hidden md:block">{Math.max(0, 1 - nicheReportUsageCount)} Free Left</span>}
          <select 
            value={selectedNiche || ''} 
            onChange={(e) => setSelectedNiche(e.target.value)}
            className="bg-transparent border-none focus:ring-0 text-sm font-medium w-48 text-text/90"
          >
            {niches.map(n => (
              <option key={n.name} value={n.name} className="bg-background text-text">{n.name} ({n.count} startups)</option>
            ))}
          </select>
          <button 
            onClick={handleGenerate}
            disabled={generating || !selectedNiche}
            className="bg-primary/20 hover:bg-primary/30 text-primary border border-primary/50 px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${generating ? 'animate-spin' : ''}`} />
            {generating ? 'Analyzing DB...' : 'Generate New Report'}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        
        {/* Sidebar: Historical Reports */}
        <div className="lg:col-span-1 space-y-4">
          <h3 className="font-bold flex items-center gap-2 mb-4"><Clock className="w-4 h-4 text-primary" /> Report History</h3>
          <div className="space-y-2">
            {reports.map((r) => (
              <button 
                key={r.id}
                onClick={() => selectReport(r)}
                className={`w-full text-left p-4 rounded-xl border transition-colors ${activeReport?.id === r.id ? 'bg-primary/10 border-primary/50' : 'bg-card/40 border-white/5 hover:bg-card/60'}`}
              >
                <div className="font-bold text-sm mb-1">{r.niche}</div>
                <div className="text-xs text-text/50 flex justify-between">
                  <span>{new Date(r.date).toLocaleDateString('en-GB')}</span>
                  <span className="text-success">{r.confidenceScore}% Conf</span>
                </div>
              </button>
            ))}
            {reports.length === 0 && <div className="text-sm text-text/50 italic">No reports generated yet.</div>}
          </div>
        </div>

        {/* Main Content: Active Report */}
        <div className="lg:col-span-3 relative">
          {!canUseNicheReports && activeReport && (
            <div className="absolute inset-0 z-20 bg-background/60 backdrop-blur-md rounded-2xl flex flex-col items-center justify-center p-8 text-center border border-white/10">
              <Lock className="w-12 h-12 text-primary mb-4" />
              <h3 className="text-3xl font-black mb-2">Pro Feature Locked</h3>
              <p className="text-text/70 mb-6 max-w-md">You've viewed your 1 free Deep Niche Report. Upgrade to Founder Pro to access unlimited intelligence reports for every category.</p>
              <button onClick={triggerUpgrade} className="bg-primary text-background px-8 py-3 rounded-xl font-black shadow-[0_0_20px_var(--color-primary)]">Upgrade Now</button>
            </div>
          )}

          {activeReport ? (
            <motion.div 
              key={activeReport.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              <div className="glass-card p-8 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 blur-[80px] rounded-full pointer-events-none" />
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <h2 className="text-3xl font-black mb-2">{activeReport.niche}</h2>
                    <p className="text-text/50 text-sm">Generated on {new Date(activeReport.date).toLocaleString('en-GB')} • {activeReport.startupsAnalyzed} Startups Analyzed</p>
                  </div>
                  <div className="bg-success/10 border border-success/30 px-4 py-2 rounded-xl text-success font-bold text-sm flex items-center gap-2">
                    <Activity className="w-4 h-4" /> AI Confidence: {activeReport.confidenceScore}%
                  </div>
                </div>

                <div className="prose prose-invert max-w-none">
                  <h3 className="text-xl font-bold flex items-center gap-2"><BookOpen className="w-5 h-5 text-primary" /> Market Overview</h3>
                  <p className="text-text/80 leading-relaxed text-sm mb-8">{activeReport.marketOverview}</p>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                    <div className="bg-warning/10 border border-warning/20 p-5 rounded-xl">
                      <h4 className="font-bold text-warning flex items-center gap-2 mb-2"><AlertCircle className="w-4 h-4" /> Saturated Segments</h4>
                      <p className="text-sm text-warning/80">{activeReport.saturatedSegments}</p>
                    </div>
                    <div className="bg-success/10 border border-success/20 p-5 rounded-xl">
                      <h4 className="font-bold text-success flex items-center gap-2 mb-2"><Target className="w-4 h-4" /> Underserved Opportunities</h4>
                      <p className="text-sm text-success/80">{activeReport.underserved}</p>
                    </div>
                  </div>

                  <h3 className="text-xl font-bold mb-4">Opportunity Indicators</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                    <div className="glass p-4 rounded-xl">
                      <div className="text-xs text-text/50 uppercase tracking-wider mb-1">Fastest Growing</div>
                      <div className="font-bold text-sm">{activeReport.fastestGrowing}</div>
                    </div>
                    <div className="glass p-4 rounded-xl">
                      <div className="text-xs text-text/50 uppercase tracking-wider mb-1">Score Distribution</div>
                      <div className="font-bold text-sm">{activeReport.scoreDistribution}</div>
                    </div>
                    <div className="glass p-4 rounded-xl">
                      <div className="text-xs text-text/50 uppercase tracking-wider mb-1">Top Performers</div>
                      <div className="font-bold text-sm truncate">{activeReport.topStartups}</div>
                    </div>
                  </div>

                  <div className="bg-primary/5 border border-primary/20 p-6 rounded-2xl">
                    <h3 className="text-lg font-bold flex items-center gap-2 mb-4 text-primary"><CheckCircle2 className="w-5 h-5" /> Recommended Startup Ideas</h3>
                    <p className="text-sm text-text/90 leading-relaxed whitespace-pre-wrap">{activeReport.recommendedIdeas}</p>
                  </div>
                </div>
              </div>
            </motion.div>
          ) : (
            <div className="glass-card p-12 text-center text-text/50 flex flex-col items-center justify-center h-full min-h-[400px]">
              <Target className="w-12 h-12 mb-4 opacity-20" />
              <p>Select a niche and generate a report to view Deep Intelligence data.</p>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
