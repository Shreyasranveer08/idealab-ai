import { useState } from 'react';
import { supabase } from '../lib/supabase';
import { motion } from 'framer-motion';
import { Lock, Mail, Sparkles, AlertCircle } from 'lucide-react';
import { Navigate, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export default function Auth() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLogin, setIsLogin] = useState(true);
  const [isResetMode, setIsResetMode] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [message, setMessage] = useState(null);

  const { user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const from = location.state?.from?.pathname || '/workspace';

  if (user) {
    return <Navigate to={from} replace />;
  }

  const handleAuth = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setMessage(null);

    try {
      const normalizedEmail = email.trim().toLowerCase();
      
      if (isResetMode) {
        const { error } = await supabase.auth.resetPasswordForEmail(normalizedEmail, {
          redirectTo: window.location.origin + '/profile',
        });
        if (error) throw error;
        setMessage('Password reset link sent! Check your email.');
        setIsResetMode(false);
      } else if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({
          email: normalizedEmail,
          password,
        });
        if (error) throw error;
        navigate(from, { replace: true });
      } else {
        const { error } = await supabase.auth.signUp({
          email: normalizedEmail,
          password,
        });
        if (error) throw error;
        setMessage('Registration successful! You can now log in.');
        setIsLogin(true);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-background text-text flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background Ambience */}
      <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] rounded-full bg-primary/10 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] rounded-full bg-secondary/10 blur-[120px] pointer-events-none" />
      
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md glass-card p-8 relative overflow-hidden"
      >
        <div className="absolute top-[-50%] left-[-50%] w-[200%] h-[200%] bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-primary/10 via-transparent to-transparent pointer-events-none" />
        
        <motion.div 
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 200, damping: 20 }}
          className="relative z-10 flex flex-col items-center mb-8"
        >
          <motion.div 
            whileHover={{ rotate: 180 }}
            transition={{ duration: 0.5 }}
            className="bg-primary/20 p-4 rounded-2xl mb-4 border border-primary/30 shadow-[0_0_20px_rgba(99,102,241,0.3)]"
          >
            <Sparkles className="w-8 h-8 text-primary" />
          </motion.div>
          <h1 className="text-3xl font-black text-center tracking-tight">
            {isResetMode ? 'Reset Password' : isLogin ? 'Welcome Back' : 'Create Account'}
          </h1>
          <p className="text-text/50 text-center mt-2 max-w-xs">
            {isResetMode 
              ? 'Enter your email address and we will send you a link to reset your password.' 
              : isLogin 
                ? 'Enter your credentials to access your workspace.' 
                : 'Sign up to start saving and validating ideas.'}
          </p>
        </motion.div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/50 text-red-400 p-4 rounded-xl flex items-start gap-3 mb-6">
            <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
            <p className="text-sm">{error}</p>
          </div>
        )}

        {message && (
          <div className="bg-green-500/10 border border-green-500/50 text-green-400 p-4 rounded-xl flex items-start gap-3 mb-6">
            <Sparkles className="w-5 h-5 shrink-0 mt-0.5" />
            <p className="text-sm">{message}</p>
          </div>
        )}

        <form onSubmit={handleAuth} className="space-y-5 relative z-10">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
          >
            <label className="block text-sm font-bold text-text/80 mb-2">Email Address</label>
            <div className="relative group">
              <div className="absolute left-3 top-1/2 -translate-y-1/2 w-8 h-8 bg-white/5 rounded-lg flex items-center justify-center group-focus-within:bg-primary/20 group-focus-within:text-primary transition-colors">
                <Mail className="w-4 h-4 text-text/60 group-focus-within:text-primary transition-colors" />
              </div>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-background/50 border border-white/10 rounded-xl py-3 pl-14 pr-4 focus:outline-none focus:border-primary/50 focus:bg-card focus:shadow-[0_0_20px_rgba(99,102,241,0.15)] transition-all"
                placeholder="founder@startup.io"
              />
            </div>
          </motion.div>
          
          
          {!isResetMode && (
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
            >
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-bold text-text/80">Password</label>
                {isLogin && (
                  <button 
                    type="button"
                    onClick={() => { setIsResetMode(true); setError(null); setMessage(null); }}
                    className="text-xs text-primary hover:underline"
                  >
                    Forgot Password?
                  </button>
                )}
              </div>
              <div className="relative group">
                <div className="absolute left-3 top-1/2 -translate-y-1/2 w-8 h-8 bg-white/5 rounded-lg flex items-center justify-center group-focus-within:bg-primary/20 group-focus-within:text-primary transition-colors">
                  <Lock className="w-4 h-4 text-text/60 group-focus-within:text-primary transition-colors" />
                </div>
                <input
                  type="password"
                  required={!isResetMode}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-background/50 border border-white/10 rounded-xl py-3 pl-14 pr-4 focus:outline-none focus:border-primary/50 focus:bg-card focus:shadow-[0_0_20px_rgba(99,102,241,0.15)] transition-all"
                  placeholder="••••••••"
                />
              </div>
            </motion.div>
          )}

          <motion.button
            type="submit"
            disabled={loading}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            whileHover={{ scale: 1.02, boxShadow: "0 10px 25px -5px rgba(99, 102, 241, 0.5)" }}
            whileTap={{ scale: 0.98 }}
            className="w-full bg-gradient-to-r from-primary to-secondary text-white font-bold py-3.5 rounded-xl transition-all disabled:opacity-50 mt-6 shadow-[0_0_15px_rgba(99,102,241,0.3)] relative overflow-hidden"
          >
            <span className="relative z-10 flex items-center justify-center gap-2">
              {loading 
                ? 'Processing...' 
                : isResetMode 
                  ? 'Send Reset Link' 
                  : isLogin 
                    ? 'Sign In to Workspace' 
                    : 'Create Free Account'}
            </span>
          </motion.button>
        </form>

        <div className="mt-6 text-center relative z-10">
          <p className="text-sm text-text/60">
            {isResetMode ? (
              <>
                Remembered your password?{' '}
                <button 
                  onClick={() => setIsResetMode(false)}
                  className="text-primary hover:underline font-medium"
                >
                  Back to Sign In
                </button>
              </>
            ) : isLogin ? (
              <>
                Don't have an account?{' '}
                <button 
                  onClick={() => { setIsLogin(false); setError(null); setMessage(null); }}
                  className="text-primary hover:underline font-medium"
                >
                  Sign Up
                </button>
              </>
            ) : (
              <>
                Already have an account?{' '}
                <button 
                  onClick={() => { setIsLogin(true); setError(null); setMessage(null); }}
                  className="text-primary hover:underline font-medium"
                >
                  Sign In
                </button>
              </>
            )}
          </p>
        </div>
      </motion.div>
    </div>
  );
}
