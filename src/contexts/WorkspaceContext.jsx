import React, { createContext, useContext, useState, useEffect } from 'react';

const WorkspaceContext = createContext();

export function WorkspaceProvider({ children }) {
  const [savedStartups, setSavedStartups] = useState([]);
  const [validatedIdeas, setValidatedIdeas] = useState([]);

  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem('buildwatch_savedStartups')) || [];
      const ideas = JSON.parse(localStorage.getItem('buildwatch_validatedIdeas')) || [];
      setSavedStartups(saved);
      setValidatedIdeas(ideas);
    } catch (e) {
      console.error("Failed to load workspace data:", e);
    }
  }, []);

  const toggleSaveStartup = (id) => {
    setSavedStartups(prev => {
      const newSaved = prev.includes(id) ? prev.filter(s => s !== id) : [...prev, id];
      localStorage.setItem('buildwatch_savedStartups', JSON.stringify(newSaved));
      return newSaved;
    });
  };

  const addValidatedIdea = (id) => {
    setValidatedIdeas(prev => {
      if (prev.includes(id)) return prev;
      const newIdeas = [id, ...prev];
      localStorage.setItem('buildwatch_validatedIdeas', JSON.stringify(newIdeas));
      return newIdeas;
    });
  };

  const isStartupSaved = (id) => savedStartups.includes(id);

  return (
    <WorkspaceContext.Provider value={{
      savedStartups,
      validatedIdeas,
      toggleSaveStartup,
      addValidatedIdea,
      isStartupSaved
    }}>
      {children}
    </WorkspaceContext.Provider>
  );
}

export function useWorkspace() {
  return useContext(WorkspaceContext);
}
