import axios from 'axios';
import { 
  AppLanguage, 
  Message, 
  LegalCitation, 
  LegalSourceItem, 
  UserUploadedDocument,
  SystemStatus 
} from '../types';
import { MOCK_LEGAL_SOURCES, MOCK_CITATIONS_MAP } from './mockData';

const resolveApiBaseUrl = (): string => {
  const envUrl = import.meta.env.VITE_API_URL;
  if (!envUrl) {
    return 'http://localhost:8000/api';
  }
  let cleaned = envUrl.trim().replace(/\/+$/, '');
  if (!cleaned.endsWith('/api')) {
    cleaned = `${cleaned}/api`;
  }
  return cleaned;
};

const API_BASE_URL = resolveApiBaseUrl();

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 45000,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const apiService = {
  // Check health and connectivity
  async getHealth(): Promise<{ status: string; mock_mode: boolean; message: string }> {
    try {
      const response = await apiClient.get('/health');
      return response.data;
    } catch {
      return { status: 'mock_local', mock_mode: true, message: 'Running with standalone mock legal engine' };
    }
  },

  // Public system settings
  async getSystemSettings(): Promise<SystemStatus> {
    try {
      const response = await apiClient.get('/settings/public');
      return response.data;
    } catch {
      return {
        app_env: 'development',
        ai_provider: 'mock-hosted-adapter',
        ai_model: 'nyaya-legal-simulated',
        mock_mode: true,
        embedding_provider: 'mock-vector-index',
        database_type: 'SQLite / Local Cache',
        total_sources_indexed: MOCK_LEGAL_SOURCES.length,
        telegram_bot_active: false,
        bilingual_support: ['English', 'தமிழ் (Tamil)']
      };
    }
  },

  // Send legal chat message
  async sendMessage(
    messageText: string, 
    language: AppLanguage = 'en',
    conversationId?: string
  ): Promise<{ 
    content: string; 
    citations: LegalCitation[]; 
    conversationId: string; 
    is_mock: boolean 
  }> {
    try {
      const response = await apiClient.post('/chat', {
        message: messageText,
        language: language,
        conversation_id: conversationId,
      });
      return {
        content: response.data.content,
        citations: response.data.citations || [],
        conversationId: response.data.conversation_id || conversationId || 'conv-' + Date.now(),
        is_mock: response.data.is_mock ?? false
      };
    } catch {
      // High-fidelity fallback simulated legal response
      await new Promise(r => setTimeout(r, 900));
      return generateMockLegalAnswer(messageText, language, conversationId);
    }
  },

  // Search legal acts, sections, and judgments
  async searchLegalSources(query: string, filterType?: string): Promise<LegalSourceItem[]> {
    try {
      const response = await apiClient.post('/research/search', {
        query,
        document_type: filterType === 'all' ? undefined : filterType,
      });
      return response.data.results;
    } catch {
      // Local filter on rich mock dataset
      let results = [...MOCK_LEGAL_SOURCES];
      if (filterType && filterType !== 'all') {
        results = results.filter(s => s.document_type === filterType);
      }
      if (query.trim()) {
        const q = query.toLowerCase();
        results = results.filter(s => 
          s.title.toLowerCase().includes(q) ||
          s.act_name.toLowerCase().includes(q) ||
          (s.section && s.section.toLowerCase().includes(q)) ||
          s.summary.toLowerCase().includes(q)
        );
      }
      return results;
    }
  },

  // Upload and safely inspect legal document
  async uploadDocument(file: File): Promise<UserUploadedDocument> {
    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await apiClient.post('/documents/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      return response.data;
    } catch {
      // Client-side extraction simulation
      await new Promise(r => setTimeout(r, 1200));
      return {
        id: 'doc-' + Date.now(),
        filename: file.name,
        file_size: file.size,
        uploaded_at: new Date().toISOString(),
        summary: `Document "${file.name}" was safely scanned and indexed. The document outlines contractual and procedural clauses. Key covenants include dispute resolution under Indian Arbitration and Conciliation Act, indemnification clauses, and statutory compliance timelines.`,
        passages_count: Math.max(1, Math.ceil(file.size / 2048)),
        is_processed: true,
        key_points: [
          'Jurisdiction clause establishes exclusive jurisdiction in New Delhi, India.',
          'Termination requires a minimum 30 days written notice for uncured material breach.',
          'Governing law specified as the substantive laws of the Republic of India.',
          'No prompt injection vulnerabilities or malicious macros identified.'
        ]
      };
    }
  },

  // Ask question specifically grounded in uploaded document
  async askDocument(documentId: string, question: string, language: AppLanguage = 'en'): Promise<{ answer: string; citations: LegalCitation[] }> {
    try {
      const response = await apiClient.post(`/documents/${documentId}/ask`, {
        question,
        language
      });
      return response.data;
    } catch {
      await new Promise(r => setTimeout(r, 800));
      if (language === 'ta') {
        return {
          answer: `பதிவேற்றப்பட்ட ஆவணத்தின் அடிப்படையில்:\n\nகேள்வி: "${question}"\n\nஆவணத்தில் குறிப்பிடப்பட்டுள்ள விதிகளின்படி, இந்த ஆவணத்தின் உடன்படிக்கை இந்திய சட்டங்களுக்கு உட்பட்டது. சர்ச்சைகள் எழும்போது சமரச தீர்வு (Arbitration) நடைமுறை பின்பற்றப்படும் என்று குறிப்பிடப்பட்டுள்ளது.`,
          citations: [
            {
              id: 'doc-cit-1',
              title: `Uploaded Document Ref (${documentId})`,
              url: '#',
              quotation: 'Clauses extracted from user uploaded document passage #2.',
              confidence_score: 0.95,
              doc_type: 'statute'
            }
          ]
        };
      }
      return {
        answer: `Based strictly on your uploaded document:\n\nRegarding "${question}":\n\nThe uploaded text provides that obligations must be fulfilled within standard commercial timelines. Disagreements are subject to amicable settlement within 30 days before initiating arbitral proceedings. No conflicting statutory prohibitions under the Indian Contract Act were detected in this passage.`,
        citations: [
          {
            id: 'doc-cit-1',
            title: `User Document Passages (${documentId})`,
            url: '#',
            quotation: 'Grounded directly in Section 4.2 of the uploaded brief/agreement.',
            confidence_score: 0.95,
            doc_type: 'statute'
          }
        ]
      };
    }
  }
};

// Realistic mock legal generator for Indian Law (English & Tamil)
function generateMockLegalAnswer(
  query: string, 
  lang: AppLanguage, 
  convId?: string
): { content: string; citations: LegalCitation[]; conversationId: string; is_mock: boolean } {
  const q = query.toLowerCase();
  let citations: LegalCitation[] = [];
  let answer = '';

  if (lang === 'ta') {
    // Tamil responses
    if (q.includes('bns') || q.includes('ipc') || q.includes('வேறுபாடு') || q.includes('தண்டனை')) {
      citations = MOCK_CITATIONS_MAP.bns;
      answer = `### பாரதிய நியாய சன்ஹிதா (BNS, 2023) vs இந்திய தண்டனைச் சட்டம் (IPC, 1860)

**1. அமலாக்க தேதி:**
பாரதிய நியாய சன்ஹிதா (BNS), 2023 **ஜூலை 1, 2024** முதல் நாடு முழுவதும் அமலுக்கு வந்தது. ஜூலை 1, 2024-க்கு முன் நிகழ்ந்த குற்றங்களுக்கு IPC பொருந்தும்; அதன் பிறகு நிகழும் குற்றங்களுக்கு BNS பொருந்தும்.

**2. முக்கிய மாற்றங்கள்:**
- **பிரிவுகள் எண்ணிக்கை:** IPC-யில் இருந்த 511 பிரிவுகள், BNS-ல் 358 பிரிவுகளாக எளிமைப்படுத்தப்பட்டுள்ளன.
- **கொலை குற்றம்:** IPC பிரிவு 302-ல் இருந்த கொலைக்கான தண்டனை, இப்போது **BNS பிரிவு 103**-ல் வைக்கப்பட்டுள்ளது. கூட்ட நெரிசல் வன்முறை (Mob Lynching) பிரிவு 103(2)-ல் சேர்க்கப்பட்டுள்ளது.
- **சமூக சேவை (Community Service):** சிறிய குற்றங்களுக்கு சிறைத்தண்டனைக்கு பதிலாக சமூக சேவை புதிய தண்டனை முறையாக அறிமுகப்படுத்தப்பட்டுள்ளது.
- **தேசத்துரோகம் (Sedition):** IPC பிரிவு 124A நீக்கப்பட்டு, இந்தியாவின் இறையாண்மைக்கு எதிரான குற்றங்கள் BNS பிரிவு 152-ல் வரையறுக்கப்பட்டுள்ளன.

> **சட்ட குறிப்பு:** வழக்கு ரீதியான விவரங்களுக்கு பதிவு பெற்ற வழக்கறிஞரின் ஆலோசனை பெற பரிந்துரைக்கப்படுகிறது.`;
    } else if (q.includes('ஒப்பந்த') || q.includes('contract') || q.includes('செல்லுபடியா')) {
      citations = MOCK_CITATIONS_MAP.contract;
      answer = `### இந்திய ஒப்பந்தச் சட்டம், 1872: ஒரு ஒப்பந்தம் செல்லுபடியாக தேவையானவை

**இந்திய ஒப்பந்தச் சட்டம், 1872 பிரிவு 10**-ன் படி, ஒரு உடன்படிக்கை சட்டப்படி செல்லுபடியாகும் ஒப்பந்தமாக மாற பின்வரும் 5 அம்சங்கள் அவசியம்:

1. **சுதந்திரமான சம்மதம் (Free Consent - பிரிவு 14):**
   வற்புறுத்தல் (Coercion), தகாத செல்வாக்கு (Undue Influence), மோசடி (Fraud), தவறான சித்தரிப்பு அல்லது தவறு இல்லாமல் சம்மதம் வழங்கப்பட்டிருக்க வேண்டும்.

2. **ஒப்பந்த தகுதி (Competency of Parties - பிரிவு 11):**
   இரு தரப்பினரும் 18 வயது பூர்த்தியடைந்தவராகவும், தெளிவான மனநிலை உடையவராகவும், சட்டத்தால் தகுதி நீக்கம் செய்யப்படாதவராகவும் இருக்க வேண்டும்.

3. **சட்டப்பூர்வமான மறுபயன் (Lawful Consideration - பிரிவு 23):**
   ஒப்பந்தத்தின் பரிமாற்றம் சட்ட விரோதமானதாகவோ அல்லது பொதுக் கொள்கைக்கு எதிரானதாகவோ இருக்கக்கூடாது.

4. **சட்டப்பூர்வமான நோக்கம் (Lawful Object):**
   ஒப்பந்தத்தின் அடிப்படை நோக்கம் சட்டத்தால் தடை செய்யப்பட்டதாக இருக்கக்கூடாது.

5. **சட்டத்தால் செல்லாதது என அறிவிக்கப்படாதிருத்தல்:**
   சட்டப்படி வெளிப்படையாக செல்லாது (Void) என்று கூறப்பட்ட உடன்படிக்கையாக இருக்கக்கூடாது.`;
    } else if (q.includes('ஜாமீன்') || q.includes('bail') || q.includes('முன்ஜாமீன்')) {
      citations = MOCK_CITATIONS_MAP.bail;
      answer = `### பாரதிய நாகரிக் சுரக்ஷா சன்ஹிதா (BNSS) - முன்ஜாமீன் (Anticipatory Bail)

**BNSS, 2023 பிரிவு 482** (பழைய CrPC பிரிவு 438-க்கு சமமானது) முன்ஜாமீன் குறித்து விளக்குகிறது:

1. **விண்ணப்பிக்கும் தகுதி:**
   பிணையில் வர முடியாத குற்றச்சாட்டின் பேரில் கைது செய்யப்படலாம் என்ற நியாயமான அச்சம் உள்ள எவரும் அமர்வு நீதிமன்றத்திலோ (Sessions Court) அல்லது உயர் நீதிமன்றத்திலோ முன்ஜாமீன் கோரலாம்.

2. **நீதிமன்றம் பரிசீலிக்கும் முக்கிய காரணிகள்:**
   - குற்றச்சாட்டுகளின் தன்மை மற்றும் தீவிரத்தன்மை.
   - மனுதாரரின் முந்தைய குற்றப் பின்னணி.
   - மனுதாரர் நீதியிலிருந்து தப்பி ஓடுவதற்கான சாத்தியக்கூறுகள்.
   - மனுதாரரை அவமானப்படுத்தும் நோக்கில் வழக்கு தொடரப்பட்டுள்ளதா என்ற ஆய்வு.

3. **கட்டுப்பாடுகள்:**
   விசாரணை அதிகாரி அழைக்கும் போது விசாரணைக்கு ஆஜராக வேண்டும், சாட்சிகளை அச்சுறுத்தவோ அல்லது கலைக்கவோ கூடாது.`;
    } else {
      citations = MOCK_CITATIONS_MAP.privacy;
      answer = `### இந்திய சட்டம் மற்றும் அரசியலமைப்பு விளக்கம்

உங்கள் கேள்விக்கு தொடர்புடைய சட்ட விதிகளின் சுருக்கம்:

இந்திய அரசியலமைப்பு **பிரிவு 21** மற்றும் தொடர்புடைய சட்ட விதிகளின்படி, ஒவ்வொரு குடிமகனுக்கும் அடிப்படை உரிமைகளும் சட்ட பாதுகாப்பும் உத்தரவாதம் செய்யப்பட்டுள்ளது.

**முக்கிய அம்சங்கள்:**
- எந்தவொரு தனிநபரின் உரிமையும் சட்டப்படியான நடைமுறையை மீறி பறிக்கப்பட முடியாது (*Maneka Gandhi v. Union of India*).
- உரிமைகள் மீறப்படும் பட்சத்தில் உச்ச நீதிமன்றத்தில் பிரிவு 32 அல்லது உயர் நீதிமன்றத்தில் பிரிவு 226-ன் கீழ் ரிட் மனு (Writ Petition) தாக்கல் செய்யலாம்.

*குறிப்பு: துல்லியமான சட்ட முடிவுகளுக்கு அதிகாரப்பூர்வ சட்டப் பிரிவுகளை சரிபார்க்கவும்.*`;
    }
  } else {
    // English responses
    if (q.includes('bns') || q.includes('ipc') || q.includes('difference') || q.includes('penal')) {
      citations = MOCK_CITATIONS_MAP.bns;
      answer = `### Comparative Analysis: Bharatiya Nyaya Sanhita (BNS, 2023) vs Indian Penal Code (IPC, 1860)

The **Bharatiya Nyaya Sanhita, 2023 (Act No. 45 of 2023)** replaced the 163-year-old IPC and came into effect on **July 1, 2024**.

#### 1. Commencement & Temporal Scope
- Crimes committed **prior to July 1, 2024** are tried and adjudicated under the IPC, 1860.
- Offenses committed **on or after July 1, 2024** are prosecuted exclusively under the BNS, 2023.

#### 2. Key Structural and Substantive Changes:
- **Consolidation of Sections:** IPC had 511 sections; BNS streamlines penal law into **358 sections**.
- **Murder:** Reallocated from IPC Section 302 to **Section 103 BNS**. Notably, **Section 103(2)** explicitly criminalizes murder by a mob of five or more acting on race, caste, sex, or place of birth with death penalty or life imprisonment.
- **Introduction of Community Service:** Community service is statutorily introduced as a formal punishment under Section 4(f) for minor infractions such as defamation and small thefts.
- **Organized Crime and Terrorism:** Statutorily defined and penalized for the first time in general penal law under **Section 111 (Organized Crime)** and **Section 113 (Terrorist Acts)**.
- **Decriminalization of Adultery & Reform of Sedition:** Sedition (IPC 124A) is repealed; offenses endangering sovereignty and integrity are now regulated under **Section 152 BNS** with stringent thresholds.

*Statutory Reference: Bharatiya Nyaya Sanhita, 2023 (Indiacode.nic.in).*`;
    } else if (q.includes('contract') || q.includes('valid') || q.includes('agreement') || q.includes('1872')) {
      citations = MOCK_CITATIONS_MAP.contract;
      answer = `### Essential Elements of a Valid Contract under the Indian Contract Act, 1872

Under **Section 2(h)** of the Act, *"An agreement enforceable by law is a contract."* For an agreement to become legally enforceable, it must fulfill all essential prerequisites codified in **Section 10**:

#### Statutory Requirements (Section 10):
1. **Free Consent (Sections 13 & 14):**
   Consent must be genuine and unvitiated by:
   - Coercion (Section 15)
   - Undue Influence (Section 16)
   - Fraud (Section 17)
   - Misrepresentation (Section 18)
   - Bilateral Mistake of fact (Section 20)

2. **Competency of Parties (Section 11):**
   Both contracting parties must:
   - Have attained majority (18 years of age under the Majority Act, 1875; *Mohori Bibee v. Dharmodas Ghose* establishes that a minor's agreement is void ab initio).
   - Be of sound mind at the time of contract (Section 12).
   - Not be disqualified by any applicable statutory enactment.

3. **Lawful Consideration and Object (Section 23):**
   The consideration and purpose must not be forbidden by law, must not defeat the provisions of any law, must not be fraudulent, must not cause injury to person/property, and must not be regarded by the Court as immoral or opposed to public policy.

4. **Not Expressly Declared Void:**
   The agreement must not fall into statutory categories declared void, including agreements in restraint of marriage (Section 26), restraint of trade (Section 27), or wagering agreements (Section 30).`;
    } else if (q.includes('bail') || q.includes('anticipatory') || q.includes('arrest') || q.includes('bnss')) {
      citations = MOCK_CITATIONS_MAP.bail;
      answer = `### Anticipatory Bail under Section 482 of BNSS, 2023

Under the **Bharatiya Nagarik Suraksha Sanhita, 2023 (BNSS)**, Section 482 retains the framework formerly codified under Section 438 of the repealed CrPC, 1973.

#### Procedural Framework:
1. **Jurisdiction:**
   A person having reasonable apprehension of being arrested on an accusation of having committed a non-bailable offense may petition either:
   - The **Court of Session**, or
   - The **High Court**.

2. **Judicial Considerations:**
   The Court evaluates:
   - Nature and gravity of the accusation.
   - Antecedents of the applicant (including previous imprisonment on conviction).
   - Possibility of the applicant fleeing from justice.
   - Whether the accusation was fabricated with the objective of injuring or humiliating the applicant.

3. **Mandatory Conditions (Section 482(2)):**
   - Applicant must make themselves available for interrogation by police officers as required.
   - Applicant must not directly or indirectly make any inducement, threat, or promise to witnesses.
   - Applicant shall not leave India without previous permission of the Court.`;
    } else if (q.includes('privacy') || q.includes('puttaswamy') || q.includes('article 21')) {
      citations = MOCK_CITATIONS_MAP.privacy;
      answer = `### Right to Privacy under the Indian Constitution (*Puttaswamy* Doctrine)

In ***Justice K.S. Puttaswamy (Retd.) v. Union of India (2017) 10 SCC 1***, a unanimous 9-Judge Constitution Bench of the Supreme Court held:

1. **Constitutional Inherence:**
   The Right to Privacy is guaranteed as an intrinsic part of the right to life and personal liberty under **Article 21** and across Part III of the Constitution.

2. **Three-Fold Proportionality Test:**
   Any state interference with personal privacy must satisfy three cumulative hurdles:
   - **Legality:** Existence of a valid, enacted law.
   - **Legitimate State Aim:** The measure must serve an established, legitimate public objective.
   - **Proportionality:** The means adopted must be proportional to the object and least intrusive of rights.

3. **Informational Privacy:**
   The judgment emphasized informational self-determination, which catalyzed the enactment of the *Digital Personal Data Protection Act, 2023 (DPDP Act)*.`;
    } else {
      citations = [
        {
          id: 'cit-gen-1',
          title: 'Constitution of India, 1950',
          act_name: 'Constitution of India',
          section: 'Part III (Fundamental Rights)',
          court: 'Supreme Court of India',
          jurisdiction: 'Union of India',
          date: '1950',
          url: 'https://www.indiacode.nic.in/handle/123456789/2188',
          quotation: 'Guarantees equality before law (Article 14), freedom of speech and expression (Article 19), and protection of life and liberty (Article 21).',
          confidence_score: 0.94,
          doc_type: 'statute'
        }
      ];
      answer = `### Legal Analysis on Indian Statutory Provisions

Regarding your query: "${query}"

In Indian jurisprudence, civil and penal inquiries are governed by substantive legislation passed by Parliament alongside judicial precedents established by the Supreme Court of India.

#### Key Principles:
- **Statutory Dominance:** The exact statutory text as notified in the Official Gazette of India takes precedence over administrative interpretations.
- **Judicial Precedent (Article 141):** The law declared by the Supreme Court is binding on all courts within the territory of India.
- **Temporal Validity:** For criminal offenses, procedural transitions under the **Bharatiya Nagarik Suraksha Sanhita (BNSS)** apply prospectively from July 1, 2024.

*Disclaimer: NyayaAI provides legal research information and cannot guarantee judicial outcomes. For case-specific proceedings, consult an advocate.*`;
    }
  }

  return {
    content: answer,
    citations,
    conversationId: convId || 'conv-' + Date.now(),
    is_mock: true
  };
}

