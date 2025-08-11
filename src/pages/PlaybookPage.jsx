import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { collection, query, where, getDocs, doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase';

// Define the 13 standard playbook sections
const PLAYBOOK_SECTIONS = [
  { id: 'executive-summary', title: 'Executive Summary', number: 1 },
  { id: 'data-monetization', title: 'Data Monetization Overview', number: 2 },
  { id: 'strategic-assessment', title: 'Strategic Assessment Framework', number: 3 },
  { id: 'use-case-prioritization', title: 'Prioritization of Use Cases', number: 4 },
  { id: 'financial-modeling', title: 'Financial Modeling & ROI Assessment', number: 5 },
  { id: 'data-readiness', title: 'Data Utilization & Readiness', number: 6 },
  { id: 'implementation-roadmap', title: 'Technology Implementation Roadmap', number: 7 },
  { id: 'regulatory-compliance', title: 'Regulatory & Compliance', number: 8 },
  { id: 'go-to-market', title: 'Go-to-Market Strategy', number: 9 },
  { id: 'risk-mitigation', title: 'Risk Mitigation Plan', number: 10 },
  { id: 'actionable-outputs', title: 'Actionable Playbook Outputs', number: 11 },
  { id: 'tools-resources', title: 'Tools & Resources', number: 12 },
  { id: 'appendices', title: 'Appendices', number: 13 }
];

// Table of Contents Component
const TableOfContents = ({ sections, activeSection, onSectionClick }) => {
  return (
    <div style={{
      position: 'sticky',
      top: '24px',
      backgroundColor: 'white',
      border: '1px solid #e5e7eb',
      borderRadius: '12px',
      padding: '24px',
      boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
      maxHeight: 'calc(100vh - 100px)',
      overflowY: 'auto'
    }}>
      <h2 style={{
        fontSize: '18px',
        fontWeight: '700',
        color: '#18365E',
        marginBottom: '20px',
        fontFamily: 'Montserrat, sans-serif'
      }}>
        Table of Contents
      </h2>
      
      <nav>
        <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
          {sections.map((section) => (
            <li key={section.id} style={{ marginBottom: '8px' }}>
              <button
                onClick={() => onSectionClick(section.id)}
                style={{
                  width: '100%',
                  textAlign: 'left',
                  padding: '8px 12px',
                  backgroundColor: activeSection === section.id ? '#f0f9ff' : 'transparent',
                  border: activeSection === section.id ? '1px solid #0ea5e9' : '1px solid transparent',
                  borderRadius: '6px',
                  color: activeSection === section.id ? '#0369a1' : '#374151',
                  fontSize: '14px',
                  fontWeight: activeSection === section.id ? '600' : '400',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}
                onMouseEnter={(e) => {
                  if (activeSection !== section.id) {
                    e.target.style.backgroundColor = '#f9fafb';
                  }
                }}
                onMouseLeave={(e) => {
                  if (activeSection !== section.id) {
                    e.target.style.backgroundColor = 'transparent';
                  }
                }}
              >
                <span style={{
                  fontSize: '12px',
                  fontWeight: '600',
                  color: '#6b7280',
                  minWidth: '20px'
                }}>
                  {section.number}.
                </span>
                {section.title}
              </button>
            </li>
          ))}
        </ul>
      </nav>
    </div>
  );
};

// Section Renderer Component
const SectionRenderer = ({ section, content, sectionRefs }) => {
  return (
    <section 
      id={section.id}
      ref={el => sectionRefs.current[section.id] = el}
      style={{
        marginBottom: '48px',
        paddingBottom: '32px',
        borderBottom: '1px solid #e5e7eb'
      }}
    >
      <h2 style={{
        fontSize: '24px',
        fontWeight: '700',
        color: '#18365E',
        marginBottom: '24px',
        fontFamily: 'Montserrat, sans-serif',
        display: 'flex',
        alignItems: 'center',
        gap: '12px'
      }}>
        <span style={{
          fontSize: '18px',
          fontWeight: '600',
          color: '#6b7280'
        }}>
          {section.number}.
        </span>
        {section.title}
      </h2>
      
      <div style={{
        fontSize: '16px',
        lineHeight: '1.7',
        color: '#374151',
        fontFamily: 'Montserrat, sans-serif'
      }}>
        {content ? (
          <div style={{ whiteSpace: 'pre-wrap' }}>
            {content}
          </div>
        ) : (
          <div style={{
            backgroundColor: '#fef3c7',
            border: '1px solid #fed7aa',
            borderRadius: '8px',
            padding: '20px',
            textAlign: 'center',
            color: '#92400e'
          }}>
            <div style={{ fontSize: '18px', marginBottom: '8px' }}>📝</div>
            <div style={{ fontWeight: '600', marginBottom: '4px' }}>This section is in progress</div>
            <div style={{ fontSize: '14px' }}>Content will be available once finalized</div>
          </div>
        )}
      </div>
    </section>
  );
};

// Export Button Component
const ExportButton = ({ clientName, onExport }) => {
  const [isExporting, setIsExporting] = useState(false);

  const handleExport = async () => {
    setIsExporting(true);
    try {
      await onExport();
    } catch (error) {
      console.error('Export failed:', error);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <button
      onClick={handleExport}
      disabled={isExporting}
      style={{
        backgroundColor: '#FF6E4C',
        color: 'white',
        border: 'none',
        borderRadius: '8px',
        padding: '12px 20px',
        fontSize: '14px',
        fontWeight: '600',
        cursor: isExporting ? 'not-allowed' : 'pointer',
        opacity: isExporting ? 0.6 : 1,
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        transition: 'all 0.2s ease'
      }}
    >
      {isExporting ? (
        <>
          <span>⏳</span>
          Exporting...
        </>
      ) : (
        <>
          <span>📄</span>
          Export to PDF
        </>
      )}
    </button>
  );
};

// Share Button Component
const ShareButton = ({ playbook }) => {
  const [isSharing, setIsSharing] = useState(false);

  const handleShare = async () => {
    setIsSharing(true);
    try {
      if (navigator.share) {
        await navigator.share({
          title: `${playbook.clientName} - Data Product Playbook`,
          text: 'Strategic data monetization plan',
          url: window.location.href
        });
      } else {
        // Fallback: copy to clipboard
        await navigator.clipboard.writeText(window.location.href);
        alert('Link copied to clipboard!');
      }
    } catch (error) {
      console.error('Share failed:', error);
    } finally {
      setIsSharing(false);
    }
  };

  return (
    <button
      onClick={handleShare}
      disabled={isSharing}
      style={{
        backgroundColor: '#18365E',
        color: 'white',
        border: 'none',
        borderRadius: '8px',
        padding: '12px 20px',
        fontSize: '14px',
        fontWeight: '600',
        cursor: isSharing ? 'not-allowed' : 'pointer',
        opacity: isSharing ? 0.6 : 1,
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        transition: 'all 0.2s ease'
      }}
    >
      {isSharing ? (
        <>
          <span>⏳</span>
          Sharing...
        </>
      ) : (
        <>
          <span>🔗</span>
          Share Link
        </>
      )}
    </button>
  );
};

// Main PlaybookPage Component
const PlaybookPage = () => {
  const [searchParams] = useSearchParams();
  const [playbook, setPlaybook] = useState(null);
  const [sections, setSections] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeSection, setActiveSection] = useState('executive-summary');
  const sectionRefs = useRef({});
  const observerRef = useRef(null);

  // Get client ID from URL params
  const clientId = searchParams.get('client') || 'default-client';

  // Load playbook data
  useEffect(() => {
    const loadPlaybookData = async () => {
      try {
        // Load client information (mock for now)
        const clientData = {
          id: clientId,
          name: 'ABC Health System',
          logo: null // Optional
        };

        // For now, provide mock content for demonstration
        // In production, this would query Firestore: client_playbook_sections
        const mockSectionsData = {
          'executive-summary': {
            title: 'Executive Summary',
            content: 'ABC Health System possesses a wealth of valuable data assets that can be strategically leveraged to unlock new revenue streams, improve patient care, and enhance operational efficiency. This comprehensive playbook outlines a data-driven approach to monetizing healthcare data while maintaining the highest standards of privacy, security, and regulatory compliance.\n\nKey strategic recommendations include implementing robust data governance frameworks, developing predictive analytics capabilities for population health management, and creating subscription-based data products for regional healthcare providers.',
            lastUpdated: new Date()
          },
          'data-monetization': {
            title: 'Data Monetization Overview',
            content: 'Healthcare data monetization represents a significant opportunity for integrated health systems to generate new revenue streams while improving patient outcomes. This section outlines the strategic framework for identifying, developing, and commercializing data assets.\n\nCore monetization strategies include:\n• Direct data product sales to pharmaceutical companies\n• Subscription-based analytics services for regional providers\n• Predictive modeling services for payer organizations\n• Population health insights for public health agencies',
            lastUpdated: new Date()
          },
          'strategic-assessment': {
            title: 'Strategic Assessment Framework',
            content: 'The strategic assessment framework provides a systematic approach to evaluating data monetization opportunities based on organizational readiness, market demand, and regulatory considerations.\n\nKey assessment criteria include:\n• Data quality and completeness\n• Technical infrastructure capabilities\n• Regulatory compliance status\n• Market demand validation\n• Competitive landscape analysis',
            lastUpdated: new Date()
          }
        };

        // Try to load from Firestore, but fall back to mock data if collection doesn't exist
        let sectionsData = {};
        try {
          const sectionsQuery = query(
            collection(db, 'client_playbook_sections'),
            where('client_id', '==', clientId)
          );
          const sectionsSnap = await getDocs(sectionsQuery);
          
          sectionsSnap.forEach((doc) => {
            const data = doc.data();
            sectionsData[data.section_id] = {
              title: data.title,
              content: data.customized_content || data.content,
              lastUpdated: data.lastUpdated?.toDate()
            };
          });
          
          // If no data found in Firestore, use mock data
          if (Object.keys(sectionsData).length === 0) {
            sectionsData = mockSectionsData;
          }
        } catch (firestoreError) {
          console.log('Firestore collection not found, using mock data:', firestoreError.message);
          sectionsData = mockSectionsData;
        }

        setPlaybook(clientData);
        setSections(sectionsData);
      } catch (error) {
        console.error('Error loading playbook data:', error);
        // Provide fallback data even on error
        setPlaybook({
          id: clientId,
          name: 'ABC Health System',
          logo: null
        });
        setSections({
          'executive-summary': {
            title: 'Executive Summary',
            content: 'This is a demonstration of the playbook viewer. In production, content would be loaded from your Firestore database.',
            lastUpdated: new Date()
          }
        });
      } finally {
        setLoading(false);
      }
    };

    loadPlaybookData();
  }, [clientId]);

  // Intersection Observer for active section tracking
  useEffect(() => {
    const observerOptions = {
      root: null,
      rootMargin: '-20% 0px -70% 0px',
      threshold: 0
    };

    observerRef.current = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          setActiveSection(entry.target.id);
        }
      });
    }, observerOptions);

    // Observe all section elements
    Object.values(sectionRefs.current).forEach((ref) => {
      if (ref) observerRef.current.observe(ref);
    });

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [sections]);

  // Handle section click navigation
  const handleSectionClick = (sectionId) => {
    const element = sectionRefs.current[sectionId];
    if (element) {
      element.scrollIntoView({ 
        behavior: 'smooth', 
        block: 'start',
        inline: 'nearest'
      });
    }
  };

  // Handle PDF export
  const handleExport = async () => {
    // Simulate PDF export - in real implementation, this would:
    // 1. Generate PDF using react-to-pdf or similar
    // 2. Apply print stylesheets
    // 3. Download the file
    await new Promise(resolve => setTimeout(resolve, 2000));
    console.log('PDF export completed');
  };

  if (loading) {
    return (
      <div style={{
        minHeight: '100vh',
        backgroundColor: '#f8fafc',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center'
      }}>
        <div style={{
          fontSize: '18px',
          color: '#6b7280',
          fontFamily: 'Montserrat, sans-serif'
        }}>
          Loading playbook...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{
        minHeight: '100vh',
        backgroundColor: '#f8fafc',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center'
      }}>
        <div style={{
          fontSize: '18px',
          color: '#ef4444',
          fontFamily: 'Montserrat, sans-serif',
          textAlign: 'center'
        }}>
          <div style={{ fontSize: '24px', marginBottom: '8px' }}>⚠️</div>
          <div>{error}</div>
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
        padding: '24px'
      }}>
        <div style={{
          maxWidth: '1400px',
          margin: '0 auto',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          {/* Client Info */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            {playbook?.logo && (
              <img 
                src={playbook.logo} 
                alt={`${playbook.name} Logo`} 
                style={{
                  height: '40px',
                  width: 'auto'
                }}
              />
            )}
            <div>
              <h1 style={{
                fontSize: '28px',
                fontWeight: '700',
                color: '#18365E',
                margin: 0,
                fontFamily: 'Montserrat, sans-serif'
              }}>
                {playbook?.name || 'Client'} – Data Product Playbook
              </h1>
              <p style={{
                fontSize: '14px',
                color: '#6b7280',
                margin: '4px 0 0 0'
              }}>
                Strategic data monetization plan
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div style={{ display: 'flex', gap: '12px' }}>
            <ShareButton playbook={playbook} />
            <ExportButton 
              clientName={playbook?.name} 
              onExport={handleExport} 
            />
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div style={{
        maxWidth: '1400px',
        margin: '0 auto',
        padding: '24px',
        display: 'grid',
        gridTemplateColumns: '300px 1fr',
        gap: '32px'
      }}>
        {/* Table of Contents Sidebar */}
        <div>
          <TableOfContents 
            sections={PLAYBOOK_SECTIONS}
            activeSection={activeSection}
            onSectionClick={handleSectionClick}
          />
        </div>

        {/* Content Area */}
        <div style={{
          backgroundColor: 'white',
          borderRadius: '12px',
          padding: '40px',
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
          maxWidth: '960px'
        }}>
          {PLAYBOOK_SECTIONS.map((section) => {
            const sectionContent = sections[section.id];
            return (
              <SectionRenderer
                key={section.id}
                section={section}
                content={sectionContent?.content}
                sectionRefs={sectionRefs}
              />
            );
          })}
        </div>
      </div>

      {/* Print Styles */}
      <style jsx>{`
        @media print {
          /* Hide sidebar and buttons for print */
          .sidebar, .action-buttons {
            display: none !important;
          }
          
          /* Expand content area for print */
          .content-area {
            grid-template-columns: 1fr !important;
            max-width: none !important;
          }
          
          /* Optimize typography for print */
          body {
            font-size: 12pt;
            line-height: 1.4;
          }
          
          h1, h2, h3 {
            page-break-after: avoid;
          }
          
          section {
            page-break-inside: avoid;
          }
        }
        
        @media (max-width: 768px) {
          .main-grid {
            grid-template-columns: 1fr !important;
          }
          
          .sidebar {
            position: static !important;
            margin-bottom: 24px;
          }
        }
      `}</style>
    </div>
  );
};

export default PlaybookPage;
