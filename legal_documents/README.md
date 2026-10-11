# NyayaAI Legal Documents Repository

This directory contains legally obtained and public domain Indian legal texts, statutory acts, and landmark judgments for indexing in the NyayaAI RAG pipeline.

## Official Public Domain Sources:
1. **India Code (Digital Repository of all Central and State Acts)**: https://www.indiacode.nic.in/
2. **Supreme Court of India (Judgments & Orders)**: https://www.sci.gov.in/
3. **eCourts Services (Case Status & Judgments)**: https://ecourts.gov.in/
4. **The Gazette of India (e-Gazette notifications)**: https://egazette.gov.in/

## Included Curated Legal Corpora:
- `constitution_of_india.json`: Core fundamental rights, writ jurisdiction, directive principles.
- `bns_2023.json`: Bharatiya Nyaya Sanhita, 2023 (Penal provisions replacing IPC 1860, effective July 1, 2024).
- `bnss_2023.json`: Bharatiya Nagarik Suraksha Sanhita, 2023 (Criminal procedural law replacing CrPC 1973).
- `bsa_2023.json`: Bharatiya Sakshya Adhiniyam, 2023 (Law of Evidence replacing IEA 1872).
- `indian_contract_act_1872.json`: Formation, validity, voidability, damages for breach.
- `consumer_protection_act_2019.json`: Consumer disputes, CCPA, unfair trade practices, e-commerce.
- `it_act_2000.json`: Information Technology Act (Cyber offenses, digital evidence, intermediary liability).
- `cpc_1908.json`: Code of Civil Procedure (Civil suits, jurisdiction, res judicata, summary suits).
- `landmark_judgments.json`: Verified Supreme Court landmark verdicts with authoritative citations (AIR/SCC).

## Ingestion Notes:
- Documents can be ingested via the CLI ingestion script: `python scripts/ingest_knowledge_base.py`
- User-uploaded PDF/text files are processed safely with PyMuPDF, isolated per user session, and scanned for prompt injection attacks.

