import React from 'react';
import { Scale, ShieldCheck, User } from 'lucide-react';
import { useTranslation } from '../../i18n/LanguageContext';
import { TextSizeControl } from './TextSizeControl';
import { LanguageSelector } from './LanguageSelector';
import { useAuth } from '../../hooks/useAuth';

export const AppHeader: React.FC<{
  onNavigate: (page: string) => void;
  currentPage: string;
}> = ({ onNavigate, currentPage }) => {
  const { t } = useTranslation();
  const { user } = useAuth();

  return (
    <header className="sticky top-0 z-30 bg-white border-b border-slate-200 shadow-xs">
      {/* Subtle Indian Saffron / Navy Tricolor Header Bar */}
      <div className="h-1 w-full bg-gradient-to-r from-gov-saffron via-white to-gov-navy opacity-90" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-18">
          
          {/* Logo & Brand Identity */}
          <button
            onClick={() => onNavigate('home')}
            className="flex items-center gap-3 text-left group focus:outline-none focus:ring-2 focus:ring-gov-navy rounded-md p-1"
          >
            <div className="w-10 h-10 rounded-lg bg-gov-navy flex items-center justify-center text-white shadow-sm flex-shrink-0 group-hover:bg-blue-900 transition">
              <Scale className="w-5 h-5 text-amber-300" aria-hidden="true" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-xl font-extrabold tracking-tight text-gov-navy font-sans">
                  {t('appTitle')}
                </span>
                <span className="hidden sm:inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-600 border border-slate-200">
                  Citizen Portal
                </span>
              </div>
              <p className="text-[11px] sm:text-xs text-slate-500 font-medium -mt-0.5 tracking-wide">
                {t('tagline')}
              </p>
            </div>
          </button>

          {/* Header Controls: Text Size, Language, Profile */}
          <div className="flex items-center gap-2 sm:gap-4">
            {/* Text Size Control */}
            <div className="hidden xs:block">
              <TextSizeControl />
            </div>

            {/* Language Selector */}
            <LanguageSelector />

            {/* User Profile Pill */}
            <button
              onClick={() => onNavigate('profile')}
              className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs font-semibold border transition ${
                currentPage === 'profile'
                  ? 'bg-gov-navy text-white border-gov-navy'
                  : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
              }`}
              title="User Profile & Settings"
              aria-label="User Profile"
            >
              <User className="w-3.5 h-3.5 text-slate-500" aria-hidden="true" />
              <span className="hidden md:inline max-w-[110px] truncate">
                {user?.full_name || 'Citizen'}
              </span>
            </button>
          </div>

        </div>
      </div>
    </header>
  );
};
