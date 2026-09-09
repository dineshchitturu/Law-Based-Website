import React from 'react';
import {
  Home, PlusCircle, Briefcase, Paperclip, BookOpen,
  HelpCircle, Building2, Eye, History as HistoryIcon, User
} from 'lucide-react';
import { useTranslation } from '../../i18n/LanguageContext';

export const Sidebar: React.FC<{
  currentPage: string;
  onNavigate: (page: string) => void;
}> = ({ currentPage, onNavigate }) => {
  const { t } = useTranslation();

  const primaryItems = [
    { id: 'home', label: t('nav.home'), icon: Home },
    { id: 'start_case', label: t('nav.newCase'), icon: PlusCircle, highlight: true },
    { id: 'my_cases', label: t('nav.cases'), icon: Briefcase },
    { id: 'evidence', label: t('nav.evidence'), icon: Paperclip },
  ];

  const secondaryItems = [
    { id: 'search_laws', label: t('nav.searchLaws'), icon: BookOpen },
    { id: 'filing_guidance', label: t('nav.guidance'), icon: HelpCircle },
    { id: 'official_resources', label: t('nav.resources'), icon: Building2 },
    { id: 'transparency', label: t('nav.transparency'), icon: Eye },
    { id: 'history', label: t('nav.history'), icon: HistoryIcon },
    { id: 'profile', label: t('nav.profile'), icon: User },
  ];

  return (
    <aside className="hidden md:flex flex-col w-64 bg-white border-r border-slate-200 min-h-[calc(100vh-4.5rem)] p-4 flex-shrink-0">
      
      {/* Primary Action Button */}
      <button
        onClick={() => onNavigate('start_case')}
        className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gov-navy text-white rounded-lg font-bold text-sm hover:bg-blue-900 transition shadow-sm mb-6 focus:outline-none focus:ring-2 focus:ring-gov-navy"
      >
        <PlusCircle className="w-5 h-5 text-amber-300" aria-hidden="true" />
        <span>{t('nav.newCase')}</span>
      </button>

      {/* Main Navigation Links */}
      <div className="space-y-1">
        <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 px-3 block mb-1">
          Case Services
        </span>
        {primaryItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentPage === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-semibold transition ${
                isActive
                  ? 'bg-blue-50 text-gov-navy border-l-4 border-gov-navy font-bold'
                  : 'text-slate-700 hover:bg-slate-50 hover:text-slate-900'
              }`}
              aria-current={isActive ? 'page' : undefined}
            >
              <Icon className={`w-4 h-4 ${isActive ? 'text-gov-navy' : 'text-slate-500'}`} aria-hidden="true" />
              <span>{item.label}</span>
            </button>
          );
        })}
      </div>

      <hr className="my-5 border-slate-200" />

      {/* Legal Reference & Citizen Resources */}
      <div className="space-y-1">
        <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 px-3 block mb-1">
          Information & Support
        </span>
        {secondaryItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentPage === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition ${
                isActive
                  ? 'bg-blue-50 text-gov-navy font-bold'
                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
              }`}
              aria-current={isActive ? 'page' : undefined}
            >
              <Icon className={`w-4 h-4 ${isActive ? 'text-gov-navy' : 'text-slate-400'}`} aria-hidden="true" />
              <span>{item.label}</span>
            </button>
          );
        })}
      </div>

      {/* Footer Trust Indicator in Sidebar */}
      <div className="mt-auto pt-6">
        <div className="bg-slate-50 border border-slate-200 rounded-lg p-3 text-xs text-slate-600">
          <p className="font-bold text-slate-800 text-[11px] mb-1">
            LawBot AI Safety Commitment
          </p>
          <p className="text-[11px] text-slate-500 leading-tight">
            Verified Indian statutes. Data stays on your device and secure account.
          </p>
        </div>
      </div>

    </aside>
  );
};
