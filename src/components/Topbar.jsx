import { Bell, Search, User, Menu, X } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { useNavigate, Link } from "react-router-dom";
import { fetchBriefs, fetchStartups } from "../lib/api";

export default function Topbar({ onMenuToggle }) {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const notifRef = useRef(null);
  const dismissedNotifsRef = useRef(new Set());

  useEffect(() => {
    function handleClickOutside(event) {
      if (notifRef.current && !notifRef.current.contains(event.target)) {
        setShowNotifications(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const removeNotification = (e, id, index) => {
    e.stopPropagation();
    if (id) {
      dismissedNotifsRef.current.add(id);
    }
    setNotifications(prev => prev.filter((n, i) => (n.id || i) !== (id || index)));
  };

  const clearAllNotifications = () => {
    notifications.forEach(n => {
      if (n.id) dismissedNotifsRef.current.add(n.id);
    });
    setNotifications([]);
  };

  useEffect(() => {
    async function loadNotifications() {
      const briefs = await fetchBriefs();
      if (briefs) {
        // Only show notifications that haven't been dismissed by the user
        const activeBriefs = briefs
          .filter(b => !dismissedNotifsRef.current.has(b.id))
          .slice(0, 3);
        setNotifications(activeBriefs);
      }
    }
    
    // Initial load
    loadNotifications();
    
    // Poll every 15 seconds to simulate "Live" notifications
    const interval = setInterval(loadNotifications, 15000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const delayDebounceFn = setTimeout(async () => {
      if (searchQuery.trim() !== "") {
        setIsSearching(true);
        const results = await fetchStartups(searchQuery);
        setSearchResults(results.slice(0, 5)); // Show top 5 preview
        setIsSearching(false);
      } else {
        setSearchResults([]);
      }
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery]);

  const handleSearch = (e) => {
    if (e.key === "Enter" && searchQuery.trim() !== "") {
      navigate(`/explore?q=${encodeURIComponent(searchQuery)}`);
      setSearchQuery(""); // Clear after searching
      setSearchResults([]);
    }
  };
  return (
    <header className="flex-none px-4 py-3 md:px-8 md:py-6 flex justify-between items-center z-10 glass-nav border-b border-white/5 rounded-t-[40px]">
      <div className="flex items-center gap-4 flex-1">
        <div className="relative w-full max-w-sm hidden sm:block">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text/40" />
        <input 
          type="search" 
          autoComplete="off"
          name="global-search"
          placeholder="Search startups, categories, or trends..." 
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onKeyDown={handleSearch}
          className="w-full bg-card/50 border border-white/10 rounded-full py-2 pl-10 pr-4 text-sm text-text placeholder:text-text/40 focus:outline-none focus:border-primary/50 transition-colors"
        />
        
        {/* Search Previews Dropdown */}
        {searchQuery.trim() !== "" && (
          <div className="absolute top-12 left-0 w-full bg-card border border-white/10 shadow-2xl shadow-primary/10 rounded-2xl overflow-hidden backdrop-blur-xl z-50">
            {isSearching ? (
              <div className="p-4 text-sm text-text/50 text-center">Searching...</div>
            ) : searchResults.length === 0 ? (
              <div className="p-4 text-sm text-text/50 text-center">No results found for "{searchQuery}"</div>
            ) : (
              <div>
                {searchResults.map((startup) => (
                  <Link
                    key={startup.id}
                    to={`/startup/${startup.id}`}
                    onClick={() => { setSearchQuery(""); setSearchResults([]); }}
                    className="flex items-center gap-3 p-3 border-b border-white/5 hover:bg-white/5 transition-colors"
                  >
                    <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center shrink-0">
                      <span className="text-primary font-bold text-xs">{startup.name.charAt(0)}</span>
                    </div>
                    <div className="overflow-hidden">
                      <div className="font-bold text-sm truncate">{startup.name}</div>
                      <div className="text-xs text-text/50 truncate">{startup.category || startup.analysis?.niche || "Unknown"}</div>
                    </div>
                  </Link>
                ))}
                <button 
                  onClick={() => { navigate(`/explore?q=${encodeURIComponent(searchQuery)}`); setSearchQuery(""); setSearchResults([]); }}
                  className="w-full p-3 text-center text-xs font-bold text-primary hover:bg-white/5 transition-colors"
                >
                  View All Results
                </button>
              </div>
            )}
          </div>
        )}
      </div>
      </div>
      
      <div className="flex items-center gap-2 md:gap-4 shrink-0">
        
        {/* Notification Container */}
        <div ref={notifRef} className="relative">
          <button 
            onClick={() => setShowNotifications(!showNotifications)}
            className="p-2 text-text/60 hover:text-text transition-colors relative"
          >
            <Bell className="w-5 h-5" />
            {notifications.length > 0 && <span className="absolute top-2 right-2 w-2 h-2 bg-primary rounded-full"></span>}
          </button>

          {showNotifications && (
            <div className="absolute top-12 right-0 w-80 bg-card border border-white/10 shadow-2xl shadow-primary/10 rounded-2xl overflow-hidden backdrop-blur-xl z-50">
              <div className="p-4 border-b border-white/5 font-bold flex justify-between items-center">
                <span>Notifications</span>
                {notifications.length > 0 && (
                  <button onClick={clearAllNotifications} className="text-xs font-normal text-text/50 hover:text-red-400 transition-colors">
                    Clear All
                  </button>
                )}
              </div>
              <div className="max-h-96 overflow-y-auto">
                {notifications.length === 0 ? (
                  <div className="p-4 text-sm text-text/50 text-center">No recent alerts.</div>
                ) : (
                  notifications.map((notif, i) => (
                    <div key={notif.id || i} className="p-4 border-b border-white/5 hover:bg-white/5 transition-colors cursor-pointer text-sm relative group">
                      <button 
                        onClick={(e) => removeNotification(e, notif.id, i)}
                        className="absolute top-4 right-4 text-text/40 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X className="w-4 h-4" />
                      </button>
                      <div className="font-bold text-primary mb-1 text-xs pr-6">New Opportunity Alert</div>
                      <div className="text-text/80 line-clamp-2 pr-4">{notif.summary}</div>
                      <div className="text-[10px] text-text/40 mt-2">{new Date(notif.date).toLocaleDateString('en-GB')}</div>
                    </div>
                  ))
                )}
              </div>
              <Link to="/briefs" onClick={() => setShowNotifications(false)} className="block p-3 text-center text-xs font-bold text-primary hover:bg-white/5 transition-colors">
                View All Intelligence
              </Link>
            </div>
          )}
        </div>

        <Link to="/profile" className="w-10 h-10 rounded-full bg-gradient-to-tr from-primary to-secondary p-[2px] cursor-pointer hover:scale-105 transition-transform block">
          <div className="w-full h-full bg-card rounded-full flex items-center justify-center">
            <User className="w-5 h-5 text-text/80" />
          </div>
        </Link>
      </div>
    </header>
  );
}
