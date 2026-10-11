export type AppLanguage = 'en' | 'ta';
export type ThemeMode = 'dark' | 'light';
export type DocumentType = 'statute' | 'judgment' | 'notification' | 'user_doc';

export interface LegalCitation {
  id: string;
  title: string;
  act_name?: string;
  section?: string;
  court?: string;
  jurisdiction?: string;
  date?: string;
  url: string;
  quotation: string;
  confidence_score?: number;
  doc_type: 'statute' | 'judgment' | 'notification';
}

export interface Message {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: string;
  citations?: LegalCitation[];
  language?: AppLanguage;
  isStreaming?: boolean;
  error?: boolean;
}

export interface Conversation {
  id: string;
  title: string;
  created_at: string;
  language: AppLanguage;
  messages: Message[];
}

export interface LegalSourceItem {
  id: string;
  title: string;
  act_name: string;
  section?: string;
  court?: string;
  jurisdiction: string;
  document_type: DocumentType;
  publication_date?: string;
  effective_date?: string;
  source_url: string;
  summary: string;
  full_text?: string;
}

export interface UserUploadedDocument {
  id: string;
  filename: string;
  file_size: number;
  uploaded_at: string;
  summary: string;
  passages_count: number;
  is_processed: boolean;
  key_points: string[];
}

export interface SystemStatus {
  app_env: string;
  ai_provider: string;
  ai_model: string;
  mock_mode: boolean;
  embedding_provider: string;
  database_type: string;
  total_sources_indexed: number;
  telegram_bot_active: boolean;
  bilingual_support: string[];
}

