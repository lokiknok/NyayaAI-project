from typing import List, Optional
from pydantic import BaseModel, Field

class CitationSchema(BaseModel):
    id: str
    title: str
    act_name: Optional[str] = None
    section: Optional[str] = None
    court: Optional[str] = None
    jurisdiction: Optional[str] = None
    date: Optional[str] = None
    url: str
    quotation: str
    confidence_score: Optional[float] = 0.95
    doc_type: str = "statute"  # statute or judgment

class ChatRequest(BaseModel):
    message: str = Field(..., min_length=1, max_length=4000)
    language: str = Field(default="en")
    conversation_id: Optional[str] = None

class ChatResponse(BaseModel):
    content: str
    citations: List[CitationSchema] = []
    conversation_id: str
    is_mock: bool = False

class SearchRequest(BaseModel):
    query: str = Field(default="")
    document_type: Optional[str] = None
    limit: int = Field(default=20, ge=1, le=100)

class LegalSourceSchema(BaseModel):
    id: str
    title: str
    act_name: str
    section: Optional[str] = None
    court: Optional[str] = None
    jurisdiction: str
    document_type: str
    publication_date: Optional[str] = None
    effective_date: Optional[str] = None
    source_url: str
    summary: str
    full_text: Optional[str] = None

class SearchResponse(BaseModel):
    query: str
    total: int
    results: List[LegalSourceSchema]

class DocumentUploadResponse(BaseModel):
    id: str
    filename: str
    file_size: int
    summary: str
    passages_count: int
    safe_hash: Optional[str] = None
    key_points: List[str] = []
    is_processed: bool = True

class DocumentAskRequest(BaseModel):
    question: str = Field(..., min_length=2, max_length=2000)
    language: str = Field(default="en")

class DocumentAskResponse(BaseModel):
    answer: str
    citations: List[CitationSchema] = []

class PublicSettingsResponse(BaseModel):
    app_env: str
    ai_provider: str
    ai_model: str
    mock_mode: bool
    embedding_provider: str
    database_type: str
    total_sources_indexed: int
    telegram_bot_active: bool
    bilingual_support: List[str]

class HealthResponse(BaseModel):
    status: str
    mock_mode: bool
    message: str

