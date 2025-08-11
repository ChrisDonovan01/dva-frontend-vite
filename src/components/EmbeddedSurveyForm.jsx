// Embedded Survey Form Component for Client Data Input Configurator
// Google Forms integration with manual completion tracking

import React, { useState } from 'react';

const EmbeddedSurveyForm = ({ 
  title, 
  instructions, 
  formUrl, 
  isCompleted = false, 
  onCompletionToggle 
}) => {
  const [completed, setCompleted] = useState(isCompleted);

  const handleCompletionToggle = () => {
    const newStatus = !completed;
    setCompleted(newStatus);
    if (onCompletionToggle) {
      onCompletionToggle(newStatus);
    }
  };

  return (
    <div style={{
      backgroundColor: 'white',
      borderRadius: '12px',
      padding: '24px',
      boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
      border: '1px solid #e5e7eb',
      marginBottom: '24px'
    }}>
      
      {/* Header */}
      <div style={{
        marginBottom: '20px',
        paddingBottom: '16px',
        borderBottom: '2px solid #18365E'
      }}>
        <h2 style={{
          fontSize: '20px',
          fontWeight: '600',
          color: '#18365E', // DVA Blue
          margin: '0 0 8px 0',
          fontFamily: 'Montserrat, system-ui, sans-serif'
        }}>
          {title}
        </h2>
        
        {instructions && (
          <p style={{
            color: '#6b7280',
            fontSize: '14px',
            lineHeight: '1.6',
            margin: 0
          }}>
            {instructions}
          </p>
        )}
      </div>

      {/* Embedded Google Form */}
      <div style={{
        marginBottom: '20px',
        border: '1px solid #d1d5db',
        borderRadius: '8px',
        overflow: 'hidden',
        backgroundColor: '#f9fafb'
      }}>
        <iframe
          src={formUrl}
          width="100%"
          height="600"
          frameBorder="0"
          marginHeight="0"
          marginWidth="0"
          style={{
            display: 'block',
            backgroundColor: 'white'
          }}
          title={title}
        >
          Loading survey...
        </iframe>
      </div>

      {/* Manual Completion Toggle */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '16px',
        backgroundColor: completed ? '#f0f9ff' : '#fef3f2',
        border: `2px solid ${completed ? '#0ea5e9' : '#f97316'}`,
        borderRadius: '8px'
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '12px'
        }}>
          <div style={{
            width: '20px',
            height: '20px',
            borderRadius: '50%',
            backgroundColor: completed ? '#10b981' : '#f59e0b',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white',
            fontSize: '12px',
            fontWeight: 'bold'
          }}>
            {completed ? '✓' : '!'}
          </div>
          
          <div>
            <p style={{
              margin: 0,
              fontSize: '14px',
              fontWeight: '600',
              color: completed ? '#0ea5e9' : '#f97316'
            }}>
              {completed ? 'Survey Completed' : 'Mark Survey as Complete'}
            </p>
            <p style={{
              margin: 0,
              fontSize: '12px',
              color: '#6b7280'
            }}>
              {completed 
                ? 'This survey has been marked as completed and will contribute to your scoring.'
                : 'Once you\'ve finished the survey above, mark it as complete to proceed.'
              }
            </p>
          </div>
        </div>

        <button
          onClick={handleCompletionToggle}
          style={{
            backgroundColor: completed ? '#10b981' : '#FF6E4C',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            padding: '8px 16px',
            fontSize: '12px',
            fontWeight: '600',
            cursor: 'pointer',
            transition: 'all 0.2s ease',
            fontFamily: 'Montserrat, system-ui, sans-serif',
            textTransform: 'uppercase',
            letterSpacing: '0.5px'
          }}
          onMouseEnter={(e) => {
            e.target.style.opacity = '0.9';
            e.target.style.transform = 'translateY(-1px)';
          }}
          onMouseLeave={(e) => {
            e.target.style.opacity = '1';
            e.target.style.transform = 'translateY(0)';
          }}
        >
          {completed ? 'Completed' : 'Mark Complete'}
        </button>
      </div>

      {/* Help Text */}
      <div style={{
        marginTop: '16px',
        padding: '12px',
        backgroundColor: '#f8fafc',
        borderRadius: '6px',
        border: '1px solid #e2e8f0'
      }}>
        <p style={{
          margin: 0,
          fontSize: '12px',
          color: '#64748b',
          lineHeight: '1.4'
        }}>
          <strong>Note:</strong> Complete the survey in the embedded form above, then manually mark it as complete. 
          This will update your progress and contribute to your DVA scoring calculations.
        </p>
      </div>
    </div>
  );
};

export default EmbeddedSurveyForm;
