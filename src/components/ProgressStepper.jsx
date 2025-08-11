// src/components/ProgressStepper.jsx
import React from 'react';

const ProgressStepper = ({ currentStep = 1 }) => {
  const steps = [
    { id: 1, label: 'Data Input', icon: '📊' },
    { id: 2, label: 'Baseline Data Product Strategy', icon: '🎯' },
    { id: 3, label: 'Opportunity Assessment', icon: '💡' },
    { id: 4, label: 'Data Product Playbook', icon: '📋' }
  ];

  return (
    <div style={{
      width: '100%',
      backgroundColor: 'white',
      borderBottom: '1px solid #e5e7eb',
      padding: '1.5rem 2rem',
      marginBottom: '0'
    }}>
      <div style={{
        maxWidth: '1200px',
        margin: '0 auto',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        position: 'relative'
      }}>
        {/* Progress Line Background */}
        <div style={{
          position: 'absolute',
          top: '50%',
          left: '0',
          right: '0',
          height: '2px',
          backgroundColor: '#e5e7eb',
          zIndex: 1,
          transform: 'translateY(-50%)'
        }} />
        
        {/* Active Progress Line */}
        <div style={{
          position: 'absolute',
          top: '50%',
          left: '0',
          width: `${((currentStep - 1) / (steps.length - 1)) * 100}%`,
          height: '2px',
          backgroundColor: '#18365E',
          zIndex: 2,
          transform: 'translateY(-50%)',
          transition: 'width 0.3s ease'
        }} />

        {/* Step Items */}
        {steps.map((step, index) => {
          const isActive = step.id === currentStep;
          const isCompleted = step.id < currentStep;
          const isUpcoming = step.id > currentStep;

          return (
            <div
              key={step.id}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                position: 'relative',
                zIndex: 3,
                flex: 1,
                maxWidth: '200px'
              }}
            >
              {/* Step Circle */}
              <div style={{
                width: '48px',
                height: '48px',
                borderRadius: '50%',
                backgroundColor: isActive ? '#18365E' : isCompleted ? '#10B981' : '#f3f4f6',
                border: isActive ? '3px solid #18365E' : isCompleted ? '3px solid #10B981' : '3px solid #d1d5db',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '1.25rem',
                fontWeight: '600',
                color: isActive || isCompleted ? 'white' : '#6b7280',
                marginBottom: '0.75rem',
                transition: 'all 0.3s ease',
                cursor: step.id === 1 ? 'pointer' : 'default'
              }}>
                {isCompleted ? '✓' : step.id}
              </div>

              {/* Step Label */}
              <div style={{
                textAlign: 'center',
                fontSize: '0.875rem',
                fontWeight: isActive ? '600' : '500',
                color: isActive ? '#18365E' : isCompleted ? '#10B981' : '#6b7280',
                fontFamily: 'Montserrat, system-ui, sans-serif',
                lineHeight: '1.25',
                maxWidth: '140px'
              }}>
                {step.label}
              </div>

              {/* Active Step Indicator */}
              {isActive && (
                <div style={{
                  width: '8px',
                  height: '8px',
                  borderRadius: '50%',
                  backgroundColor: '#18365E',
                  marginTop: '0.5rem',
                  animation: 'pulse 2s infinite'
                }} />
              )}
            </div>
          );
        })}
      </div>

      {/* CSS Animation for Pulse Effect */}
      <style>{`
        @keyframes pulse {
          0%, 100% {
            opacity: 1;
          }
          50% {
            opacity: 0.5;
          }
        }
      `}</style>
    </div>
  );
};

export default ProgressStepper;
