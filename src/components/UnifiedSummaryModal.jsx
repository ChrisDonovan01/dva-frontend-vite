// src/components/UnifiedSurveyModal.jsx
import React, { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import UnifiedSurvey from './UnifiedSurvey';

const UnifiedSurveyModal = ({
  isOpen,
  onClose,
  surveyType,  // 'strategy' | 'capabilities' | 'readiness'
  clientId,
  userId = 'admin',
  onComplete,
  onSaveAndExit
}) => {
  const modalRef = useRef(null);
  const previousFocusRef = useRef(null);

  // Body scroll lock and cleanup
  useEffect(() => {
    if (!isOpen) return;

    // Store current focus
    previousFocusRef.current = document.activeElement;

    // Lock body scroll
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    // Cleanup function
    return () => {
      // Restore body scroll
      document.body.style.overflow = originalOverflow;
      
      // Restore focus
      if (previousFocusRef.current && document.body.contains(previousFocusRef.current)) {
        previousFocusRef.current.focus();
      }
    };
  }, [isOpen]);

  // ESC key handler
  useEffect(() => {
    if (!isOpen) return;

    const handleEscape = (e) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => {
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen, onClose]);

  // Handle backdrop click
  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  // Prevent event propagation from modal content
  const handleModalClick = (e) => {
    e.stopPropagation();
  };

  if (!isOpen) return null;

  // Get or create portal root
  let portalRoot = document.getElementById('survey-modal-root');
  if (!portalRoot) {
    portalRoot = document.createElement('div');
    portalRoot.id = 'survey-modal-root';
    document.body.appendChild(portalRoot);
  }

  return createPortal(
    <div
      role="dialog"
      aria-modal="true"
      aria-label={`${surveyType} Survey`}
      onClick={handleBackdropClick}
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 9999,
        padding: '1rem'
      }}
    >
      <div
        ref={modalRef}
        onClick={handleModalClick}
        style={{
          backgroundColor: 'white',
          borderRadius: '16px',
          width: '100%',
          maxWidth: '900px',
          maxHeight: '90vh',
          overflow: 'hidden',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
          display: 'flex',
          flexDirection: 'column'
        }}
      >
        {/* Modal Header */}
        <div style={{
          padding: '1.5rem 2rem',
          borderBottom: '1px solid #e5e7eb',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          backgroundColor: '#f9fafb'
        }}>
          <h2 style={{
            margin: 0,
            fontSize: '1.5rem',
            fontWeight: 700,
            color: '#18365E',
            fontFamily: 'Montserrat, system-ui, sans-serif'
          }}>
            DVA Survey
          </h2>
          <button
            onClick={onClose}
            aria-label="Close modal"
            style={{
              width: '40px',
              height: '40px',
              backgroundColor: '#f3f4f6',
              border: 'none',
              borderRadius: '10px',
              cursor: 'pointer',
              fontSize: '1.5rem',
              color: '#6b7280',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'all 0.2s ease'
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.backgroundColor = '#e5e7eb';
              e.currentTarget.style.color = '#374151';
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.backgroundColor = '#f3f4f6';
              e.currentTarget.style.color = '#6b7280';
            }}
          >
            ×
          </button>
        </div>

        {/* Modal Body - Survey Component */}
        <div style={{
          flex: 1,
          overflowY: 'auto',
          backgroundColor: 'white'
        }}>
          <UnifiedSurvey
            surveyType={surveyType}
            clientId={clientId}
            userId={userId}
            onComplete={() => {
              if (onComplete) onComplete();
              onClose();
            }}
            onSaveAndExit={() => {
              if (onSaveAndExit) onSaveAndExit();
              onClose();
            }}
            onClose={onClose}
          />
        </div>
      </div>
    </div>,
    portalRoot
  );
};

export default UnifiedSurveyModal;