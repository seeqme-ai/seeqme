import React, { createContext, useContext, useState, ReactNode } from 'react';

type Theme = 'light' | 'dark';

interface TemplateContextType {
  selectedTemplateId: string;
  setSelectedTemplateId: (id: string) => void;
  synthesisInput: string;
  setSynthesisInput: (input: string) => void;
  theme: Theme;
  setTheme: (theme: Theme) => void;
}

const TemplateContext = createContext<TemplateContextType | undefined>(undefined);

export const TemplateProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>('');
  const [synthesisInput, setSynthesisInput] = useState<string>('');
  const [theme, setTheme] = useState<Theme>('light');

  return (
    <TemplateContext.Provider value={{
      selectedTemplateId,
      setSelectedTemplateId,
      synthesisInput,
      setSynthesisInput,
      theme,
      setTheme
    }}>
      {children}
    </TemplateContext.Provider>
  );
};

export const useTemplate = () => {
  const context = useContext(TemplateContext);
  if (!context) {
    throw new Error('useTemplate must be used within a TemplateProvider');
  }
  return context;
};
