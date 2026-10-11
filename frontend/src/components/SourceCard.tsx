import React, { useState } from 'react';
import { BookOpen, ExternalLink, Scale, CheckCircle2, ChevronDown, ChevronUp } from 'lucide-react';
import { LegalCitation } from '../types';

interface SourceCardProps {
  citation: LegalCitation;
}

export const SourceCard: React.FC<SourceCardProps> = ({ citation }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const isStatute = citation.doc_type === 'statute';

  return (
    <div className="bg-slate-800/60 border border-slate-700/60 hover:border-nyaya-gold-500/40 rounded-xl p-4 transition-all duration-200 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2">
          <div className={`p-1.5 rounded-lg ${
            isStatute 
              ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20' 
              : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
          }`}>
            {isStatute ? <BookOpen className="w-4 h-4" /> : <Scale className="w-4 h-4" />}
          </div>
          <div>
            <span className={`text-[11px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded ${
              isStatute ? 'bg-blue-900/40 text-blue-300' : 'bg-amber-900/40 text-amber-300'
            }`}>
              {isStatute ? 'Statutory Provision' : 'Judicial Precedent'}
            </span>
            {citation.date && (
              <span className="text-[11px] text-slate-400 ml-2">
                {citation.date}
              </span>
            )}
          </div>
        </div>

        {citation.confidence_score && (
          <div className="flex items-center gap-1 text-[11px] font-medium text-emerald-400 bg-emerald-950/40 px-2 py-0.5 rounded border border-emerald-800/40">
            <CheckCircle2 className="w-3 h-3" />
            <span>{Math.round(citation.confidence_score * 100)}% verified</span>
          </div>
        )}
      </div>

      {/* Title / Act & Section */}
      <h4 className="font-serif font-semibold text-slate-100 text-sm mt-2.5 mb-1">
        {citation.title}
      </h4>

      {citation.court && (
        <p className="text-xs text-slate-400 font-sans mb-2">
          {citation.court} {citation.jurisdiction ? `• ${citation.jurisdiction}` : ''}
        </p>
      )}

      {/* Quotation preview */}
      <div className="bg-slate-900/70 rounded-lg p-3 border border-slate-800 text-xs text-slate-300 font-sans leading-relaxed">
        <p className={isExpanded ? '' : 'line-clamp-2'}>
          &ldquo;{citation.quotation}&rdquo;
        </p>
      </div>

      {/* Actions */}
      <div className="flex items-center justify-between mt-3 pt-2 border-t border-slate-800/70 text-xs">
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="text-slate-400 hover:text-slate-200 flex items-center gap-1 font-medium transition-colors"
        >
          {isExpanded ? (
            <>
              <ChevronUp className="w-3.5 h-3.5" />
              <span>Show Less</span>
            </>
          ) : (
            <>
              <ChevronDown className="w-3.5 h-3.5" />
              <span>Read Full Excerpt</span>
            </>
          )}
        </button>

        {citation.url && citation.url !== '#' && (
          <a
            href={citation.url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-nyaya-gold-400 hover:text-nyaya-gold-300 flex items-center gap-1 font-medium hover:underline transition-colors"
          >
            <span>Official Gazette / Law Source</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        )}
      </div>
    </div>
  );
};

