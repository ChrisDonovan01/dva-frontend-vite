import React, { useState, useEffect } from 'react';
import { db } from '../firebase.js';
import { doc, getDoc } from 'firebase/firestore';

const OpportunityAssessmentResults = ({ clientId, assessmentData: propAssessmentData }) => {
  const [assessmentData, setAssessmentData] = useState(propAssessmentData || null);
  const [loading, setLoading] = useState(!propAssessmentData);
  const [error, setError] = useState(null);
  const [activeSection, setActiveSection] = useState('executive_summary');
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);

  // Fetch assessment data from Firestore if not provided as prop
  useEffect(() => {
    if (!propAssessmentData && clientId) {
      const fetchAssessmentData = async () => {
        try {
          setLoading(true);
          const docRef = doc(db, 'client_strategy_summary', clientId);
          const docSnap = await getDoc(docRef);
          
          if (docSnap.exists()) {
            setAssessmentData(docSnap.data());
          } else {
            setError('No assessment data found');
          }
        } catch (err) {
          console.warn('Firestore fetch failed, using prop data:', err);
          setError('Failed to load assessment data');
        } finally {
          setLoading(false);
        }
      };

      fetchAssessmentData();
    }
  }, [clientId, propAssessmentData]);

  // Enhanced markdown renderer with better styling
  const renderMarkdown = (text) => {
    if (!text) return null;
    
    return text.split('\n').map((line, index) => {
      // Handle headers
      if (line.startsWith('### ')) {
        return (
          <h3 key={index} style={{
            fontSize: '1.25rem',
            fontWeight: '600',
            color: '#1f2937',
            margin: '1.5rem 0 0.75rem 0',
            fontFamily: 'Montserrat, system-ui, sans-serif'
          }}>
            {line.replace('### ', '')}
          </h3>
        );
      }
      
      if (line.startsWith('## ')) {
        return (
          <h2 key={index} style={{
            fontSize: '1.375rem',
            fontWeight: '600',
            color: '#1f2937',
            margin: '2rem 0 1rem 0',
            fontFamily: 'Montserrat, system-ui, sans-serif'
          }}>
            {line.replace('## ', '')}
          </h2>
        );
      }

      // Handle numbered lists
      if (/^\d+\.\s/.test(line)) {
        return (
          <div key={index} style={{
            margin: '0.5rem 0',
            paddingLeft: '1rem',
            color: '#374151',
            lineHeight: '1.6'
          }}>
            <strong style={{ color: '#FF6E4C' }}>
              {line.match(/^\d+\./)[0]}
            </strong>
            {line.replace(/^\d+\.\s/, ' ')}
          </div>
        );
      }

      // Handle bullet points
      if (line.startsWith('- ') || line.startsWith('* ')) {
        return (
          <div key={index} style={{
            margin: '0.5rem 0',
            paddingLeft: '1rem',
            color: '#374151',
            lineHeight: '1.6',
            position: 'relative'
          }}>
            <span style={{
              position: 'absolute',
              left: '0',
              color: '#FF6E4C',
              fontWeight: 'bold'
            }}>•</span>
            {line.replace(/^[-*]\s/, '')}
          </div>
        );
      }

      // Handle bold text
      const boldText = line.replace(/\*\*(.*?)\*\*/g, '<strong style="color: #1f2937; font-weight: 600;">$1</strong>');
      
      // Regular paragraphs
      if (line.trim()) {
        return (
          <p key={index} style={{
            margin: '1rem 0',
            color: '#374151',
            lineHeight: '1.7'
          }} dangerouslySetInnerHTML={{ __html: boldText }}>
          </p>
        );
      }

      return <br key={index} />;
    });
  };

  // PDF download handler
  const handleDownloadPDF = async () => {
    setIsGeneratingPDF(true);
    try {
      // Simulate PDF generation
      await new Promise(resolve => setTimeout(resolve, 2000));
      console.log('PDF generation would happen here');
    } catch (error) {
      console.error('PDF generation failed:', error);
    } finally {
      setIsGeneratingPDF(false);
    }
  };

  // Loading state
  if (loading) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '400px',
        backgroundColor: '#f8fafc'
      }}>
        <div style={{
          padding: '2rem',
          backgroundColor: 'white',
          borderRadius: '1rem',
          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
          textAlign: 'center'
        }}>
          <div style={{
            width: '40px',
            height: '40px',
            border: '4px solid #e5e7eb',
            borderTop: '4px solid #FF6E4C',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            margin: '0 auto 1rem'
          }} />
          <p style={{ color: '#6b7280', fontSize: '1rem' }}>Loading assessment...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error || !assessmentData) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '400px',
        backgroundColor: '#f8fafc'
      }}>
        <div style={{
          padding: '2rem',
          backgroundColor: 'white',
          borderRadius: '1rem',
          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
          textAlign: 'center',
          maxWidth: '500px'
        }}>
          <div style={{
            fontSize: '3rem',
            marginBottom: '1rem'
          }}>📊</div>
          <h2 style={{
            fontSize: '1.5rem',
            fontWeight: '600',
            color: '#1f2937',
            marginBottom: '1rem',
            fontFamily: 'Montserrat, system-ui, sans-serif'
          }}>
            Assessment Not Available
          </h2>
          <p style={{
            color: '#6b7280',
            fontSize: '1rem',
            lineHeight: '1.5',
            marginBottom: '1.5rem'
          }}>
            {error || 'No assessment data found. Please complete all required surveys to generate your Data Product Opportunity Assessment.'}
          </p>
        </div>
      </div>
    );
  }

  // Main Results Display
  return (
    <div style={{
      display: 'flex',
      minHeight: '100vh',
      backgroundColor: '#f8fafc',
      fontFamily: 'system-ui, -apple-system, sans-serif'
    }}>
      {/* Left Sidebar - Executive Navigation */}
      <div style={{
        width: '350px',
        backgroundColor: '#F8FAFE',
        borderRight: '3px solid #18365E',
        padding: '2rem 1.5rem',
        position: 'sticky',
        top: '0',
        height: '100vh',
        overflowY: 'auto'
      }}>
        {/* Sidebar Header */}
        <div style={{
          marginBottom: '2rem',
          paddingBottom: '1.5rem',
          borderBottom: '2px solid #18365E'
        }}>
          <h2 style={{
            fontSize: '1.125rem',
            fontWeight: '700',
            color: '#18365E',
            marginBottom: '0.75rem',
            fontFamily: 'Montserrat, system-ui, sans-serif'
          }}>
            📋 Executive Summary Navigation
          </h2>
          <p style={{
            fontSize: '0.875rem',
            color: '#4B5563',
            lineHeight: '1.4',
            fontWeight: '500'
          }}>
            Jump to key insights and recommendations for executive briefing
          </p>
        </div>
        
        {/* Executive Navigation Menu */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          {[
            { 
              key: 'executive_summary', 
              title: 'Executive Summary', 
              icon: '📊', 
              description: 'Strategic overview and key insights',
              tldr: 'Key Findings'
            },
            { 
              key: 'strategy_summary', 
              title: 'Strategic Analysis', 
              icon: '🎯', 
              description: 'Organizational priorities and alignment',
              tldr: 'Strategic Position'
            },
            { 
              key: 'capabilities_summary', 
              title: 'Technical Capabilities', 
              icon: '⚡', 
              description: 'Infrastructure and analytics maturity',
              tldr: 'Tech Readiness'
            },
            { 
              key: 'readiness_summary', 
              title: 'Data Readiness', 
              icon: '🚀', 
              description: 'Governance and compliance assessment',
              tldr: 'Governance Status'
            },
            { 
              key: 'recommendations', 
              title: 'Recommendations', 
              icon: '💡', 
              description: 'Prioritized action items',
              tldr: 'Action Items'
            },
            { 
              key: 'implementation_roadmap', 
              title: 'Implementation Roadmap', 
              icon: '🗺️', 
              description: 'Phased execution plan',
              tldr: 'Timeline'
            },
            { 
              key: 'roi_analysis', 
              title: 'ROI Analysis', 
              icon: '💰', 
              description: 'Value drivers and financial impact',
              tldr: 'Financial Impact'
            },
            { 
              key: 'next_steps', 
              title: 'Next Steps', 
              icon: '🎯', 
              description: 'Immediate actions for leadership',
              tldr: 'Immediate Actions'
            }
          ].filter(section => {
            const content = assessmentData.sections?.[section.key] || assessmentData[section.key];
            return content && content.trim() && !content.includes('Of course. Here is the');
          }).map((section, index) => (
            <button
              key={section.key}
              onClick={() => {
                setActiveSection(section.key);
                const element = document.getElementById(section.key);
                if (element) {
                  element.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }
              }}
              style={{
                display: 'flex',
                alignItems: 'flex-start',
                padding: '1rem',
                backgroundColor: activeSection === section.key ? 'white' : 'transparent',
                border: activeSection === section.key ? '2px solid #18365E' : '1px solid #D1D5DB',
                borderRadius: '0.75rem',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                textAlign: 'left',
                width: '100%',
                borderLeft: activeSection === section.key ? '4px solid #FF6E4C' : '4px solid transparent',
                boxShadow: activeSection === section.key ? '0 2px 8px rgba(24, 54, 94, 0.15)' : 'none'
              }}
              onMouseEnter={(e) => {
                if (activeSection !== section.key) {
                  e.target.style.backgroundColor = 'white';
                  e.target.style.boxShadow = '0 2px 4px rgba(0, 0, 0, 0.1)';
                }
              }}
              onMouseLeave={(e) => {
                if (activeSection !== section.key) {
                  e.target.style.backgroundColor = 'transparent';
                  e.target.style.boxShadow = 'none';
                }
              }}
            >
              <span style={{
                fontSize: '1.25rem',
                marginRight: '0.75rem',
                marginTop: '0.125rem',
                color: activeSection === section.key ? '#FF6E4C' : '#18365E'
              }}>
                {section.icon}
              </span>
              <div style={{ flex: 1 }}>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginBottom: '0.25rem'
                }}>
                  <div style={{
                    fontSize: '0.875rem',
                    fontWeight: '700',
                    color: activeSection === section.key ? '#18365E' : '#1f2937',
                    fontFamily: 'Montserrat, system-ui, sans-serif'
                  }}>
                    {section.title}
                  </div>
                  <span style={{
                    fontSize: '0.625rem',
                    fontWeight: '600',
                    color: 'white',
                    backgroundColor: '#FF6E4C',
                    padding: '0.125rem 0.5rem',
                    borderRadius: '0.375rem',
                    textTransform: 'uppercase',
                    letterSpacing: '0.025em'
                  }}>
                    {section.tldr}
                  </span>
                </div>
                <div style={{
                  fontSize: '0.75rem',
                  color: '#6B7280',
                  lineHeight: '1.3',
                  fontWeight: '500'
                }}>
                  {section.description}
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Main Content Area */}
      <div style={{
        flex: 1,
        padding: '0',
        backgroundColor: '#f8fafc',
        position: 'relative',
        overflowY: 'auto'
      }}>
        {/* Executive PDF Download Button */}
        <div style={{
          position: 'fixed',
          bottom: '2rem',
          right: '2rem',
          zIndex: 1000,
          display: 'flex',
          flexDirection: 'column',
          gap: '0.75rem',
          alignItems: 'flex-end'
        }}>
          {/* Main PDF Button */}
          <button
            onClick={handleDownloadPDF}
            disabled={isGeneratingPDF}
            style={{
              backgroundColor: '#18365E',
              color: 'white',
              border: '2px solid #FF6E4C',
              borderRadius: '0.75rem',
              padding: '1rem 1.5rem',
              fontSize: '0.875rem',
              fontWeight: '700',
              cursor: isGeneratingPDF ? 'not-allowed' : 'pointer',
              boxShadow: '0 6px 20px rgba(24, 54, 94, 0.3)',
              transition: 'all 0.3s ease',
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
              opacity: isGeneratingPDF ? 0.7 : 1,
              fontFamily: 'Montserrat, system-ui, sans-serif',
              textTransform: 'uppercase',
              letterSpacing: '0.025em'
            }}
            onMouseEnter={(e) => {
              if (!isGeneratingPDF) {
                e.target.style.backgroundColor = '#FF6E4C';
                e.target.style.borderColor = '#18365E';
                e.target.style.transform = 'translateY(-2px)';
                e.target.style.boxShadow = '0 8px 25px rgba(255, 110, 76, 0.4)';
              }
            }}
            onMouseLeave={(e) => {
              if (!isGeneratingPDF) {
                e.target.style.backgroundColor = '#18365E';
                e.target.style.borderColor = '#FF6E4C';
                e.target.style.transform = 'translateY(0px)';
                e.target.style.boxShadow = '0 6px 20px rgba(24, 54, 94, 0.3)';
              }
            }}
          >
            {isGeneratingPDF ? (
              <>
                <div style={{
                  width: '18px',
                  height: '18px',
                  border: '2px solid #ffffff',
                  borderTop: '2px solid transparent',
                  borderRadius: '50%',
                  animation: 'spin 1s linear infinite'
                }} />
                Generating Executive Report...
              </>
            ) : (
              <>
                <span style={{ fontSize: '1.125rem' }}>📄</span>
                Download Executive PDF
              </>
            )}
          </button>
          
          {/* Executive Note */}
          <div style={{
            backgroundColor: 'white',
            border: '1px solid #D1D5DB',
            borderRadius: '0.5rem',
            padding: '0.75rem 1rem',
            fontSize: '0.75rem',
            color: '#6B7280',
            fontWeight: '500',
            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
            maxWidth: '200px',
            textAlign: 'center'
          }}>
            💼 Executive-ready format for C-suite presentation
          </div>
        </div>

        {/* Executive Report Header - Enhanced for Jamie Reynolds */}
        <div style={{
          backgroundColor: 'white',
          borderBottom: '2px solid #18365E'
        }}>
          {/* DVA Brand Header */}
          <div style={{
            backgroundColor: '#18365E',
            color: 'white',
            padding: '1rem 2rem',
            fontSize: '0.875rem',
            fontWeight: '600',
            fontFamily: 'Montserrat, system-ui, sans-serif'
          }}>
            Data Value Accelerator • Adaptive Product
          </div>
          
          <div style={{
            padding: '3rem 2rem 2rem'
          }}>
            <div style={{
              maxWidth: '1000px',
              margin: '0 auto'
            }}>
              {/* Executive Summary Card */}
              <div style={{
                backgroundColor: '#F8FAFE',
                border: '2px solid #18365E',
                borderRadius: '1rem',
                padding: '2rem',
                marginBottom: '2rem'
              }}>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  marginBottom: '1rem'
                }}>
                  <div style={{
                    width: '60px',
                    height: '60px',
                    backgroundColor: '#18365E',
                    borderRadius: '12px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginRight: '1.5rem'
                  }}>
                    <span style={{ fontSize: '2rem', color: 'white' }}>📊</span>
                  </div>
                  <div style={{ flex: 1 }}>
                    <h1 style={{
                      fontSize: '2.25rem',
                      fontWeight: '700',
                      color: '#18365E',
                      margin: '0 0 0.5rem 0',
                      fontFamily: 'Montserrat, system-ui, sans-serif',
                      lineHeight: '1.2'
                    }}>
                      Data Product Opportunity Assessment
                    </h1>
                    <p style={{
                      fontSize: '1rem',
                      color: '#4B5563',
                      margin: 0,
                      lineHeight: '1.5',
                      fontWeight: '500'
                    }}>
                      Executive analysis of your organization's data strategy, capabilities, and monetization readiness
                    </p>
                  </div>
                </div>
                
                {/* Assessment Context */}
                <div style={{
                  backgroundColor: 'white',
                  borderRadius: '0.75rem',
                  padding: '1.5rem',
                  border: '1px solid #D1D5DB'
                }}>
                  <h3 style={{
                    fontSize: '1rem',
                    fontWeight: '600',
                    color: '#18365E',
                    margin: '0 0 1rem 0',
                    fontFamily: 'Montserrat, system-ui, sans-serif'
                  }}>
                    📋 Assessment Summary
                  </h3>
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                    gap: '1rem',
                    fontSize: '0.875rem',
                    color: '#6B7280'
                  }}>
                    <div>
                      <strong style={{ color: '#18365E' }}>Client:</strong> Healthcare Organization
                    </div>
                    <div>
                      <strong style={{ color: '#18365E' }}>Generated:</strong> {new Date().toLocaleDateString('en-US', { 
                        year: 'numeric', 
                        month: 'long', 
                        day: 'numeric' 
                      })}
                    </div>
                    <div>
                      <strong style={{ color: '#18365E' }}>Sections:</strong> {Object.keys(assessmentData.sections || {}).length} Analysis Areas
                    </div>
                    <div>
                      <strong style={{ color: '#18365E' }}>Read Time:</strong> 15-20 minutes
                    </div>
                  </div>
                  
                  {/* Input Sources */}
                  <div style={{
                    marginTop: '1rem',
                    padding: '1rem',
                    backgroundColor: '#F9FAFB',
                    borderRadius: '0.5rem',
                    fontSize: '0.875rem',
                    color: '#6B7280'
                  }}>
                    <strong style={{ color: '#18365E' }}>Data Sources:</strong> Strategic Priorities Survey • Technical Capabilities Assessment • Data Readiness & Governance Survey
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Report Content */}
        <div style={{
          maxWidth: '1000px',
          margin: '0 auto',
          padding: '2rem'
        }}>
          {/* Executive Analysis Sections */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
            {[
              {
                key: 'executive_summary',
                title: 'Executive Summary',
                icon: '📊',
                description: 'Strategic overview and key insights',
                tldr: 'Key Findings',
                priority: 'high'
              },
              {
                key: 'strategy_summary',
                title: 'Strategic Analysis',
                icon: '🎯',
                description: 'Organizational priorities and alignment',
                tldr: 'Strategic Position',
                priority: 'high'
              },
              {
                key: 'capabilities_summary',
                title: 'Technical Capabilities Assessment',
                icon: '⚡',
                description: 'Infrastructure and analytics maturity',
                tldr: 'Tech Readiness',
                priority: 'medium'
              },
              {
                key: 'readiness_summary',
                title: 'Data Readiness & Governance',
                icon: '🚀',
                description: 'Governance and compliance assessment',
                tldr: 'Governance Status',
                priority: 'medium'
              },
              {
                key: 'recommendations',
                title: 'Strategic Recommendations',
                icon: '💡',
                description: 'Prioritized action items',
                tldr: 'Action Items',
                priority: 'high'
              },
              {
                key: 'implementation_roadmap',
                title: 'Implementation Roadmap',
                icon: '🗺️',
                description: 'Phased execution plan',
                tldr: 'Timeline',
                priority: 'high'
              },
              {
                key: 'roi_analysis',
                title: 'ROI & Value Analysis',
                icon: '💰',
                description: 'Value drivers and financial impact',
                tldr: 'Financial Impact',
                priority: 'high'
              },
              {
                key: 'next_steps',
                title: 'Next Steps & Leadership Actions',
                icon: '🎯',
                description: 'Immediate actions for leadership',
                tldr: 'Immediate Actions',
                priority: 'high'
              }
            ].filter(section => {
              const content = assessmentData.sections?.[section.key] || assessmentData[section.key];
              return content && content.trim() && !content.includes('Of course. Here is the');
            }).map((section, index) => {
              const content = assessmentData.sections?.[section.key] || assessmentData[section.key];
              
              if (!content) return null;

              const priorityColors = {
                high: { bg: '#FEF2F2', border: '#DC2626', badge: '#DC2626' },
                medium: { bg: '#FFFBEB', border: '#D97706', badge: '#D97706' },
                low: { bg: '#F0FDF4', border: '#16A34A', badge: '#16A34A' }
              };
              
              const colors = priorityColors[section.priority] || priorityColors.medium;

              return (
                <div
                  key={section.key}
                  id={section.key}
                  style={{
                    backgroundColor: 'white',
                    borderRadius: '1rem',
                    boxShadow: '0 4px 12px rgba(24, 54, 94, 0.1)',
                    border: `2px solid ${section.priority === 'high' ? '#18365E' : '#D1D5DB'}`,
                    overflow: 'hidden',
                    scrollMarginTop: '2rem'
                  }}
                >
                  {/* Executive Section Header */}
                  <div style={{
                    padding: '2rem 2rem 1.5rem',
                    borderBottom: '2px solid #18365E',
                    backgroundColor: section.priority === 'high' ? '#F8FAFE' : '#FAFBFC'
                  }}>
                    <div style={{ 
                      display: 'flex', 
                      alignItems: 'flex-start', 
                      justifyContent: 'space-between',
                      marginBottom: '1rem'
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', flex: 1 }}>
                        <span style={{
                          fontSize: '2.5rem',
                          marginRight: '1.5rem',
                          color: '#18365E'
                        }}>
                          {section.icon}
                        </span>
                        <div style={{ flex: 1 }}>
                          <h2 style={{
                            fontSize: '1.75rem',
                            fontWeight: '700',
                            color: '#18365E',
                            margin: '0 0 0.5rem 0',
                            fontFamily: 'Montserrat, system-ui, sans-serif',
                            lineHeight: '1.2'
                          }}>
                            {section.title}
                          </h2>
                          <p style={{
                            fontSize: '0.875rem',
                            color: '#4B5563',
                            margin: 0,
                            lineHeight: '1.4',
                            fontWeight: '500'
                          }}>
                            {section.description}
                          </p>
                        </div>
                      </div>
                      
                      {/* TL;DR Badge */}
                      <div style={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'flex-end',
                        gap: '0.5rem'
                      }}>
                        <span style={{
                          fontSize: '0.75rem',
                          fontWeight: '700',
                          color: 'white',
                          backgroundColor: '#FF6E4C',
                          padding: '0.375rem 0.75rem',
                          borderRadius: '0.5rem',
                          textTransform: 'uppercase',
                          letterSpacing: '0.05em',
                          boxShadow: '0 2px 4px rgba(255, 110, 76, 0.3)'
                        }}>
                          {section.tldr}
                        </span>
                        {section.priority === 'high' && (
                          <span style={{
                            fontSize: '0.625rem',
                            fontWeight: '600',
                            color: '#DC2626',
                            backgroundColor: '#FEE2E2',
                            padding: '0.25rem 0.5rem',
                            borderRadius: '0.375rem',
                            textTransform: 'uppercase',
                            letterSpacing: '0.025em',
                            border: '1px solid #FECACA'
                          }}>
                            Executive Priority
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  {/* Executive Content */}
                  <div style={{
                    padding: '2rem'
                  }}>
                    <div style={{
                      fontSize: '1rem',
                      lineHeight: '1.7',
                      color: '#374151',
                      fontFamily: 'system-ui, -apple-system, sans-serif'
                    }}>
                      {renderMarkdown(content)}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Footer */}
          <div style={{
            marginTop: '3rem',
            paddingTop: '2rem',
            borderTop: '1px solid #e5e7eb',
            textAlign: 'center'
          }}>
            <p style={{
              color: '#9ca3af',
              fontSize: '0.875rem',
              lineHeight: '1.5'
            }}>
              This assessment was generated using AI analysis of your survey responses and organizational data inputs.
            </p>
            <p style={{
              color: '#9ca3af',
              fontSize: '0.75rem',
              marginTop: '0.5rem'
            }}>
              Powered by Adaptive Product's Data Value Accelerator Platform
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OpportunityAssessmentResults;
