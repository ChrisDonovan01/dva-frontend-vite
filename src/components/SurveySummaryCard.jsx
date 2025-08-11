// SurveySummaryCard.jsx
// Reusable component for displaying individual survey summaries
// Supports collapsible cards with status badges and Gemini-generated content

import React, { useState } from 'react';

const SurveySummaryCard = ({ 
  title, 
  summaryText, 
  status = 'generated', 
  icon = '📊',
  defaultExpanded = true,
  onEdit = null,
  lastUpdated = null,
  isEditable = false
}) => {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);
  const [isEditing, setIsEditing] = useState(false);
  const [editedContent, setEditedContent] = useState(summaryText || '');

  // Status badge styling
  const getStatusBadge = () => {
    const statusConfig = {
      generated: { 
        bg: '#10B981', 
        text: 'Generated', 
        icon: '✅' 
      },
      generating: { 
        bg: '#F59E0B', 
        text: 'Generating...', 
        icon: '⏳' 
      },
      error: { 
        bg: '#EF4444', 
        text: 'Error', 
        icon: '❌' 
      },
      pending: { 
        bg: '#6B7280', 
        text: 'Pending', 
        icon: '⏸️' 
      }
    };

    const config = statusConfig[status] || statusConfig.pending;
    
    return (
      <span style={{
        backgroundColor: config.bg,
        color: 'white',
        padding: '0.25rem 0.75rem',
        borderRadius: '1rem',
        fontSize: '0.75rem',
        fontWeight: '600',
        display: 'flex',
        alignItems: 'center',
        gap: '0.25rem'
      }}>
        <span>{config.icon}</span>
        {config.text}
      </span>
    );
  };

  // Handle save edited content
  const handleSave = () => {
    if (onEdit) {
      onEdit(editedContent);
    }
    setIsEditing(false);
  };

  // Handle cancel editing
  const handleCancel = () => {
    setEditedContent(summaryText || '');
    setIsEditing(false);
  };

  // Render loading skeleton
  const renderLoadingSkeleton = () => (
    <div style={{ padding: '1.5rem' }}>
      <div style={{
        height: '1rem',
        backgroundColor: '#E5E7EB',
        borderRadius: '0.25rem',
        marginBottom: '0.75rem',
        animation: 'pulse 2s infinite'
      }} />
      <div style={{
        height: '1rem',
        backgroundColor: '#E5E7EB',
        borderRadius: '0.25rem',
        marginBottom: '0.75rem',
        width: '80%',
        animation: 'pulse 2s infinite'
      }} />
      <div style={{
        height: '1rem',
        backgroundColor: '#E5E7EB',
        borderRadius: '0.25rem',
        width: '60%',
        animation: 'pulse 2s infinite'
      }} />
    </div>
  );

  // Render empty state
  const renderEmptyState = () => (
    <div style={{
      padding: '2rem',
      textAlign: 'center',
      color: '#6B7280'
    }}>
      <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>📝</div>
      <p style={{ margin: 0, fontSize: '0.875rem' }}>
        Summary will be generated when survey is completed
      </p>
    </div>
  );

  // Render markdown content
  const renderContent = () => {
    if (status === 'generating') {
      return renderLoadingSkeleton();
    }

    if (!summaryText || summaryText.trim() === '') {
      return renderEmptyState();
    }

    if (isEditing) {
      return (
        <div style={{ padding: '1.5rem' }}>
          <textarea
            value={editedContent}
            onChange={(e) => setEditedContent(e.target.value)}
            style={{
              width: '100%',
              minHeight: '200px',
              padding: '1rem',
              border: '2px solid #18365E',
              borderRadius: '0.5rem',
              fontSize: '0.875rem',
              fontFamily: 'system-ui, -apple-system, sans-serif',
              lineHeight: '1.6',
              resize: 'vertical'
            }}
            placeholder="Edit your summary content..."
          />
          <div style={{
            display: 'flex',
            gap: '0.75rem',
            marginTop: '1rem',
            justifyContent: 'flex-end'
          }}>
            <button
              onClick={handleCancel}
              style={{
                padding: '0.5rem 1rem',
                border: '1px solid #D1D5DB',
                borderRadius: '0.375rem',
                backgroundColor: 'white',
                color: '#374151',
                fontSize: '0.875rem',
                cursor: 'pointer'
              }}
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              style={{
                padding: '0.5rem 1rem',
                border: 'none',
                borderRadius: '0.375rem',
                backgroundColor: '#18365E',
                color: 'white',
                fontSize: '0.875rem',
                cursor: 'pointer'
              }}
            >
              Save Changes
            </button>
          </div>
        </div>
      );
    }

    return (
      <div style={{
        padding: '1.5rem',
        fontSize: '0.875rem',
        lineHeight: '1.7',
        color: '#374151'
      }}>
        {/* Simple markdown rendering */}
        <div dangerouslySetInnerHTML={{
          __html: summaryText
            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
            .replace(/\*(.*?)\*/g, '<em>$1</em>')
            .replace(/\n\n/g, '</p><p>')
            .replace(/^(.+)$/gm, '<p>$1</p>')
            .replace(/^# (.*$)/gm, '<h1 style="font-size: 1.25rem; font-weight: 700; margin: 1rem 0 0.5rem 0; color: #18365E;">$1</h1>')
            .replace(/^## (.*$)/gm, '<h2 style="font-size: 1.125rem; font-weight: 600; margin: 0.75rem 0 0.5rem 0; color: #18365E;">$1</h2>')
            .replace(/^### (.*$)/gm, '<h3 style="font-size: 1rem; font-weight: 600; margin: 0.5rem 0 0.25rem 0; color: #18365E;">$1</h3>')
        }} />
      </div>
    );
  };

  return (
    <div style={{
      backgroundColor: 'white',
      borderRadius: '0.75rem',
      boxShadow: '0 4px 12px rgba(24, 54, 94, 0.1)',
      border: '1px solid #E5E7EB',
      overflow: 'hidden',
      marginBottom: '1.5rem'
    }}>
      {/* Card Header */}
      <div 
        style={{
          padding: '1.5rem',
          borderBottom: '1px solid #F3F4F6',
          backgroundColor: '#FAFBFC',
          cursor: 'pointer'
        }}
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <span style={{ fontSize: '1.5rem' }}>{icon}</span>
            <div>
              <h3 style={{
                margin: 0,
                fontSize: '1.125rem',
                fontWeight: '700',
                color: '#18365E',
                fontFamily: 'Montserrat, system-ui, sans-serif'
              }}>
                {title}
              </h3>
              {lastUpdated && (
                <p style={{
                  margin: '0.25rem 0 0 0',
                  fontSize: '0.75rem',
                  color: '#6B7280'
                }}>
                  Last updated: {new Date(lastUpdated).toLocaleDateString()}
                </p>
              )}
            </div>
          </div>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            {getStatusBadge()}
            
            {isEditable && status === 'generated' && !isEditing && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setIsEditing(true);
                  setIsExpanded(true);
                }}
                style={{
                  padding: '0.375rem 0.75rem',
                  border: '1px solid #FF6E4C',
                  borderRadius: '0.375rem',
                  backgroundColor: 'white',
                  color: '#FF6E4C',
                  fontSize: '0.75rem',
                  fontWeight: '600',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.25rem'
                }}
              >
                ✏️ Edit
              </button>
            )}
            
            <span style={{
              fontSize: '1.25rem',
              color: '#6B7280',
              transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)',
              transition: 'transform 0.2s ease'
            }}>
              ▼
            </span>
          </div>
        </div>
      </div>

      {/* Card Content */}
      {isExpanded && renderContent()}
    </div>
  );
};

export default SurveySummaryCard;
