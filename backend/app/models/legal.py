import datetime
from sqlalchemy import Column, String, Text, Integer, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from app.database.session import Base

class LegalSource(Base):
    __tablename__ = "legal_sources"

    id = Column(String, primary_key=True, index=True)
    title = Column(String, nullable=False, index=True)
    act_name = Column(String, nullable=False, index=True)
    section = Column(String, nullable=True, index=True)
    court = Column(String, nullable=True)
    jurisdiction = Column(String, default="Union of India")
    document_type = Column(String, default="statute", index=True)  # statute, judgment
    publication_date = Column(String, nullable=True)
    effective_date = Column(String, nullable=True)
    source_url = Column(String, nullable=False)
    summary = Column(Text, nullable=False)
    full_text = Column(Text, nullable=True)

    passages = relationship("LegalPassage", back_populates="source", cascade="all, delete-orphan")

class LegalPassage(Base):
    __tablename__ = "legal_passages"

    id = Column(String, primary_key=True, index=True)
    source_id = Column(String, ForeignKey("legal_sources.id"), nullable=False)
    passage_text = Column(Text, nullable=False)
    section_ref = Column(String, nullable=True)
    embedding_json = Column(Text, nullable=True)  # JSON-encoded float array
    chunk_index = Column(Integer, default=0)

    source = relationship("LegalSource", back_populates="passages")

class Conversation(Base):
    __tablename__ = "conversations"

    id = Column(String, primary_key=True, index=True)
    title = Column(String, default="Legal Inquiry")
    language = Column(String, default="en")
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    messages = relationship("Message", back_populates="conversation", cascade="all, delete-orphan")

class Message(Base):
    __tablename__ = "messages"

    id = Column(String, primary_key=True, index=True)
    conversation_id = Column(String, ForeignKey("conversations.id"), nullable=False)
    role = Column(String, nullable=False)  # user, assistant, system
    content = Column(Text, nullable=False)
    citations_json = Column(Text, nullable=True)  # Serialized citations list
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    conversation = relationship("Conversation", back_populates="messages")

class UserDocument(Base):
    __tablename__ = "user_documents"

    id = Column(String, primary_key=True, index=True)
    filename = Column(String, nullable=False)
    file_size = Column(Integer, nullable=False)
    summary = Column(Text, nullable=False)
    passages_count = Column(Integer, default=0)
    safe_hash = Column(String, nullable=True)
    user_id = Column(String, default="local_user", index=True)  # Isolation
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    passages = relationship("UserDocumentPassage", back_populates="document", cascade="all, delete-orphan")

class UserDocumentPassage(Base):
    __tablename__ = "user_document_passages"

    id = Column(String, primary_key=True, index=True)
    document_id = Column(String, ForeignKey("user_documents.id"), nullable=False)
    passage_text = Column(Text, nullable=False)
    embedding_json = Column(Text, nullable=True)
    chunk_index = Column(Integer, default=0)

    document = relationship("UserDocument", back_populates="passages")

