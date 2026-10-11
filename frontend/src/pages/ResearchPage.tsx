import React, { useState, useEffect } from 'react';
import { 
  Search, 
  BookOpen, 
  Scale, 
  Calendar, 
  ExternalLink, 
  Filter, 
  X, 
  FileCheck,
  ChevronRight,
  Landmark
} from 'lucide-react';
import { AppLanguage, LegalSourceItem } from '../types';
import { getTranslation } from '../utils/translations';
import { apiService } from '../services/api';
import { LoadingSkeleton } from '../components/LoadingSkeleton';

interface ResearchPageProps {
  language: AppLanguage;
}

export const ResearchPage: React.FC<ResearchPageProps> = ({ language }) => {
  const t = getTranslation(language);
  const [query, setQuery] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [sources, setSources] = useState<LegalSourceItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedSource, setSelectedSource] = useState<LegalSourceItem | null>(null);

  const fetchSources = async (searchQuery: string, type: string) => {
    setIsLoading(true);
    try {
      const results = await apiService.searchLegalSources(searchQuery, type);
      setSources(results);
    } catch {
      setSources([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSources(query, filterType);
  }, [filterType]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchSources(query, filterType);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="max-w-3xl space-y-2">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-nyaya-navy-800 border border-nyaya-gold-500/30 text-nyaya-gold-400 text-xs font-medium">
          <BookOpen className="w-3.5 h-3.5" />
          <span>India Code & Supreme Court Repository</span>
        </div>
        <h1 className="font-serif text-3xl font-bold text-white tracking-tight">
          {t.research_title}
        </h1>
        <p className="text-sm text-slate-400 font-sans">
          {t.research_subtitle}
        </p>
      </div>

      {/* Search & Filter Bar */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-5 shadow-lg space-y-4">
        <form onSubmit={handleSearchSubmit} className="flex gap-2">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={t.research_search_placeholder}
              className="w-full bg-slate-800/80 border border-slate-700/80 rounded-xl pl-10 pr-4 py-3 text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-nyaya-gold-500 transition-colors"
            />
          </div>
          <button
            type="submit"
            className="px-6 py-3 rounded-xl bg-nyaya-navy-600 hover:bg-nyaya-navy-500 text-white text-xs sm:text-sm font-semibold transition-all shadow-md shrink-0 border border-nyaya-gold-500/30"
          >
            Search
          </button>
        </form>

        {/* Filter Pills */}
        <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-slate-800/80">
          <span className="text-xs text-slate-500 flex items-center gap-1.5 mr-2">
            <Filter className="w-3.5 h-3.5" />
            <span>Category:</span>
          </span>

          <button
            onClick={() => setFilterType('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              filterType === 'all'
                ? 'bg-nyaya-navy-700 text-nyaya-gold-400 border border-nyaya-gold-500/40 shadow-sm'
                : 'bg-slate-800/60 text-slate-400 hover:text-slate-200 hover:bg-slate-800'
            }`}
          >
            {t.research_filter_all}
          </button>

          <button
            onClick={() => setFilterType('statute')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center gap-1.5 ${
              filterType === 'statute'
                ? 'bg-blue-900/40 text-blue-300 border border-blue-500/40 shadow-sm'
                : 'bg-slate-800/60 text-slate-400 hover:text-slate-200 hover:bg-slate-800'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            {t.research_filter_statute}
          </button>

          <button
            onClick={() => setFilterType('judgment')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center gap-1.5 ${
              filterType === 'judgment'
                ? 'bg-amber-900/40 text-amber-300 border border-amber-500/40 shadow-sm'
                : 'bg-slate-800/60 text-slate-400 hover:text-slate-200 hover:bg-slate-800'
            }`}
          >
            <Scale className="w-3.5 h-3.5" />
            {t.research_filter_judgment}
          </button>
        </div>
      </div>

      {/* Results Count & Grid */}
      <div className="space-y-4">
        <div className="flex items-center justify-between text-xs text-slate-400 px-1">
          <span>
            Found <strong className="text-white">{sources.length}</strong> indexed legal authorities
          </span>
          <span>Categorized by Jurisdiction & Statutory Type</span>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <LoadingSkeleton type="card" />
            <LoadingSkeleton type="card" />
            <LoadingSkeleton type="card" />
            <LoadingSkeleton type="card" />
          </div>
        ) : sources.length === 0 ? (
          /* Empty state */
          <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-12 text-center max-w-lg mx-auto space-y-3">
            <div className="w-12 h-12 rounded-xl bg-slate-800 text-slate-500 flex items-center justify-center mx-auto">
              <BookOpen className="w-6 h-6" />
            </div>
            <h3 className="font-serif font-bold text-white text-base">No Matching Legal Authorities Found</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              No acts, sections, or judicial precedents matched your search keywords. Try searching for &ldquo;Contract&rdquo;, &ldquo;BNS&rdquo;, &ldquo;Bail&rdquo;, &ldquo;Article 21&rdquo;, or &ldquo;Consumer&rdquo;.
            </p>
          </div>
        ) : (
          /* Cards Grid */
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {sources.map((item) => {
              const isStatute = item.document_type === 'statute';
              return (
                <div
                  key={item.id}
                  className="bg-slate-900/80 border border-slate-800 hover:border-nyaya-gold-500/40 rounded-2xl p-5 flex flex-col justify-between transition-all duration-200 hover:shadow-md group"
                >
                  <div className="space-y-3">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-2">
                        <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded ${
                          isStatute 
                            ? 'bg-blue-900/40 text-blue-300 border border-blue-700/40' 
                            : 'bg-amber-900/40 text-amber-300 border border-amber-700/40'
                        }`}>
                          {isStatute ? 'Statute / Act' : 'Judicial Precedent'}
                        </span>
                        {item.publication_date && (
                          <span className="text-[11px] text-slate-500 flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            {item.publication_date}
                          </span>
                        )}
                      </div>

                      {item.source_url && (
                        <a
                          href={item.source_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-slate-400 hover:text-nyaya-gold-400 p-1 transition-colors"
                          title="Open official portal"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                        </a>
                      )}
                    </div>

                    <h3 className="font-serif font-bold text-white text-base group-hover:text-nyaya-gold-400 transition-colors">
                      {item.title}
                    </h3>

                    <div className="flex items-center gap-2 text-xs text-slate-400">
                      <Landmark className="w-3.5 h-3.5 text-nyaya-gold-500/70 shrink-0" />
                      <span>{item.court || item.act_name}</span>
                      <span>•</span>
                      <span className="text-slate-500">{item.jurisdiction}</span>
                    </div>

                    <p className="text-xs text-slate-300 line-clamp-3 leading-relaxed font-sans">
                      {item.summary}
                    </p>
                  </div>

                  {/* View Details Action */}
                  <div className="pt-4 mt-4 border-t border-slate-800 flex items-center justify-between text-xs">
                    {item.effective_date && (
                      <span className="text-[11px] text-emerald-400/90 font-medium">
                        Effective: {item.effective_date}
                      </span>
                    )}
                    <button
                      onClick={() => setSelectedSource(item)}
                      className="text-nyaya-gold-400 hover:text-nyaya-gold-300 font-semibold flex items-center gap-1 transition-colors ml-auto"
                    >
                      <span>View Full Provision</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Detail Modal */}
      {selectedSource && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-2xl w-full max-h-[85vh] flex flex-col shadow-2xl overflow-hidden animate-in fade-in duration-200">
            {/* Modal Header */}
            <div className="p-5 border-b border-slate-800 flex items-start justify-between gap-4 bg-slate-900/90">
              <div>
                <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded ${
                  selectedSource.document_type === 'statute'
                    ? 'bg-blue-900/40 text-blue-300'
                    : 'bg-amber-900/40 text-amber-300'
                }`}>
                  {selectedSource.document_type === 'statute' ? 'Enacted Legislation' : 'Supreme Court Judgment'}
                </span>
                <h3 className="font-serif font-bold text-white text-lg mt-1.5">
                  {selectedSource.title}
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  {selectedSource.court} • {selectedSource.jurisdiction}
                </p>
              </div>
              <button
                onClick={() => setSelectedSource(null)}
                className="p-1.5 rounded-lg bg-slate-800 text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto space-y-4 text-xs sm:text-sm text-slate-200 leading-relaxed font-sans">
              <div>
                <h4 className="font-semibold text-slate-400 text-xs uppercase tracking-wider mb-1">
                  Executive Legal Summary
                </h4>
                <p className="bg-slate-800/40 p-3.5 rounded-xl border border-slate-800">
                  {selectedSource.summary}
                </p>
              </div>

              {selectedSource.full_text && (
                <div>
                  <h4 className="font-semibold text-slate-400 text-xs uppercase tracking-wider mb-1">
                    Statutory / Judgment Verbatim Text
                  </h4>
                  <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 text-slate-300 font-mono text-xs whitespace-pre-line leading-relaxed">
                    {selectedSource.full_text}
                  </div>
                </div>
              )}

              <div className="grid grid-cols-2 gap-3 pt-2 text-xs">
                {selectedSource.publication_date && (
                  <div className="bg-slate-800/40 p-2.5 rounded-lg border border-slate-800">
                    <span className="text-slate-500 block text-[10px]">Publication / Date:</span>
                    <span className="font-medium text-slate-300">{selectedSource.publication_date}</span>
                  </div>
                )}
                {selectedSource.effective_date && (
                  <div className="bg-slate-800/40 p-2.5 rounded-lg border border-slate-800">
                    <span className="text-slate-500 block text-[10px]">Commencement Date:</span>
                    <span className="font-medium text-emerald-400">{selectedSource.effective_date}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-slate-800 bg-slate-900/90 flex items-center justify-between">
              {selectedSource.source_url ? (
                <a
                  href={selectedSource.source_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-nyaya-gold-400 hover:underline flex items-center gap-1.5"
                >
                  <FileCheck className="w-3.5 h-3.5" />
                  <span>Verify on Official India Code / Court Portal</span>
                </a>
              ) : <div />}
              <button
                onClick={() => setSelectedSource(null)}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-white"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

