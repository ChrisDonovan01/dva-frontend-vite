import React from 'react';

const SurveyCompleteModal = ({ isOpen, onClose, onGoToSummary }) => {
  if (!isOpen) return null;

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000
    }}>
      <div style={{
        backgroundColor: 'white',
        borderRadius: '16px',
        padding: '48px',
        maxWidth: '500px',
        width: '90%',
        boxShadow: '0 20px 40px rgba(0, 0, 0, 0.15)',
        textAlign: 'center',
        fontFamily: 'Montserrat, system-ui, sans-serif'
      }}>
        {/* Success Icon */}
        <div style={{
          fontSize: '64px',
          marginBottom: '24px'
        }}>
          🎉
        </div>

        {/* Title */}
        <h2 style={{
          fontSize: '28px',
          fontWeight: '700',
          color: '#18365E',
          marginBottom: '16px',
          margin: 0
        }}>
          Strategy Survey Complete!
        </h2>

        {/* Description */}
        <p style={{
          fontSize: '16px',
          color: '#6b7280',
          lineHeight: '1.6',
          marginBottom: '32px',
          margin: '0 0 32px 0'
        }}>
          Your responses have been saved successfully. You can now access your personalized Strategy Summary and unlock additional DVA modules.
        </p>

        {/* Action Buttons */}
        <div style={{
          display: 'flex',
          gap: '16px',
          justifyContent: 'center',
          flexWrap: 'wrap'
        }}>
          <button
            onClick={onGoToSummary}
            style={{
              padding: '16px 32px',
              backgroundColor: '#FF6E4C',
              color: 'white',
              border: 'none',
              borderRadius: '12px',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              fontFamily: 'Montserrat, system-ui, sans-serif',
              fontWeight: '600',
              fontSize: '16px',
              boxShadow: '0 4px 12px rgba(255, 110, 76, 0.3)'
            }}
            onMouseEnter={(e) => {
              e.target.style.backgroundColor = '#e55a3c';
              e.target.style.transform = 'translateY(-2px)';
              e.target.style.boxShadow = '0 6px 16px rgba(255, 110, 76, 0.4)';
            }}
            onMouseLeave={(e) => {
              e.target.style.backgroundColor = '#FF6E4C';
              e.target.style.transform = 'translateY(0)';
              e.target.style.boxShadow = '0 4px 12px rgba(255, 110, 76, 0.3)';
            }}
          >
            📊 Go to Strategy Summary
          </button>

          <button
            onClick={onClose}
            style={{
              padding: '16px 32px',
              color: '#6b7280',
              border: '2px solid #d1d5db',
              borderRadius: '12px',
              backgroundColor: 'white',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              fontFamily: 'Montserrat, system-ui, sans-serif',
              fontWeight: '500',
              fontSize: '16px'
            }}
            onMouseEnter={(e) => {
              e.target.style.backgroundColor = '#f9fafb';
              e.target.style.borderColor = '#9ca3af';
            }}
            onMouseLeave={(e) => {
              e.target.style.backgroundColor = 'white';
              e.target.style.borderColor = '#d1d5db';
            }}
          >
            Continue Later
          </button>
        </div>

        {/* Additional Info */}
        <div style={{
          marginTop: '32px',
          padding: '20px',
          backgroundColor: '#f0f9ff',
          borderRadius: '12px',
          border: '1px solid #e0f2fe'
        }}>
          <div style={{
            fontSize: '14px',
            color: '#18365E',
            fontWeight: '600',
            marginBottom: '8px'
          }}>
            ✅ What's Next?
          </div>
          <div style={{
            fontSize: '14px',
            color: '#6b7280',
            lineHeight: '1.5'
          }}>
            • Access your Strategy Summary dashboard<br/>
            • Review personalized recommendations<br/>
            • Unlock advanced DVA analytics modules
          </div>
        </div>
      </div>
    </div>
  );
};

export default SurveyCompleteModal;
