import React, { useState, useRef } from 'react';
import { 
  UploadCloud, 
  FileText, 
  CheckCircle2, 
  AlertTriangle, 
  ShieldAlert, 
  Send, 
  RefreshCw, 
  Lock, 
  BookOpen, 
  FileCheck,
  ChevronRight,
  Info
} from 'lucide-react';
import { AppLanguage, UserUploadedDocument } from '../types';
import { getTranslation } from '../utils/translations';
import { apiService } from '../services/api';
import { SourceCard } from '../components/SourceCard';
import { LoadingSkeleton } from '../components/LoadingSkeleton';

interface DocumentAssistantPageProps {
  language: AppLanguage;
}

export const DocumentAssistantPage: React.FC<DocumentAssistantPageProps> = ({ language }) => {
  const t = getTranslation(language);
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [docResult, setDocResult] = useState<UserUploadedDocument | null>(null);

  // Q&A state for uploaded document
  const [activeTab, setActiveTab] = useState<'summary' | 'qa'>('summary');
  const [qaQuestion, setQaQuestion] = useState('');
  const [isAsking, setIsAsking] = useState(false);
  const [qaHistory, setQaHistory] = useState<Array<{ q: string; a: string; citations?: any[] }>>([]);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (selectedFile: File) => {
    setUploadError(null);

    // Validate size (10 MB limit)
    const MAX_SIZE = 10 * 1024 * 1024;
    if (selectedFile.size > MAX_SIZE) {
      setUploadError('File exceeds 10MB limit. Please upload a smaller legal brief or agreement.');
      return;
    }

    // Validate extension
    const name = selectedFile.name.toLowerCase();
    if (!name.endsWith('.pdf') && !name.endsWith('.txt')) {
      setUploadError('Unsupported file type. Only verified PDF and TXT legal documents are permitted.');
      return;
    }

    setFile(selectedFile);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelect(e.dataTransfer.files[0]);
    }
  };

  const handleUploadAndAnalyze = async () => {
    if (!file) return;

    setIsUploading(true);
    setUploadError(null);

    try {
      const result = await apiService.uploadDocument(file);
      setDocResult(result);
      setQaHistory([]);
    } catch (err: any) {
      setUploadError(err.message || 'Error parsing document.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleAskQuestion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!qaQuestion.trim() || !docResult || isAsking) return;

    const q = qaQuestion.trim();
    setQaQuestion('');
    setIsAsking(true);

    try {
      const res = await apiService.askDocument(docResult.id, q, language);
      setQaHistory(prev => [...prev, { q, a: res.answer, citations: res.citations }]);
    } catch {
      setQaHistory(prev => [
        ...prev, 
        { q, a: 'Error processing question against uploaded document passages.' }
      ]);
    } finally {
      setIsAsking(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="max-w-3xl space-y-2">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-nyaya-navy-800 border border-nyaya-gold-500/30 text-nyaya-gold-400 text-xs font-medium">
          <FileText className="w-3.5 h-3.5" />
          <span>Confidential Legal Document Parser & Clause Analyzer</span>
        </div>
        <h1 className="font-serif text-3xl font-bold text-white tracking-tight">
          {t.docs_title}
        </h1>
        <p className="text-sm text-slate-400 font-sans">
          {t.docs_subtitle}
        </p>
      </div>

      {/* Security & Disclaimer Notice */}
      <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 flex items-start gap-3 text-xs text-slate-300">
        <ShieldAlert className="w-5 h-5 text-nyaya-gold-400 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <p className="font-semibold text-white">
            Security Safeguards & Legal Notice
          </p>
          <p className="text-slate-400 leading-relaxed">
            Uploaded contracts and pleadings are parsed ephemerally with PyMuPDF inside isolated sandboxes. All text is scanned for adversarial prompt injection. <strong>Document summaries are informational and never constitute a verified advocate legal opinion.</strong>
          </p>
        </div>
      </div>

      {!docResult ? (
        /* Upload Area */
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-10 shadow-xl space-y-6">
          <div
            onDragOver={(e) => e.preventDefault()}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className="border-2 border-dashed border-slate-700 hover:border-nyaya-gold-500/60 rounded-2xl p-8 sm:p-12 text-center cursor-pointer transition-all bg-slate-800/30 hover:bg-slate-800/60 group"
          >
            <input
              type="file"
              ref={fileInputRef}
              onChange={(e) => e.target.files?.[0] && handleFileSelect(e.target.files[0])}
              accept=".pdf,.txt"
              className="hidden"
            />
            <div className="w-16 h-16 rounded-2xl bg-nyaya-navy-700 border border-nyaya-gold-500/30 text-nyaya-gold-400 flex items-center justify-center mx-auto mb-4 group-hover:scale-105 transition-transform">
              <UploadCloud className="w-8 h-8" />
            </div>
            <h3 className="font-serif font-semibold text-white text-base mb-1">
              {t.docs_upload_box}
            </h3>
            <p className="text-xs text-slate-400">
              {t.docs_upload_limit}
            </p>
          </div>

          {/* Selected File Details */}
          {file && (
            <div className="p-4 rounded-xl bg-slate-800/80 border border-slate-700 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <FileText className="w-6 h-6 text-nyaya-gold-400" />
                <div>
                  <p className="text-xs font-semibold text-white truncate max-w-xs sm:max-w-md">
                    {file.name}
                  </p>
                  <p className="text-[11px] text-slate-400">
                    {(file.size / (1024 * 1024)).toFixed(2)} MB • {file.type || 'Plain Text / PDF'}
                  </p>
                </div>
              </div>

              <button
                onClick={handleUploadAndAnalyze}
                disabled={isUploading}
                className="px-5 py-2.5 rounded-xl bg-nyaya-navy-600 hover:bg-nyaya-navy-500 disabled:opacity-50 text-white font-semibold text-xs transition-all shadow-md flex items-center gap-2 border border-nyaya-gold-500/30"
              >
                {isUploading ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin text-nyaya-gold-400" />
                    <span>Analyzing Clauses...</span>
                  </>
                ) : (
                  <>
                    <FileCheck className="w-3.5 h-3.5 text-nyaya-gold-400" />
                    <span>Extract & Analyze</span>
                  </>
                )}
              </button>
            </div>
          )}

          {uploadError && (
            <div className="p-3.5 rounded-xl bg-rose-950/40 border border-rose-800/60 text-xs text-rose-300 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0 text-rose-400" />
              <span>{uploadError}</span>
            </div>
          )}
        </div>
      ) : (
        /* Document Analysis & Grounded Q&A Workspace */
        <div className="bg-slate-900 border border-slate-800 rounded-2xl shadow-xl overflow-hidden space-y-0">
          {/* Document Top Bar */}
          <div className="p-5 border-b border-slate-800 bg-slate-900/90 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-nyaya-navy-700 text-nyaya-gold-400 border border-nyaya-gold-500/30">
                <FileText className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-serif font-bold text-white text-base truncate max-w-sm sm:max-w-md">
                  {docResult.filename}
                </h3>
                <p className="text-xs text-slate-400 flex items-center gap-2">
                  <span>{(docResult.file_size / 1024).toFixed(1)} KB</span>
                  <span>•</span>
                  <span>{docResult.passages_count} Passages Indexed</span>
                  <span>•</span>
                  <span className="text-emerald-400 flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" /> Safe Sandboxed
                  </span>
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  setDocResult(null);
                  setFile(null);
                }}
                className="px-3.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium border border-slate-700"
              >
                Upload Different File
              </button>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="border-b border-slate-800 bg-slate-900 px-6 flex gap-6 text-xs font-semibold">
            <button
              onClick={() => setActiveTab('summary')}
              className={`py-3 border-b-2 transition-all ${
                activeTab === 'summary'
                  ? 'border-nyaya-gold-400 text-nyaya-gold-400'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              {t.docs_summary_tab}
            </button>
            <button
              onClick={() => setActiveTab('qa')}
              className={`py-3 border-b-2 transition-all flex items-center gap-2 ${
                activeTab === 'qa'
                  ? 'border-nyaya-gold-400 text-nyaya-gold-400'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              <span>{t.docs_qa_tab}</span>
              {qaHistory.length > 0 && (
                <span className="px-1.5 py-0.2 rounded-full bg-nyaya-navy-700 text-[10px] text-nyaya-gold-400">
                  {qaHistory.length}
                </span>
              )}
            </button>
          </div>

          {/* Tab Content */}
          <div className="p-6">
            {activeTab === 'summary' ? (
              <div className="space-y-6">
                <div>
                  <h4 className="font-serif font-bold text-white text-base mb-2">
                    Executive Legal Synthesis
                  </h4>
                  <p className="bg-slate-800/50 p-4 rounded-xl border border-slate-800 text-xs sm:text-sm text-slate-200 leading-relaxed font-sans">
                    {docResult.summary}
                  </p>
                </div>

                <div>
                  <h4 className="font-serif font-bold text-white text-sm mb-3">
                    Identified Covenants & Key Clauses
                  </h4>
                  <div className="space-y-2">
                    {docResult.key_points.map((point, i) => (
                      <div
                        key={i}
                        className="p-3 rounded-xl bg-slate-800/40 border border-slate-800 text-xs text-slate-300 flex items-start gap-2.5"
                      >
                        <ChevronRight className="w-3.5 h-3.5 text-nyaya-gold-400 shrink-0 mt-0.5" />
                        <span>{point}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              /* Grounded Q&A */
              <div className="space-y-6">
                <div className="p-3.5 rounded-xl bg-nyaya-navy-900/60 border border-nyaya-navy-700/60 text-xs text-slate-300 flex items-center gap-2">
                  <Info className="w-4 h-4 text-nyaya-gold-400 shrink-0" />
                  <span>
                    Questions are evaluated strictly against the verified passages extracted from <strong>{docResult.filename}</strong>.
                  </span>
                </div>

                {/* History */}
                <div className="space-y-4 max-h-96 overflow-y-auto pr-1">
                  {qaHistory.length === 0 ? (
                    <div className="text-center py-8 text-xs text-slate-500">
                      No questions asked yet. Ask about termination notice, indemnification, or governing jurisdiction.
                    </div>
                  ) : (
                    qaHistory.map((item, idx) => (
                      <div key={idx} className="space-y-2 text-xs">
                        <div className="p-3 rounded-xl bg-nyaya-navy-700/60 text-white font-medium border border-nyaya-navy-600/40">
                          Q: {item.q}
                        </div>
                        <div className="p-4 rounded-xl bg-slate-800/80 text-slate-200 leading-relaxed border border-slate-700/60 whitespace-pre-line">
                          {item.a}
                        </div>
                        {item.citations && item.citations.length > 0 && (
                          <div className="space-y-2 pt-1">
                            {item.citations.map((c: any) => (
                              <SourceCard key={c.id} citation={c} />
                            ))}
                          </div>
                        )}
                      </div>
                    ))
                  )}

                  {isAsking && <LoadingSkeleton type="chat" />}
                </div>

                {/* Q&A Input */}
                <form onSubmit={handleAskQuestion} className="flex gap-2 pt-2">
                  <input
                    type="text"
                    value={qaQuestion}
                    onChange={(e) => setQaQuestion(e.target.value)}
                    placeholder="Ask a question about this document (e.g. What is the dispute resolution procedure?)..."
                    disabled={isAsking}
                    className="flex-1 bg-slate-800/80 border border-slate-700 rounded-xl px-4 py-3 text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-nyaya-gold-500"
                  />
                  <button
                    type="submit"
                    disabled={!qaQuestion.trim() || isAsking}
                    className="px-5 py-3 rounded-xl bg-nyaya-navy-600 hover:bg-nyaya-navy-500 disabled:opacity-50 text-white font-semibold text-xs flex items-center gap-2 border border-nyaya-gold-500/30 shadow-md"
                  >
                    <Send className="w-4 h-4 text-nyaya-gold-400" />
                    <span>Ask</span>
                  </button>
                </form>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

