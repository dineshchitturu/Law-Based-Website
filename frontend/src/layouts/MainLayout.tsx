import React from 'react';
import { AppHeader } from '../components/common/AppHeader';
import { Sidebar } from '../components/common/Sidebar';
import { BottomNavigation } from '../components/common/BottomNavigation';
import { Disclaimer } from '../components/common/Disclaimer';

export const MainLayout: React.FC<{
  currentPage: string;
  onNavigate: (page: string, caseId?: number) => void;
  children: React.ReactNode;
}> = ({ currentPage, onNavigate, children }) => {
  return (
    <div className="min-h-screen bg-gov-surface flex flex-col font-sans text-gov-text">
      
      {/* Top Header */}
      <AppHeader onNavigate={onNavigate} currentPage={currentPage} />

      {/* Main Container */}
      <div className="flex-1 flex max-w-7xl w-full mx-auto">
        
        {/* Desktop Sidebar (hidden on mobile) */}
        <Sidebar currentPage={currentPage} onNavigate={onNavigate} />

        {/* Dynamic Page Content */}
        <main className="flex-1 min-w-0 pb-20 md:pb-8">
          {children}
        </main>

      </div>

      {/* Bottom Legal Disclaimer (desktop & mobile) */}
      <div className="hidden md:block">
        <Disclaimer compact />
      </div>

      {/* Mobile Bottom Navigation (fixed at bottom on mobile) */}
      <BottomNavigation currentPage={currentPage} onNavigate={onNavigate} />

    </div>
  );
};
