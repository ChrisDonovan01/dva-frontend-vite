import React from 'react';

const SurveyBreadcrumb = ({ 
  items = [],
  currentSection,
  currentQuestion,
  totalQuestions
}) => {
  return (
    <div style={{
      backgroundColor: 'white',
      borderBottom: '1px solid #e5e7eb',
      padding: '16px 32px',
      fontFamily: 'Montserrat, sans-serif'
    }}>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between'
      }}>
        {/* Breadcrumb Navigation */}
        <nav style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          fontSize: '14px'
        }}>
          {items.map((item, index) => (
            <React.Fragment key={index}>
              {index > 0 && (
                <span style={{ 
                  color: '#6b7280',
                  margin: '0 4px'
                }}>
                  ›
                </span>
              )}
              <span style={{
                color: index === items.length - 1 ? '#18365E' : '#6b7280',
                fontWeight: index === items.length - 1 ? '600' : '400',
                cursor: index < items.length - 1 ? 'pointer' : 'default'
              }}>
                {item}
              </span>
            </React.Fragment>
          ))}
        </nav>

        {/* Progress Indicator */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '16px',
          fontSize: '14px',
          color: '#6b7280'
        }}>
          {currentSection && (
            <span style={{
              padding: '4px 12px',
              backgroundColor: '#f0f9ff',
              color: '#18365E',
              borderRadius: '20px',
              fontSize: '12px',
              fontWeight: '500'
            }}>
              {currentSection}
            </span>
          )}
          <span>
            Question {currentQuestion} of {totalQuestions}
          </span>
          <div style={{
            width: '80px',
            height: '6px',
            backgroundColor: '#e5e7eb',
            borderRadius: '3px',
            overflow: 'hidden'
          }}>
            <div style={{
              width: `${(currentQuestion / totalQuestions) * 100}%`,
              height: '100%',
              backgroundColor: '#FF6E4C',
              transition: 'width 0.3s ease'
            }} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default SurveyBreadcrumb;
