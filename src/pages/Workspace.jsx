import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useWorkspace } from "../contexts/WorkspaceContext";
import { fetchIdeasByIds, generatePitchDeck } from "../lib/api";
import { FolderHeart, Sparkles, Activity, AlertCircle, Target, Flame, ChevronRight, Presentation, Loader2 } from "lucide-react";
import { Link } from "react-router-dom";

export default function Workspace() {
  const { validatedIdeas } = useWorkspace();
  const [ideasData, setIdeasData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [generatingDeckFor, setGeneratingDeckFor] = useState(null);
  const [activeDeck, setActiveDeck] = useState(null); // stores the deck slides to view

  useEffect(() => {
    async function loadData() {
      if (validatedIdeas.length > 0) {
        const data = await fetchIdeasByIds(validatedIdeas);
        setIdeasData(data || []);
      }
      setLoading(false);
    }
    loadData();
  }, [validatedIdeas]);

  const handleGenerateDeck = async (ideaId) => {
    setGeneratingDeckFor(ideaId);
    const deck = await generatePitchDeck(ideaId);
    if (deck) {
      setIdeasData(prev => prev.map(i => i.id === ideaId ? { ...i, pitchDeck: JSON.stringify(deck) } : i));
      setActiveDeck(deck);
    }
    setGeneratingDeckFor(null);
  };

  return (
    <div className="space-y-8 pb-12">
      <div>
        <h1 className="text-3xl font-bold mb-2 flex items-center gap-3"><FolderHeart className="text-primary" /> My Workspace</h1>
        <p className="text-text/60">Your personal portfolio of AI-validated ideas and bookmarked startups.</p>
      </div>

      <div className="space-y-6">
        <h2 className="text-xl font-bold flex items-center gap-2"><Sparkles className="w-5 h-5 text-primary" /> Validated Ideas Portfolio</h2>
        
        {loading ? (
          <div className="text-text/50">Loading portfolio...</div>
        ) : ideasData.length === 0 ? (
          <div className="glass-card p-12 text-center text-text/50 rounded-2xl border border-white/5 border-dashed">
            <p>You haven't validated any ideas yet.</p>
            <Link to="/lab" className="text-primary font-bold mt-2 inline-block hover:underline">Go to Opportunity Lab</Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {ideasData.map((idea) => (
              <motion.div 
                key={idea.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="glass-card p-6 border-l-4 border-l-primary flex flex-col h-full"
              >
                <div className="flex justify-between items-start mb-4">
                  <div className="text-xs text-primary font-bold uppercase tracking-wider mb-1">{idea.niche}</div>
                  <div className="bg-success/10 text-success text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1">
                    <Activity className="w-3 h-3" /> {idea.overallScore}/100
                  </div>
                </div>
                
                <h3 className="font-bold text-lg mb-2 line-clamp-2">{idea.rawIdea}</h3>
                <p className="text-sm text-text/70 mb-6 flex-1 line-clamp-3">{idea.aiSummary}</p>

                <div className="grid grid-cols-2 gap-4 mt-auto border-t border-white/5 pt-4 mb-4">
                  <div>
                    <div className="text-xs text-text/50 mb-1 flex items-center gap-1"><AlertCircle className="w-3 h-3 text-warning"/> Key Risks</div>
                    <div className="text-xs line-clamp-2">{idea.keyRisks}</div>
                  </div>
                  <div>
                    <div className="text-xs text-text/50 mb-1 flex items-center gap-1"><Flame className="w-3 h-3 text-primary"/> Advantage</div>
                    <div className="text-xs line-clamp-2">{idea.advantages}</div>
                  </div>
                </div>

                <div className="mt-2">
                  {idea.pitchDeck ? (
                    <button onClick={() => setActiveDeck(JSON.parse(idea.pitchDeck))} className="w-full bg-primary/20 text-primary hover:bg-primary/30 transition-colors py-2 rounded-lg font-bold text-sm flex items-center justify-center gap-2">
                      <Presentation className="w-4 h-4" /> View Pitch Deck
                    </button>
                  ) : (
                    <button 
                      onClick={() => handleGenerateDeck(idea.id)}
                      disabled={generatingDeckFor === idea.id}
                      className="w-full bg-white/5 hover:bg-white/10 transition-colors py-2 rounded-lg font-bold text-sm flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                      {generatingDeckFor === idea.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Presentation className="w-4 h-4" />}
                      Generate AI Pitch Deck
                    </button>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Deck Viewer Modal */}
      {activeDeck && (
        <div className="fixed inset-0 z-50 bg-background/90 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-card w-full max-w-4xl max-h-[80vh] rounded-2xl border border-white/10 flex flex-col overflow-hidden shadow-2xl">
            <div className="flex justify-between items-center p-4 border-b border-white/5 bg-background">
              <h2 className="font-black text-lg flex items-center gap-2"><Presentation className="text-primary w-5 h-5"/> Pitch Deck Generator</h2>
              <button onClick={() => setActiveDeck(null)} className="text-text/50 hover:text-text font-bold">Close</button>
            </div>
            <div className="p-6 overflow-y-auto flex-1 space-y-8 bg-card/50">
              {activeDeck.map((slide, i) => (
                <div key={i} className="bg-background rounded-xl p-8 border border-white/5 relative">
                  <div className="absolute top-4 right-4 text-xs font-bold text-text/30">Slide {slide.slideNumber || i+1}</div>
                  <h3 className="text-2xl font-black mb-4 text-primary">{slide.title}</h3>
                  <div className="text-text/80 whitespace-pre-wrap leading-relaxed mb-6 font-medium text-lg border-l-2 border-white/10 pl-4">{slide.content}</div>
                  <div className="bg-white/5 p-4 rounded-lg text-sm text-text/60 italic border border-white/5">
                    <strong>Speaker Notes:</strong> {slide.speakerNotes}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
