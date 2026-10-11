import React from 'react';
import { Link } from 'react-router-dom';
import { 
  Scale, 
  MessageSquare, 
  BookOpen, 
  FileText, 
  ShieldCheck, 
  CheckCircle2, 
  ArrowRight, 
  ExternalLink,
  Search,
  Sparkles,
  Lock,
  Landmark
} from 'lucide-react';
import { AppLanguage } from '../types';
import { getTranslation } from '../utils/translations';

interface LandingPageProps {
  language: AppLanguage;
}

export const LandingPage: React.FC<LandingPageProps> = ({ language }) => {
  const t = getTranslation(language);

  const features = [
    {
      icon: BookOpen,
      title: t.feature_rag_title,
      description: t.feature_rag_desc,
      color: 'from-blue-500/20 to-blue-600/5',
      border: 'border-blue-500/30'
    },
    {
      icon: Scale,
      title: t.feature_bns_title,
      description: t.feature_bns_desc,
      color: 'from-amber-500/20 to-amber-600/5',
      border: 'border-amber-500/30'
    },
    {
      icon: Sparkles,
      title: t.feature_tamil_title,
      description: t.feature_tamil_desc,
      color: 'from-emerald-500/20 to-emerald-600/5',
      border: 'border-emerald-500/30'
    },
    {
      icon: FileText,
      title: t.feature_docs_title,
      description: t.feature_docs_desc,
      color: 'from-purple-500/20 to-purple-600/5',
      border: 'border-purple-500/30'
    }
  ];

  const officialLinks = [
    { name: 'India Code (Digital Law Repository)', url: 'https://www.indiacode.nic.in/', desc: 'Central & State Acts' },
    { name: 'Supreme Court of India', url: 'https://www.sci.gov.in/', desc: 'Official Judgments & Case Status' },
    { name: 'eCourts Services', url: 'https://ecourts.gov.in/', desc: 'District & High Courts Portal' },
    { name: 'e-Gazette of India', url: 'https://egazette.gov.in/', desc: 'Statutory Commencement Notifications' }
  ];

  return (
    <div className="space-y-20 pb-16">
      {/* Hero Section */}
      <section className="relative pt-12 sm:pt-20 pb-12 overflow-hidden">
        {/* Subtle background glow */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-96 h-96 bg-nyaya-gold-500/10 blur-[120px] rounded-full pointer-events-none" />
        <div className="absolute top-10 left-10 w-72 h-72 bg-blue-600/10 blur-[100px] rounded-full pointer-events-none" />

        <div className="max-w-5xl mx-auto px-4 sm:px-6 text-center relative z-10 space-y-6">
          {/* Trust badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-800/80 border border-nyaya-gold-500/30 text-nyaya-gold-400 text-xs font-medium shadow-sm">
            <Landmark className="w-4 h-4" />
            <span>Grounded on India Code, BNS 2023 & Supreme Court Precedents</span>
          </div>

          <h1 className="font-serif text-4xl sm:text-5xl lg:text-6xl font-bold text-white tracking-tight leading-tight sm:leading-tight">
            {t.hero_title}
          </h1>

          <p className="max-w-3xl mx-auto text-base sm:text-lg text-slate-300 leading-relaxed font-sans">
            {t.hero_subtitle}
          </p>

          {/* Action CTAs */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <Link
              to="/chat"
              className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-nyaya-navy-600 hover:bg-nyaya-navy-500 text-white font-medium text-sm flex items-center justify-center gap-2 shadow-lg shadow-nyaya-navy-900/50 border border-nyaya-gold-500/40 hover:border-nyaya-gold-400 transition-all group"
            >
              <MessageSquare className="w-4 h-4 text-nyaya-gold-400" />
              <span>{t.hero_cta_chat}</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
            </Link>

            <Link
              to="/research"
              className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-slate-800/80 hover:bg-slate-700/80 text-slate-200 font-medium text-sm flex items-center justify-center gap-2 border border-slate-700 hover:border-slate-600 transition-all"
            >
              <Search className="w-4 h-4 text-slate-400" />
              <span>{t.hero_cta_research}</span>
            </Link>
          </div>

          {/* Key statutory badges */}
          <div className="pt-8 flex flex-wrap items-center justify-center gap-2 text-xs text-slate-400">
            <span className="px-2.5 py-1 rounded bg-slate-800/60 border border-slate-700/60">Constitution of India</span>
            <span className="px-2.5 py-1 rounded bg-slate-800/60 border border-slate-700/60">BNS 2023 (New Penal Law)</span>
            <span className="px-2.5 py-1 rounded bg-slate-800/60 border border-slate-700/60">BNSS 2023 (Criminal Procedure)</span>
            <span className="px-2.5 py-1 rounded bg-slate-800/60 border border-slate-700/60">Indian Contract Act 1872</span>
            <span className="px-2.5 py-1 rounded bg-slate-800/60 border border-slate-700/60">Consumer Protection 2019</span>
            <span className="px-2.5 py-1 rounded bg-slate-800/60 border border-slate-700/60">IT Act 2000</span>
          </div>
        </div>
      </section>

      {/* Feature Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((f, i) => {
            const Icon = f.icon;
            return (
              <div
                key={i}
                className={`p-6 rounded-2xl bg-gradient-to-b ${f.color} bg-slate-900/60 border ${f.border} shadow-sm hover:translate-y-[-2px] transition-all`}
              >
                <div className="w-10 h-10 rounded-xl bg-slate-800/80 border border-slate-700 flex items-center justify-center mb-4 text-nyaya-gold-400">
                  <Icon className="w-5 h-5" />
                </div>
                <h3 className="font-serif font-bold text-white text-base mb-2">
                  {f.title}
                </h3>
                <p className="text-xs text-slate-300 leading-relaxed font-sans">
                  {f.description}
                </p>
              </div>
            );
          })}
        </div>
      </section>

      {/* RAG Sourcing Transparency Section */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6">
        <div className="bg-slate-900/90 rounded-2xl border border-slate-800 p-8 sm:p-10 relative overflow-hidden">
          <div className="text-center max-w-2xl mx-auto mb-10">
            <h2 className="font-serif text-2xl sm:text-3xl font-bold text-white mb-3">
              {t.how_it_works_title}
            </h2>
            <p className="text-xs sm:text-sm text-slate-400">
              Unlike generic LLMs that generate unverified opinions, NyayaAI enforces strict retrieval augmentation from official gazettes and verified judgments.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative">
            <div className="p-5 rounded-xl bg-slate-800/50 border border-slate-700/60 space-y-2">
              <div className="w-8 h-8 rounded-full bg-blue-500/20 text-blue-400 font-bold text-sm flex items-center justify-center">
                1
              </div>
              <h4 className="font-serif font-semibold text-white text-sm">
                {t.how_step1_title}
              </h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                {t.how_step1_desc}
              </p>
            </div>

            <div className="p-5 rounded-xl bg-slate-800/50 border border-slate-700/60 space-y-2">
              <div className="w-8 h-8 rounded-full bg-amber-500/20 text-amber-400 font-bold text-sm flex items-center justify-center">
                2
              </div>
              <h4 className="font-serif font-semibold text-white text-sm">
                {t.how_step2_title}
              </h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                {t.how_step2_desc}
              </p>
            </div>

            <div className="p-5 rounded-xl bg-slate-800/50 border border-slate-700/60 space-y-2">
              <div className="w-8 h-8 rounded-full bg-emerald-500/20 text-emerald-400 font-bold text-sm flex items-center justify-center">
                3
              </div>
              <h4 className="font-serif font-semibold text-white text-sm">
                {t.how_step3_title}
              </h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                {t.how_step3_desc}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Privacy and Legal Boundaries */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6">
        <div className="p-6 rounded-2xl bg-slate-900/50 border border-slate-800/80 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-1.5 max-w-2xl">
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-amber-400">
              <Lock className="w-4 h-4" />
              <span>Confidentiality & Ethics</span>
            </div>
            <h3 className="font-serif text-lg font-bold text-white">
              Data Privacy & Bar Council Alignment
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Uploaded files and queries are processed within isolated sessions and are never used to train public models. NyayaAI does not solicit clients or engage in the unauthorized practice of law under Advocates Act, 1961.
            </p>
          </div>
          <Link
            to="/settings"
            className="px-5 py-2.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-medium text-slate-200 border border-slate-700 shrink-0 transition-colors"
          >
            Review Security & Settings
          </Link>
        </div>
      </section>

      {/* Official Legal Resources Footer */}
      <footer className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 border-t border-slate-800/80 pt-10">
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h4 className="font-serif text-sm font-semibold text-slate-300">
              Official Indian Legal Portals (Public Domain)
            </h4>
            <span className="text-[11px] text-slate-500">Ministry of Law and Justice & Judiciary</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {officialLinks.map((link, idx) => (
              <a
                key={idx}
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800 hover:border-slate-700 group transition-all"
              >
                <div className="flex items-center justify-between text-xs font-medium text-slate-200 group-hover:text-nyaya-gold-400">
                  <span>{link.name}</span>
                  <ExternalLink className="w-3.5 h-3.5 opacity-60 group-hover:opacity-100" />
                </div>
                <p className="text-[11px] text-slate-500 mt-1">
                  {link.desc}
                </p>
              </a>
            ))}
          </div>

          <div className="text-center pt-6 border-t border-slate-900 text-xs text-slate-500">
            © {new Date().getFullYear()} NyayaAI • Built for Indian Legal Research & Statutory Clarity.
          </div>
        </div>
      </footer>
    </div>
  );
};

