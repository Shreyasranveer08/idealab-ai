import { motion, AnimatePresence } from 'framer-motion';
import { usePro } from '../contexts/ProContext';
import { X, Zap, CheckCircle2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function UpgradeModal() {
  const { showUpgradeModal, closeUpgrade, upgradeToPro } = usePro();
  const navigate = useNavigate();

  if (!showUpgradeModal) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center px-4 bg-background/80 backdrop-blur-sm">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="bg-card border border-white/10 rounded-2xl shadow-2xl max-w-md w-full overflow-hidden relative"
        >
          {/* Close Button */}
          <button onClick={closeUpgrade} className="absolute top-4 right-4 p-2 rounded-full bg-white/5 hover:bg-white/10 transition-colors">
            <X className="w-5 h-5 text-text/70" />
          </button>

          {/* Header */}
          <div className="p-8 text-center bg-gradient-to-br from-primary/20 to-transparent relative overflow-hidden">
            <div className="absolute -top-24 -right-24 w-48 h-48 bg-primary/40 rounded-full blur-[60px]" />
            <Zap className="w-12 h-12 text-primary mx-auto mb-4" />
            <h2 className="text-2xl font-black mb-2">Upgrade to Founder Pro</h2>
            <p className="text-text/70 text-sm">You've hit your free limit. Unlock unlimited AI idea validations and deep niche reports.</p>
          </div>

          {/* Features */}
          <div className="p-8 space-y-4">
            <div className="flex items-center gap-3">
              <CheckCircle2 className="w-5 h-5 text-primary" />
              <span className="text-sm font-medium">Unlimited Opportunity Lab Validations</span>
            </div>
            <div className="flex items-center gap-3">
              <CheckCircle2 className="w-5 h-5 text-primary" />
              <span className="text-sm font-medium">Unlimited Deep Niche Reports</span>
            </div>
            <div className="flex items-center gap-3">
              <CheckCircle2 className="w-5 h-5 text-primary" />
              <span className="text-sm font-medium">Priority Early Access to New Features</span>
            </div>

            <button 
              onClick={() => {
                closeUpgrade();
                navigate('/pricing');
              }}
              className="w-full mt-6 bg-primary text-background font-black py-4 rounded-xl hover:bg-primary/90 transition-colors flex justify-center items-center gap-2"
            >
              View Pricing Plans
            </button>
            <button 
              onClick={upgradeToPro}
              className="w-full mt-2 bg-white/5 text-text font-bold py-3 rounded-xl hover:bg-white/10 transition-colors text-sm"
            >
              [Mock] Click here to simulate upgrade
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
