import { Link, useLocation, useNavigate } from "react-router-dom";
import { LayoutDashboard, Compass, TrendingUp, Lightbulb, Zap, History, Target, BarChart2, BookOpen, FlaskConical, Crown, FolderHeart, Newspaper, Bot, X } from "lucide-react";
import { cn } from "../lib/utils";
import { usePro } from "../contexts/ProContext";
import { useAuth } from "../contexts/AuthContext";

const navItems = [
  { name: "Dashboard", path: "/", icon: LayoutDashboard },
  { name: "AI Copilot", path: "/copilot", icon: Bot },
  { name: "My Workspace", path: "/workspace", icon: FolderHeart },
  { name: "Intelligence Feed", path: "/briefs", icon: Newspaper },
  { name: "Explorer", path: "/explore", icon: Compass },
  { name: "Trend Radar", path: "/trends", icon: TrendingUp },
  { name: "Niche Reports", path: "/niches", icon: BookOpen },
  { name: "Opportunity Lab", path: "/lab", icon: Lightbulb },
  { name: "Analysis History", path: "/history", icon: History },
];

export default function Sidebar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { isPro } = usePro();
  const { user } = useAuth();

  return (
    <div className="w-[280px] h-full glass-card flex flex-col p-5 overflow-hidden">
      <div className="flex items-center gap-3 px-2 py-4 mb-8">
        <div className="bg-primary/20 p-2.5 rounded-xl border border-primary/50 shadow-[inset_0_1px_1px_rgba(255,255,255,0.2)]">
          <Zap className="w-6 h-6 text-primary" />
        </div>
        <span className="text-xl font-bold text-text tracking-tight">IdeaLab <span className="text-primary">AI</span></span>
      </div>
      
      <nav className="flex-1 space-y-2">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.name}
              to={item.path}
              className={cn(
                "flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300",
                isActive 
                  ? "bg-primary/10 text-primary font-medium border border-primary/20 shadow-[0_0_15px_rgba(99,102,241,0.1)]" 
                  : "text-text/70 hover:bg-white/5 hover:text-text"
              )}
            >
              <item.icon className={cn("w-5 h-5", isActive ? "text-primary" : "text-text/50")} />
              {item.name}
            </Link>
          );
        })}
      </nav>

      {isPro ? (
        <div className="mt-auto p-4 rounded-xl bg-gradient-to-br from-success/10 to-transparent border border-success/20">
          <div className="text-sm font-bold text-success flex items-center gap-2 mb-1"><Crown className="w-4 h-4" /> Founder Pro</div>
          <div className="text-xs text-success/70">All features unlocked.</div>
        </div>
      ) : (
        <div className="mt-auto p-4 rounded-xl bg-gradient-to-br from-primary/10 to-secondary/10 border border-white/5">
          <div className="text-sm font-bold mb-1">Founder Pro</div>
          <div className="text-xs text-text/60 mb-3">Unlimited idea validation & deep niche reports.</div>
          <button 
            onClick={() => navigate('/pricing')}
            className="w-full py-2 bg-primary hover:bg-primary/90 text-white text-sm font-bold rounded-lg transition-colors shadow-lg shadow-primary/20 flex justify-center items-center gap-2"
          >
            <Zap className="w-4 h-4" /> Upgrade Now
          </button>
        </div>
      )}

      {/* Profile Section */}
      <Link to={user ? "/profile" : "/auth"} className="mt-4 pt-4 border-t border-white/5 flex items-center gap-3 px-2 cursor-pointer hover:bg-white/5 p-2 rounded-xl transition-colors">
        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center font-bold text-white shadow-lg shrink-0">
          {user ? user.email.charAt(0).toUpperCase() : 'G'}
        </div>
        <div className="flex-1 overflow-hidden">
          <div className="font-bold text-sm truncate">{user ? 'Founder' : 'Guest'}</div>
          <div className="text-xs text-text/50 truncate">{user ? user.email : 'Sign In / Register'}</div>
        </div>
      </Link>
    </div>
  );
}
