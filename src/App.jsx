// src/App.jsx
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

import Sidebar from './components/Sidebar';
import Header from './components/Header';

// Firebase Config
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

// Looker Studio Embed URL
const lookerStudioEmbedUrl = import.meta.env.VITE_LOOKER_STUDIO_EMBED_URL;

// Page imports
import HomePage from './pages/HomePage';
import MatrixPage from './pages/MatrixPage';
import PlaybookPage from './pages/PlaybookPage';
import StrategicAlignmentDashboard from './pages/StrategicAlignmentDashboard';
import ClientConfiguratorPage from './pages/ClientConfiguratorPage';
import ChatPage from './pages/ChatPage';
import SettingsPage from './pages/SettingsPage';
import LogoutPage from './pages/LogoutPage';
import UseCaseProfilePage from './pages/UseCaseProfilePage';
import PlaybookDraftPage from './pages/PlaybookDraftPage';
import ClientPlaybooksPage from './pages/ClientPlaybooksPage';
import CapabilitiesSummaryPage from './pages/CapabilitiesSummaryPage';
import ComprehensiveStrategySummaryPage from './pages/ComprehensiveStrategySummaryPage';
import StrategicPrioritiesSurvey from './components/StrategicPrioritiesSurvey';

import './App.css';

export default function App() {
  return (
    <Router>
      <div style={{
        display: 'flex',
        minHeight: '100vh',
        backgroundColor: '#f9fafb',
        margin: 0,
        padding: 0
      }}>
        {/* Sidebar Component */}
        <Sidebar />

        {/* Main Content */}
        <div style={{
          flexGrow: 1,
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          margin: 0,
          padding: 0
        }}>
          {/* Header Component */}
          <Header />

          {/* Main Application Routes */}
          <main style={{
            flexGrow: 1,
            overflowY: 'auto',
            margin: 0,
            padding: 0
          }}>
            <Routes>
              {/* Main route - HomePage is the default */}
              <Route path="/" element={<HomePage />} />
              
              {/* HomePage with client ID */}
              <Route path="/home/:clientId" element={<HomePage />} />
              
              {/* Client Configurator on its own route */}
              <Route path="/client-configurator" element={<ClientConfiguratorPage />} />
              <Route path="/client-configurator/:clientId" element={<ClientConfiguratorPage />} />
              
              {/* Matrix page with Firebase config */}
              <Route path="/matrix" element={
                <MatrixPage 
                  __firebase_config={JSON.stringify(firebaseConfig)}
                  __looker_studio_embed_url={lookerStudioEmbedUrl}
                  __initial_auth_token={null}
                  __app_id="dva-frontend-vite"
                />
              } />
              
              {/* Playbook routes */}
              <Route path="/playbook" element={<PlaybookPage />} />
              <Route path="/playbook-draft/:id" element={<PlaybookDraftPage />} />
              <Route path="/client-playbooks/:clientId" element={<ClientPlaybooksPage />} />
              
              {/* Strategic and summary routes */}
              <Route path="/strategic-alignment" element={
                <StrategicAlignmentDashboard clientId={101} useCaseId={10} />
              } />
              <Route path="/capabilities-summary" element={<CapabilitiesSummaryPage />} />
              <Route path="/strategy-summary" element={<ComprehensiveStrategySummaryPage />} />
              
              {/* Use case profile */}
              <Route path="/usecase/:id" element={<UseCaseProfilePage />} />
              
              {/* Utility routes */}
              <Route path="/chat" element={<ChatPage />} />
              <Route path="/settings" element={<SettingsPage />} />
              <Route path="/logout" element={<LogoutPage />} />
              
              {/* Test survey route */}
              <Route path="/test-survey" element={
                <StrategicPrioritiesSurvey
                  userProfile={{ client_id: '101', user_id: 'admin' }}
                  onComplete={() => console.log('Survey completed')}
                  onSaveAndExit={() => console.log('Survey saved and exited')}
                  onGoToSummary={() => console.log('Go to summary')}
                  initialResponses={{}}
                  initialCompletionStatus={false}
                />
              } />
              
              {/* Fallback route - redirect to home */}
              <Route path="*" element={<HomePage />} />
            </Routes>
          </main>
        </div>
      </div>
    </Router>
  );
}