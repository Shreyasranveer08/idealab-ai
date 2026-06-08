import { useState } from "react";
import { motion } from "framer-motion";
import { User, Mail, CreditCard, Settings, Shield, Bell, Zap, LogOut, AlertTriangle, Key } from "lucide-react";
import { usePro } from "../contexts/ProContext";
import { useAuth } from "../contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase";
import toast from "react-hot-toast";

export default function Profile() {
  const { isPro } = usePro();
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [newPassword, setNewPassword] = useState('');
  const [updatingPassword, setUpdatingPassword] = useState(false);

  const handleUpdatePassword = async () => {
    if (!newPassword || newPassword.length < 6) {
      toast.error("Password must be at least 6 characters.");
      return;
    }
    setUpdatingPassword(true);
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    setUpdatingPassword(false);
    if (error) {
      toast.error("Error updating password: " + error.message);
    } else {
      toast.success("Password updated successfully!");
      setNewPassword('');
    }
  };

  const handleSignOut = async () => {
    await signOut();
    navigate('/auth');
  };

  const handleDeleteAccount = async () => {
    const confirmed = window.confirm("Are you sure you want to permanently delete your account? This action cannot be undone and all your saved startups, niches, and ideas will be lost.");
    if (confirmed) {
      // In a real production app, this would call a backend endpoint to delete the user from Supabase Auth and Database
      // e.g., await fetch('/api/user/delete', { method: 'DELETE' });
      alert("Account deletion requested. Your session will now be terminated.");
      await signOut();
      navigate('/auth');
    }
  };

  return (
    <div className="max-w-5xl mx-auto pb-12 space-y-8 relative">
      {/* Premium Background Ambience */}
      <div className="absolute top-[-10%] left-[20%] w-[40%] h-[40%] rounded-full bg-primary/5 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[20%] right-[-10%] w-[30%] h-[30%] rounded-full bg-secondary/5 blur-[100px] pointer-events-none" />
      
      <div>
        <h1 className="text-4xl font-black mb-2 flex items-center gap-3 tracking-tight">
          <div className="p-3 bg-primary/20 rounded-2xl border border-primary/30">
            <User className="text-primary w-8 h-8" />
          </div>
          My Profile
        </h1>
        <p className="text-text/50 text-lg">Manage your account settings and subscription preferences.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        
        {/* Left Column: Avatar & Quick Stats */}
        <div className="space-y-6">
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            whileHover={{ y: -5, boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.5)" }}
            className="glass-card p-8 rounded-3xl text-center border border-white/5 relative overflow-hidden transition-all duration-300"
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/20 blur-[60px] rounded-full pointer-events-none" />
            <motion.div 
              whileHover={{ scale: 1.05 }}
              className="w-28 h-28 mx-auto rounded-full bg-gradient-to-br from-primary via-primary/80 to-secondary flex items-center justify-center font-black text-4xl text-white shadow-[0_0_40px_rgba(99,102,241,0.4)] border-4 border-background mb-6"
            >
              {user?.email?.charAt(0).toUpperCase() || 'G'}
            </motion.div>
            <h2 className="text-2xl font-bold mb-1 tracking-tight">{user ? 'Founder Account' : 'Guest Account'}</h2>
            <p className="text-sm text-text/50 flex items-center justify-center gap-2 mb-8"><Mail className="w-4 h-4"/> {user?.email || 'Not logged in'}</p>
            
            <div className="inline-flex px-4 py-2 rounded-full border border-white/10 bg-white/5 text-sm font-semibold items-center gap-2">
              {isPro ? (
                <><Zap className="w-4 h-4 text-success" /> <span className="text-success">Pro Plan Active</span></>
              ) : (
                <><Shield className="w-4 h-4 text-text/50" /> <span>Free Plan</span></>
              )}
            </div>
          </motion.div>

          <motion.div 
            whileHover={{ scale: 1.02 }}
            className="glass-card p-3 rounded-2xl space-y-2 border border-white/5 shadow-lg"
          >
            <button 
              onClick={handleSignOut}
              className="w-full text-left px-4 py-4 rounded-xl hover:bg-white/5 hover:border-white/10 border border-transparent transition-all flex items-center gap-3 text-sm text-text/80 hover:text-white font-medium group"
            >
              <div className="p-2 bg-white/5 rounded-lg group-hover:bg-red-500/20 group-hover:text-red-400 transition-colors">
                <LogOut className="w-4 h-4" />
              </div>
              Sign Out
            </button>
          </motion.div>
        </div>

        {/* Right Column: Settings */}
        <div className="md:col-span-2 space-y-6">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            whileHover={{ borderColor: "rgba(255,255,255,0.1)" }}
            className="glass-card p-8 rounded-3xl border border-white/5 transition-colors duration-300 relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 blur-[80px] rounded-full pointer-events-none" />
            <h3 className="text-xl font-bold mb-8 flex items-center gap-3"><CreditCard className="w-6 h-6 text-primary"/> Subscription & Billing</h3>
            
            <div className="bg-background/40 backdrop-blur-md border border-white/10 rounded-2xl p-6 flex flex-col sm:flex-row items-center justify-between gap-6 shadow-inner relative z-10">
              <div>
                <div className="font-black text-lg mb-2 flex items-center gap-2">Current Plan: <span className="text-primary">{isPro ? "Founder Pro" : "Free Explorer"}</span></div>
                <div className="text-sm text-text/60 max-w-sm">{isPro ? "You have unlimited access to all AI features and Deep Niche Reports." : "Upgrade to Pro to unlock unlimited Deep Niche Reports and AI Idea Validation."}</div>
              </div>
              {!isPro && (
                <button onClick={() => navigate('/pricing')} className="shrink-0 px-8 py-3 bg-gradient-to-r from-primary to-secondary hover:opacity-90 text-white rounded-xl font-bold transition-all shadow-[0_0_20px_rgba(99,102,241,0.3)] hover:shadow-[0_0_30px_rgba(99,102,241,0.5)] transform hover:-translate-y-1">
                  Upgrade to Pro
                </button>
              )}
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="glass-card p-8 rounded-3xl border border-white/5"
          >
            <h3 className="text-xl font-bold mb-6 flex items-center gap-2"><Settings className="w-5 h-5 text-primary"/> Account Settings</h3>
            
            <div className="space-y-6">
              
              {/* Update Password */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 bg-white/[0.02] border border-white/5 rounded-xl">
                <div>
                  <div className="font-bold text-sm mb-1 flex items-center gap-2"><Key className="w-4 h-4 text-primary"/> Update Password</div>
                  <div className="text-xs text-text/60">If you used a reset link, set your new password here.</div>
                </div>
                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <input 
                    type="password" 
                    placeholder="New Password" 
                    value={newPassword}
                    autoComplete="new-password"
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="flex-1 sm:w-48 bg-background/50 border border-white/10 rounded-lg py-2 px-3 focus:outline-none focus:border-primary/50 text-sm"
                  />
                  <button 
                    onClick={handleUpdatePassword}
                    disabled={updatingPassword}
                    className="px-4 py-2 bg-primary/20 text-primary border border-primary/30 rounded-lg text-sm font-semibold hover:bg-primary/30 transition-colors disabled:opacity-50 whitespace-nowrap"
                  >
                    {updatingPassword ? 'Saving...' : 'Update'}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between p-4 bg-white/[0.02] border border-white/5 rounded-xl">
                <div>
                  <div className="font-bold text-sm mb-1">Email Notifications</div>
                  <div className="text-xs text-text/60">Receive your Daily Brief via email every morning.</div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" className="sr-only peer" defaultChecked />
                  <div className="w-11 h-6 bg-white/10 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                </label>
              </div>

              <div className="flex items-center justify-between p-4 bg-white/[0.02] border border-white/5 rounded-xl">
                <div>
                  <div className="font-bold text-sm mb-1">AI Data Sharing</div>
                  <div className="text-xs text-text/60">Allow your validation queries to improve our engine.</div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" className="sr-only peer" />
                  <div className="w-11 h-6 bg-white/10 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                </label>
              </div>
            </div>
          </motion.div>

          {/* Danger Zone */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            whileHover={{ borderColor: "rgba(239,68,68,0.3)", boxShadow: "0 0 40px rgba(239,68,68,0.05)" }}
            className="glass-card p-8 rounded-3xl border border-red-500/10 bg-red-500/[0.02] relative overflow-hidden transition-all duration-300 group"
          >
            <div className="absolute top-[-50%] right-[-10%] w-64 h-64 bg-red-500/10 blur-[80px] rounded-full pointer-events-none group-hover:bg-red-500/20 transition-colors duration-500" />
            <h3 className="text-xl font-bold mb-8 flex items-center gap-3 text-red-400 relative z-10">
              <div className="p-2 bg-red-500/10 rounded-xl border border-red-500/20 text-red-500">
                <AlertTriangle className="w-5 h-5"/>
              </div>
              Danger Zone
            </h3>
            
            <div className="bg-background/60 backdrop-blur-md border border-red-500/10 rounded-2xl p-6 flex flex-col sm:flex-row items-center justify-between gap-6 relative z-10 group-hover:border-red-500/30 transition-colors duration-300">
              <div>
                <div className="font-bold mb-2 text-red-300 tracking-tight text-lg">Delete Account</div>
                <div className="text-sm text-red-400/60 max-w-md">Permanently delete your account, workspace data, and active subscriptions. This cannot be undone.</div>
              </div>
              <button 
                onClick={handleDeleteAccount}
                className="shrink-0 px-8 py-3 bg-red-500/10 hover:bg-red-500 text-red-400 hover:text-white border border-red-500/30 hover:border-red-500 rounded-xl font-bold transition-all shadow-lg hover:shadow-[0_0_20px_rgba(239,68,68,0.4)] transform hover:-translate-y-1"
              >
                Delete Account
              </button>
            </div>
          </motion.div>
        </div>

      </div>
    </div>
  );
}
