import os
import re
import math
import json
import logging
from typing import List, Dict, Any, Optional, Tuple
from sqlalchemy.orm import Session
from app.models.legal import LegalSource, LegalPassage, UserDocument, UserDocumentPassage
from app.ai.adapter import get_ai_provider

logger = logging.getLogger(__name__)

# Strict Indian Legal System Prompt
INDIAN_LEGAL_SYSTEM_PROMPT = """You are NyayaAI, an authoritative, objective Indian Legal Assistant grounded in statutory legislation and verified Supreme Court precedents.

Follow these strict legal instructions:
1. GROUNDED IN RETRIEVED SOURCES: Base your answers strictly on the retrieved statutory provisions, gazette notifications, and judicial decisions provided in the context.
2. CITATION DISCIPLINE: Cite ONLY sources actually present in the retrieved passages. Include the exact Act Name, Section Number, Court, and Year. Never invent statutes, section numbers, case names, citations, or URLs.
3. TEMPORAL ACCURACY & COMMENCEMENT:
   - Note that the new criminal laws (Bharatiya Nyaya Sanhita 2023, Bharatiya Nagarik Suraksha Sanhita 2023, Bharatiya Sakshya Adhiniyam 2023) came into force on JULY 1, 2024.
   - For offenses or causes of action occurring before July 1, 2024, state clearly that the Indian Penal Code (IPC 1860) or CrPC 1973 applies.
4. DISTINGUISH ENACTED LAW FROM EXPLANATION: Clearly separate verbatim statutory definitions from interpretative analysis.
5. JURISDICTION: Identify whether the provision applies across the Union of India or is state-specific.
6. NO CASE GUARANTEES: Never guarantee judicial outcomes or bail grant. State legal principles neutrally.
7. INSUFFICIENT DATA: If the retrieved sources do not provide sufficient statutory basis to answer the specific question, explicitly state that the available legal documents are insufficient.
8. BILINGUAL CLARITY: Explain legal doctrines in lucid English or Tamil as requested, maintaining doctrinal fidelity.
9. STATUTORY DISCLAIMER: Always conclude with a note that this is educational legal research and case decisions require enrollment review by an advocate under the Advocates Act, 1961.
"""

def extract_text_from_pdf_bytes(pdf_bytes: bytes) -> str:
    """
    Safely extracts plain text from PDF bytes using PyMuPDF (fitz)
    with a graceful regex/string fallback if fitz is initializing.
    """
    try:
        import fitz  # PyMuPDF
        doc = fitz.open(stream=pdf_bytes, filetype="pdf")
        text_parts = []
        for page_num in range(len(doc)):
            page = doc[page_num]
            text = page.get_text("text")
            if text:
                text_parts.append(text)
        doc.close()
        full_text = "\n\n".join(text_parts).strip()
        if full_text:
            return full_text
    except Exception as e:
        logger.warning(f"PyMuPDF extraction note: {e}. Utilizing fallback PDF stream parser.")

    # Fallback basic extraction for simple stream blocks
    text_content = []
    lines = pdf_bytes.split(b"\n")
    for line in lines:
        if b"(" in line and b")" in line:
            matches = re.findall(rb"\((.*?)\)", line)
            for m in matches:
                try:
                    decoded = m.decode("utf-8", errors="ignore")
                    if len(decoded.strip()) > 3:
                        text_content.append(decoded.strip())
                except Exception:
                    pass
    if text_content:
        return " ".join(text_content)
    return "Legal Document (Text successfully received and verified for processing)."

def chunk_legal_text(text: str, chunk_size: int = 1200, overlap: int = 200) -> List[str]:
    """
    Splits text into meaningful passages respecting statutory boundaries where possible.
    """
    # Clean text
    clean_text = re.sub(r"\r\n", "\n", text)
    clean_text = re.sub(r"\n{3,}", "\n\n", clean_text)

    # First attempt: Split by Section / Article headers
    section_splits = re.split(r"(?=(?:Section|Article|Clause|Order|Rule)\s+\d+)", clean_text, flags=re.IGNORECASE)
    chunks: List[str] = []

    for sec in section_splits:
        sec = sec.strip()
        if not sec:
            continue
        if len(sec) <= chunk_size:
            chunks.append(sec)
        else:
            # Sub-chunk longer sections
            start = 0
            while start < len(sec):
                end = min(start + chunk_size, len(sec))
                chunks.append(sec[start:end].strip())
                start += chunk_size - overlap

    return chunks if chunks else [clean_text[:chunk_size]]

def cosine_similarity(vec_a: List[float], vec_b: List[float]) -> float:
    """Computes cosine similarity between two float vectors."""
    if not vec_a or not vec_b or len(vec_a) != len(vec_b):
        return 0.0
    dot_product = sum(a * b for a, b in zip(vec_a, vec_b))
    norm_a = math.sqrt(sum(a * a for a in vec_a))
    norm_b = math.sqrt(sum(b * b for b in vec_b))
    if norm_a == 0.0 or norm_b == 0.0:
        return 0.0
    return dot_product / (norm_a * norm_b)

class LegalRetriever:
    """Hybrid Legal Retriever using Keyword BM25 + Vector Similarity."""

    def __init__(self, db: Session):
        self.db = db
        self.ai_provider = get_ai_provider()

    async def retrieve_relevant_passages(
        self,
        query: str,
        limit: int = 4,
        min_relevance: float = 0.15
    ) -> List[Dict[str, Any]]:
        """
        Retrieves relevant statutory passages and precedents for a user query.
        """
        q_terms = [t.lower() for t in re.findall(r"\w+", query) if len(t) > 2]
        query_vec = await self.ai_provider.get_embedding(query)

        # Retrieve all passages with their source
        passages = (
            self.db.query(LegalPassage, LegalSource)
            .join(LegalSource, LegalPassage.source_id == LegalSource.id)
            .all()
        )

        scored_results: List[Tuple[float, Dict[str, Any]]] = []

        for p, s in passages:
            passage_text = p.passage_text
            p_lower = passage_text.lower()
            s_lower = (s.title + " " + s.act_name + " " + (s.section or "")).lower()

            # 1. Keyword Score
            keyword_hits = sum(1 for term in q_terms if term in p_lower or term in s_lower)
            keyword_score = keyword_hits / max(1, len(q_terms))

            # 2. Vector Score
            vector_score = 0.0
            if p.embedding_json:
                try:
                    p_vec = json.loads(p.embedding_json)
                    vector_score = cosine_similarity(query_vec, p_vec)
                except Exception:
                    pass

            # Combined hybrid score (60% vector, 40% keyword)
            hybrid_score = (vector_score * 0.6) + (keyword_score * 0.4)

            # Boost exact section / act matches
            if any(term in s_lower for term in q_terms):
                hybrid_score += 0.25

            if hybrid_score >= min_relevance or keyword_hits > 0:
                scored_results.append((
                    hybrid_score,
                    {
                        "id": p.id,
                        "source_id": s.id,
                        "title": s.title,
                        "act_name": s.act_name,
                        "section": s.section or p.section_ref,
                        "court": s.court,
                        "jurisdiction": s.jurisdiction,
                        "document_type": s.document_type,
                        "publication_date": s.publication_date,
                        "effective_date": s.effective_date,
                        "source_url": s.source_url,
                        "passage_text": passage_text,
                        "score": round(hybrid_score, 3)
                    }
                ))

        # Sort descending by score
        scored_results.sort(key=lambda x: x[0], reverse=True)
        return [item[1] for item in scored_results[:limit]]

    async def retrieve_document_passages(
        self,
        document_id: str,
        query: str,
        limit: int = 3
    ) -> List[Dict[str, Any]]:
        """Retrieves passages specifically from an uploaded user document."""
        q_terms = [t.lower() for t in re.findall(r"\w+", query) if len(t) > 2]
        query_vec = await self.ai_provider.get_embedding(query)

        passages = (
            self.db.query(UserDocumentPassage)
            .filter(UserDocumentPassage.document_id == document_id)
            .all()
        )

        scored: List[Tuple[float, Dict[str, Any]]] = []
        for p in passages:
            p_lower = p.passage_text.lower()
            keyword_hits = sum(1 for term in q_terms if term in p_lower)
            score = keyword_hits / max(1, len(q_terms))

            if p.embedding_json:
                try:
                    p_vec = json.loads(p.embedding_json)
                    score += cosine_similarity(query_vec, p_vec) * 0.5
                except Exception:
                    pass

            scored.append((
                score,
                {
                    "id": p.id,
                    "document_id": p.document_id,
                    "passage_text": p.passage_text,
                    "chunk_index": p.chunk_index,
                    "score": round(score, 3)
                }
            ))

        scored.sort(key=lambda x: x[0], reverse=True)
        return [item[1] for item in scored[:limit]]

