import { motion } from 'framer-motion';
import { CheckCircle2, Zap } from 'lucide-react';
import { usePro } from '../contexts/ProContext';

export default function Pricing() {
  const { isPro, upgradeToPro } = usePro();

  return (
    <div className="max-w-5xl mx-auto py-12 px-4">
      <div className="text-center mb-16">
        <h1 className="text-4xl md:text-5xl font-black mb-4">Pricing that scales with you</h1>
        <p className="text-text/70 text-lg max-w-2xl mx-auto">
          Start for free to explore the market. Upgrade to Founder Pro when you're ready to validate ideas and discover deep niches.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
        
        {/* Free Plan */}
        <div className="glass-card p-8 rounded-3xl border border-white/5 relative">
          <h2 className="text-2xl font-bold mb-2">Explorer</h2>
          <div className="text-4xl font-black mb-6">$0<span className="text-lg text-text/50 font-normal">/mo</span></div>
          
          <ul className="space-y-4 mb-8">
            <li className="flex items-center gap-3 text-text/80"><CheckCircle2 className="w-5 h-5 text-primary" /> Live Startup Dashboard</li>
            <li className="flex items-center gap-3 text-text/80"><CheckCircle2 className="w-5 h-5 text-primary" /> Startup Explorer & Filtering</li>
            <li className="flex items-center gap-3 text-text/80"><CheckCircle2 className="w-5 h-5 text-primary" /> Trend Radar Access</li>
            <li className="flex items-center gap-3 text-text/80"><CheckCircle2 className="w-5 h-5 text-primary" /> 3 Free Idea Validations</li>
            <li className="flex items-center gap-3 text-text/80"><CheckCircle2 className="w-5 h-5 text-primary" /> 1 Free Deep Niche Report</li>
          </ul>

          <button className="w-full bg-white/5 text-text font-bold py-3 rounded-xl hover:bg-white/10 transition-colors cursor-default">
            Current Plan
          </button>
        </div>

        {/* Pro Plan */}
        <div className="glass-card p-8 rounded-3xl border border-primary/50 relative bg-gradient-to-br from-primary/10 to-transparent">
          <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-primary text-background font-bold px-4 py-1 rounded-full text-sm flex items-center gap-1">
            <Zap className="w-4 h-4" /> Most Popular
          </div>
          <h2 className="text-2xl font-bold mb-2 text-primary">Founder Pro</h2>
          <div className="text-4xl font-black mb-6">$29<span className="text-lg text-text/50 font-normal">/mo</span></div>
          
          <ul className="space-y-4 mb-8">
            <li className="flex items-center gap-3 font-medium"><CheckCircle2 className="w-5 h-5 text-primary" /> Everything in Explorer</li>
            <li className="flex items-center gap-3 font-medium"><CheckCircle2 className="w-5 h-5 text-primary" /> Unlimited Idea Validations</li>
            <li className="flex items-center gap-3 font-medium"><CheckCircle2 className="w-5 h-5 text-primary" /> Unlimited Deep Niche Reports</li>
            <li className="flex items-center gap-3 font-medium"><CheckCircle2 className="w-5 h-5 text-primary" /> Interactive Market Matrix</li>
            <li className="flex items-center gap-3 font-medium"><CheckCircle2 className="w-5 h-5 text-primary" /> Export Data to CSV</li>
          </ul>

          {isPro ? (
            <button className="w-full bg-success/20 text-success font-bold py-3 rounded-xl cursor-default flex justify-center items-center gap-2">
              <CheckCircle2 className="w-5 h-5" /> You are on Pro
            </button>
          ) : (
            <button 
              onClick={upgradeToPro}
              className="w-full bg-primary text-background font-black py-3 rounded-xl hover:opacity-90 transition-opacity shadow-[0_0_20px_var(--color-primary)] shadow-primary/30"
            >
              Upgrade Now (Mock)
            </button>
          )}
        </div>

      </div>
    </div>
  );
}
