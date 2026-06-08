import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Layout from "./components/Layout";
import Dashboard from "./pages/Dashboard";
import StartupExplorer from "./pages/StartupExplorer";
import TrendRadar from "./pages/TrendRadar";
import OpportunityLab from "./pages/OpportunityLab";
import AnalysisHistory from "./pages/AnalysisHistory";
import StartupDetail from "./pages/StartupDetail";
import NicheReports from "./pages/NicheReports";
import Pricing from "./pages/Pricing";
import Workspace from "./pages/Workspace";
import DailyBriefs from "./pages/DailyBriefs";
import { ProProvider } from "./contexts/ProContext";
import { WorkspaceProvider } from "./contexts/WorkspaceContext";
import UpgradeModal from "./components/UpgradeModal";
import Profile from "./pages/Profile";
import Copilot from "./pages/Copilot";
import Auth from "./pages/Auth";
import { AuthProvider } from "./contexts/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";
import { Toaster } from "react-hot-toast";
import IntroAnimation from "./components/IntroAnimation";
import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

function App() {
  const [showIntro, setShowIntro] = useState(true);

  return (
    <AuthProvider>
    <WorkspaceProvider>
    <ProProvider>
      <Router>
        {/* Splash Screen */}
        <AnimatePresence>
          {showIntro && <IntroAnimation key="intro" onComplete={() => setShowIntro(false)} />}
        </AnimatePresence>

        {/* Main App Content - Fades in after intro */}
        {!showIntro && (
          <motion.div 
            initial={{ opacity: 0, filter: "blur(10px)", scale: 0.95 }}
            animate={{ opacity: 1, filter: "blur(0px)", scale: 1 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="h-full w-full absolute inset-0"
          >
            <div className="bg-watery-animated">
              <div className="absolute inset-0 bg-gradient-to-b from-transparent to-[#050b14]/80 pointer-events-none" />
            </div>
            <Toaster 
          position="top-right"
          toastOptions={{
            style: {
              background: '#1e293b',
              color: '#f8fafc',
              border: '1px solid rgba(255,255,255,0.1)',
            },
            success: {
              iconTheme: { primary: '#10b981', secondary: '#1e293b' },
            },
          }} 
        />
        <Routes>
          {/* Full Screen Auth Route */}
          <Route path="/auth" element={<Auth />} />

          {/* App Routes wrapped in Layout */}
          <Route path="*" element={
            <Layout>
              <UpgradeModal />
              <Routes>
                {/* Public Routes */}
                <Route path="/" element={<Dashboard />} />
                <Route path="/explore" element={<StartupExplorer />} />
                <Route path="/startup/:id" element={<StartupDetail />} />
                <Route path="/trends" element={<TrendRadar />} />
                <Route path="/lab" element={<OpportunityLab />} />
                <Route path="/history" element={<AnalysisHistory />} />
                <Route path="/niches" element={<NicheReports />} />
                <Route path="/pricing" element={<Pricing />} />
                <Route path="/briefs" element={<DailyBriefs />} />

                {/* Protected Routes */}
                <Route path="/workspace" element={
                  <ProtectedRoute>
                    <Workspace />
                  </ProtectedRoute>
                } />
                <Route path="/profile" element={
                  <ProtectedRoute>
                    <Profile />
                  </ProtectedRoute>
                } />
                <Route path="/copilot" element={
                  <ProtectedRoute>
                    <Copilot />
                  </ProtectedRoute>
                } />
              </Routes>
            </Layout>
          } />
        </Routes>
        </motion.div>
        )}
      </Router>
    </ProProvider>
    </WorkspaceProvider>
    </AuthProvider>
  );
}

export default App;
