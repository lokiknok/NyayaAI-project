import { LegalSourceItem, LegalCitation } from '../types';

export const MOCK_LEGAL_SOURCES: LegalSourceItem[] = [
  {
    id: 'bns-sec-103',
    title: 'Bharatiya Nyaya Sanhita, 2023 - Section 103 (Punishment for murder)',
    act_name: 'Bharatiya Nyaya Sanhita, 2023',
    section: 'Section 103',
    court: 'Parliament of India',
    jurisdiction: 'Union of India',
    document_type: 'statute',
    publication_date: '2023-12-25',
    effective_date: '2024-07-01',
    source_url: 'https://www.indiacode.nic.in/handle/123456789/2143',
    summary: 'Prescribes death penalty or imprisonment for life and fine for murder. Introduces subsection (2) penalizing mob lynching by five or more persons on grounds of race, caste, sex, or place of birth.',
    full_text: '(1) Whoever commits murder shall be punished with death or imprisonment for life, and shall also be liable to fine. (2) When a group of five or more persons acting in concert commits murder on the ground of race, caste or community, sex, place of birth, language, personal belief or any other similar ground, each member of such group shall be punished with death or with imprisonment for life, and shall also be liable to fine.'
  },
  {
    id: 'bnss-sec-482',
    title: 'Bharatiya Nagarik Suraksha Sanhita, 2023 - Section 482 (Anticipatory Bail)',
    act_name: 'Bharatiya Nagarik Suraksha Sanhita, 2023',
    section: 'Section 482',
    court: 'Parliament of India',
    jurisdiction: 'Union of India',
    document_type: 'statute',
    publication_date: '2023-12-25',
    effective_date: '2024-07-01',
    source_url: 'https://www.indiacode.nic.in/handle/123456789/2144',
    summary: 'Direction for grant of bail to person apprehending arrest (corresponding to Section 438 of the repealed Code of Criminal Procedure, 1973). The High Court or Court of Session may issue directions.',
    full_text: 'Where any person has reason to believe that he may be arrested on an accusation of having committed a non-bailable offence, he may apply to the High Court or the Court of Session for a direction under this section; and that Court may, if it thinks fit, direct that in the event of such arrest, he shall be released on bail.'
  },
  {
    id: 'contract-sec-10',
    title: 'Indian Contract Act, 1872 - Section 10 (What agreements are contracts)',
    act_name: 'Indian Contract Act, 1872',
    section: 'Section 10',
    court: 'Central Legislative Council',
    jurisdiction: 'Union of India',
    document_type: 'statute',
    publication_date: '1872-04-25',
    effective_date: '1872-09-01',
    source_url: 'https://www.indiacode.nic.in/handle/123456789/2187',
    summary: 'Defines the essential ingredients of a legally enforceable contract: free consent of parties competent to contract, lawful consideration, lawful object, and not expressly declared void.',
    full_text: 'All agreements are contracts if they are made by the free consent of parties competent to contract, for a lawful consideration and with a lawful object, and are not hereby expressly declared to be void.'
  },
  {
    id: 'const-art-21',
    title: 'Constitution of India - Article 21 (Protection of life and personal liberty)',
    act_name: 'Constitution of India',
    section: 'Article 21',
    court: 'Constituent Assembly of India',
    jurisdiction: 'Union of India',
    document_type: 'statute',
    publication_date: '1950-01-26',
    effective_date: '1950-01-26',
    source_url: 'https://www.indiacode.nic.in/handle/123456789/2188',
    summary: 'Guarantees that no person shall be deprived of his life or personal liberty except according to procedure established by law. Expansively interpreted by the Supreme Court to encompass dignity, privacy, and fair trial.',
    full_text: 'No person shall be deprived of his life or personal liberty except according to procedure established by law.'
  },
  {
    id: 'puttaswamy-2017',
    title: 'Justice K.S. Puttaswamy (Retd.) and Anr. v. Union of India and Ors. (2017) 10 SCC 1',
    act_name: 'Constitution of India (Articles 14, 19, 21)',
    court: 'Supreme Court of India',
    jurisdiction: 'Supreme Court of India (9-Judge Constitution Bench)',
    document_type: 'judgment',
    publication_date: '2017-08-24',
    source_url: 'https://www.sci.gov.in/judgments/',
    summary: 'Unanimously affirmed that the Right to Privacy is a fundamental right emanating primarily from Article 21 and the freedoms guaranteed by Part III of the Constitution.',
    full_text: 'The right to privacy is protected as an intrinsic part of the right to life and personal liberty under Article 21 and as a part of the freedoms guaranteed by Part III of the Constitution. Privacy has both positive and negative contents. State interference must pass the three-fold test of legality, legitimate state aim, and proportionality.'
  },
  {
    id: 'dk-basu-1997',
    title: 'D.K. Basu v. State of West Bengal (1997) 1 SCC 416',
    act_name: 'Code of Criminal Procedure / BNSS Provisions on Arrest',
    court: 'Supreme Court of India',
    jurisdiction: 'Supreme Court of India',
    document_type: 'judgment',
    publication_date: '1996-12-18',
    source_url: 'https://www.sci.gov.in/judgments/',
    summary: 'Supreme Court laid down 11 mandatory guidelines for police personnel during arrest and detention to prevent custodial violence and safeguard fundamental rights under Articles 21 and 22.',
    full_text: 'Police officers carrying out arrest must bear clear identification, memo of arrest must be prepared, friend or relative of arrestee must be informed, medical examination must be conducted every 48 hours, and arrestee entitled to meet lawyer during interrogation.'
  },
  {
    id: 'cpa-2019-sec-2',
    title: 'Consumer Protection Act, 2019 - Section 2(9) (Consumer Rights)',
    act_name: 'Consumer Protection Act, 2019',
    section: 'Section 2(9)',
    court: 'Parliament of India',
    jurisdiction: 'Union of India',
    document_type: 'statute',
    publication_date: '2019-08-09',
    effective_date: '2020-07-20',
    source_url: 'https://www.indiacode.nic.in/handle/123456789/15256',
    summary: 'Codifies six statutory rights of consumers including right to safety, information, choice, hearing, redressal, and consumer awareness.',
    full_text: '"consumer rights" includes the right to be protected against marketing of hazardous goods, right to be informed about quality, quantity, potency, purity, standard and price, right to be assured access to competitive variety, right to seek redressal against unfair trade practices.'
  }
];

export const MOCK_CITATIONS_MAP: Record<string, LegalCitation[]> = {
  bns: [
    {
      id: 'cit-bns-1',
      title: 'Bharatiya Nyaya Sanhita, 2023 (Act No. 45 of 2023)',
      act_name: 'Bharatiya Nyaya Sanhita, 2023',
      section: 'Section 1 to 358',
      court: 'Parliament of India',
      jurisdiction: 'Union of India',
      date: 'Effective: 2024-07-01',
      url: 'https://www.indiacode.nic.in/handle/123456789/2143',
      quotation: 'Replaces the Indian Penal Code, 1860. Retains core offences while consolidating provisions into 358 sections, introducing community service, organized crime (Sec 111), and terrorism definitions.',
      confidence_score: 0.98,
      doc_type: 'statute'
    }
  ],
  contract: [
    {
      id: 'cit-contract-1',
      title: 'Indian Contract Act, 1872 - Section 10',
      act_name: 'Indian Contract Act, 1872',
      section: 'Section 10 & 2(h)',
      court: 'Parliament of India',
      jurisdiction: 'Union of India',
      date: 'Effective: 1872-09-01',
      url: 'https://www.indiacode.nic.in/handle/123456789/2187',
      quotation: 'An agreement enforceable by law is a contract. Section 10 requires free consent, competency of parties, lawful consideration and object.',
      confidence_score: 0.99,
      doc_type: 'statute'
    }
  ],
  bail: [
    {
      id: 'cit-bnss-bail',
      title: 'Bharatiya Nagarik Suraksha Sanhita, 2023 - Section 482',
      act_name: 'Bharatiya Nagarik Suraksha Sanhita, 2023',
      section: 'Section 482 (Anticipatory Bail)',
      court: 'Parliament of India',
      jurisdiction: 'Union of India',
      date: 'Effective: 2024-07-01',
      url: 'https://www.indiacode.nic.in/handle/123456789/2144',
      quotation: 'Direction for grant of bail to person apprehending arrest. The High Court or Court of Session may direct release on bail in the event of arrest for non-bailable offences.',
      confidence_score: 0.96,
      doc_type: 'statute'
    }
  ],
  privacy: [
    {
      id: 'cit-puttaswamy',
      title: 'K.S. Puttaswamy v. Union of India (2017) 10 SCC 1',
      act_name: 'Constitution of India, Article 21',
      court: 'Supreme Court of India',
      jurisdiction: 'Supreme Court 9-Judge Constitution Bench',
      date: '2017-08-24',
      url: 'https://www.sci.gov.in/judgments/',
      quotation: 'The right to privacy is protected as an intrinsic part of the right to life and personal liberty under Article 21 of the Constitution.',
      confidence_score: 0.99,
      doc_type: 'judgment'
    }
  ]
};

