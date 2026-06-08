import React, { createContext, useContext, useState, useEffect } from 'react';

const ProContext = createContext();

export function ProProvider({ children }) {
  const [isPro, setIsPro] = useState(false);
  const [labUsageCount, setLabUsageCount] = useState(0);
  const [nicheReportUsageCount, setNicheReportUsageCount] = useState(0);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);

  // Load from LocalStorage
  useEffect(() => {
    const proStatus = localStorage.getItem('buildwatch_isPro') === 'true';
    const labUsage = parseInt(localStorage.getItem('buildwatch_labUsage')) || 0;
    const nicheUsage = parseInt(localStorage.getItem('buildwatch_nicheUsage')) || 0;
    
    setIsPro(proStatus);
    setLabUsageCount(labUsage);
    setNicheReportUsageCount(nicheUsage);
  }, []);

  // Save changes
  useEffect(() => {
    localStorage.setItem('buildwatch_isPro', isPro);
    localStorage.setItem('buildwatch_labUsage', labUsageCount);
    localStorage.setItem('buildwatch_nicheUsage', nicheReportUsageCount);
  }, [isPro, labUsageCount, nicheReportUsageCount]);

  const triggerUpgrade = () => {
    setShowUpgradeModal(true);
  };

  const closeUpgrade = () => {
    setShowUpgradeModal(false);
  };

  const upgradeToPro = () => {
    setIsPro(true);
    setShowUpgradeModal(false);
  };

  const incrementLabUsage = () => {
    setLabUsageCount(prev => prev + 1);
  };

  const incrementNicheUsage = () => {
    setNicheReportUsageCount(prev => prev + 1);
  };

  const canUseLab = isPro || labUsageCount < 3;
  const canUseNicheReports = isPro || nicheReportUsageCount < 1;

  return (
    <ProContext.Provider value={{
      isPro,
      labUsageCount,
      nicheReportUsageCount,
      canUseLab,
      canUseNicheReports,
      triggerUpgrade,
      closeUpgrade,
      upgradeToPro,
      incrementLabUsage,
      incrementNicheUsage,
      showUpgradeModal
    }}>
      {children}
    </ProContext.Provider>
  );
}

export function usePro() {
  return useContext(ProContext);
}
