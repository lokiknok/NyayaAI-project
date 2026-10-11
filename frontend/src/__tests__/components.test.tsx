import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { SourceCard } from '../components/SourceCard';
import { getTranslation } from '../utils/translations';
import { LegalCitation } from '../types';

describe('NyayaAI Frontend Components & Translations', () => {
  it('renders English and Tamil translation dictionaries accurately', () => {
    const en = getTranslation('en');
    const ta = getTranslation('ta');

    expect(en.app_name).toBe('NyayaAI');
    expect(ta.app_name).toContain('நியாயாAI');
    expect(en.hero_title).toBe('Understand Indian Law with AI');
    expect(ta.hero_title).toContain('இந்திய சட்டங்களை');
  });

  it('renders statutory SourceCard with citation details', () => {
    const mockCitation: LegalCitation = {
      id: 'cit-test',
      title: 'Bharatiya Nyaya Sanhita, 2023 - Section 103',
      act_name: 'BNS 2023',
      section: 'Section 103',
      court: 'Parliament of India',
      jurisdiction: 'Union of India',
      date: '2024-07-01',
      url: 'https://www.indiacode.nic.in/',
      quotation: 'Whoever commits murder shall be punished with death or imprisonment for life.',
      confidence_score: 0.98,
      doc_type: 'statute'
    };

    render(<SourceCard citation={mockCitation} />);

    expect(screen.getByText('Bharatiya Nyaya Sanhita, 2023 - Section 103')).toBeDefined();
    expect(screen.getByText('Statutory Provision')).toBeDefined();
    expect(screen.getByText('98% verified')).toBeDefined();
  });
});

