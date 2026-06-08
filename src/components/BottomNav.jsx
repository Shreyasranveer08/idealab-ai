import { Link, useLocation } from "react-router-dom";
import { LayoutDashboard, Compass, TrendingUp, Lightbulb, Zap, History, Target, BookOpen, Newspaper, Bot } from "lucide-react";
import { cn } from "../lib/utils";

const mobileNavItems = [
  { name: "Feed", path: "/", icon: LayoutDashboard },
  { name: "Copilot", path: "/copilot", icon: Bot },
  { name: "Briefs", path: "/briefs", icon: Newspaper },
  { name: "Explore", path: "/explore", icon: Compass },
  { name: "Lab", path: "/lab", icon: Lightbulb },
];

export default function BottomNav() {
  const location = useLocation();

  return (
    <div className="md:hidden fixed bottom-0 left-0 w-full z-50 px-4 pb-6 pt-2">
      <div className="glass-nav rounded-[32px] flex items-center justify-around p-2">
        {mobileNavItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.name}
              to={item.path}
              className={cn(
                "flex flex-col items-center justify-center w-14 h-14 rounded-2xl transition-all duration-300 relative",
                isActive ? "text-primary" : "text-text/50 hover:text-text/80"
              )}
            >
              {isActive && (
                <div className="absolute inset-0 bg-primary/10 rounded-2xl border border-primary/20 shadow-[inset_0_1px_1px_rgba(255,255,255,0.1)]"></div>
              )}
              <item.icon className="w-5 h-5 mb-1 z-10" />
              <span className="text-[10px] font-medium z-10">{item.name}</span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
