import React from 'react';
import { AlertTriangle } from 'lucide-react';
import { AppLanguage } from '../types';
import { getTranslation } from '../utils/translations';

interface LegalDisclaimerBannerProps {
  language: AppLanguage;
}

export const LegalDisclaimerBanner: React.FC<LegalDisclaimerBannerProps> = ({ language }) => {
  const t = getTranslation(language);

  return (
    <div className="bg-amber-950/30 border-y border-amber-500/20 px-4 py-2 text-xs text-amber-200/90 flex items-center justify-center gap-2 text-center">
      <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
      <span>{t.disclaimer_banner}</span>
    </div>
  );
};

