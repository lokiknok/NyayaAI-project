import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AppLanguage, ThemeMode } from './types';
import { Navbar } from './components/Navbar';
import { LegalDisclaimerBanner } from './components/LegalDisclaimerBanner';
import { LandingPage } from './pages/LandingPage';
import { ChatPage } from './pages/ChatPage';
import { ResearchPage } from './pages/ResearchPage';
import { DocumentAssistantPage } from './pages/DocumentAssistantPage';
import { SettingsPage } from './pages/SettingsPage';
import { apiService } from './services/api';

export function App() {
  const [language, setLanguage] = useState<AppLanguage>(() => {
    return (localStorage.getItem('nyaya_lang') as AppLanguage) || 'en';
  });

  const [theme, setTheme] = useState<ThemeMode>(() => {
    return (localStorage.getItem('nyaya_theme') as ThemeMode) || 'dark';
  });

  const [isMockMode, setIsMockMode] = useState(true);

  useEffect(() => {
    localStorage.setItem('nyaya_lang', language);
  }, [language]);

  useEffect(() => {
    localStorage.setItem('nyaya_theme', theme);
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  useEffect(() => {
    apiService.getHealth().then((res) => {
      setIsMockMode(res.mock_mode);
    });
  }, []);

  const toggleTheme = () => {
    setTheme(prev => (prev === 'dark' ? 'light' : 'dark'));
  };

  return (
    <BrowserRouter>
      <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-nyaya-500 selection:text-white">
        <LegalDisclaimerBanner language={language} />
        <Navbar
          language={language}
          onLanguageChange={setLanguage}
          theme={theme}
          onThemeToggle={toggleTheme}
          isMockMode={isMockMode}
        />
        <div className="flex-1">
          <Routes>
            <Route path="/" element={<LandingPage language={language} />} />
            <Route path="/chat" element={<ChatPage language={language} onLanguageChange={setLanguage} />} />
            <Route path="/research" element={<ResearchPage language={language} />} />
            <Route path="/documents" element={<DocumentAssistantPage language={language} />} />
            <Route path="/settings" element={<SettingsPage language={language} onLanguageChange={setLanguage} theme={theme} onThemeToggle={toggleTheme} />} />
          </Routes>
        </div>
      </div>
    </BrowserRouter>
  );
}

export default App;
