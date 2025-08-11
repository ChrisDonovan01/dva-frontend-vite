// Stepper Navigation Component for Client Data Input Configurator
// Sticky progress sidebar with step navigation

import React from 'react';

const StepperNav = ({ 
  currentStep = 0, 
  onStepClick,
  isSticky = true,
  allowBackNavigation = true 
}) => {
  
  const steps = [
    {
      id: 0,
      title: 'Input Overview',
      description: 'Review data input categories',
      icon: '📋'
    },
    {
      id: 1,
      title: 'Organizational Strategy',
      description: 'Strategic goals and priorities',
      icon: '🎯'
    },
    {
      id: 2,
      title: 'Current Capabilities',
      description: 'Existing systems and processes',
      icon: '⚙️'
    },
    {
      id: 3,
      title: 'Interoperability',
      description: 'Data readiness assessment',
      icon: '🔗'
    },
    {
      id: 4,
      title: 'Alignment Summary',
      description: 'Review and validate inputs',
      icon: '📊'
    },
    {
      id: 5,
      title: 'Proceed to Scoring',
      description: 'Generate DVA recommendations',
      icon: '🚀'
    }
  ];

  const getStepStatus = (stepId) => {
    if (stepId < currentStep) return 'completed';
    if (stepId === currentStep) return 'active';
    return 'pending';
  };

  const getStepColor = (status) => {
    switch(status) {
      case 'completed': return '#10b981'; // Green
      case 'active': return '#FF6E4C'; // DVA Orange
      case 'pending': return '#d1d5db'; // Gray
      default: return '#d1d5db';
    }
  };

  const getStepTextColor = (status) => {
    switch(status) {
      case 'completed': return '#065f46';
      case 'active': return '#FF6E4C';
      case 'pending': return '#6b7280';
      default: return '#6b7280';
    }
  };

  const handleStepClick = (stepId) => {
    if (!onStepClick) return;
    
    // Allow clicking on completed steps or current step
    if (allowBackNavigation && stepId <= currentStep) {
      onStepClick(stepId);
    }
  };

  const containerStyle = {
    backgroundColor: 'white',
    borderRadius: '12px',
    padding: '24px',
    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
    border: '1px solid #e5e7eb',
    minWidth: '280px',
    ...(isSticky && {
      position: 'sticky',
      top: '24px',
      maxHeight: 'calc(100vh - 48px)',
      overflowY: 'auto'
    })
  };

  return (
    <div style={containerStyle}>
      
      {/* Header */}
      <div style={{
        marginBottom: '24px',
        paddingBottom: '16px',
        borderBottom: '2px solid #18365E'
      }}>
        <h3 style={{
          fontSize: '18px',
          fontWeight: '600',
          color: '#18365E',
          margin: '0 0 8px 0',
          fontFamily: 'Montserrat, system-ui, sans-serif'
        }}>
          Configuration Progress
        </h3>
        
        <p style={{
          color: '#6b7280',
          fontSize: '12px',
          lineHeight: '1.4',
          margin: 0
        }}>
          Step {currentStep + 1} of {steps.length}
        </p>
      </div>

      {/* Progress Bar */}
      <div style={{
        marginBottom: '24px'
      }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '8px'
        }}>
          <span style={{ fontSize: '12px', color: '#6b7280' }}>Overall Progress</span>
          <span style={{ fontSize: '12px', fontWeight: '600', color: '#18365E' }}>
            {Math.round(((currentStep) / (steps.length - 1)) * 100)}%
          </span>
        </div>
        <div style={{
          width: '100%',
          height: '6px',
          backgroundColor: '#e5e7eb',
          borderRadius: '3px',
          overflow: 'hidden'
        }}>
          <div style={{
            width: `${((currentStep) / (steps.length - 1)) * 100}%`,
            height: '100%',
            backgroundColor: '#FF6E4C',
            transition: 'width 0.3s ease'
          }} />
        </div>
      </div>

      {/* Steps */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
        {steps.map((step, index) => {
          const status = getStepStatus(step.id);
          const isClickable = allowBackNavigation && step.id <= currentStep;
          
          return (
            <div
              key={step.id}
              onClick={() => handleStepClick(step.id)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '12px',
                borderRadius: '8px',
                backgroundColor: status === 'active' ? '#fef3f2' : 'transparent',
                border: status === 'active' ? '1px solid #FF6E4C' : '1px solid transparent',
                cursor: isClickable ? 'pointer' : 'default',
                transition: 'all 0.2s ease',
                position: 'relative'
              }}
              onMouseEnter={(e) => {
                if (isClickable) {
                  e.currentTarget.style.backgroundColor = '#f8fafc';
                }
              }}
              onMouseLeave={(e) => {
                if (status !== 'active') {
                  e.currentTarget.style.backgroundColor = 'transparent';
                }
              }}
            >
              
              {/* Step Icon/Number */}
              <div style={{
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                backgroundColor: getStepColor(status),
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: status === 'completed' ? '14px' : '16px',
                fontWeight: 'bold',
                color: status === 'pending' ? '#6b7280' : 'white',
                flexShrink: 0
              }}>
                {status === 'completed' ? '✓' : step.icon}
              </div>

              {/* Step Content */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{
                  fontSize: '14px',
                  fontWeight: '600',
                  color: getStepTextColor(status),
                  marginBottom: '2px',
                  fontFamily: 'Montserrat, system-ui, sans-serif'
                }}>
                  {step.title}
                </div>
                <div style={{
                  fontSize: '11px',
                  color: '#9ca3af',
                  lineHeight: '1.3'
                }}>
                  {step.description}
                </div>
              </div>

              {/* Connection Line */}
              {index < steps.length - 1 && (
                <div style={{
                  position: 'absolute',
                  left: '27px',
                  top: '44px',
                  width: '2px',
                  height: '16px',
                  backgroundColor: step.id < currentStep ? '#10b981' : '#e5e7eb'
                }} />
              )}
            </div>
          );
        })}
      </div>

      {/* Action Buttons */}
      <div style={{
        marginTop: '24px',
        paddingTop: '16px',
        borderTop: '1px solid #e5e7eb',
        display: 'flex',
        gap: '8px'
      }}>
        
        {currentStep > 0 && (
          <button
            onClick={() => handleStepClick(currentStep - 1)}
            style={{
              flex: 1,
              backgroundColor: 'transparent',
              color: '#6b7280',
              border: '1px solid #d1d5db',
              borderRadius: '6px',
              padding: '8px 12px',
              fontSize: '12px',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              fontFamily: 'Montserrat, system-ui, sans-serif'
            }}
            onMouseEnter={(e) => {
              e.target.style.backgroundColor = '#f9fafb';
              e.target.style.borderColor = '#9ca3af';
            }}
            onMouseLeave={(e) => {
              e.target.style.backgroundColor = 'transparent';
              e.target.style.borderColor = '#d1d5db';
            }}
          >
            ← Back
          </button>
        )}

        {currentStep < steps.length - 1 && (
          <button
            onClick={() => handleStepClick(currentStep + 1)}
            style={{
              flex: 1,
              backgroundColor: '#FF6E4C',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              padding: '8px 12px',
              fontSize: '12px',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              fontFamily: 'Montserrat, system-ui, sans-serif'
            }}
            onMouseEnter={(e) => {
              e.target.style.backgroundColor = '#e55a3c';
            }}
            onMouseLeave={(e) => {
              e.target.style.backgroundColor = '#FF6E4C';
            }}
          >
            Next →
          </button>
        )}
      </div>
    </div>
  );
};

export default StepperNav;
