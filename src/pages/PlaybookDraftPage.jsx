import React, { useEffect, useState, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { doc, getDoc, setDoc, updateDoc, serverTimestamp, collection, query, where, getDocs } from "firebase/firestore";
import { db } from "../firebase";

// Playbook Section Editor Component
const SectionEditor = ({ 
  title, 
  status, 
  content, 
  lastEdited, 
  onSave, 
  onRegenerate, 
  isAdmin = false,
  isExpanded,
  onToggle
}) => {
  const [editContent, setEditContent] = useState(content || '');
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setSaving] = useState(false);
  const [isRegenerating, setRegenerating] = useState(false);

  const getStatusColor = (status) => {
    switch (status) {
      case 'generated': return '#3b82f6'; // Blue
      case 'edited': return '#10b981'; // Green
      case 'missing': return '#f59e0b'; // Yellow
      default: return '#6b7280'; // Gray
    }
  };

  const getStatusBorder = (status) => {
    switch (status) {
      case 'generated': return '2px solid #bfdbfe';
      case 'edited': return '2px solid #bbf7d0';
      case 'missing': return '2px solid #fed7aa';
      default: return '1px solid #e5e7eb';
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await onSave(title, editContent);
      setIsEditing(false);
    } catch (error) {
      console.error('Save failed:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleRegenerate = async (type) => {
    setRegenerating(true);
    try {
      const newContent = await onRegenerate(title, type);
      setEditContent(newContent);
    } catch (error) {
      console.error('Regeneration failed:', error);
    } finally {
      setRegenerating(false);
    }
  };

  return (
    <div style={{
      backgroundColor: '#f8fafc',
      border: getStatusBorder(status),
      borderRadius: '12px',
      marginBottom: '16px',
      overflow: 'hidden'
    }}>
      {/* Section Header */}
      <div 
        onClick={onToggle}
        style={{
          padding: '20px 24px',
          backgroundColor: 'white',
          borderBottom: '1px solid #e5e7eb',
          cursor: 'pointer',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <h3 style={{
            fontSize: '18px',
            fontWeight: '600',
            color: '#18365E',
            margin: 0
          }}>
            {title}
          </h3>
          <span style={{
            backgroundColor: getStatusColor(status),
            color: 'white',
            padding: '4px 12px',
            borderRadius: '16px',
            fontSize: '12px',
            fontWeight: '600',
            textTransform: 'uppercase'
          }}>
            {status}
          </span>
        </div>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          {lastEdited && (
            <span style={{ fontSize: '12px', color: '#6b7280' }}>
              Last edited: {new Date(lastEdited).toLocaleDateString()}
            </span>
          )}
          <span style={{
            fontSize: '18px',
            color: '#6b7280',
            transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)',
            transition: 'transform 0.2s ease'
          }}>
            ▼
          </span>
        </div>
      </div>

      {/* Section Content */}
      {isExpanded && (
        <div style={{ padding: '24px' }}>
          {/* AI Tools Toolbar */}
          {isAdmin && (
            <div style={{
              display: 'flex',
              gap: '8px',
              marginBottom: '16px',
              flexWrap: 'wrap'
            }}>
              <button
                onClick={() => handleRegenerate('full')}
                disabled={isRegenerating}
                style={{
                  backgroundColor: '#FF6E4C',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  padding: '8px 16px',
                  fontSize: '14px',
                  fontWeight: '600',
                  cursor: isRegenerating ? 'not-allowed' : 'pointer',
                  opacity: isRegenerating ? 0.6 : 1
                }}
              >
                {isRegenerating ? 'Regenerating...' : '🔄 Regenerate'}
              </button>
              
              <button
                onClick={() => handleRegenerate('summarize')}
                disabled={isRegenerating}
                style={{
                  backgroundColor: '#18365E',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  padding: '8px 16px',
                  fontSize: '14px',
                  fontWeight: '600',
                  cursor: isRegenerating ? 'not-allowed' : 'pointer',
                  opacity: isRegenerating ? 0.6 : 1
                }}
              >
                📊 Summarize from Profile
              </button>
              
              <button
                onClick={() => handleRegenerate('strategic')}
                disabled={isRegenerating}
                style={{
                  backgroundColor: '#10b981',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  padding: '8px 16px',
                  fontSize: '14px',
                  fontWeight: '600',
                  cursor: isRegenerating ? 'not-allowed' : 'pointer',
                  opacity: isRegenerating ? 0.6 : 1
                }}
              >
                💡 Insert Strategic Narrative
              </button>
            </div>
          )}

          {/* Content Editor */}
          <div style={{
            backgroundColor: 'white',
            border: '1px solid #e5e7eb',
            borderRadius: '8px',
            minHeight: '200px'
          }}>
            <textarea
              value={editContent}
              onChange={(e) => {
                setEditContent(e.target.value);
                setIsEditing(true);
              }}
              placeholder={`Enter ${title.toLowerCase()} content here...`}
              style={{
                width: '100%',
                minHeight: '200px',
                padding: '16px',
                border: 'none',
                borderRadius: '8px',
                fontSize: '16px',
                lineHeight: '1.6',
                fontFamily: 'inherit',
                resize: 'vertical',
                outline: 'none'
              }}
            />
          </div>

          {/* Save Button */}
          {isEditing && (
            <div style={{
              display: 'flex',
              justifyContent: 'flex-end',
              marginTop: '16px',
              gap: '8px'
            }}>
              <button
                onClick={() => {
                  setEditContent(content || '');
                  setIsEditing(false);
                }}
                style={{
                  backgroundColor: 'transparent',
                  color: '#6b7280',
                  border: '1px solid #d1d5db',
                  borderRadius: '6px',
                  padding: '8px 16px',
                  fontSize: '14px',
                  cursor: 'pointer'
                }}
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={isSaving}
                style={{
                  backgroundColor: '#10b981',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  padding: '8px 16px',
                  fontSize: '14px',
                  fontWeight: '600',
                  cursor: isSaving ? 'not-allowed' : 'pointer',
                  opacity: isSaving ? 0.6 : 1
                }}
              >
                {isSaving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

// Context Panel Component
const ContextPanel = ({ useCase, client, lastUpdated, onRegenerateAll, isAdmin }) => {
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <div style={{
      backgroundColor: 'white',
      border: '1px solid #e5e7eb',
      borderRadius: '12px',
      padding: '24px',
      marginBottom: '24px',
      boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
    }}>
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: isCollapsed ? 0 : '20px'
      }}>
        <h2 style={{
          fontSize: '20px',
          fontWeight: '700',
          color: '#18365E',
          margin: 0
        }}>
          Playbook Context
        </h2>
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          style={{
            background: 'none',
            border: 'none',
            fontSize: '16px',
            color: '#6b7280',
            cursor: 'pointer',
            transform: isCollapsed ? 'rotate(180deg)' : 'rotate(0deg)',
            transition: 'transform 0.2s ease'
          }}
        >
          ▲
        </button>
      </div>

      {!isCollapsed && (
        <div style={{ display: 'grid', gap: '16px' }}>
          <div>
            <div style={{ fontSize: '12px', color: '#6b7280', fontWeight: '600', marginBottom: '4px' }}>
              CLIENT
            </div>
            <div style={{ fontSize: '16px', fontWeight: '600', color: '#1f2937' }}>
              {client?.name || 'Unknown Client'}
            </div>
          </div>
          
          <div>
            <div style={{ fontSize: '12px', color: '#6b7280', fontWeight: '600', marginBottom: '4px' }}>
              USE CASE
            </div>
            <div style={{ fontSize: '16px', fontWeight: '600', color: '#1f2937' }}>
              {useCase?.name || 'Unknown Use Case'}
            </div>
          </div>
          
          <div>
            <div style={{ fontSize: '12px', color: '#6b7280', fontWeight: '600', marginBottom: '4px' }}>
              LAST UPDATED
            </div>
            <div style={{ fontSize: '14px', color: '#6b7280' }}>
              {lastUpdated ? new Date(lastUpdated).toLocaleString() : 'Never'}
            </div>
          </div>

          {isAdmin && (
            <div style={{ marginTop: '16px', paddingTop: '16px', borderTop: '1px solid #e5e7eb' }}>
              <button
                onClick={onRegenerateAll}
                style={{
                  backgroundColor: '#FF6E4C',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  padding: '12px 20px',
                  fontSize: '14px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  width: '100%'
                }}
              >
                🔄 Regenerate All Sections
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

// Main PlaybookDraftPage Component
export default function PlaybookDraftPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [useCase, setUseCase] = useState(null);
  const [client, setClient] = useState(null);
  const [sections, setSections] = useState({});
  const [expandedSections, setExpandedSections] = useState({ 'Executive Summary': true });
  const [lastUpdated, setLastUpdated] = useState(null);
  const [isAdmin] = useState(true); // This would come from auth context
  const [saveToast, setSaveToast] = useState(null);

  // Define playbook sections
  const sectionTitles = [
    'Executive Summary',
    'Data Monetization Overview',
    'Strategic Alignment',
    'Financial ROI Model',
    'Tech & Data Readiness',
    'Implementation Roadmap',
    'Regulatory & Compliance',
    'Go-to-Market Strategy',
    'Risks & Mitigation',
    'Action Plan',
    'Tools & Resources'
  ];

  // Load playbook data
  useEffect(() => {
    const loadPlaybookData = async () => {
      try {
        // Load use case data
        const useCaseRef = doc(db, 'use_cases', id);
        const useCaseSnap = await getDoc(useCaseRef);
        if (useCaseSnap.exists()) {
          setUseCase(useCaseSnap.data());
        }

        // Load sections data
        const sectionsQuery = query(
          collection(db, 'playbook_sections'),
          where('use_case_id', '==', id)
        );
        const sectionsSnap = await getDocs(sectionsQuery);
        
        const sectionsData = {};
        sectionsSnap.forEach((doc) => {
          const data = doc.data();
          sectionsData[data.title] = {
            content: data.content || '',
            status: data.status || 'missing',
            lastEdited: data.lastEdited?.toDate() || null
          };
        });
        
        setSections(sectionsData);
        setLastUpdated(new Date());
      } catch (error) {
        console.error('Error loading playbook data:', error);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      loadPlaybookData();
    }
  }, [id]);

  // Auto-save functionality
  useEffect(() => {
    const autoSaveInterval = setInterval(() => {
      // Auto-save logic would go here
    }, 10000); // Every 10 seconds

    return () => clearInterval(autoSaveInterval);
  }, [sections]);

  const handleSectionSave = async (sectionTitle, content) => {
    try {
      const sectionRef = doc(db, 'playbook_sections', `${id}_${sectionTitle}`);
      await setDoc(sectionRef, {
        use_case_id: id,
        title: sectionTitle,
        content,
        status: 'edited',
        lastEdited: serverTimestamp()
      }, { merge: true });

      setSections(prev => ({
        ...prev,
        [sectionTitle]: {
          ...prev[sectionTitle],
          content,
          status: 'edited',
          lastEdited: new Date()
        }
      }));

      setSaveToast('Section saved successfully!');
      setTimeout(() => setSaveToast(null), 3000);
    } catch (error) {
      console.error('Error saving section:', error);
      setSaveToast('Error saving section');
      setTimeout(() => setSaveToast(null), 3000);
    }
  };

  const handleSectionRegenerate = async (sectionTitle, type) => {
    // Simulate AI regeneration
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    const mockContent = {
      'full': `AI-generated content for ${sectionTitle} (Full Regeneration)\n\nThis section has been completely regenerated using advanced AI capabilities to provide comprehensive insights tailored to your specific use case and organizational context.`,
      'summarize': `AI-summarized content for ${sectionTitle} (From Profile)\n\nThis content has been synthesized from your use case profile data to provide targeted insights and recommendations.`,
      'strategic': `Strategic narrative for ${sectionTitle}\n\nThis section incorporates strategic storytelling elements to enhance executive communication and stakeholder alignment.`
    };

    const newContent = mockContent[type] || mockContent['full'];
    
    setSections(prev => ({
      ...prev,
      [sectionTitle]: {
        ...prev[sectionTitle],
        content: newContent,
        status: 'generated',
        lastEdited: new Date()
      }
    }));

    return newContent;
  };

  const handleRegenerateAll = async () => {
    // Bulk regeneration logic
    console.log('Regenerating all sections...');
  };

  const toggleSection = (sectionTitle) => {
    setExpandedSections(prev => ({
      ...prev,
      [sectionTitle]: !prev[sectionTitle]
    }));
  };

  if (loading) {
    return (
      <div style={{
        minHeight: '100vh',
        backgroundColor: '#f8fafc',
        padding: '24px',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center'
      }}>
        <div style={{
          fontSize: '18px',
          color: '#6b7280'
        }}>
          Loading playbook draft...
        </div>
      </div>
    );
  }

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#f8fafc'
    }}>
      {/* Header */}
      <div style={{
        backgroundColor: 'white',
        borderBottom: '1px solid #e5e7eb',
        padding: '16px 24px'
      }}>
        {/* Breadcrumbs */}
        <div style={{
          fontSize: '14px',
          color: '#6b7280',
          marginBottom: '8px'
        }}>
          <button
            onClick={() => navigate('/')}
            style={{
              background: 'none',
              border: 'none',
              color: '#2563eb',
              cursor: 'pointer',
              textDecoration: 'underline'
            }}
          >
            Home
          </button>
          {' / '}
          <button
            onClick={() => navigate('/playbooks')}
            style={{
              background: 'none',
              border: 'none',
              color: '#2563eb',
              cursor: 'pointer',
              textDecoration: 'underline'
            }}
          >
            Playbooks
          </button>
          {' / '}
          <span>{client?.name || 'Client'}</span>
          {' / '}
          <span>{useCase?.name || 'Use Case'}</span>
        </div>
        
        {/* Page Title */}
        <h1 style={{
          fontSize: '28px',
          fontWeight: '700',
          color: '#18365E',
          margin: 0,
          fontFamily: 'Montserrat, sans-serif'
        }}>
          {useCase?.name || 'Use Case'} – Playbook Draft
        </h1>
      </div>

      {/* Main Content */}
      <div style={{
        maxWidth: '1400px',
        margin: '0 auto',
        padding: '24px',
        display: 'grid',
        gridTemplateColumns: '350px 1fr',
        gap: '24px'
      }}>
        {/* Context Panel */}
        <div>
          <ContextPanel
            useCase={useCase}
            client={client}
            lastUpdated={lastUpdated}
            onRegenerateAll={handleRegenerateAll}
            isAdmin={isAdmin}
          />
        </div>

        {/* Main Editor */}
        <div>
          {sectionTitles.map((sectionTitle) => {
            const sectionData = sections[sectionTitle] || {
              content: '',
              status: 'missing',
              lastEdited: null
            };

            return (
              <SectionEditor
                key={sectionTitle}
                title={sectionTitle}
                status={sectionData.status}
                content={sectionData.content}
                lastEdited={sectionData.lastEdited}
                onSave={handleSectionSave}
                onRegenerate={handleSectionRegenerate}
                isAdmin={isAdmin}
                isExpanded={expandedSections[sectionTitle] || false}
                onToggle={() => toggleSection(sectionTitle)}
              />
            );
          })}
        </div>
      </div>

      {/* Save Toast */}
      {saveToast && (
        <div style={{
          position: 'fixed',
          bottom: '24px',
          right: '24px',
          backgroundColor: '#10b981',
          color: 'white',
          padding: '12px 20px',
          borderRadius: '8px',
          fontSize: '14px',
          fontWeight: '600',
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
          zIndex: 1000
        }}>
          {saveToast}
        </div>
      )}
    </div>
  );
}
