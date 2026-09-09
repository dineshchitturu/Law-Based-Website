import React from 'react';
import { Home, PlusCircle, Briefcase, Paperclip, User } from 'lucide-react';
import { useTranslation } from '../../i18n/LanguageContext';

export const BottomNavigation: React.FC<{
  currentPage: string;
  onNavigate: (page: string) => void;
}> = ({ currentPage, onNavigate }) => {
  const { t } = useTranslation();

  const navItems = [
    { id: 'home', label: t('nav.home'), icon: Home },
    { id: 'start_case', label: t('nav.newCase'), icon: PlusCircle, isPrimary: true },
    { id: 'my_cases', label: t('nav.cases'), icon: Briefcase },
    { id: 'evidence', label: t('nav.evidence'), icon: Paperclip },
    { id: 'profile', label: t('nav.profile'), icon: User }
  ];

  return (
    <nav 
      className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-slate-200 shadow-lg px-2 py-1.5 flex items-center justify-around"
      role="navigation"
      aria-label="Mobile Bottom Navigation"
    >
      {navItems.map((item) => {
        const Icon = item.icon;
        const isActive = currentPage === item.id || (item.id === 'start_case' && currentPage === 'chat_intake');

        if (item.isPrimary) {
          return (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className="flex flex-col items-center justify-center -mt-5 group focus:outline-none"
              aria-label={item.label}
            >
              <div className="w-12 h-12 rounded-full bg-gov-navy text-white shadow-md flex items-center justify-center group-hover:bg-blue-900 group-active:scale-95 transition">
                <PlusCircle className="w-6 h-6 text-amber-300" aria-hidden="true" />
              </div>
              <span className="text-[11px] font-bold text-gov-navy mt-0.5">
                {item.label}
              </span>
            </button>
          );
        }

        return (
          <button
            key={item.id}
            onClick={() => onNavigate(item.id)}
            className={`flex flex-col items-center justify-center py-1 px-2 rounded-md transition min-w-[56px] ${
              isActive
                ? 'text-gov-navy font-bold'
                : 'text-slate-500 hover:text-slate-900 font-medium'
            }`}
            aria-current={isActive ? 'page' : undefined}
          >
            <Icon className={`w-5 h-5 ${isActive ? 'text-gov-navy stroke-[2.5]' : 'stroke-2'}`} aria-hidden="true" />
            <span className="text-[10px] mt-0.5 tracking-tight">
              {item.label}
            </span>
          </button>
        );
      })}
    </nav>
  );
};
