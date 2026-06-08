import { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { Bot, Send, User, Sparkles, Loader2 } from "lucide-react";

export default function Copilot() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const scrollContainerRef = useRef(null);

  const scrollToBottom = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTo({
        top: scrollContainerRef.current.scrollHeight,
        behavior: "smooth"
      });
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  const handleSend = async (e) => {
    e?.preventDefault();
    if (!input.trim() || loading) return;

    const userMessage = input.trim();
    setInput("");
    setMessages(prev => [...prev, { role: 'user', text: userMessage }]);
    setLoading(true);

    try {
      const res = await fetch("http://localhost:3000/api/copilot/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: userMessage })
      });
      const data = await res.json();
      
      if (res.ok && data.response) {
        setMessages(prev => [...prev, { role: 'ai', text: data.response }]);
      } else {
        setMessages(prev => [...prev, { role: 'ai', text: "Sorry, I encountered an error. Please try again." }]);
      }
    } catch (err) {
      setMessages(prev => [...prev, { role: 'ai', text: "Network error. Please check if the backend is running." }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col bg-background/50 h-full w-full">
      {/* Header */}
      <div className="flex-none px-6 py-4 border-b border-white/5 bg-background/90 backdrop-blur-xl flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="bg-primary/20 p-2 rounded-3xl">
            <Bot className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h1 className="text-xl font-bold flex items-center gap-2">Startup Copilot <span className="text-[9px] bg-primary/20 text-primary px-2 py-0.5 rounded-md uppercase font-black">Beta</span></h1>
          </div>
        </div>
        <p className="text-text/50 text-xs hidden md:block">Chat with your tracked startups and validated ideas database.</p>
      </div>

      {messages.length === 0 ? (
        /* Empty Landing State */
        <div className="flex-1 flex flex-col items-center justify-center p-4">
          <div className="w-full max-w-4xl flex flex-col items-center gap-8 -mt-20">
            <div className="flex flex-col items-center gap-4 text-center">
              <div className="bg-primary/20 p-4 rounded-3xl">
                <Bot className="w-12 h-12 text-primary" />
              </div>
              <h1 className="text-3xl font-bold">Hello! I am your AI Startup Copilot.</h1>
              <p className="text-text/50 max-w-lg">I have full access to your database of tracked startups and your validated ideas. Ask me anything!</p>
            </div>

            <form onSubmit={handleSend} className="w-full relative group">
              <input 
                type="text" 
                value={input}
                onChange={(e) => setInput(e.target.value)}
                disabled={loading}
                placeholder="Ask Copilot..."
                className="w-full bg-card/80 border border-white/10 rounded-3xl py-4 pl-6 pr-16 focus:outline-none focus:border-primary/50 focus:bg-card transition-all shadow-2xl"
              />
              <button 
                type="submit"
                disabled={!input.trim() || loading}
                className="absolute right-2 top-2 bottom-2 bg-primary text-background p-3 rounded-3xl hover:opacity-90 transition-opacity disabled:opacity-30 disabled:bg-white/10 disabled:text-text/50"
              >
                <Send className="w-5 h-5" />
              </button>
            </form>

            <div className="flex flex-wrap gap-2 justify-center">
              {["Find a blue ocean niche", "Highest scored validated idea?", "Compare top 3 startups"].map(q => (
                <button 
                  key={q} 
                  onClick={(e) => {
                    setInput(q);
                    // Slight delay to allow state to update before sending
                    setTimeout(() => {
                      const formEvent = new Event('submit', { cancelable: true, bubbles: true });
                      e.target.closest('.w-full').querySelector('form')?.dispatchEvent(formEvent);
                    }, 0);
                  }} 
                  className="bg-white/5 hover:bg-white/10 border border-white/5 px-4 py-2 rounded-full text-text/70 transition-colors text-sm"
                >
                  {q}
                </button>
              ))}
            </div>
          </div>
        </div>
      ) : (
        /* Active Chat State */
        <div className="flex-1 flex flex-col min-h-0 relative">
          <div 
            ref={scrollContainerRef}
            className="flex-1 overflow-y-auto px-4 py-8 space-y-8 scroll-smooth"
          >
            <div className="max-w-5xl mx-auto w-full space-y-8">
            {messages.map((msg, idx) => (
              <motion.div 
                key={idx}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`flex gap-4 w-full ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}
              >
                <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${msg.role === 'user' ? 'bg-white/10' : 'bg-primary/20'}`}>
                  {msg.role === 'user' ? <User className="w-4 h-4 text-text/80" /> : <Sparkles className="w-4 h-4 text-primary" />}
                </div>
                <div className={`px-5 py-4 rounded-3xl max-w-3xl ${msg.role === 'user' ? 'bg-white/5 border border-white/10 text-white' : 'bg-card/30 border border-white/5 text-text/90'}`}>
                  {msg.role === 'ai' ? (
                    <div 
                      className="prose prose-invert prose-sm max-w-none leading-relaxed space-y-4"
                      dangerouslySetInnerHTML={{ __html: formatMarkdown(msg.text) }} 
                    />
                  ) : (
                    <p className="whitespace-pre-wrap leading-relaxed">{msg.text}</p>
                  )}
                </div>
              </motion.div>
            ))}
            
            {loading && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex gap-4 w-full">
                <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center shrink-0">
                  <Loader2 className="w-4 h-4 text-primary animate-spin" />
                </div>
                <div className="px-5 py-4 rounded-3xl bg-transparent text-text/50 flex items-center gap-2">
                  Searching database...
                </div>
              </motion.div>
            )}
            <div className="h-4" />
            </div>
          </div>

          <div className="flex-none p-4 md:p-6 bg-background border-t border-white/5">
            <form onSubmit={handleSend} className="max-w-4xl mx-auto relative group">
              <input 
                type="text" 
                value={input}
                onChange={(e) => setInput(e.target.value)}
                disabled={loading}
                placeholder="Ask Copilot..."
                className="w-full bg-card/80 border border-white/10 rounded-3xl py-4 pl-6 pr-16 focus:outline-none focus:border-primary/50 focus:bg-card transition-all shadow-lg"
              />
              <button 
                type="submit"
                disabled={!input.trim() || loading}
                className="absolute right-2 top-2 bottom-2 bg-primary text-background p-3 rounded-3xl hover:opacity-90 transition-opacity disabled:opacity-30 disabled:bg-white/10 disabled:text-text/50"
              >
                <Send className="w-5 h-5" />
              </button>
            </form>
          </div>
          </div>
      )}
    </div>
  );
}

// Simple markdown formatter to handle bolding and basic lists sent by the AI without needing a heavy markdown library
function formatMarkdown(text) {
  let html = text
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.*?)\*/g, '<em>$1</em>')
    .replace(/\n\n/g, '</p><p>')
    .replace(/\n- /g, '<br/>• ');
  return `<p>${html}</p>`;
}
