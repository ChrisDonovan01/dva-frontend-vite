// Executive Use Case Profile Page - Designed for Jamie Reynolds Persona
// State-of-the-art dashboard for strategic decision-making

import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

// Sticky KPI Bar Component
const UseCaseKPIBar = ({ useCase }) => {
  const [isSticky, setIsSticky] = useState(false);
  
  useEffect(() => {
    const handleScroll = () => {
      setIsSticky(window.scrollY > 100);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const alignmentScore = useCase.alignment_score || useCase.total_score || 75;
  const roiEstimate = useCase.value_score ? (useCase.value_score * 1000) : 50000;
  const easeScore = useCase.implementation_score || 50;
  const goalMatchCount = useCase.goal_matches || 3;
  const status = useCase.status || 'Aggressively Pursue';

  const getAlignmentColor = (score) => {
    if (score >= 80) return '#10b981'; // Green
    if (score >= 60) return '#f59e0b'; // Yellow
    return '#ef4444'; // Red
  };

  const getStatusColor = (status) => {
    switch(status?.toLowerCase()) {
      case 'aggressively pursue': return '#FF6E4C'; // DVA Orange
      case 'explore': return '#18365E'; // DVA Blue
      case 'monitor': return '#6b7280'; // Gray
      default: return '#FF6E4C';
    }
  };

  return (
    <div style={{
      position: isSticky ? 'fixed' : 'relative',
      top: isSticky ? '0' : 'auto',
      left: isSticky ? '0' : 'auto',
      right: isSticky ? '0' : 'auto',
      zIndex: isSticky ? 1000 : 'auto',
      backgroundColor: 'white',
      borderBottom: isSticky ? '2px solid #e5e7eb' : 'none',
      boxShadow: isSticky ? '0 2px 8px rgba(0,0,0,0.1)' : 'none',
      padding: '16px 24px',
      display: 'flex',
      flexWrap: 'wrap',
      gap: '24px',
      alignItems: 'center',
      justifyContent: 'space-between',
      transition: 'all 0.3s ease',
      opacity: isSticky ? 0.95 : 1
    }}>
      {/* Strategic Alignment */}
      <div style={{
        backgroundColor: '#f8fafc',
        padding: '16px 20px',
        borderRadius: '12px',
        border: '1px solid #e2e8f0',
        minWidth: '140px'
      }}>
        <div style={{ fontSize: '12px', color: '#64748b', fontWeight: '600', marginBottom: '4px' }}>Strategic Alignment</div>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}>
          <div style={{
            width: '10px',
            height: '10px',
            borderRadius: '50%',
            backgroundColor: getAlignmentColor(alignmentScore)
          }} />
          <span style={{ fontSize: '20px', fontWeight: '700', color: '#1e293b' }}>
            {((alignmentScore)).toFixed(1)}%
          </span>
        </div>
      </div>

      {/* Estimated ROI */}
      <div style={{
        backgroundColor: '#f0fdf4',
        padding: '16px 20px',
        borderRadius: '12px',
        border: '1px solid #bbf7d0',
        minWidth: '140px'
      }}>
        <div style={{ fontSize: '12px', color: '#166534', fontWeight: '600', marginBottom: '4px' }}>Estimated ROI</div>
        <div style={{ fontSize: '20px', fontWeight: '700', color: '#15803d' }}>
          ${Math.ceil(roiEstimate / 100) * 100}
        </div>
      </div>

      {/* Implementation Ease */}
      <div style={{
        backgroundColor: '#eff6ff',
        padding: '16px 20px',
        borderRadius: '12px',
        border: '1px solid #bfdbfe',
        minWidth: '140px'
      }}>
        <div style={{ fontSize: '12px', color: '#1e40af', fontWeight: '600', marginBottom: '4px' }}>Implementation Ease</div>
        <div style={{ fontSize: '20px', fontWeight: '700', color: '#2563eb' }}>
          {easeScore >= 70 ? 'Simple' : easeScore >= 40 ? 'Medium' : 'Hard'}
        </div>
      </div>

      {/* Goal Alignment */}
      <div style={{
        backgroundColor: '#fef3c7',
        padding: '16px 20px',
        borderRadius: '12px',
        border: '1px solid #fed7aa',
        minWidth: '140px'
      }}>
        <div style={{ fontSize: '12px', color: '#92400e', fontWeight: '600', marginBottom: '4px' }}>Goal Alignment</div>
        <div style={{ fontSize: '20px', fontWeight: '700', color: '#d97706' }}>{goalMatchCount} Goals</div>
      </div>

      {/* Status Tag */}
      <div style={{
        backgroundColor: getStatusColor(status),
        color: 'white',
        padding: '12px 24px',
        borderRadius: '25px',
        fontSize: '14px',
        fontWeight: '700',
        textTransform: 'uppercase',
        letterSpacing: '0.5px',
        boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
        minWidth: '180px',
        textAlign: 'center'
      }}>
        {status}
      </div>
    </div>
  );
};

// Tab Controller Component
const TabController = ({ activeTab, setActiveTab, tabs }) => {
  return (
    <div style={{
      backgroundColor: 'white',
      borderBottom: '1px solid #e5e7eb',
      marginBottom: '32px',
      boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
    }}>
      <div style={{
        maxWidth: '1400px',
        margin: '0 auto',
        padding: '0 24px'
      }}>
        <div style={{
          display: 'flex',
          gap: '8px',
          overflowX: 'auto'
        }}>
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            style={{
              padding: '16px 32px',
              fontSize: '16px',
              fontWeight: '600',
              color: activeTab === tab.id ? '#18365E' : '#6b7280',
              backgroundColor: activeTab === tab.id ? '#f8fafc' : 'transparent',
              border: 'none',
              borderBottom: activeTab === tab.id ? '3px solid #FF6E4C' : '3px solid transparent',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              whiteSpace: 'nowrap',
              borderRadius: '8px 8px 0 0'
            }}
            onMouseEnter={(e) => {
              if (activeTab !== tab.id) {
                e.target.style.color = '#374151';
              }
            }}
            onMouseLeave={(e) => {
              if (activeTab !== tab.id) {
                e.target.style.color = '#6b7280';
              }
            }}
          >
            {tab.label}
          </button>
        ))}
        </div>
      </div>
    </div>
  );
};

// Content Section Component
const ContentSection = ({ title, children, className = '' }) => {
  return (
    <div style={{
      backgroundColor: 'white',
      borderRadius: '8px',
      boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
      padding: '24px',
      marginBottom: '24px'
    }} className={className}>
      {title && (
        <h3 style={{
          fontSize: '20px',
          fontWeight: '600',
          color: '#18365E',
          marginBottom: '16px',
          fontFamily: 'Montserrat, sans-serif'
        }}>
          {title}
        </h3>
      )}
      {children}
    </div>
  );
};

// Chart Component (Placeholder for future implementation)
const ChartModule = ({ type, data, title }) => {
  return (
    <div style={{
      backgroundColor: '#f8fafc',
      borderRadius: '8px',
      padding: '16px',
      textAlign: 'center',
      border: '2px dashed #d1d5db'
    }}>
      <div style={{ fontSize: '14px', color: '#6b7280', marginBottom: '8px' }}>{title}</div>
      <div style={{ fontSize: '12px', color: '#9ca3af' }}>Chart visualization coming soon</div>
    </div>
  );
};

// Main Use Case Profile Component
export default function UseCaseProfile({ useCase }) {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');

  const tabs = [
    { id: 'overview', label: 'Overview' },
    { id: 'alignment', label: 'Alignment' },
    { id: 'roi', label: 'ROI' },
    { id: 'details', label: 'Details' },
    { id: 'playbook', label: 'Playbook' }
  ];

  const renderOverviewTab = () => (
    <div>
      {/* Executive Summary */}
      <ContentSection title="Executive Summary">
        <div style={{
          fontSize: '16px',
          lineHeight: '1.6',
          color: '#374151',
          marginBottom: '16px'
        }}>
          {useCase.description || useCase.summary || 
            `This ${useCase.category_name || 'strategic'} initiative represents a high-impact opportunity to leverage data analytics for measurable business outcomes. The use case demonstrates strong alignment with organizational strategic goals and offers significant potential for ROI through improved operational efficiency and revenue generation.`
          }
        </div>
      </ContentSection>

      {/* Key Benefits */}
      <ContentSection title="Key Benefits">
        <ul style={{
          listStyle: 'disc',
          paddingLeft: '20px',
          fontSize: '16px',
          lineHeight: '1.8',
          color: '#374151'
        }}>
          <li>Enhances strategic decision-making through data-driven insights</li>
          <li>Generates measurable ROI through operational optimization</li>
          <li>Supports competitive differentiation in healthcare analytics</li>
          <li>Enables scalable implementation across organizational units</li>
          <li>Provides foundation for advanced analytics capabilities</li>
        </ul>
      </ContentSection>

      {/* Category & Type */}
      <ContentSection title="Classification">
        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
          <span style={{
            backgroundColor: '#e0f2fe',
            color: '#0277bd',
            padding: '6px 12px',
            borderRadius: '16px',
            fontSize: '14px',
            fontWeight: '500'
          }}>
            {useCase.category_name || 'Strategic Initiative'}
          </span>
          <span style={{
            backgroundColor: '#f3e5f5',
            color: '#7b1fa2',
            padding: '6px 12px',
            borderRadius: '16px',
            fontSize: '14px',
            fontWeight: '500'
          }}>
            {useCase.type || 'Data Analytics'}
          </span>
        </div>
      </ContentSection>
    </div>
  );

  const renderAlignmentTab = () => (
    <div>
      <ContentSection title="Strategic Goals Alignment">
        <div style={{ marginBottom: '24px' }}>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: '40px',
            flexWrap: 'wrap'
          }}>
            <span style={{ fontSize: '14px', fontWeight: '500', color: '#374151' }}>Overall Alignment Score</span>
            <span style={{ fontSize: '18px', fontWeight: '700', color: '#18365E' }}>
              {((useCase.alignment_score || useCase.total_score || 75)).toFixed(1)}%
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
              width: `${((useCase.alignment_score || useCase.total_score || 75)).toFixed(1)}%`,
              height: '100%',
              backgroundColor: '#10b981',
              transition: 'width 0.3s ease'
            }} />
          </div>
        </div>
        
        <div style={{
          fontSize: '16px',
          lineHeight: '1.6',
          color: '#374151'
        }}>
          This use case demonstrates strong alignment with organizational strategic priorities, 
          particularly in areas of operational efficiency, revenue optimization, and competitive 
          positioning. The initiative supports key performance indicators and measurable business outcomes.
        </div>
      </ContentSection>

      <ContentSection title="Category Scoring Breakdown">
        <ChartModule type="bar" title="Alignment Scoring by Category" />
      </ContentSection>
    </div>
  );

  const renderROITab = () => (
    <div>
      <ContentSection title="Financial Impact Analysis">
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '16px',
          marginBottom: '24px'
        }}>
          <div style={{
            backgroundColor: '#f0fdf4',
            padding: '16px',
            borderRadius: '8px',
            border: '1px solid #bbf7d0'
          }}>
            <div style={{ fontSize: '12px', color: '#166534', fontWeight: '500' }}>Estimated Revenue</div>
            <div style={{ fontSize: '24px', fontWeight: '700', color: '#15803d' }}>
              ${Math.ceil((useCase.value_score || 50) * 1000 / 100) * 100}
            </div>
          </div>
          
          <div style={{
            backgroundColor: '#eff6ff',
            padding: '16px',
            borderRadius: '8px',
            border: '1px solid #bfdbfe'
          }}>
            <div style={{ fontSize: '12px', color: '#1e40af', fontWeight: '500' }}>Implementation Cost</div>
            <div style={{ fontSize: '24px', fontWeight: '700', color: '#2563eb' }}>
              ${Math.ceil((100 - (useCase.implementation_score || 50)) * 500 / 100) * 100}
            </div>
          </div>
          
          <div style={{
            backgroundColor: '#fef3c7',
            padding: '16px',
            borderRadius: '8px',
            border: '1px solid #fed7aa'
          }}>
            <div style={{ fontSize: '12px', color: '#92400e', fontWeight: '500' }}>Payback Period</div>
            <div style={{ fontSize: '24px', fontWeight: '700', color: '#d97706' }}>
              {Math.ceil((100 - (useCase.implementation_score || 50)) / 10)} Months
            </div>
          </div>
        </div>
        
        <ChartModule type="area" title="Projected ROI Over Time" />
      </ContentSection>

      <ContentSection title="Financial Justification">
        <div style={{
          fontSize: '16px',
          lineHeight: '1.6',
          color: '#374151'
        }}>
          The financial analysis demonstrates strong potential for positive ROI through multiple value streams. 
          Primary revenue drivers include operational efficiency gains, cost reduction opportunities, and 
          new revenue generation capabilities. The investment is projected to achieve break-even within the 
          specified payback period with continued value creation thereafter.
        </div>
      </ContentSection>
    </div>
  );

  const renderDetailsTab = () => (
    <div>
      <ContentSection title="Implementation Requirements">
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
          gap: '24px'
        }}>
          <div>
            <h4 style={{
              fontSize: '16px',
              fontWeight: '600',
              color: '#18365E',
              marginBottom: '12px'
            }}>Data Sources Required</h4>
            <ul style={{
              listStyle: 'disc',
              paddingLeft: '20px',
              fontSize: '14px',
              lineHeight: '1.6',
              color: '#374151'
            }}>
              <li>Electronic Health Records (EHR)</li>
              <li>Claims and billing data</li>
              <li>Patient demographics and outcomes</li>
              <li>Operational metrics and KPIs</li>
            </ul>
          </div>
          
          <div>
            <h4 style={{
              fontSize: '16px',
              fontWeight: '600',
              color: '#18365E',
              marginBottom: '12px'
            }}>Technology Requirements</h4>
            <ul style={{
              listStyle: 'disc',
              paddingLeft: '20px',
              fontSize: '14px',
              lineHeight: '1.6',
              color: '#374151'
            }}>
              <li>Data integration platform</li>
              <li>Analytics and visualization tools</li>
              <li>Security and compliance infrastructure</li>
              <li>API connectivity and data pipelines</li>
            </ul>
          </div>
        </div>
      </ContentSection>

      <ContentSection title="Compliance Considerations">
        <div style={{
          backgroundColor: '#fef2f2',
          border: '1px solid #fecaca',
          borderRadius: '8px',
          padding: '16px'
        }}>
          <div style={{
            fontSize: '16px',
            lineHeight: '1.6',
            color: '#374151'
          }}>
            Implementation must ensure full compliance with HIPAA, state privacy regulations, 
            and organizational data governance policies. Security protocols and audit trails 
            are required for all data access and processing activities.
          </div>
        </div>
      </ContentSection>
    </div>
  );

  const renderPlaybookTab = () => (
    <div>
      <ContentSection title="Implementation Playbook">
        <div style={{
          backgroundColor: '#f8fafc',
          border: '2px dashed #d1d5db',
          borderRadius: '8px',
          padding: '32px',
          textAlign: 'center'
        }}>
          <div style={{
            fontSize: '18px',
            fontWeight: '600',
            color: '#6b7280',
            marginBottom: '8px'
          }}>AI-Generated Playbook Content</div>
          <div style={{
            fontSize: '14px',
            color: '#9ca3af',
            marginBottom: '16px'
          }}>Detailed implementation guidance will be available here</div>
          <button
            onClick={() => navigate(`/playbook-draft/${useCase.id}`)}
            style={{
              backgroundColor: '#FF6E4C',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              padding: '12px 24px',
              fontSize: '14px',
              fontWeight: '600',
              cursor: 'pointer'
            }}
          >
            Generate Playbook
          </button>
        </div>
      </ContentSection>
    </div>
  );

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#f8fafc'
    }}>
      {/* Breadcrumbs */}
      <div style={{
        padding: '16px 24px',
        backgroundColor: 'white',
        borderBottom: '1px solid #e5e7eb'
      }}>
        <div style={{
          fontSize: '14px',
          color: '#6b7280'
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
            onClick={() => navigate('/matrix')}
            style={{
              background: 'none',
              border: 'none',
              color: '#2563eb',
              cursor: 'pointer',
              textDecoration: 'underline'
            }}
          >
            Use Case Matrix
          </button>
          {' / '}
          <span>{useCase.name || 'Use Case Details'}</span>
        </div>
      </div>

      {/* Header */}
      <div style={{
        padding: '24px',
        backgroundColor: 'white',
        borderBottom: '1px solid #e5e7eb'
      }}>
        <h1 style={{
          fontSize: '32px',
          fontWeight: '700',
          color: '#18365E',
          margin: 0,
          fontFamily: 'Montserrat, sans-serif'
        }}>
          {useCase.name || 'Use Case Profile'}
        </h1>
      </div>

      {/* Sticky KPI Bar */}
      <UseCaseKPIBar useCase={useCase} />

      {/* Main Content */}
      <div style={{
        padding: '0 24px 24px',
        maxWidth: '1400px',
        margin: '0 auto'
      }}>
        <TabController 
          activeTab={activeTab} 
          setActiveTab={setActiveTab} 
          tabs={tabs} 
        />

        {activeTab === 'overview' && renderOverviewTab()}
        {activeTab === 'alignment' && renderAlignmentTab()}
        {activeTab === 'roi' && renderROITab()}
        {activeTab === 'details' && renderDetailsTab()}
        {activeTab === 'playbook' && renderPlaybookTab()}
      </div>
    </div>
  );
}
