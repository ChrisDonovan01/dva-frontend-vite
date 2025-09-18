// src/components/UnifiedSurveyModal.jsx
import React, { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import UnifiedSurvey from './UnifiedSurvey';
import { getSurveyDisplayName } from '../services/surveyService';

const UnifiedSurveyModal = ({
  isOpen,
  onClose,
  surveyType,        // 'strategy' | 'capabilities' | 'readiness'
  clientId,
  userId = 'admin',
  userProfile,
  onComplete,
  onSaveAndExit
}) => {
  const modalRef = useRef(null);
  const prevFocusRef = useRef(null);

  useEffect(() => {
    if (!isOpen) return;
    prevFocusRef.current = document.activeElement;
    const overflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = overflow;
      if (prevFocusRef.current && document.body.contains(prevFocusRef.current)) {
        prevFocusRef.current.focus();
      }
    };
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    const onEsc = (e) => e.key === 'Escape' && onClose?.();
    document.addEventListener('keydown', onEsc);
    return () => document.removeEventListener('keydown', onEsc);
  }, [isOpen, onClose]);

  const handleBackdrop = (e) => { if (e.target === e.currentTarget) onClose?.(); };
  const stop = (e) => e.stopPropagation();

  if (!isOpen) return null;

  let root = document.getElementById('survey-modal-root');
  if (!root) {
    root = document.createElement('div');
    root.id = 'survey-modal-root';
    document.body.appendChild(root);
  }

  return createPortal(
    <div
      role="dialog"
      aria-modal="true"
      onClick={handleBackdrop}
      style={{
        position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        zIndex: 9999, padding: '1rem'
      }}
    >
      <div
        ref={modalRef}
        onClick={stop}
        style={{
          backgroundColor: '#fff',
          borderRadius: 16,
          width: '100%', maxWidth: 1100, maxHeight: '90vh',
          overflow: 'hidden', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)',
          display: 'flex', flexDirection: 'column'
        }}
      >
        {/* Header with survey name */}
        <div style={{
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          padding: '12px 16px', borderBottom: '1px solid #eee', flexShrink: 0,
          backgroundColor: '#f8fafc'
        }}>
          <h2 style={{
            margin: 0, fontSize: '18px', fontWeight: '600', color: '#1f2937'
          }}>
            {getSurveyDisplayName(surveyType)}
          </h2>
          <button
            aria-label="Close"
            onClick={onClose}
            style={{
              width: 36, height: 36, borderRadius: 8, border: 'none',
              background: '#F3F4F6', cursor: 'pointer', fontSize: 18, color: '#6B7280'
            }}
            onMouseEnter={e => { e.currentTarget.style.background = '#E5E7EB'; e.currentTarget.style.color = '#1F2937'; }}
            onMouseLeave={e => { e.currentTarget.style.background = '#F3F4F6'; e.currentTarget.style.color = '#6B7280'; }}
          >×</button>
        </div>

        {/* Body: UnifiedSurvey renders the polished UI */}
        <div style={{ flex: 1, overflow: 'hidden', background: '#fff' }}>
          <UnifiedSurvey
            isOpen={isOpen}
            onClose={onClose}
            userProfile={userProfile}
            clientId={clientId}
            userId={userId}
            surveyType={surveyType}
            surveyTitle={getSurveyDisplayName(surveyType)}
            onComplete={onComplete}
            onSaveAndExit={onSaveAndExit}
          />
        </div>
      </div>
    </div>,
    root
  );
};

export default UnifiedSurveyModal;
