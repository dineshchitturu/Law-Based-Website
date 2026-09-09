import React, { useState } from 'react';
import { MainLayout } from './layouts/MainLayout';
import { WelcomePage } from './pages/WelcomePage';
import { HowItWorksPage } from './pages/HowItWorksPage';
import { HomePage } from './pages/HomePage';
import { StartCasePage } from './pages/StartCasePage';
import { ChatIntakePage } from './pages/ChatIntakePage';
import { EvidencePage } from './pages/EvidencePage';
import { CaseReviewPage } from './pages/CaseReviewPage';
import { LegalResultPage } from './pages/LegalResultPage';
import { CaseSummaryPage } from './pages/CaseSummaryPage';
import { DocumentDraftPage } from './pages/DocumentDraftPage';
import { FilingGuidancePage } from './pages/FilingGuidancePage';
import { OfficialResourcesPage } from './pages/OfficialResourcesPage';
import { MyCasesPage } from './pages/MyCasesPage';
import { CaseDetailsPage } from './pages/CaseDetailsPage';
import { MyEvidencePage } from './pages/MyEvidencePage';
import { SearchLawsPage } from './pages/SearchLawsPage';
import { HistoryPage } from './pages/HistoryPage';
import { ProfilePage } from './pages/ProfilePage';
import { TransparencyPage } from './pages/TransparencyPage';

export const App: React.FC = () => {
  const [currentPage, setCurrentPage] = useState<string>('home');
  const [activeCaseId, setActiveCaseId] = useState<number | null>(null);

  const navigate = (page: string, caseId?: number) => {
    if (caseId !== undefined) {
      setActiveCaseId(caseId);
    }
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const renderContent = () => {
    switch (currentPage) {
      case 'welcome':
        return <WelcomePage onNavigate={navigate} />;

      case 'how_it_works':
        return <HowItWorksPage onNavigate={navigate} />;

      case 'start_case':
        return (
          <StartCasePage
            onCaseCreated={(newId) => {
              setActiveCaseId(newId);
              navigate('chat_intake', newId);
            }}
          />
        );

      case 'chat_intake':
        if (!activeCaseId) {
          return <StartCasePage onCaseCreated={(id) => navigate('chat_intake', id)} />;
        }
        return (
          <ChatIntakePage
            caseId={activeCaseId}
            onProceedToEvidence={() => navigate('evidence', activeCaseId)}
            onProceedToReview={() => navigate('case_review', activeCaseId)}
          />
        );

      case 'evidence':
        if (!activeCaseId) return <HomePage onNavigate={navigate} />;
        return (
          <EvidencePage
            caseId={activeCaseId}
            onProceedToReview={() => navigate('case_review', activeCaseId)}
          />
        );

      case 'case_review':
        if (!activeCaseId) return <HomePage onNavigate={navigate} />;
        return (
          <CaseReviewPage
            caseId={activeCaseId}
            onProceedToAnalysis={() => navigate('legal_result', activeCaseId)}
            onEditFact={() => navigate('evidence', activeCaseId)}
          />
        );

      case 'legal_result':
        if (!activeCaseId) return <HomePage onNavigate={navigate} />;
        return (
          <LegalResultPage
            caseId={activeCaseId}
            onNavigateToDraft={() => navigate('document_draft', activeCaseId)}
            onNavigateToSummary={() => navigate('case_summary', activeCaseId)}
            onSaveCase={() => navigate('my_cases')}
          />
        );

      case 'case_summary':
        if (!activeCaseId) return <HomePage onNavigate={navigate} />;
        return (
          <CaseSummaryPage
            caseId={activeCaseId}
            onBack={() => navigate('legal_result', activeCaseId)}
          />
        );

      case 'document_draft':
        if (!activeCaseId) return <HomePage onNavigate={navigate} />;
        return (
          <DocumentDraftPage
            caseId={activeCaseId}
            onBack={() => navigate('legal_result', activeCaseId)}
          />
        );

      case 'filing_guidance':
        return <FilingGuidancePage onNavigate={navigate} />;

      case 'official_resources':
        return <OfficialResourcesPage />;

      case 'my_cases':
        return (
          <MyCasesPage
            onSelectCase={(id) => navigate('case_details', id)}
            onNewCase={() => navigate('start_case')}
          />
        );

      case 'case_details':
        if (!activeCaseId) return <MyCasesPage onSelectCase={(id) => navigate('case_details', id)} onNewCase={() => navigate('start_case')} />;
        return (
          <CaseDetailsPage
            caseId={activeCaseId}
            onBack={() => navigate('my_cases')}
            onNavigateToChat={(id) => navigate('chat_intake', id)}
            onNavigateToDraft={(id) => navigate('document_draft', id)}
            onNavigateToAnalysis={(id) => navigate('legal_result', id)}
          />
        );

      case 'evidence_all':
      case 'evidence':
        return <MyEvidencePage onSelectCase={(id) => navigate('case_details', id)} />;

      case 'search_laws':
        return <SearchLawsPage />;

      case 'history':
        return <HistoryPage />;

      case 'profile':
        return <ProfilePage onLogout={() => navigate('welcome')} />;

      case 'transparency':
        return <TransparencyPage onStartCase={() => navigate('start_case')} />;

      case 'home':
      default:
        return <HomePage onNavigate={navigate} />;
    }
  };

  return (
    <MainLayout currentPage={currentPage} onNavigate={navigate}>
      {renderContent()}
    </MainLayout>
  );
};
