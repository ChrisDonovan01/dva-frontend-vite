import React from 'react';

const SurveyNavigation = ({ 
  surveyTitle,
  currentSection,
  currentQuestion,
  totalQuestions,
  sections = [],
  onClose,
  onNavigateToSection,
  showSectionNav = true
}) => {
  return (
    <div style={{
      display: 'flex',
      height: '100vh',
      fontFamily: 'Montserrat, sans-serif'
    }}>
      {/* Left Navigation Sidebar */}
      <div style={{
        width: '280px',
        backgroundColor: '#f8f9fa',
        borderRight: '1px solid #e5e7eb',
        display: 'flex',
        flexDirection: 'column',
        position: 'relative'
      }}>
        {/* Header */}
        <div style={{
          padding: '24px 20px',
          borderBottom: '1px solid #e5e7eb',
          backgroundColor: 'white'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '12px'
          }}>
            <h2 style={{
              fontSize: '18px',
              fontWeight: '700',
              color: '#18365E',
              margin: 0
            }}>
              DVA Survey
            </h2>
            <button
              onClick={onClose}
              style={{
                background: 'none',
                border: 'none',
                fontSize: '20px',
                color: '#6b7280',
                cursor: 'pointer',
                padding: '4px',
                borderRadius: '4px'
              }}
              title="Close Survey"
            >
              ✕
            </button>
          </div>
          <p style={{
            fontSize: '14px',
            color: '#6b7280',
            margin: 0,
            lineHeight: '1.4'
          }}>
            {surveyTitle}
          </p>
        </div>

        {/* Progress Overview */}
        <div style={{
          padding: '20px',
          borderBottom: '1px solid #e5e7eb',
          backgroundColor: 'white'
        }}>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '12px'
          }}>
            <span style={{
              fontSize: '14px',
              fontWeight: '600',
              color: '#374151'
            }}>
              Overall Progress
            </span>
            <span style={{
              fontSize: '14px',
              color: '#6b7280'
            }}>
              {currentQuestion} of {totalQuestions}
            </span>
          </div>
          <div style={{
            width: '100%',
            height: '8px',
            backgroundColor: '#e5e7eb',
            borderRadius: '4px',
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

        {/* Section Navigation */}
        {showSectionNav && sections.length > 0 && (
          <div style={{
            flex: 1,
            overflowY: 'auto',
            padding: '16px 0'
          }}>
            <div style={{
              padding: '0 20px 12px 20px'
            }}>
              <h3 style={{
                fontSize: '14px',
                fontWeight: '600',
                color: '#374151',
                margin: 0,
                textTransform: 'uppercase',
                letterSpacing: '0.5px'
              }}>
                Sections
              </h3>
            </div>
            {sections.map((section, index) => {
              const isActive = currentSection === section.id;
              const isCompleted = false; // You can pass completion status if needed
              
              return (
                <button
                  key={section.id}
                  onClick={() => onNavigateToSection && onNavigateToSection(section.id, index)}
                  style={{
                    width: '100%',
                    padding: '12px 20px',
                    border: 'none',
                    backgroundColor: isActive ? '#f0f9ff' : 'transparent',
                    borderLeft: isActive ? '3px solid #18365E' : '3px solid transparent',
                    textAlign: 'left',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    transition: 'all 0.2s ease'
                  }}
                  onMouseEnter={(e) => {
                    if (!isActive) {
                      e.target.style.backgroundColor = '#f9fafb';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isActive) {
                      e.target.style.backgroundColor = 'transparent';
                    }
                  }}
                >
                  <div style={{
                    width: '24px',
                    height: '24px',
                    borderRadius: '50%',
                    backgroundColor: isActive ? '#18365E' : isCompleted ? '#10b981' : '#e5e7eb',
                    color: isActive || isCompleted ? 'white' : '#6b7280',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '12px',
                    fontWeight: '600',
                    flexShrink: 0
                  }}>
                    {isCompleted ? '✓' : index + 1}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{
                      fontSize: '14px',
                      fontWeight: isActive ? '600' : '500',
                      color: isActive ? '#18365E' : '#374151',
                      marginBottom: '2px'
                    }}>
                      {section.title}
                    </div>
                    <div style={{
                      fontSize: '12px',
                      color: '#6b7280',
                      lineHeight: '1.3'
                    }}>
                      {section.description}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        )}

        {/* Footer */}
        <div style={{
          padding: '16px 20px',
          borderTop: '1px solid #e5e7eb',
          backgroundColor: 'white'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            fontSize: '12px',
            color: '#6b7280'
          }}>
            <div style={{
              width: '16px',
              height: '16px',
              backgroundColor: '#18365E',
              borderRadius: '2px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
              fontSize: '10px',
              fontWeight: '700'
            }}>
              DVA
            </div>
            Data Value Acceleration
          </div>
        </div>
      </div>
    </div>
  );
};

export default SurveyNavigation;
