import React, { useState, useEffect } from 'react';
import { 
  Settings, 
  Globe, 
  Cpu, 
  Send, 
  Trash2, 
  ShieldCheck, 
  CheckCircle2, 
  AlertTriangle,
  Info,
  Server,
  Database
} from 'lucide-react';
import { AppLanguage, ThemeMode, SystemStatus } from '../types';
import { getTranslation } from '../utils/translations';
import { apiService } from '../services/api';

interface SettingsPageProps {
  language: AppLanguage;
  onLanguageChange: (lang: AppLanguage) => void;
  theme: ThemeMode;
  onThemeToggle: () => void;
}

export const SettingsPage: React.FC<SettingsPageProps> = ({
  language,
  onLanguageChange,
  theme,
  onThemeToggle,
}) => {
  const t = getTranslation(language);
  const [systemStatus, setSystemStatus] = useState<SystemStatus | null>(null);
  const [showClearSuccess, setShowClearSuccess] = useState(false);

  useEffect(() => {
    apiService.getSystemSettings().then(setSystemStatus);
  }, []);

  const handleClearLocalData = () => {
    localStorage.removeItem('nyaya_conversations');
    setShowClearSuccess(true);
    setTimeout(() => setShowClearSuccess(false), 3000);
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="max-w-3xl space-y-2">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-nyaya-navy-800 border border-nyaya-gold-500/30 text-nyaya-gold-400 text-xs font-medium">
          <Settings className="w-3.5 h-3.5" />
          <span>Application Configuration & Privacy Controls</span>
        </div>
        <h1 className="font-serif text-3xl font-bold text-white tracking-tight">
          {t.settings_title}
        </h1>
        <p className="text-sm text-slate-400 font-sans">
          Configure linguistic preferences, check live AI provider readiness, and manage data sovereignty.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Language & UI Preferences */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-5 shadow-lg">
          <div className="flex items-center gap-2.5 text-white font-serif font-bold text-base">
            <Globe className="w-5 h-5 text-nyaya-gold-400" />
            <h3>{t.settings_language}</h3>
          </div>

          <p className="text-xs text-slate-400 leading-relaxed">
            NyayaAI offers native bilingual legal understanding in both English and Tamil.
          </p>

          <div className="grid grid-cols-2 gap-3 pt-1">
            <button
              onClick={() => onLanguageChange('en')}
              className={`p-3.5 rounded-xl border text-xs font-semibold flex items-center justify-between transition-all ${
                language === 'en'
                  ? 'bg-nyaya-navy-700 border-nyaya-gold-400 text-white shadow-md'
                  : 'bg-slate-800/60 border-slate-700 text-slate-300 hover:bg-slate-800'
              }`}
            >
              <span>English (Default)</span>
              {language === 'en' && <CheckCircle2 className="w-4 h-4 text-nyaya-gold-400" />}
            </button>

            <button
              onClick={() => onLanguageChange('ta')}
              className={`p-3.5 rounded-xl border text-xs font-semibold flex items-center justify-between transition-all ${
                language === 'ta'
                  ? 'bg-nyaya-navy-700 border-nyaya-gold-400 text-white shadow-md'
                  : 'bg-slate-800/60 border-slate-700 text-slate-300 hover:bg-slate-800'
              }`}
            >
              <span>தமிழ் (Tamil)</span>
              {language === 'ta' && <CheckCircle2 className="w-4 h-4 text-nyaya-gold-400" />}
            </button>
          </div>
        </div>

        {/* AI Engine & Retrieval Status (No Secrets Exposed) */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-5 shadow-lg">
          <div className="flex items-center gap-2.5 text-white font-serif font-bold text-base">
            <Cpu className="w-5 h-5 text-blue-400" />
            <h3>{t.settings_provider_status}</h3>
          </div>

          <div className="space-y-2.5 text-xs">
            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-800/50 border border-slate-800">
              <span className="text-slate-400">Configured AI Adapter:</span>
              <span className="font-semibold text-white capitalize">
                {systemStatus?.ai_provider || 'Mock / Hosted Provider'}
              </span>
            </div>

            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-800/50 border border-slate-800">
              <span className="text-slate-400">Target Model:</span>
              <span className="font-mono text-nyaya-gold-400">
                {systemStatus?.ai_model || 'gpt-4o-mini / gemini-1.5'}
              </span>
            </div>

            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-800/50 border border-slate-800">
              <span className="text-slate-400">RAG Vector Index:</span>
              <span className="text-emerald-400 font-semibold flex items-center gap-1.5">
                <Database className="w-3.5 h-3.5" />
                <span>{systemStatus?.database_type || 'SQLite Vector'} ({systemStatus?.total_sources_indexed || 7} Sources)</span>
              </span>
            </div>

            <div className="p-2.5 rounded-lg bg-blue-950/30 border border-blue-800/40 text-[11px] text-blue-300">
              ✓ API keys are securely guarded in backend environment variables and never exposed to the client.
            </div>
          </div>
        </div>

        {/* Telegram Bot Instructions */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4 shadow-lg">
          <div className="flex items-center gap-2.5 text-white font-serif font-bold text-base">
            <Send className="w-5 h-5 text-sky-400" />
            <h3>{t.settings_telegram_status}</h3>
          </div>

          <p className="text-xs text-slate-300 leading-relaxed">
            NyayaAI includes a standalone Telegram bot for instant statutory research on mobile devices.
          </p>

          <div className="bg-slate-800/60 p-4 rounded-xl border border-slate-800 space-y-2 text-xs">
            <h4 className="font-semibold text-nyaya-gold-400">How to connect your Telegram bot:</h4>
            <ol className="list-decimal list-inside space-y-1 text-slate-300">
              <li>Message <strong className="text-white">@BotFather</strong> on Telegram and create a new bot.</li>
              <li>Copy the HTTP API token.</li>
              <li>Paste it into <code className="text-nyaya-gold-400 font-mono">.env</code> as <code className="text-nyaya-gold-400 font-mono">TELEGRAM_BOT_TOKEN=...</code></li>
              <li>Run the bot service: <code className="text-white bg-slate-900 px-1.5 py-0.5 rounded">python -m app.telegram.bot</code></li>
            </ol>
          </div>

          <div className="flex items-center gap-2 text-xs text-slate-400">
            <div className={`w-2.5 h-2.5 rounded-full ${systemStatus?.telegram_bot_active ? 'bg-emerald-400' : 'bg-amber-400'}`} />
            <span>
              Bot Status: {systemStatus?.telegram_bot_active ? 'Online & Polling' : 'Configured via .env'}
            </span>
          </div>
        </div>

        {/* Data Privacy & Deletion Controls */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4 shadow-lg">
          <div className="flex items-center gap-2.5 text-white font-serif font-bold text-base">
            <ShieldCheck className="w-5 h-5 text-emerald-400" />
            <h3>{t.settings_privacy_notice}</h3>
          </div>

          <p className="text-xs text-slate-300 leading-relaxed">
            Your conversational history is stored strictly in your browser session for privacy. You can permanently wipe all cached queries at any time.
          </p>

          <button
            onClick={handleClearLocalData}
            className="w-full py-3 px-4 rounded-xl bg-rose-950/40 hover:bg-rose-900/60 border border-rose-800/60 text-rose-200 text-xs font-semibold flex items-center justify-center gap-2 transition-all"
          >
            <Trash2 className="w-4 h-4 text-rose-400" />
            <span>Wipe Local Conversations & Cached Data</span>
          </button>

          {showClearSuccess && (
            <div className="p-2.5 rounded-lg bg-emerald-950/40 border border-emerald-800/40 text-emerald-300 text-xs text-center">
              ✓ Local chat history cleared successfully.
            </div>
          )}
        </div>
      </div>

      {/* Statutory Legal Disclaimer Section */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 space-y-3">
        <h4 className="font-serif font-bold text-white text-sm flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-amber-400" />
          <span>Statutory Disclaimer (Advocates Act, 1961)</span>
        </h4>
        <p className="text-xs text-slate-400 leading-relaxed font-sans">
          NyayaAI is an educational and statutory research technological tool. Under the Bar Council of India Rules and the Advocates Act, 1961, automated systems do not constitute advocates or solicit professional employment. The outputs generated by the retrieval-augmented generation engine reflect public domain statutory materials and court records and should not be construed as verified legal advice or guarantees of judicial outcome.
        </p>
      </div>
    </div>
  );
};

