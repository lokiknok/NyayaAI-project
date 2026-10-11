import json
from typing import List, Dict, Any

SEED_LEGAL_SOURCES: List[Dict[str, Any]] = [
    {
        "id": "bns-sec-103",
        "title": "Bharatiya Nyaya Sanhita, 2023 - Section 103 (Punishment for murder)",
        "act_name": "Bharatiya Nyaya Sanhita, 2023",
        "section": "Section 103",
        "court": "Parliament of India",
        "jurisdiction": "Union of India",
        "document_type": "statute",
        "publication_date": "2023-12-25",
        "effective_date": "2024-07-01",
        "source_url": "https://www.indiacode.nic.in/handle/123456789/2143",
        "summary": "Prescribes death penalty or imprisonment for life and fine for murder. Introduces subsection (2) penalizing mob lynching by five or more persons on grounds of race, caste, sex, or place of birth.",
        "full_text": "(1) Whoever commits murder shall be punished with death or imprisonment for life, and shall also be liable to fine.\n(2) When a group of five or more persons acting in concert commits murder on the ground of race, caste or community, sex, place of birth, language, personal belief or any other similar ground, each member of such group shall be punished with death or with imprisonment for life, and shall also be liable to fine."
    },
    {
        "id": "bns-sec-111",
        "title": "Bharatiya Nyaya Sanhita, 2023 - Section 111 (Organised crime)",
        "act_name": "Bharatiya Nyaya Sanhita, 2023",
        "section": "Section 111",
        "court": "Parliament of India",
        "jurisdiction": "Union of India",
        "document_type": "statute",
        "publication_date": "2023-12-25",
        "effective_date": "2024-07-01",
        "source_url": "https://www.indiacode.nic.in/handle/123456789/2143",
        "summary": "Statutorily defines and penalizes organised crime syndicate activities including kidnapping, robbery, extortion, land grabbing, contract killing, and economic offences.",
        "full_text": "Any continuing unlawful activity including kidnapping, robbery, vehicle theft, extortion, land grabbing, contract killing, economic offence, cyber-crimes having severe consequences, trafficking in persons, drugs or weapons, done by any person either as a member of an organised crime syndicate or on behalf of such syndicate."
    },
    {
        "id": "bnss-sec-482",
        "title": "Bharatiya Nagarik Suraksha Sanhita, 2023 - Section 482 (Anticipatory Bail)",
        "act_name": "Bharatiya Nagarik Suraksha Sanhita, 2023",
        "section": "Section 482",
        "court": "Parliament of India",
        "jurisdiction": "Union of India",
        "document_type": "statute",
        "publication_date": "2023-12-25",
        "effective_date": "2024-07-01",
        "source_url": "https://www.indiacode.nic.in/handle/123456789/2144",
        "summary": "Direction for grant of bail to person apprehending arrest (corresponding to Section 438 of the repealed Code of Criminal Procedure, 1973). The High Court or Court of Session may issue directions.",
        "full_text": "Where any person has reason to believe that he may be arrested on an accusation of having committed a non-bailable offence, he may apply to the High Court or the Court of Session for a direction under this section; and that Court may, if it thinks fit, direct that in the event of such arrest, he shall be released on bail."
    },
    {
        "id": "contract-sec-10",
        "title": "Indian Contract Act, 1872 - Section 10 (What agreements are contracts)",
        "act_name": "Indian Contract Act, 1872",
        "section": "Section 10",
        "court": "Central Legislative Council",
        "jurisdiction": "Union of India",
        "document_type": "statute",
        "publication_date": "1872-04-25",
        "effective_date": "1872-09-01",
        "source_url": "https://www.indiacode.nic.in/handle/123456789/2187",
        "summary": "Defines the essential ingredients of a legally enforceable contract: free consent of parties competent to contract, lawful consideration, lawful object, and not expressly declared void.",
        "full_text": "All agreements are contracts if they are made by the free consent of parties competent to contract, for a lawful consideration and with a lawful object, and are not hereby expressly declared to be void."
    },
    {
        "id": "contract-sec-73",
        "title": "Indian Contract Act, 1872 - Section 73 (Compensation for loss or damage caused by breach)",
        "act_name": "Indian Contract Act, 1872",
        "section": "Section 73",
        "court": "Central Legislative Council",
        "jurisdiction": "Union of India",
        "document_type": "statute",
        "publication_date": "1872-04-25",
        "effective_date": "1872-09-01",
        "source_url": "https://www.indiacode.nic.in/handle/123456789/2187",
        "summary": "Entitles the party suffering from a breach of contract to receive compensation for naturally arising loss, excluding remote and indirect damages.",
        "full_text": "When a contract has been broken, the party who suffers by such breach is entitled to receive, from the party who has broken the contract, compensation for any loss or damage caused to him thereby, which naturally arose in the usual course of things from such breach, or which the parties knew, when they made the contract, to be likely to result from the breach of it."
    },
    {
        "id": "const-art-21",
        "title": "Constitution of India - Article 21 (Protection of life and personal liberty)",
        "act_name": "Constitution of India",
        "section": "Article 21",
        "court": "Constituent Assembly of India",
        "jurisdiction": "Union of India",
        "document_type": "statute",
        "publication_date": "1950-01-26",
        "effective_date": "1950-01-26",
        "source_url": "https://www.indiacode.nic.in/handle/123456789/2188",
        "summary": "Guarantees that no person shall be deprived of his life or personal liberty except according to procedure established by law. Expansively interpreted by the Supreme Court to encompass dignity, privacy, and fair trial.",
        "full_text": "No person shall be deprived of his life or personal liberty except according to procedure established by law."
    },
    {
        "id": "puttaswamy-2017",
        "title": "Justice K.S. Puttaswamy (Retd.) and Anr. v. Union of India and Ors. (2017) 10 SCC 1",
        "act_name": "Constitution of India (Articles 14, 19, 21)",
        "court": "Supreme Court of India",
        "jurisdiction": "Supreme Court of India (9-Judge Constitution Bench)",
        "document_type": "judgment",
        "publication_date": "2017-08-24",
        "source_url": "https://www.sci.gov.in/judgments/",
        "summary": "Unanimously affirmed that the Right to Privacy is a fundamental right emanating primarily from Article 21 and Part III of the Constitution. Established three-fold proportionality test for state infringement.",
        "full_text": "The right to privacy is protected as an intrinsic part of the right to life and personal liberty under Article 21 and as a part of the freedoms guaranteed by Part III of the Constitution. State interference must pass the three-fold test of legality, legitimate state aim, and proportionality."
    },
    {
        "id": "dk-basu-1997",
        "title": "D.K. Basu v. State of West Bengal (1997) 1 SCC 416",
        "act_name": "Code of Criminal Procedure / BNSS Provisions on Arrest",
        "court": "Supreme Court of India",
        "jurisdiction": "Supreme Court of India",
        "document_type": "judgment",
        "publication_date": "1996-12-18",
        "source_url": "https://www.sci.gov.in/judgments/",
        "summary": "Supreme Court laid down 11 mandatory guidelines for police personnel during arrest and detention to prevent custodial violence and safeguard fundamental rights under Articles 21 and 22.",
        "full_text": "Police officers carrying out arrest must bear clear identification, memo of arrest must be prepared, friend or relative of arrestee must be informed, medical examination must be conducted every 48 hours, and arrestee entitled to meet lawyer during interrogation."
    },
    {
        "id": "cpa-2019-sec-2",
        "title": "Consumer Protection Act, 2019 - Section 2(9) (Consumer Rights)",
        "act_name": "Consumer Protection Act, 2019",
        "section": "Section 2(9)",
        "court": "Parliament of India",
        "jurisdiction": "Union of India",
        "document_type": "statute",
        "publication_date": "2019-08-09",
        "effective_date": "2020-07-20",
        "source_url": "https://www.indiacode.nic.in/handle/123456789/15256",
        "summary": "Codifies six statutory rights of consumers including right to safety, information, choice, hearing, redressal, and consumer awareness.",
        "full_text": "'consumer rights' includes the right to be protected against marketing of hazardous goods, right to be informed about quality, quantity, potency, purity, standard and price, right to be assured access to competitive variety, right to seek redressal against unfair trade practices."
    },
    {
        "id": "it-act-2000-sec-43a",
        "title": "Information Technology Act, 2000 - Section 43A (Compensation for failure to protect data)",
        "act_name": "Information Technology Act, 2000",
        "section": "Section 43A",
        "court": "Parliament of India",
        "jurisdiction": "Union of India",
        "document_type": "statute",
        "publication_date": "2000-06-09",
        "effective_date": "2008-10-27",
        "source_url": "https://www.indiacode.nic.in/handle/123456789/1999",
        "summary": "Mandates body corporate possessing sensitive personal data to implement reasonable security practices, imposing liability to pay damages for wrongful loss.",
        "full_text": "Where a body corporate, possessing, dealing or handling any sensitive personal data or information in a computer resource which it owns, controls or operates, is negligent in implementing and maintaining reasonable security practices and procedures and thereby causes wrongful loss or wrongful gain to any person, such body corporate shall be liable to pay damages by way of compensation to the person so affected."
    }
]

async def seed_knowledge_base(db, ai_provider):
    """Indexes the seed legal corpus into SQLite/PostgreSQL."""
    from app.models.legal import LegalSource, LegalPassage
    from app.rag.retriever import chunk_legal_text

    existing_count = db.query(LegalSource).count()
    if existing_count > 0:
        return existing_count

    for src_data in SEED_LEGAL_SOURCES:
        source = LegalSource(
            id=src_data["id"],
            title=src_data["title"],
            act_name=src_data["act_name"],
            section=src_data.get("section"),
            court=src_data.get("court"),
            jurisdiction=src_data.get("jurisdiction", "Union of India"),
            document_type=src_data.get("document_type", "statute"),
            publication_date=src_data.get("publication_date"),
            effective_date=src_data.get("effective_date"),
            source_url=src_data["source_url"],
            summary=src_data["summary"],
            full_text=src_data.get("full_text")
        )
        db.add(source)
        db.flush()

        # Chunk full text or summary
        text_to_chunk = src_data.get("full_text") or src_data["summary"]
        chunks = chunk_legal_text(text_to_chunk)

        for idx, chunk in enumerate(chunks):
            embedding = await ai_provider.get_embedding(chunk)
            passage = LegalPassage(
                id=f"{source.id}-p{idx+1}",
                source_id=source.id,
                passage_text=chunk,
                section_ref=source.section,
                embedding_json=json.dumps(embedding),
                chunk_index=idx
            )
            db.add(passage)

    db.commit()
    return len(SEED_LEGAL_SOURCES)

