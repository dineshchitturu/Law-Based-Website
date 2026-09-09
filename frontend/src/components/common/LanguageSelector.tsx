import React from 'react';
import { Languages } from 'lucide-react';
import { useTranslation } from '../../i18n/LanguageContext';
import { Language } from '../../i18n/translations';

export const LanguageSelector: React.FC = () => {
  const { language, setLanguage } = useTranslation();

  const languages: { code: Language; label: string; native: string }[] = [
    { code: 'en', label: 'English', native: 'English' },
    { code: 'te', label: 'Telugu', native: 'తెలుగు' },
    { code: 'hi', label: 'Hindi', native: 'हिन्दी' }
  ];

  return (
    <div className="relative inline-flex items-center">
      <label htmlFor="language-select" className="sr-only">Choose language</label>
      <Languages className="w-4 h-4 text-slate-500 absolute left-2 pointer-events-none" aria-hidden="true" />
      <select
        id="language-select"
        value={language}
        onChange={(e) => setLanguage(e.target.value as Language)}
        className="pl-8 pr-3 py-1 text-xs font-semibold bg-white border border-slate-300 rounded-md text-slate-800 hover:border-slate-400 focus:outline-none focus:ring-2 focus:ring-gov-navy shadow-sm cursor-pointer"
      >
        {languages.map((lang) => (
          <option key={lang.code} value={lang.code}>
            {lang.native} ({lang.label})
          </option>
        ))}
      </select>
    </div>
  );
};
