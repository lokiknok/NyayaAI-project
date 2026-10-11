import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Scale, MessageSquare, BookOpen, FileText, Settings, Globe, ShieldCheck } from 'lucide-react';
import { AppLanguage, ThemeMode } from '../types';
import { getTranslation } from '../utils/translations';

interface NavbarProps {
  language: AppLanguage;
  onLanguageChange: (lang: AppLanguage) => void;
  theme: ThemeMode;
  onThemeToggle: () => void;
  isMockMode?: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({
  language,
  onLanguageChange,
  theme,
  onThemeToggle,
  isMockMode = true
}) => {
  const location = useLocation();
  const t = getTranslation(language);

  const navLinks = [
    { to: '/', label: t.nav_home, icon: Scale },
    { to: '/chat', label: t.nav_chat, icon: MessageSquare },
    { to: '/research', label: t.nav_research, icon: BookOpen },
    { to: '/documents', label: t.nav_documents, icon: FileText },
    { to: '/settings', label: t.nav_settings, icon: Settings },
  ];

  return (
    <header className="sticky top-0 z-50 bg-slate-900/90 backdrop-blur-md border-b border-slate-800 text-slate-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand */}
        <Link to="/" className="flex items-center gap-3 group">
          <div className="w-10 h-10 rounded-lg bg-nyaya-navy-700 border border-nyaya-gold-500/40 flex items-center justify-center text-nyaya-gold-500 shadow-sm group-hover:border-nyaya-gold-500 transition-colors">
            <Scale className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-serif font-bold text-lg tracking-wide text-white group-hover:text-nyaya-gold-400 transition-colors">
                {t.app_name}
              </span>
              {isMockMode && (
                <span className="text-[10px] uppercase font-semibold px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20">
                  Simulated RAG
                </span>
              )}
            </div>
            <p className="text-[11px] text-slate-400 font-sans tracking-tight hidden sm:block">
              {t.app_tagline}
            </p>
          </div>
        </Link>

        {/* Navigation items */}
        <nav className="hidden md:flex items-center gap-1">
          {navLinks.map((link) => {
            const Icon = link.icon;
            const isActive = location.pathname === link.to;
            return (
              <Link
                key={link.to}
                to={link.to}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-nyaya-navy-700 text-nyaya-gold-400 border border-nyaya-gold-500/30 shadow-inner'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-nyaya-gold-400' : 'text-slate-400'}`} />
                {link.label}
              </Link>
            );
          })}
        </nav>

        {/* Controls: Language, Theme, Status */}
        <div className="flex items-center gap-3">
          {/* Language Switcher */}
          <div className="flex items-center bg-slate-800/80 p-0.5 rounded-lg border border-slate-700/60 text-xs font-medium">
            <button
              onClick={() => onLanguageChange('en')}
              className={`px-2.5 py-1 rounded-md transition-all ${
                language === 'en'
                  ? 'bg-nyaya-navy-600 text-white shadow-sm font-semibold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              EN
            </button>
            <button
              onClick={() => onLanguageChange('ta')}
              className={`px-2.5 py-1 rounded-md transition-all ${
                language === 'ta'
                  ? 'bg-nyaya-navy-600 text-white shadow-sm font-semibold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              தமிழ்
            </button>
          </div>

          {/* Quick link badge */}
          <div className="hidden lg:flex items-center gap-1.5 text-xs text-slate-400 bg-slate-800/40 px-2.5 py-1 rounded-full border border-slate-800">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>India Code Grounded</span>
          </div>
        </div>
      </div>

      {/* Mobile nav bar */}
      <div className="md:hidden border-t border-slate-800/80 bg-slate-900/95 px-2 py-1.5 flex justify-around">
        {navLinks.map((link) => {
          const Icon = link.icon;
          const isActive = location.pathname === link.to;
          return (
            <Link
              key={link.to}
              to={link.to}
              className={`flex flex-col items-center gap-0.5 px-2 py-1 rounded text-[11px] font-medium ${
                isActive ? 'text-nyaya-gold-400' : 'text-slate-400'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{link.label}</span>
            </Link>
          );
        })}
      </div>
    </header>
  );
};

