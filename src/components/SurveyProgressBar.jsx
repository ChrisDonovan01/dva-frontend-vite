// Survey Progress Bar Component - Professional DVA Brand Styling
// Shows completion progress and current section

import React from 'react';

const SurveyProgressBar = ({ 
  currentSection, 
  completedQuestions, 
  totalQuestions,
  sections 
}) => {
  const progressPercentage = Math.round((completedQuestions / totalQuestions) * 100);
  
  return (
    <div style={{
      backgroundColor: 'white',
      borderBottom: '2px solid #18365E',
      padding: '24px 32px',
      position: 'sticky',
      top: 0,
      zIndex: 1000,
      boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)'
    }}>
      <div style={{
        maxWidth: '1200px',
        margin: '0 auto'
      }}>
        {/* Progress Header */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '20px'
        }}>
          <div>
            <h2 style={{
              fontSize: '28px',
              fontWeight: '700',
              color: '#18365E',
              margin: '0 0 8px 0',
              fontFamily: 'Montserrat, system-ui, sans-serif'
            }}>
              📋 Strategy Survey
            </h2>
            <p style={{
              fontSize: '16px',
              color: '#6b7280',
              margin: 0,
              fontFamily: 'Montserrat, system-ui, sans-serif'
            }}>
              {completedQuestions} of {totalQuestions} questions completed
            </p>
          </div>
          <div style={{
            textAlign: 'right',
            backgroundColor: '#f8fafc',
            padding: '16px 24px',
            borderRadius: '12px',
            border: '2px solid #FF6E4C'
          }}>
            <div style={{
              fontSize: '32px',
              fontWeight: '700',
              color: '#FF6E4C',
              fontFamily: 'Montserrat, system-ui, sans-serif'
            }}>
              {progressPercentage}%
            </div>
            <div style={{
              fontSize: '14px',
              color: '#6b7280',
              fontFamily: 'Montserrat, system-ui, sans-serif'
            }}>
              Complete
            </div>
          </div>
        </div>

        {/* Progress Bar */}
        <div style={{
          width: '100%',
          backgroundColor: '#e5e7eb',
          borderRadius: '8px',
          height: '12px',
          marginBottom: '24px',
          overflow: 'hidden'
        }}>
          <div style={{
            backgroundColor: '#FF6E4C',
            height: '100%',
            borderRadius: '8px',
            width: `${progressPercentage}%`,
            transition: 'width 0.5s ease-out',
            background: 'linear-gradient(90deg, #FF6E4C 0%, #FF8A6B 100%)'
          }} />
        </div>

        {/* Section Indicators */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: '16px'
        }}>
          {sections.map((section, index) => {
            const isActive = section.id === currentSection;
            const isCompleted = index < sections.findIndex(s => s.id === currentSection);
            
            return (
              <div 
                key={section.id}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  flex: 1,
                  minWidth: 0
                }}
              >
                <div style={{
                  width: '48px',
                  height: '48px',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '18px',
                  fontWeight: '600',
                  marginBottom: '12px',
                  fontFamily: 'Montserrat, system-ui, sans-serif',
                  backgroundColor: isActive 
                    ? '#FF6E4C' 
                    : isCompleted 
                      ? '#10b981' 
                      : '#e5e7eb',
                  color: isActive || isCompleted ? 'white' : '#6b7280',
                  border: isActive ? '3px solid #FF8A6B' : 'none',
                  boxShadow: isActive ? '0 4px 12px rgba(255, 110, 76, 0.3)' : 'none'
                }}>
                  {isCompleted ? '✓' : index + 1}
                </div>
                <div style={{
                  fontSize: '13px',
                  textAlign: 'center',
                  fontWeight: isActive ? '600' : '500',
                  color: isActive ? '#FF6E4C' : '#6b7280',
                  fontFamily: 'Montserrat, system-ui, sans-serif',
                  lineHeight: '1.3'
                }}>
                  {section.title}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default SurveyProgressBar;
