import Sidebar from "./Sidebar";
import Topbar from "./Topbar";
import BottomNav from "./BottomNav";
import { useLocation } from "react-router-dom";
export default function Layout({ children }) {
  const location = useLocation();
  const isCopilot = location.pathname.startsWith("/copilot");

  return (
    <div className="flex h-screen overflow-hidden bg-background text-text selection:bg-primary/30 relative">
      <div className="hidden md:flex p-4">
        <Sidebar />
      </div>
      <div className="flex-1 flex flex-col relative overflow-hidden h-full rounded-[40px] md:my-4 md:mr-4 glass-card bg-transparent shadow-none border-none">
        {/* Ambient background glows */}
        <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] rounded-full bg-primary/10 blur-[120px] pointer-events-none" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] rounded-full bg-secondary/10 blur-[120px] pointer-events-none" />
        
        <Topbar />
        <main className="flex-1 w-full overflow-hidden flex flex-col h-full relative">
          <div className={`flex-1 w-full h-full pb-24 md:pb-8 ${isCopilot ? 'flex flex-col' : 'overflow-y-auto p-4 md:p-8'}`}>
            {children}
          </div>
        </main>
      </div>

      <BottomNav />

    </div>
  );
}
