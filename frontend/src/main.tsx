import React from 'react';
import ReactDOM from 'react-dom/client';
import { App } from './App';
import { LanguageProvider } from './i18n/LanguageContext';
import { TextSizeProvider } from './hooks/useTextSize';
import { AuthProvider } from './hooks/useAuth';
import './index.css';

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <LanguageProvider>
      <TextSizeProvider>
        <AuthProvider>
          <App />
        </AuthProvider>
      </TextSizeProvider>
    </LanguageProvider>
  </React.StrictMode>
);
