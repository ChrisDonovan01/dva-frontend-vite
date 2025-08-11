// Strategy Synthesis Panel Component for Freemium Deliverable
// Locked until all inputs complete, shows loading, preview, download, and upgrade CTA

import React, { useState, useEffect } from 'react';

const StrategySynthesisPanel = ({ 
  inputStatus, 
  onDownload, 
  onUpgrade,
  isGenerating = false,
  strategyContent = null 
}) => {
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [downloadClicked, setDownloadClicked] = useState(false);

  // Check if all inputs are completed
  const allInputsComplete = Object.values(inputStatus).every(status => status.completed);

  // Mock strategy content for demonstration
  const mockStrategyContent = {
    executiveSummary: "Based on your organizational inputs, your health system demonstrates strong foundational capabilities with significant opportunities for data value acceleration. Key strengths include established clinical workflows and growing analytics maturity.",
    inputHighlights: [
      "Strategic Priority: Patient outcomes improvement and operational efficiency",
      "Current Capabilities: EHR integration with basic reporting infrastructure", 
      "Interoperability: FHIR-compliant systems with API readiness"
    ],
    recommendations: [
      "Implement predictive analytics for patient risk stratification",
      "Develop real-time operational dashboards for executive decision-making",
      "Establish data governance framework for regulatory compliance",
      "Create patient engagement platforms leveraging existing data assets"
    ],
    nextSteps: [
      "Conduct detailed technical assessment of current data infrastructure",
      "Identify high-impact use cases for immediate implementation",
      "Develop ROI projections for proposed analytics initiatives",
      "Create implementation roadmap with timeline and resource requirements"
    ]
  };

  const handleDownload = () => {
    setDownloadClicked(true);
    if (onDownload) {
      onDownload();
    }
    // Reset after 3 seconds
    setTimeout(() => setDownloadClicked(false), 3000);
  };

  const handleUpgrade = () => {
    setShowUpgradeModal(true);
    if (onUpgrade) {
      onUpgrade();
    }
  };

  const UpgradeModal = () => (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000
    }}>
      <div style={{
        backgroundColor: 'white',
        borderRadius: '12px',
        padding: '32px',
        maxWidth: '500px',
        width: '90%',
        boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)'
      }}>
        <h2 style={{
          fontSize: '24px',
          fontWeight: '600',
          color: '#18365E',
          margin: '0 0 16px 0',
          fontFamily: 'Montserrat, system-ui, sans-serif'
        }}>
          Unlock Full DVA Analytics
        </h2>
        
        <p style={{
          color: '#6b7280',
          fontSize: '16px',
          lineHeight: '1.6',
          marginBottom: '24px'
        }}>
          Upgrade to access comprehensive scoring, monetization roadmaps, executive dashboards, and personalized recommendations.
        </p>

        <div style={{
          backgroundColor: '#f8fafc',
          padding: '20px',
          borderRadius: '8px',
          marginBottom: '24px'
        }}>
          <h3 style={{
            fontSize: '16px',
            fontWeight: '600',
            color: '#374151',
            margin: '0 0 12px 0'
          }}>
            Premium Features Include:
          </h3>
          <ul style={{
            margin: 0,
            paddingLeft: '20px',
            color: '#6b7280',
            fontSize: '14px',
            lineHeight: '1.6'
          }}>
            <li>Real-time DVA scoring and alignment metrics</li>
            <li>ROI projections and financial modeling</li>
            <li>Executive-ready dashboards and reports</li>
            <li>Use case prioritization matrix</li>
            <li>Implementation roadmap with timelines</li>
          </ul>
        </div>

        <div style={{
          display: 'flex',
          gap: '12px',
          justifyContent: 'flex-end'
        }}>
          <button
            onClick={() => setShowUpgradeModal(false)}
            style={{
              backgroundColor: 'transparent',
              color: '#6b7280',
              border: '1px solid #d1d5db',
              borderRadius: '6px',
              padding: '10px 20px',
              fontSize: '14px',
              fontWeight: '500',
              cursor: 'pointer'
            }}
          >
            Maybe Later
          </button>
          <button
            onClick={() => {
              setShowUpgradeModal(false);
              // Handle upgrade logic here
            }}
            style={{
              backgroundColor: '#FF6E4C',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              padding: '10px 20px',
              fontSize: '14px',
              fontWeight: '600',
              cursor: 'pointer',
              fontFamily: 'Montserrat, system-ui, sans-serif'
            }}
          >
            Upgrade Now
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div style={{
      backgroundColor: 'white',
      borderRadius: '12px',
      padding: '24px',
      boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
      border: '1px solid #e5e7eb',
      marginBottom: '24px'
    }}>
      
      {/* Header */}
      <div style={{
        marginBottom: '20px',
        paddingBottom: '16px',
        borderBottom: '2px solid #18365E'
      }}>
        <h2 style={{
          fontSize: '20px',
          fontWeight: '600',
          color: '#18365E',
          margin: '0 0 8px 0',
          fontFamily: 'Montserrat, system-ui, sans-serif'
        }}>
          Your Preliminary Data Product Strategy
        </h2>
        
        <p style={{
          color: '#6b7280',
          fontSize: '14px',
          lineHeight: '1.6',
          margin: 0
        }}>
          AI-generated strategic synthesis based on your organizational inputs and document uploads.
        </p>
      </div>

      {/* Content Area */}
      {!allInputsComplete ? (
        // Locked State
        <div style={{
          textAlign: 'center',
          padding: '48px 20px',
          backgroundColor: '#f9fafb',
          borderRadius: '8px',
          border: '2px dashed #d1d5db'
        }}>
          <div style={{ fontSize: '48px', marginBottom: '16px', opacity: 0.5 }}>🔒</div>
          <h3 style={{
            fontSize: '18px',
            fontWeight: '600',
            color: '#9ca3af',
            marginBottom: '8px'
          }}>
            Strategy Synthesis Locked
          </h3>
          <p style={{
            color: '#6b7280',
            fontSize: '14px',
            margin: 0
          }}>
            Complete all input sections to generate your preliminary data product strategy.
          </p>
        </div>
      ) : isGenerating ? (
        // Generating State
        <div style={{
          textAlign: 'center',
          padding: '48px 20px'
        }}>
          <div style={{
            width: '40px',
            height: '40px',
            border: '4px solid #e5e7eb',
            borderTop: '4px solid #FF6E4C',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            margin: '0 auto 16px auto'
          }} />
          <h3 style={{
            fontSize: '18px',
            fontWeight: '600',
            color: '#374151',
            marginBottom: '8px'
          }}>
            Generating Strategy...
          </h3>
          <p style={{
            color: '#6b7280',
            fontSize: '14px',
            margin: 0
          }}>
            AI is analyzing your inputs and creating a personalized data strategy summary.
          </p>
        </div>
      ) : (
        // Strategy Ready State
        <div>
          {/* Strategy Preview */}
          <div style={{
            maxHeight: '400px',
            overflowY: 'auto',
            padding: '20px',
            backgroundColor: '#f8fafc',
            borderRadius: '8px',
            border: '1px solid #e2e8f0',
            marginBottom: '20px'
          }}>
            
            {/* Executive Summary */}
            <div style={{ marginBottom: '24px' }}>
              <h3 style={{
                fontSize: '16px',
                fontWeight: '600',
                color: '#18365E',
                marginBottom: '8px',
                fontFamily: 'Montserrat, system-ui, sans-serif'
              }}>
                Executive Summary
              </h3>
              <p style={{
                color: '#374151',
                fontSize: '14px',
                lineHeight: '1.6',
                margin: 0
              }}>
                {mockStrategyContent.executiveSummary}
              </p>
            </div>

            {/* Input Highlights */}
            <div style={{ marginBottom: '24px' }}>
              <h3 style={{
                fontSize: '16px',
                fontWeight: '600',
                color: '#18365E',
                marginBottom: '8px',
                fontFamily: 'Montserrat, system-ui, sans-serif'
              }}>
                Input Highlights
              </h3>
              <ul style={{
                margin: 0,
                paddingLeft: '20px',
                color: '#374151',
                fontSize: '14px',
                lineHeight: '1.6'
              }}>
                {mockStrategyContent.inputHighlights.map((highlight, index) => (
                  <li key={index} style={{ marginBottom: '4px' }}>{highlight}</li>
                ))}
              </ul>
            </div>

            {/* Recommendations */}
            <div style={{ marginBottom: '24px' }}>
              <h3 style={{
                fontSize: '16px',
                fontWeight: '600',
                color: '#18365E',
                marginBottom: '8px',
                fontFamily: 'Montserrat, system-ui, sans-serif'
              }}>
                Data Strategy Enhancement Recommendations
              </h3>
              <ul style={{
                margin: 0,
                paddingLeft: '20px',
                color: '#374151',
                fontSize: '14px',
                lineHeight: '1.6'
              }}>
                {mockStrategyContent.recommendations.map((rec, index) => (
                  <li key={index} style={{ marginBottom: '4px' }}>{rec}</li>
                ))}
              </ul>
            </div>

            {/* Next Steps */}
            <div>
              <h3 style={{
                fontSize: '16px',
                fontWeight: '600',
                color: '#18365E',
                marginBottom: '8px',
                fontFamily: 'Montserrat, system-ui, sans-serif'
              }}>
                Suggested Next Steps
              </h3>
              <ul style={{
                margin: 0,
                paddingLeft: '20px',
                color: '#374151',
                fontSize: '14px',
                lineHeight: '1.6'
              }}>
                {mockStrategyContent.nextSteps.map((step, index) => (
                  <li key={index} style={{ marginBottom: '4px' }}>{step}</li>
                ))}
              </ul>
            </div>
          </div>

          {/* Download Button */}
          <div style={{ textAlign: 'center', marginBottom: '20px' }}>
            <button
              onClick={handleDownload}
              disabled={downloadClicked}
              style={{
                backgroundColor: downloadClicked ? '#10b981' : '#FF6E4C',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                padding: '16px 32px',
                fontSize: '16px',
                fontWeight: '600',
                cursor: downloadClicked ? 'default' : 'pointer',
                fontFamily: 'Montserrat, system-ui, sans-serif',
                textTransform: 'uppercase',
                letterSpacing: '0.5px',
                transition: 'all 0.2s ease',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                margin: '0 auto'
              }}
            >
              {downloadClicked ? (
                <>
                  <span>✓</span>
                  Download in Progress
                </>
              ) : (
                <>
                  <span>📄</span>
                  Download as PDF
                </>
              )}
            </button>
          </div>

          {/* Upgrade CTA */}
          <div style={{
            padding: '16px',
            backgroundColor: '#fef3f2',
            border: '1px solid #fecaca',
            borderRadius: '8px',
            textAlign: 'center'
          }}>
            <p style={{
              color: '#7c2d12',
              fontSize: '14px',
              lineHeight: '1.5',
              margin: '0 0 12px 0'
            }}>
              Unlock full scoring, monetization roadmap, and executive dashboards in the DVA Customizer
            </p>
            <button
              onClick={handleUpgrade}
              style={{
                backgroundColor: '#18365E',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                padding: '10px 20px',
                fontSize: '14px',
                fontWeight: '600',
                cursor: 'pointer',
                fontFamily: 'Montserrat, system-ui, sans-serif'
              }}
            >
              Upgrade Now →
            </button>
          </div>
        </div>
      )}

      {/* Upgrade Modal */}
      {showUpgradeModal && <UpgradeModal />}

      {/* CSS for spinner animation */}
      <style jsx>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default StrategySynthesisPanel;
