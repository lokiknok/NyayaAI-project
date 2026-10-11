import React, { useState, useEffect, useRef } from 'react';
import { 
  Send, 
  Plus, 
  Trash2, 
  Copy, 
  Check, 
  RefreshCw, 
  Scale, 
  Sparkles, 
  Menu, 
  X, 
  BookOpen,
  MessageSquare
} from 'lucide-react';
import { AppLanguage, Message, Conversation } from '../types';
import { getTranslation } from '../utils/translations';
import { apiService } from '../services/api';
import { SourceCard } from '../components/SourceCard';
import { LoadingSkeleton } from '../components/LoadingSkeleton';

interface ChatPageProps {
  language: AppLanguage;
  onLanguageChange: (lang: AppLanguage) => void;
}

export const ChatPage: React.FC<ChatPageProps> = ({ language, onLanguageChange }) => {
  const t = getTranslation(language);
  const [conversations, setConversations] = useState<Conversation[]>(() => {
    const saved = localStorage.getItem('nyaya_conversations');
    if (saved) {
      try { return JSON.parse(saved); } catch {}
    }
    return [
      {
        id: 'conv-default',
        title: 'New Legal Inquiry',
        created_at: new Date().toISOString(),
        language: language,
        messages: []
      }
    ];
  });

  const [activeConvId, setActiveConvId] = useState<string>('conv-default');
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [copiedMsgId, setCopiedMsgId] = useState<string | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Sync to local storage
  useEffect(() => {
    localStorage.setItem('nyaya_conversations', JSON.stringify(conversations));
  }, [conversations]);

  const activeConversation = conversations.find(c => c.id === activeConvId) || conversations[0];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [activeConversation?.messages, isLoading]);

  const handleNewConversation = () => {
    const newConv: Conversation = {
      id: 'conv-' + Date.now(),
      title: language === 'ta' ? 'புதிய சட்ட வினா' : 'New Legal Inquiry',
      created_at: new Date().toISOString(),
      language: language,
      messages: []
    };
    setConversations(prev => [newConv, ...prev]);
    setActiveConvId(newConv.id);
    setIsSidebarOpen(false);
  };

  const handleClearHistory = () => {
    const initialConv: Conversation = {
      id: 'conv-' + Date.now(),
      title: 'New Legal Inquiry',
      created_at: new Date().toISOString(),
      language: language,
      messages: []
    };
    setConversations([initialConv]);
    setActiveConvId(initialConv.id);
  };

  const handleSendMessage = async (textToSend?: string) => {
    const text = textToSend || inputMessage.trim();
    if (!text || isLoading) return;

    setInputMessage('');

    const userMsg: Message = {
      id: 'msg-' + Date.now(),
      role: 'user',
      content: text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      language
    };

    // Update active conversation immediately
    const updatedMessages = [...activeConversation.messages, userMsg];
    const isFirstMessage = activeConversation.messages.length === 0;
    const newTitle = isFirstMessage ? text.slice(0, 36) + (text.length > 36 ? '...' : '') : activeConversation.title;

    setConversations(prev =>
      prev.map(c =>
        c.id === activeConvId
          ? { ...c, title: newTitle, messages: updatedMessages }
          : c
      )
    );

    setIsLoading(true);

    try {
      const response = await apiService.sendMessage(text, language, activeConvId);

      const assistantMsg: Message = {
        id: 'msg-' + (Date.now() + 1),
        role: 'assistant',
        content: response.content,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        citations: response.citations,
        language
      };

      setConversations(prev =>
        prev.map(c =>
          c.id === activeConvId
            ? { ...c, messages: [...updatedMessages, assistantMsg] }
            : c
        )
      );
    } catch {
      const errorMsg: Message = {
        id: 'msg-' + (Date.now() + 1),
        role: 'assistant',
        content: language === 'ta' 
          ? 'மன்னிக்கவும், சட்டப் பிரிவுகளை மீட்டெடுப்பதில் சிக்கல் ஏற்பட்டது. தயவுசெய்து மீண்டும் முயற்சிக்கவும்.' 
          : 'Unable to process legal inquiry at this moment. Please check your connectivity and retry.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        error: true,
        language
      };
      setConversations(prev =>
        prev.map(c =>
          c.id === activeConvId
            ? { ...c, messages: [...updatedMessages, errorMsg] }
            : c
        )
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopyText = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedMsgId(id);
    setTimeout(() => setCopiedMsgId(null), 2000);
  };

  const suggestedQuestions = [
    t.suggested_q1,
    t.suggested_q2,
    t.suggested_q3,
    t.suggested_q4,
    t.suggested_q5,
  ];

  return (
    <div className="max-w-7xl mx-auto px-2 sm:px-4 lg:px-6 h-[calc(100vh-5rem)] flex gap-4 overflow-hidden py-2">
      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && (
        <div 
          onClick={() => setIsSidebarOpen(false)}
          className="fixed inset-0 bg-black/60 z-30 md:hidden"
        />
      )}

      {/* Conversations Sidebar */}
      <aside className={`
        fixed md:static top-20 bottom-4 left-4 z-40 w-72 bg-slate-900 border border-slate-800 rounded-2xl flex flex-col p-4 shadow-xl transition-transform duration-300
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-[110%] md:translate-x-0'}
      `}>
        {/* New Chat Button */}
        <button
          onClick={handleNewConversation}
          className="w-full py-2.5 px-4 rounded-xl bg-nyaya-navy-700 hover:bg-nyaya-navy-600 border border-nyaya-gold-500/30 text-white text-xs font-semibold flex items-center justify-center gap-2 transition-colors shadow-sm mb-4"
        >
          <Plus className="w-4 h-4 text-nyaya-gold-400" />
          <span>{t.chat_new_conversation}</span>
        </button>

        {/* History List */}
        <div className="flex-1 overflow-y-auto space-y-1.5 pr-1">
          <div className="flex items-center justify-between text-[11px] font-semibold uppercase tracking-wider text-slate-500 px-2 py-1">
            <span>{t.chat_conversations_history}</span>
            <span className="text-[10px]">{conversations.length}</span>
          </div>

          {conversations.map(conv => (
            <button
              key={conv.id}
              onClick={() => {
                setActiveConvId(conv.id);
                setIsSidebarOpen(false);
              }}
              className={`w-full text-left p-2.5 rounded-xl text-xs flex items-center gap-2.5 transition-all truncate ${
                conv.id === activeConvId
                  ? 'bg-nyaya-navy-800 text-nyaya-gold-400 border border-nyaya-gold-500/20 font-medium'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              <MessageSquare className="w-3.5 h-3.5 shrink-0 opacity-70" />
              <span className="truncate flex-1">{conv.title}</span>
            </button>
          ))}
        </div>

        {/* Sidebar Footer */}
        <div className="pt-3 border-t border-slate-800 flex items-center justify-between">
          <button
            onClick={handleClearHistory}
            className="text-[11px] text-slate-500 hover:text-rose-400 flex items-center gap-1.5 transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>{t.chat_clear_all}</span>
          </button>

          <button
            onClick={() => onLanguageChange(language === 'en' ? 'ta' : 'en')}
            className="text-[11px] text-slate-400 hover:text-white px-2 py-1 rounded bg-slate-800 border border-slate-700"
          >
            {language === 'en' ? 'தமிழ் மாற்று' : 'Switch English'}
          </button>
        </div>
      </aside>

      {/* Main Chat Interface */}
      <main className="flex-1 bg-slate-900 border border-slate-800 rounded-2xl flex flex-col overflow-hidden shadow-xl">
        {/* Chat Header */}
        <div className="px-4 py-3 border-b border-slate-800 bg-slate-900/80 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="md:hidden p-1.5 rounded-lg bg-slate-800 text-slate-400 hover:text-white"
            >
              {isSidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-xs font-semibold text-slate-300 font-serif">
                {activeConversation.title}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[11px] text-slate-500 hidden sm:inline">
              Language: {language === 'en' ? 'English' : 'தமிழ்'}
            </span>
          </div>
        </div>

        {/* Chat Message Scroll Area */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
          {activeConversation.messages.length === 0 ? (
            /* Welcome / Suggested Questions State */
            <div className="h-full flex flex-col items-center justify-center max-w-2xl mx-auto text-center space-y-6 py-6">
              <div className="w-14 h-14 rounded-2xl bg-nyaya-navy-700 border border-nyaya-gold-500/40 flex items-center justify-center text-nyaya-gold-400 shadow-md">
                <Scale className="w-7 h-7" />
              </div>

              <div>
                <h3 className="font-serif text-xl sm:text-2xl font-bold text-white mb-2">
                  {language === 'ta' ? 'இந்திய சட்ட வினாக்களை கேளுங்கள்' : 'Grounded Indian Legal Intelligence'}
                </h3>
                <p className="text-xs sm:text-sm text-slate-400 max-w-lg mx-auto">
                  {language === 'ta'
                    ? 'பாரதிய நியாய சன்ஹிதா (BNS), அரசியலமைப்பு, ஒப்பந்த சட்டம் மற்றும் உச்ச நீதிமன்ற தீர்ப்புகளின் அடிப்படையில் துல்லியமான பதில்களைப் பெறுங்கள்.'
                    : 'Query verified statutory provisions, penal code transitions, civil procedure, consumer rights, and landmark judicial decisions.'}
                </p>
              </div>

              {/* Suggestions */}
              <div className="w-full text-left space-y-2 pt-2">
                <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 flex items-center gap-1.5 px-1">
                  <Sparkles className="w-3.5 h-3.5 text-nyaya-gold-400" />
                  {t.suggested_questions_title}
                </span>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {suggestedQuestions.map((q, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleSendMessage(q)}
                      className="p-3 rounded-xl bg-slate-800/60 hover:bg-nyaya-navy-800 border border-slate-700/60 hover:border-nyaya-gold-500/30 text-xs text-slate-300 hover:text-white text-left transition-all leading-relaxed"
                    >
                      {q}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            /* Message Stream */
            activeConversation.messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'} space-y-2`}
              >
                <div className="flex items-center gap-2 text-[11px] text-slate-500 px-1">
                  <span>{msg.role === 'user' ? 'You' : 'NyayaAI Assistant'}</span>
                  <span>•</span>
                  <span>{msg.timestamp}</span>
                </div>

                <div
                  className={`max-w-3xl rounded-2xl p-4 sm:p-5 text-xs sm:text-sm leading-relaxed shadow-sm ${
                    msg.role === 'user'
                      ? 'bg-nyaya-navy-700 text-white rounded-br-sm border border-nyaya-navy-500/40'
                      : msg.error
                      ? 'bg-rose-950/40 text-rose-200 border border-rose-800/50 rounded-bl-sm'
                      : 'bg-slate-800/80 text-slate-100 border border-slate-700/60 rounded-bl-sm'
                  }`}
                >
                  <div className="prose prose-invert max-w-none text-xs sm:text-sm whitespace-pre-line font-sans">
                    {msg.content}
                  </div>

                  {/* Assistant Actions: Copy */}
                  {msg.role === 'assistant' && !msg.error && (
                    <div className="mt-3 pt-3 border-t border-slate-700/50 flex items-center justify-between text-xs text-slate-400">
                      <button
                        onClick={() => handleCopyText(msg.id, msg.content)}
                        className="flex items-center gap-1.5 hover:text-nyaya-gold-400 transition-colors"
                      >
                        {copiedMsgId === msg.id ? (
                          <>
                            <Check className="w-3.5 h-3.5 text-emerald-400" />
                            <span className="text-emerald-400">{t.chat_copied}</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3.5 h-3.5" />
                            <span>{t.chat_copy}</span>
                          </>
                        )}
                      </button>

                      <span className="text-[11px] text-slate-500 italic">
                        Verified Citation Grounded
                      </span>
                    </div>
                  )}
                </div>

                {/* Statutory Citations Cards Container */}
                {msg.citations && msg.citations.length > 0 && (
                  <div className="w-full max-w-3xl space-y-2 mt-2">
                    <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-wider text-slate-400 px-1">
                      <BookOpen className="w-3.5 h-3.5 text-nyaya-gold-400" />
                      <span>{t.chat_citations_label} ({msg.citations.length})</span>
                    </div>
                    <div className="grid grid-cols-1 gap-2.5">
                      {msg.citations.map((citation) => (
                        <SourceCard key={citation.id} citation={citation} />
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))
          )}

          {/* Loading Skeleton */}
          {isLoading && (
            <div className="max-w-2xl">
              <LoadingSkeleton type="chat" />
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input Form */}
        <div className="p-3 sm:p-4 border-t border-slate-800 bg-slate-900/90">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="flex items-center gap-2"
          >
            <input
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              placeholder={t.chat_input_placeholder}
              disabled={isLoading}
              className="flex-1 bg-slate-800/90 border border-slate-700 rounded-xl px-4 py-3 text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-nyaya-gold-500 transition-colors"
            />
            <button
              type="submit"
              disabled={!inputMessage.trim() || isLoading}
              className="px-4 py-3 rounded-xl bg-nyaya-navy-600 hover:bg-nyaya-navy-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium text-xs sm:text-sm flex items-center gap-2 border border-nyaya-gold-500/30 transition-all shadow-md shrink-0"
            >
              {isLoading ? (
                <RefreshCw className="w-4 h-4 animate-spin text-nyaya-gold-400" />
              ) : (
                <Send className="w-4 h-4 text-nyaya-gold-400" />
              )}
              <span className="hidden sm:inline">{t.chat_send}</span>
            </button>
          </form>
          <p className="text-[11px] text-slate-500 text-center mt-2">
            Answers are retrieved from India Code & legal databases. Verify with an advocate before taking legal action.
          </p>
        </div>
      </main>
    </div>
  );
};

