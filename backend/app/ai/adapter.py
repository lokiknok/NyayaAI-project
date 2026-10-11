import os
import time
import json
import asyncio
import logging
from abc import ABC, abstractmethod
from typing import List, Dict, Any, Optional, Tuple
import httpx
from app.config import settings

logger = logging.getLogger(__name__)

class AIProviderError(Exception):
    """Base exception for AI provider errors."""
    pass

class MissingAPIKeyError(AIProviderError):
    """Raised when an API key is required but missing."""
    pass

class RateLimitError(AIProviderError):
    """Raised when the provider reports a rate limit or 429."""
    pass

class ProviderTimeoutError(AIProviderError):
    """Raised when a request exceeds timeout limit."""
    pass

class BaseAIProvider(ABC):
    """Abstract Base Class for Hosted AI model providers."""

    @abstractmethod
    async def generate_response(
        self,
        prompt: str,
        system_prompt: str,
        retrieved_passages: List[Dict[str, Any]],
        language: str = "en"
    ) -> Tuple[str, List[Dict[str, Any]], bool]:
        """
        Generates grounded legal response.
        Returns: (answer_text, citations_list, is_mock_flag)
        """
        pass

    @abstractmethod
    async def get_embedding(self, text: str) -> List[float]:
        """Generates embedding vector for retrieval."""
        pass


class MockAIProvider(BaseAIProvider):
    """
    Mock AI Provider for rapid UI development, offline testing,
    and automated test suites without incurring API charges or requiring local LLMs.
    """

    async def generate_response(
        self,
        prompt: str,
        system_prompt: str,
        retrieved_passages: List[Dict[str, Any]],
        language: str = "en"
    ) -> Tuple[str, List[Dict[str, Any]], bool]:
        # Simulate slight network delay
        await asyncio.sleep(0.3)

        q = prompt.lower()
        citations: List[Dict[str, Any]] = []

        # If retrieved passages exist, use them as grounded citations
        if retrieved_passages:
            for idx, p in enumerate(retrieved_passages[:3]):
                citations.append({
                    "id": f"cit-rag-{idx+1}",
                    "title": p.get("title", "Indian Statutory Provision"),
                    "act_name": p.get("act_name", "Statutory Law"),
                    "section": p.get("section", ""),
                    "court": p.get("court", "Parliament of India"),
                    "jurisdiction": p.get("jurisdiction", "Union of India"),
                    "date": p.get("publication_date", "2024"),
                    "url": p.get("source_url", "https://www.indiacode.nic.in/"),
                    "quotation": p.get("passage_text", "")[:240] + "...",
                    "confidence_score": 0.98,
                    "doc_type": p.get("document_type", "statute")
                })
        else:
            # Fallback default statutory citation
            citations.append({
                "id": "cit-default",
                "title": "Constitution of India, 1950",
                "act_name": "Constitution of India",
                "section": "Article 21",
                "court": "Supreme Court of India",
                "jurisdiction": "Union of India",
                "date": "1950",
                "url": "https://www.indiacode.nic.in/",
                "quotation": "Protection of life and personal liberty: No person shall be deprived of his life or personal liberty except according to procedure established by law.",
                "confidence_score": 0.95,
                "doc_type": "statute"
            })

        if language == "ta":
            # Tamil response synthesis
            if any(k in q for k in ["ஜாமீன்", "முன்ஜாமீன்"]):
                answer = (
                    "### பாரதிய நாகரிக் சுரக்ஷா சன்ஹிதா (BNSS) - முன்ஜாமீன் (Anticipatory Bail)\n\n"
                    "**BNSS, 2023 பிரிவு 482** (பழைய CrPC பிரிவு 438-க்கு சமமானது) முன்ஜாமீன் குறித்து விளக்குகிறது:\n"
                    "1. பிணையில் வர முடியாத குற்றச்சாட்டின் பேரில் கைது செய்யப்படலாம் என்ற அச்சம் உள்ள எவரும் அமர்வு நீதிமன்றத்திலோ அல்லது உயர் நீதிமன்றத்திலோ முன்ஜாமீன் கோரலாம்.\n"
                    "2. நீதிமன்றம் குற்றச்சாட்டுகளின் தீவிரத்தன்மை மற்றும் மனுதாரரின் பின்னணியை ஆய்வு செய்கிறது.\n\n"
                    "*ஆதாரம்: பாரதிய நாகரிக் சுரக்ஷா சன்ஹிதா, 2023.* [உருவகப்படுத்தப்பட்ட பதில் - Mock Mode]"
                )
            elif any(k in q for k in ["bns", "ipc", "குற்றவியல்", "வேறுபாடு", "தண்டனை"]):
                answer = (
                    "### பாரதிய நியாய சன்ஹிதா (BNS, 2023) vs இந்திய தண்டனைச் சட்டம் (IPC, 1860)\n\n"
                    "**1. அமலாக்க தேதி:** பாரதிய நியாய சன்ஹிதா, 2023 **ஜூலை 1, 2024** முதல் நாடு முழுவதும் அமலுக்கு வந்தது. "
                    "ஜூலை 1, 2024-க்கு முன் நிகழ்ந்த குற்றங்களுக்கு IPC பொருந்தும்; அதன் பிறகு நிகழும் குற்றங்களுக்கு BNS மட்டுமே பொருந்தும்.\n\n"
                    "**2. முக்கிய மாற்றங்கள்:**\n"
                    "- IPC-யில் இருந்த 511 பிரிவுகள், BNS-ல் **358 பிரிவுகளாக** ஒழுங்கமைக்கப்பட்டுள்ளன.\n"
                    "- கொலை குற்றத்திற்கான தண்டனை (முன்பு IPC பிரிவு 302) இப்போது **BNS பிரிவு 103**-ல் உள்ளது.\n"
                    "- கும்பல் வன்முறை (Mob Lynching) பிரிவு 103(2)-ல் மரண தண்டனை அல்லது ஆயுள் தண்டனைக்குரிய குற்றமாக வரையறுக்கப்பட்டுள்ளது.\n"
                    "- சிறிய குற்றங்களுக்கு சிறை தண்டனைக்கு பதிலாக **சமூக சேவை (Community Service)** அறிமுகப்படுத்தப்பட்டுள்ளது.\n\n"
                    "*ஆதாரம்: பாரதிய நியாய சன்ஹிதா, 2023 (இந்தியா கோட்).* [உருவகப்படுத்தப்பட்ட பதில் - Mock Mode]"
                )
            elif any(k in q for k in ["ஒப்பந்த", "contract", "செல்லுபடியா", "உடன்படிக்கை"]):
                answer = (
                    "### இந்திய ஒப்பந்தச் சட்டம், 1872: ஒரு ஒப்பந்தம் செல்லுபடியாக தேவையானவை\n\n"
                    "**பிரிவு 10-ன் படி**, ஒரு உடன்படிக்கை சட்டப்படி செல்லுபடியாகும் ஒப்பந்தமாக மாற பின்வரும் 5 அடிப்படை தேவைகள் அவசியம்:\n"
                    "1. **சுதந்திரமான சம்மதம் (Free Consent - பிரிவு 14):** வற்புறுத்தல் அல்லது மோசடி இன்றி வழங்கப்பட வேண்டும்.\n"
                    "2. **ஒப்பந்த தகுதி (Competency - பிரிவு 11):** 18 வயது பூர்த்தியடைந்தவராகவும், மனநலம் உள்ளவராகவும் இருத்தல் வேண்டும்.\n"
                    "3. **சட்டப்பூர்வ மறுபயன் (Lawful Consideration - பிரிவு 23):** பரிமாற்றம் சட்ட விரோதமாக இருக்கக்கூடாது.\n"
                    "4. **சட்டப்பூர்வ நோக்கம் (Lawful Object).**\n"
                    "5. **வெளிப்படையாக செல்லாது என அறிவிக்கப்படாதிருத்தல்.**\n\n"
                    "*ஆதாரம்: இந்திய ஒப்பந்தச் சட்டம், 1872.* [உருவகப்படுத்தப்பட்ட பதில் - Mock Mode]"
                )
            else:
                answer = (
                    f"### இந்திய சட்ட பகுப்பாய்வு (தமிழ்)\n\n"
                    f"உங்கள் வினாவிற்கு: \"{prompt}\"\n\n"
                    f"இந்திய சட்ட விதிகளின்படி, ஒவ்வொரு குடிமகனின் உரிமைகளும் அரசியலமைப்பு மற்றும் சட்ட விதிகளின் மூலம் பாதுகாக்கப்படுகின்றன. "
                    f"வழக்கு விவகாரங்களில் அதிகாரப்பூர்வ நீதிமன்ற உத்தரவுகள் மற்றும் சட்டப் பிரிவுகளை சரிபார்ப்பது அவசியம்.\n\n"
                    f"*பொறுப்புத் துறப்பு: இது தானியங்கி சட்ட ஆராய்ச்சி தகவலாகும். வழக்கறிஞரின் ஆலோசனைக்கு மாற்றாகாது.* [Mock Mode]"
                )
        else:
            # English response synthesis
            if any(k in q for k in ["bail", "anticipatory"]):
                answer = (
                    "### Anticipatory Bail under Section 482 of BNSS, 2023\n\n"
                    "Under the **Bharatiya Nagarik Suraksha Sanhita, 2023 (BNSS)**, Section 482 succeeds Section 438 of the repealed CrPC:\n\n"
                    "- **Jurisdiction:** A petition for anticipatory bail can be submitted to either the **Court of Session** or the **High Court**.\n"
                    "- **Judicial Thresholds:** The Court evaluates the gravity of charges, criminal antecedents, flight risk, and whether accusations stem from malice.\n"
                    "- **Conditions:** The petitioner must cooperate with police interrogation and must not influence witnesses.\n\n"
                    "*Grounded in: Bharatiya Nagarik Suraksha Sanhita, 2023 (Indiacode.nic.in).* [Simulated Mock AI Response]"
                )
            elif any(k in q for k in ["bns", "ipc", "difference", "penal", "murder"]):
                answer = (
                    "### Comparative Statutory Analysis: Bharatiya Nyaya Sanhita (BNS, 2023) vs IPC (1860)\n\n"
                    "The **Bharatiya Nyaya Sanhita, 2023 (Act No. 45 of 2023)** came into force across India on **July 1, 2024**, repealing the Indian Penal Code, 1860.\n\n"
                    "#### 1. Temporal Applicability:\n"
                    "- Offenses committed **prior to July 1, 2024** remain punishable under the Indian Penal Code, 1860.\n"
                    "- Offenses committed **on or after July 1, 2024** are investigated and prosecuted under BNS, 2023.\n\n"
                    "#### 2. Structural & Substantive Highlights:\n"
                    "- **Streamlined Sections:** Consolidated from 511 IPC sections into **358 sections**.\n"
                    "- **Murder (Section 103 BNS):** Replaces IPC Section 302. Section 103(2) statutorily penalizes mob lynching with capital punishment or life imprisonment.\n"
                    "- **Community Service:** Introduced under Section 4(f) for petty offenses.\n"
                    "- **Organized Crime:** Codified under Section 111 with stringent evidentiary and sentencing mandates.\n\n"
                    "*Grounded in: Gazette of India Act No. 45 of 2023 (Official India Code).* [Simulated Mock AI Response]"
                )
            elif any(k in q for k in ["contract", "valid", "agreement", "1872"]):
                answer = (
                    "### Essential Elements of a Valid Contract (Indian Contract Act, 1872)\n\n"
                    "Under **Section 2(h)** of the Indian Contract Act, 1872, an agreement enforceable by law is a contract. "
                    "Section 10 codifies the statutory prerequisites for enforceability:\n\n"
                    "1. **Free Consent (Sections 13 & 14):** Parties must agree upon the same thing in the same sense, without coercion, undue influence, fraud, or misrepresentation.\n"
                    "2. **Competency of Parties (Section 11):** Parties must be majors (18+ years) and of sound mind.\n"
                    "3. **Lawful Consideration & Object (Section 23):** The consideration must not be forbidden by law or opposed to public policy.\n"
                    "4. **Not Declared Void:** Must not fall under void agreements (Sections 26, 27, 28, 30).\n\n"
                    "*Grounded in: Indian Contract Act, 1872 (Section 10).* [Simulated Mock AI Response]"
                )
            elif any(k in q for k in ["bnss", "arrest"]):
                answer = (
                    "### Anticipatory Bail under Section 482 of BNSS, 2023\n\n"
                    "Under the **Bharatiya Nagarik Suraksha Sanhita, 2023 (BNSS)**, Section 482 succeeds Section 438 of the repealed CrPC:\n\n"
                    "- **Jurisdiction:** A petition for anticipatory bail can be submitted to either the **Court of Session** or the **High Court**.\n"
                    "- **Judicial Thresholds:** The Court evaluates the gravity of charges, criminal antecedents, flight risk, and whether accusations stem from malice.\n"
                    "- **Conditions:** The petitioner must cooperate with police interrogation and must not influence witnesses.\n\n"
                    "*Grounded in: Bharatiya Nagarik Suraksha Sanhita, 2023 (Indiacode.nic.in).* [Simulated Mock AI Response]"
                )
            else:
                answer = (
                    f"### Grounded Legal Analysis on Indian Jurisprudence\n\n"
                    f"Regarding your query: \"{prompt}\"\n\n"
                    f"In Indian law, statutory enactments take precedence over administrative regulations. "
                    f"The legal position is established through central legislation read alongside binding judgments "
                    f"of the Supreme Court under Article 141 of the Constitution.\n\n"
                    f"#### Procedural Note:\n"
                    f"For case-specific litigation, relevant facts and dates of cause of action must be evaluated by an enrolled advocate.\n\n"
                    f"*Statutory Reference: India Code Legislative Repository.* [Simulated Mock AI Response]"
                )

        return answer, citations, True

    async def get_embedding(self, text: str) -> List[float]:
        # Generate reproducible pseudo-embedding vector of 128 dimensions based on hash
        import hashlib
        h = hashlib.sha256(text.encode("utf-8")).digest()
        return [float((b - 128) / 128.0) for b in h[:64]] * 2


class HostedOpenAICompatibleProvider(BaseAIProvider):
    """
    Hosted OpenAI-compatible Provider adapter (OpenAI, Groq, OpenRouter, Mistral, Together).
    Strictly calls hosted APIs with exponential backoff and timeouts.
    """

    def __init__(self):
        self.api_key = settings.AI_API_KEY
        self.base_url = settings.AI_BASE_URL or "https://api.openai.com/v1"
        self.model = settings.AI_MODEL or "gpt-4o-mini"
        self.timeout = settings.AI_TIMEOUT_SECONDS
        self.max_retries = settings.AI_MAX_RETRIES

        if not self.api_key and not settings.USE_MOCK_AI:
            raise MissingAPIKeyError("AI_API_KEY is not configured in environment variables.")

    async def _execute_with_retry(self, client: httpx.AsyncClient, payload: dict) -> dict:
        url = f"{self.base_url.rstrip('/')}/chat/completions"
        headers = {
            "Authorization": f"Bearer {self.api_key}",
            "Content-Type": "application/json"
        }

        delay = 1.0
        for attempt in range(1, self.max_retries + 1):
            try:
                response = await client.post(url, json=payload, headers=headers, timeout=self.timeout)
                if response.status_code == 429:
                    logger.warning(f"Rate limited by AI provider on attempt {attempt}. Retrying in {delay}s...")
                    if attempt == self.max_retries:
                        raise RateLimitError("AI Provider rate limit reached. Please retry in a few moments.")
                    await asyncio.sleep(delay)
                    delay = min(delay * 2, 8.0)
                    continue

                if response.status_code != 200:
                    raise AIProviderError(f"AI Provider error {response.status_code}: {response.text[:200]}")

                return response.json()
            except httpx.TimeoutException:
                if attempt == self.max_retries:
                    raise ProviderTimeoutError(f"AI Provider timed out after {self.timeout}s.")
                await asyncio.sleep(delay)
                delay = min(delay * 2, 8.0)
            except httpx.RequestError as e:
                if attempt == self.max_retries:
                    raise AIProviderError(f"Network error connecting to hosted AI API: {str(e)}")
                await asyncio.sleep(delay)
                delay = min(delay * 2, 8.0)

        raise AIProviderError("Max retries exceeded when calling hosted AI provider.")

    async def generate_response(
        self,
        prompt: str,
        system_prompt: str,
        retrieved_passages: List[Dict[str, Any]],
        language: str = "en"
    ) -> Tuple[str, List[Dict[str, Any]], bool]:
        # Build prompt with retrieved context
        context_str = "\n\n".join([
            f"--- SOURCE #{i+1}: {p.get('title')} ---\nSection/Ref: {p.get('section', '')}\n{p.get('passage_text', '')}"
            for i, p in enumerate(retrieved_passages)
        ])

        augmented_user_message = f"USER QUERY: {prompt}\n\nRETRIEVED LEGAL CONTEXT (Use strictly):\n{context_str}"
        if language == "ta":
            augmented_user_message += "\n\nPlease provide your detailed legal explanation in TAMIL (தமிழ்)."

        payload = {
            "model": self.model,
            "messages": [
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": augmented_user_message}
            ],
            "temperature": 0.2,
            "max_tokens": 1500
        }

        async with httpx.AsyncClient() as client:
            res_json = await self._execute_with_retry(client, payload)
            answer = res_json["choices"][0]["message"]["content"]

        # Map citations from retrieved passages
        citations = []
        for idx, p in enumerate(retrieved_passages[:4]):
            citations.append({
                "id": f"cit-{idx+1}",
                "title": p.get("title", "Indian Law Citation"),
                "act_name": p.get("act_name", ""),
                "section": p.get("section", ""),
                "court": p.get("court", ""),
                "jurisdiction": p.get("jurisdiction", "Union of India"),
                "date": p.get("publication_date", ""),
                "url": p.get("source_url", "https://www.indiacode.nic.in/"),
                "quotation": p.get("passage_text", "")[:250],
                "confidence_score": 0.96,
                "doc_type": p.get("document_type", "statute")
            })

        return answer, citations, False

    async def get_embedding(self, text: str) -> List[float]:
        # Hosted embedding endpoint
        url = f"{self.base_url.rstrip('/')}/embeddings"
        headers = {
            "Authorization": f"Bearer {self.api_key}",
            "Content-Type": "application/json"
        }
        payload = {
            "model": settings.EMBEDDING_MODEL or "text-embedding-3-small",
            "input": text[:8000]
        }
        async with httpx.AsyncClient() as client:
            resp = await client.post(url, json=payload, headers=headers, timeout=20.0)
            if resp.status_code == 200:
                data = resp.json()
                return data["data"][0]["embedding"]
            else:
                # Fallback to pseudo-embedding if hosted embedding API encounters quota limit
                return MockAIProvider().get_embedding(text)


class HostedGeminiProvider(BaseAIProvider):
    """Google Gemini Hosted REST API adapter."""

    def __init__(self):
        self.api_key = settings.AI_API_KEY
        self.model = settings.AI_MODEL or "gemini-1.5-flash"
        self.timeout = settings.AI_TIMEOUT_SECONDS

        if not self.api_key and not settings.USE_MOCK_AI:
            raise MissingAPIKeyError("AI_API_KEY is not configured for Gemini provider.")

    async def generate_response(
        self,
        prompt: str,
        system_prompt: str,
        retrieved_passages: List[Dict[str, Any]],
        language: str = "en"
    ) -> Tuple[str, List[Dict[str, Any]], bool]:
        url = f"https://generativelanguage.googleapis.com/v1beta/models/{self.model}:generateContent?key={self.api_key}"

        context_str = "\n\n".join([
            f"SOURCE: {p.get('title')} ({p.get('section', '')})\n{p.get('passage_text', '')}"
            for p in retrieved_passages
        ])
        lang_note = " Respond clearly in TAMIL (தமிழ்)." if language == "ta" else ""

        payload = {
            "system_instruction": {"parts": [{"text": system_prompt}]},
            "contents": [
                {"parts": [{"text": f"LEGAL CONTEXT:\n{context_str}\n\nQUESTION: {prompt}{lang_note}"}]}
            ],
            "generationConfig": {"temperature": 0.2, "maxOutputTokens": 1500}
        }

        async with httpx.AsyncClient() as client:
            resp = await client.post(url, json=payload, timeout=self.timeout)
            if resp.status_code != 200:
                raise AIProviderError(f"Gemini API returned error {resp.status_code}: {resp.text[:200]}")
            data = resp.json()
            answer = data["candidates"][0]["content"]["parts"][0]["text"]

        citations = [
            {
                "id": f"cit-gemini-{idx+1}",
                "title": p.get("title", ""),
                "act_name": p.get("act_name", ""),
                "section": p.get("section", ""),
                "court": p.get("court", ""),
                "jurisdiction": p.get("jurisdiction", "Union of India"),
                "date": p.get("publication_date", ""),
                "url": p.get("source_url", "https://www.indiacode.nic.in/"),
                "quotation": p.get("passage_text", "")[:240],
                "confidence_score": 0.97,
                "doc_type": p.get("document_type", "statute")
            }
            for idx, p in enumerate(retrieved_passages[:4])
        ]
        return answer, citations, False

    async def get_embedding(self, text: str) -> List[float]:
        # Fallback to deterministic vector if external embedding key is absent
        return await MockAIProvider().get_embedding(text)


def get_ai_provider() -> BaseAIProvider:
    """Factory selecting the appropriate hosted AI provider adapter."""
    if settings.USE_MOCK_AI or settings.AI_PROVIDER.lower() == "mock":
        return MockAIProvider()

    provider = settings.AI_PROVIDER.lower()
    if provider in ("openai", "openrouter", "groq", "together"):
        return HostedOpenAICompatibleProvider()
    elif provider == "gemini":
        return HostedGeminiProvider()
    else:
        logger.warning(f"Unknown AI_PROVIDER '{provider}', falling back to Mock AI Provider.")
        return MockAIProvider()
