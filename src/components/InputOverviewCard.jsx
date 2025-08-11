// Input Overview Card Component for Client Data Input Configurator
// Designed for Jamie Reynolds persona - Executive-focused UX

import React from 'react';

const InputOverviewCard = ({ 
  title, 
  description, 
  status = 'Not Started', 
  lastUpdated = null, 
  progress = 0,
  onAction,
  actionLabel = 'Start'
}) => {
  
  const getStatusColor = (status) => {
    switch(status.toLowerCase()) {
      case 'complete': return '#10b981'; // Green
      case 'in progress': return '#f59e0b'; // Yellow
      case 'not started': return '#6b7280'; // Gray
      default: return '#6b7280';
    }
  };

  const getStatusIcon = (status) => {
    switch(status.toLowerCase()) {
      case 'complete': return '✓';
      case 'in progress': return '⏳';
      case 'not started': return '○';
      default: return '○';
    }
  };

  const getActionLabel = (status) => {
    switch(status.toLowerCase()) {
      case 'complete': return 'Edit';
      case 'in progress': return 'Continue';
      case 'not started': return 'Start';
      default: return actionLabel;
    }
  };

  return (
    <div style={{
      backgroundColor: 'white',
      borderRadius: '12px',
      padding: '24px',
      boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
      border: '1px solid #e5e7eb',
      transition: 'all 0.2s ease',
      cursor: 'pointer',
      minHeight: '200px',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'space-between'
    }}
    onMouseEnter={(e) => {
      e.currentTarget.style.boxShadow = '0 4px 16px rgba(0, 0, 0, 0.15)';
      e.currentTarget.style.transform = 'translateY(-2px)';
    }}
    onMouseLeave={(e) => {
      e.currentTarget.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.1)';
      e.currentTarget.style.transform = 'translateY(0)';
    }}>
      
      {/* Header with Status */}
      <div>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '12px'
        }}>
          <h3 style={{
            fontSize: '18px',
            fontWeight: '600',
            color: '#18365E', // DVA Blue
            margin: 0,
            fontFamily: 'Montserrat, system-ui, sans-serif'
          }}>
            {title}
          </h3>
          
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            backgroundColor: getStatusColor(status) + '20',
            padding: '4px 12px',
            borderRadius: '20px',
            fontSize: '12px',
            fontWeight: '500',
            color: getStatusColor(status)
          }}>
            <span>{getStatusIcon(status)}</span>
            {status}
          </div>
        </div>

        <p style={{
          color: '#6b7280',
          fontSize: '14px',
          lineHeight: '1.5',
          margin: '0 0 16px 0'
        }}>
          {description}
        </p>

        {/* Progress Bar */}
        {progress >= 0 && (
          <div style={{ marginBottom: '16px' }}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '4px'
            }}>
              <span style={{ fontSize: '12px', color: '#6b7280' }}>Progress</span>
              <span style={{ fontSize: '12px', fontWeight: '600', color: '#18365E' }}>
                {progress}%
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
                width: `${progress}%`,
                height: '100%',
                backgroundColor: getStatusColor(status),
                transition: 'width 0.3s ease'
              }} />
            </div>
          </div>
        )}

        {/* Last Updated */}
        {lastUpdated && (
          <p style={{
            fontSize: '12px',
            color: '#9ca3af',
            margin: '8px 0 0 0'
          }}>
            Last updated: {lastUpdated}
          </p>
        )}
      </div>

      {/* Action Button */}
      <button
        onClick={onAction}
        style={{
          backgroundColor: '#FF6E4C', // DVA Orange
          color: 'white',
          border: 'none',
          borderRadius: '8px',
          padding: '12px 24px',
          fontSize: '14px',
          fontWeight: '600',
          cursor: 'pointer',
          transition: 'all 0.2s ease',
          fontFamily: 'Montserrat, system-ui, sans-serif',
          textTransform: 'uppercase',
          letterSpacing: '0.5px'
        }}
        onMouseEnter={(e) => {
          e.target.style.backgroundColor = '#e55a3c';
          e.target.style.transform = 'translateY(-1px)';
        }}
        onMouseLeave={(e) => {
          e.target.style.backgroundColor = '#FF6E4C';
          e.target.style.transform = 'translateY(0)';
        }}
      >
        {getActionLabel(status)}
      </button>
    </div>
  );
};

export default InputOverviewCard;
