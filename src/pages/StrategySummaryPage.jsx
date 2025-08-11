import React, { useState, useEffect } from 'react';
import SurveyService from '../services/surveyService';
import html2pdf from 'html2pdf.js';

const StrategySummaryPage = ({ clientId = 101, userId = 'demo_user' }) => {
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [generating, setGenerating] = useState(false);
  const [exportingPDF, setExportingPDF] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  // Load existing summary on mount
  useEffect(() => {
    loadSummary();
  }, [clientId]);

  const loadSummary = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const existingSummary = await SurveyService.getStrategySummary(clientId);
      
      if (existingSummary) {
        if (existingSummary.status === 'error') {
          setError(existingSummary.error_message || 'Failed to generate summary');
        } else {
          setSummary(existingSummary);
        }
      } else {
        // Check if strategy survey is completed before trying to generate
        try {
          const completionStatus = await SurveyService.getSurveyCompletionStatus(clientId);
          if (completionStatus.completed) {
            // Survey is completed, try to generate summary
            await generateSummary();
          } else {
            // Survey not completed, show appropriate message
            setError('Complete the Organizational Strategy survey first to generate your strategy summary.');
          }
        } catch (statusError) {
          console.error('Failed to check survey completion status:', statusError);
          setError('Unable to check survey completion status. Please ensure the Organizational Strategy survey is completed first.');
        }
      }
    } catch (err) {
      console.error('Failed to load summary:', err);
      if (err.message && err.message.includes('Failed to fetch')) {
        setError('Unable to connect to the server. Please check your connection and try again.');
      } else {
        setError('Failed to load strategy summary. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const generateSummary = async () => {
    try {
      setGenerating(true);
      setError(null);
      
      const result = await SurveyService.generateStrategySummary({
        client_id: clientId,
        user_id: userId
      });
      
      if (result.success) {
        // Reload the summary after generation
        const newSummary = await SurveyService.getStrategySummary(clientId);
        setSummary(newSummary);
      } else {
        setError(result.error || 'Failed to generate strategy summary');
      }
    } catch (err) {
      console.error('Failed to generate summary:', err);
      if (err.message && err.message.includes('Failed to fetch')) {
        setError('Unable to connect to the server. Please check your connection and try again.');
      } else if (err.message && err.message.includes('No survey responses found')) {
        setError('No survey responses found. Please complete the Organizational Strategy survey first.');
      } else {
        setError('Failed to generate strategy summary. Please try again.');
      }
    } finally {
      setGenerating(false);
    }
  };

  const handleRegenerate = async () => {
    setSummary(null);
    await generateSummary();
  };

  // Toast notification utility
  const showToastMessage = (message) => {
    setToastMessage(message);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };

  // PDF Export function
  const handleExportPDF = async () => {
    if (!summary || !summary.content) {
      showToastMessage('⚠️ No summary available to export');
      return;
    }

    try {
      setExportingPDF(true);
      showToastMessage('📄 Preparing your Strategy Summary PDF...');

      const element = document.getElementById('print-summary');
      if (!element) {
        throw new Error('Print container not found');
      }

      const options = {
        margin: 0.5,
        filename: `DVA_Strategy_Summary_${clientId}_${new Date().toISOString().split('T')[0]}.pdf`,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { 
          scale: 2,
          useCORS: true,
          letterRendering: true
        },
        jsPDF: { 
          unit: 'in', 
          format: 'letter', 
          orientation: 'portrait' 
        }
      };

      await html2pdf().set(options).from(element).save();
      showToastMessage('✅ PDF downloaded successfully');
    } catch (error) {
      console.error('PDF export failed:', error);
      showToastMessage('❌ Failed to export PDF. Please try again.');
    } finally {
      setExportingPDF(false);
    }
  };

  // Loading state
  if (loading || generating) {
    return (
      <div style={{
        fontFamily: 'Montserrat, system-ui, sans-serif',
        padding: '32px',
        backgroundColor: '#f9fafb',
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <div style={{
          backgroundColor: 'white',
          borderRadius: '16px',
          padding: '48px',
          boxShadow: '0 10px 25px rgba(0, 0, 0, 0.1)',
          textAlign: 'center',
          maxWidth: '500px',
          width: '100%'
        }}>
          {/* Animated Gemini Icon */}
          <div style={{
            fontSize: '64px',
            marginBottom: '24px',
            animation: 'spin 2s linear infinite'
          }}>
            🤖
          </div>
          
          <h2 style={{
            fontSize: '24px',
            fontWeight: '700',
            color: '#18365E',
            marginBottom: '16px',
            margin: 0
          }}>
            {generating ? 'Generating Your Strategy Summary...' : 'Loading Strategy Summary...'}
          </h2>
          
          <p style={{
            fontSize: '16px',
            color: '#6b7280',
            lineHeight: '1.6',
            margin: 0
          }}>
            Our AI is analyzing your survey responses to create a personalized strategy summary. This may take a few moments.
          </p>
          
          <style jsx>{`
            @keyframes spin {
              from { transform: rotate(0deg); }
              to { transform: rotate(360deg); }
            }
          `}</style>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div style={{
        fontFamily: 'Montserrat, system-ui, sans-serif',
        padding: '32px',
        backgroundColor: '#f9fafb',
        minHeight: '100vh'
      }}>
        <div style={{
          backgroundColor: 'white',
          borderRadius: '16px',
          padding: '32px',
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
          maxWidth: '800px',
          margin: '0 auto'
        }}>
          <div style={{
            textAlign: 'center',
            marginBottom: '32px'
          }}>
            <div style={{ fontSize: '48px', marginBottom: '16px' }}>⚠️</div>
            <h2 style={{
              fontSize: '24px',
              fontWeight: '700',
              color: '#dc2626',
              marginBottom: '16px',
              margin: 0
            }}>
              Could Not Generate Summary
            </h2>
            <p style={{
              fontSize: '16px',
              color: '#6b7280',
              marginBottom: '24px',
              margin: 0
            }}>
              {error}
            </p>
            <button
              onClick={handleRegenerate}
              style={{
                padding: '16px 32px',
                backgroundColor: '#FF6E4C',
                color: 'white',
                border: 'none',
                borderRadius: '12px',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                fontFamily: 'Montserrat, system-ui, sans-serif',
                fontWeight: '600',
                fontSize: '16px',
                boxShadow: '0 4px 12px rgba(255, 110, 76, 0.3)'
              }}
              onMouseEnter={(e) => {
                e.target.style.backgroundColor = '#e55a3c';
                e.target.style.transform = 'translateY(-2px)';
              }}
              onMouseLeave={(e) => {
                e.target.style.backgroundColor = '#FF6E4C';
                e.target.style.transform = 'translateY(0)';
              }}
            >
              🔄 Retry Generation
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Summary display
  if (!summary || !summary.content) {
    return (
      <div style={{
        fontFamily: 'Montserrat, system-ui, sans-serif',
        padding: '32px',
        backgroundColor: '#f9fafb',
        minHeight: '100vh'
      }}>
        <div style={{
          backgroundColor: 'white',
          borderRadius: '16px',
          padding: '32px',
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
          maxWidth: '800px',
          margin: '0 auto',
          textAlign: 'center'
        }}>
          <h2 style={{
            fontSize: '24px',
            fontWeight: '700',
            color: '#18365E',
            marginBottom: '16px'
          }}>
            No Strategy Summary Available
          </h2>
          <p style={{
            fontSize: '16px',
            color: '#6b7280',
            marginBottom: '24px'
          }}>
            Please complete the strategy survey first to generate your personalized summary.
          </p>
        </div>
      </div>
    );
  }

  const { content } = summary;

  return (
    <div style={{
      fontFamily: 'Montserrat, system-ui, sans-serif',
      padding: '32px',
      backgroundColor: '#f9fafb',
      minHeight: '100vh'
    }}>
      {/* Header */}
      <div style={{
        backgroundColor: 'white',
        borderRadius: '16px',
        padding: '32px',
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
        maxWidth: '1000px',
        margin: '0 auto 24px auto'
      }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '16px'
        }}>
          <h1 style={{
            fontSize: '32px',
            fontWeight: '700',
            color: '#18365E',
            margin: 0
          }}>
            📊 Strategy Summary
          </h1>
          <div style={{ display: 'flex', gap: '12px' }}>
            <button
              onClick={handleExportPDF}
              disabled={exportingPDF}
              style={{
                padding: '12px 24px',
                backgroundColor: exportingPDF ? '#9ca3af' : '#FF6E4C',
                color: 'white',
                border: 'none',
                borderRadius: '12px',
                cursor: exportingPDF ? 'not-allowed' : 'pointer',
                transition: 'all 0.3s ease',
                fontFamily: 'Montserrat, system-ui, sans-serif',
                fontWeight: '500',
                fontSize: '14px',
                opacity: exportingPDF ? 0.7 : 1
              }}
              onMouseEnter={(e) => {
                if (!exportingPDF) {
                  e.target.style.backgroundColor = '#e55a3c';
                  e.target.style.transform = 'translateY(-1px)';
                }
              }}
              onMouseLeave={(e) => {
                if (!exportingPDF) {
                  e.target.style.backgroundColor = '#FF6E4C';
                  e.target.style.transform = 'translateY(0)';
                }
              }}
            >
              {exportingPDF ? '⏳ Exporting...' : '📄 Download PDF'}
            </button>
            <button
              onClick={handleRegenerate}
              style={{
                padding: '12px 24px',
                color: '#6b7280',
                border: '2px solid #d1d5db',
                borderRadius: '12px',
                backgroundColor: 'white',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                fontFamily: 'Montserrat, system-ui, sans-serif',
                fontWeight: '500',
                fontSize: '14px'
              }}
              onMouseEnter={(e) => {
                e.target.style.backgroundColor = '#f9fafb';
                e.target.style.borderColor = '#9ca3af';
              }}
              onMouseLeave={(e) => {
                e.target.style.backgroundColor = 'white';
                e.target.style.borderColor = '#d1d5db';
              }}
            >
              🔄 Regenerate Summary
            </button>
          </div>
        </div>
        <p style={{
          fontSize: '14px',
          color: '#6b7280',
          margin: 0
        }}>
          Generated on {new Date(summary.generated_at).toLocaleDateString()} using AI analysis of your survey responses
        </p>
      </div>

      {/* Summary Content */}
      <div style={{
        maxWidth: '1000px',
        margin: '0 auto',
        display: 'flex',
        flexDirection: 'column',
        gap: '24px'
      }}>
        {/* Executive Summary */}
        <div style={{
          backgroundColor: 'white',
          borderRadius: '16px',
          padding: '32px',
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
          borderLeft: '4px solid #FF6E4C'
        }}>
          <h2 style={{
            fontSize: '20px',
            fontWeight: '600',
            color: '#18365E',
            marginBottom: '16px',
            margin: 0,
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            🟠 Executive Summary
          </h2>
          <p style={{
            fontSize: '16px',
            color: '#374151',
            lineHeight: '1.6',
            margin: 0
          }}>
            {content.executive_summary}
          </p>
        </div>

        {/* Strategic Themes */}
        <div style={{
          backgroundColor: 'white',
          borderRadius: '16px',
          padding: '32px',
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
          borderLeft: '4px solid #3b82f6'
        }}>
          <h2 style={{
            fontSize: '20px',
            fontWeight: '600',
            color: '#18365E',
            marginBottom: '16px',
            margin: 0,
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            🔵 Strategic Themes
          </h2>
          <ul style={{
            fontSize: '16px',
            color: '#374151',
            lineHeight: '1.6',
            margin: 0,
            paddingLeft: '20px'
          }}>
            {content.strategic_themes?.map((theme, index) => (
              <li key={index} style={{ marginBottom: '8px' }}>
                {theme}
              </li>
            ))}
          </ul>
        </div>

        {/* Data Monetization Readiness */}
        <div style={{
          backgroundColor: 'white',
          borderRadius: '16px',
          padding: '32px',
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
          borderLeft: '4px solid #10b981'
        }}>
          <h2 style={{
            fontSize: '20px',
            fontWeight: '600',
            color: '#18365E',
            marginBottom: '16px',
            margin: 0,
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            🟢 Data Monetization Readiness
          </h2>
          
          <div style={{
            display: 'flex',
            alignItems: 'center',
            marginBottom: '16px',
            gap: '12px'
          }}>
            <span style={{
              fontSize: '16px',
              fontWeight: '600',
              color: '#374151'
            }}>
              Readiness Score:
            </span>
            <span style={{
              padding: '4px 12px',
              borderRadius: '20px',
              fontSize: '14px',
              fontWeight: '600',
              backgroundColor: content.data_monetization_readiness?.score === 'High' ? '#dcfce7' : 
                             content.data_monetization_readiness?.score === 'Medium' ? '#fef3c7' : '#fee2e2',
              color: content.data_monetization_readiness?.score === 'High' ? '#166534' : 
                     content.data_monetization_readiness?.score === 'Medium' ? '#92400e' : '#991b1b'
            }}>
              {content.data_monetization_readiness?.score || 'Medium'}
            </span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
            <div>
              <h3 style={{
                fontSize: '16px',
                fontWeight: '600',
                color: '#059669',
                marginBottom: '8px',
                margin: 0
              }}>
                Key Strengths
              </h3>
              <ul style={{
                fontSize: '14px',
                color: '#374151',
                lineHeight: '1.5',
                margin: 0,
                paddingLeft: '16px'
              }}>
                {content.data_monetization_readiness?.key_strengths?.map((strength, index) => (
                  <li key={index} style={{ marginBottom: '4px' }}>
                    {strength}
                  </li>
                ))}
              </ul>
            </div>
            
            <div>
              <h3 style={{
                fontSize: '16px',
                fontWeight: '600',
                color: '#dc2626',
                marginBottom: '8px',
                margin: 0
              }}>
                Improvement Areas
              </h3>
              <ul style={{
                fontSize: '14px',
                color: '#374151',
                lineHeight: '1.5',
                margin: 0,
                paddingLeft: '16px'
              }}>
                {content.data_monetization_readiness?.improvement_areas?.map((area, index) => (
                  <li key={index} style={{ marginBottom: '4px' }}>
                    {area}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* Recommended Next Steps */}
        <div style={{
          backgroundColor: 'white',
          borderRadius: '16px',
          padding: '32px',
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
          borderLeft: '4px solid #f59e0b'
        }}>
          <h2 style={{
            fontSize: '20px',
            fontWeight: '600',
            color: '#18365E',
            marginBottom: '16px',
            margin: 0,
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            🔶 Recommended Next Steps
          </h2>
          
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '16px'
          }}>
            {content.recommended_next_steps?.map((step, index) => (
              <div key={index} style={{
                padding: '16px',
                backgroundColor: '#f9fafb',
                borderRadius: '12px',
                border: '1px solid #e5e7eb'
              }}>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  marginBottom: '8px'
                }}>
                  <span style={{
                    padding: '2px 8px',
                    borderRadius: '12px',
                    fontSize: '12px',
                    fontWeight: '600',
                    backgroundColor: step.priority === 'High' ? '#fee2e2' : 
                                   step.priority === 'Medium' ? '#fef3c7' : '#e0f2fe',
                    color: step.priority === 'High' ? '#991b1b' : 
                           step.priority === 'Medium' ? '#92400e' : '#0c4a6e'
                  }}>
                    {step.priority} Priority
                  </span>
                  <span style={{
                    padding: '2px 8px',
                    borderRadius: '12px',
                    fontSize: '12px',
                    fontWeight: '500',
                    backgroundColor: '#e5e7eb',
                    color: '#374151'
                  }}>
                    {step.timeline}
                  </span>
                </div>
                <p style={{
                  fontSize: '14px',
                  color: '#374151',
                  lineHeight: '1.5',
                  margin: 0
                }}>
                  {step.action}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Hidden Print Container for PDF Export */}
      <div id="print-summary" style={{
        position: 'absolute',
        left: '-9999px',
        top: '-9999px',
        width: '8.5in',
        backgroundColor: 'white',
        fontFamily: 'Montserrat, system-ui, sans-serif',
        fontSize: '12px',
        lineHeight: '1.4',
        color: '#000'
      }}>
        {/* PDF Header */}
        <div style={{
          borderBottom: '2px solid #18365E',
          paddingBottom: '20px',
          marginBottom: '30px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <div>
            <div style={{
              fontSize: '24px',
              fontWeight: 'bold',
              color: '#18365E',
              marginBottom: '5px'
            }}>
              Strategy Summary
            </div>
            <div style={{
              fontSize: '14px',
              color: '#6b7280'
            }}>
              Generated for Health System Executive
            </div>
          </div>
          <div style={{
            textAlign: 'right',
            fontSize: '10px',
            color: '#6b7280'
          }}>
            <div>DVA Data Value Accelerator</div>
            <div>{new Date().toLocaleDateString()}</div>
          </div>
        </div>

        {/* PDF Content */}
        {content && (
          <>
            {/* Executive Summary */}
            <div style={{ marginBottom: '25px' }}>
              <h2 style={{
                fontSize: '16px',
                fontWeight: 'bold',
                color: '#FF6E4C',
                marginBottom: '10px',
                borderLeft: '4px solid #FF6E4C',
                paddingLeft: '10px'
              }}>
                Executive Summary
              </h2>
              <p style={{ margin: 0, lineHeight: '1.5' }}>
                {content.executive_summary}
              </p>
            </div>

            {/* Strategic Themes */}
            <div style={{ marginBottom: '25px' }}>
              <h2 style={{
                fontSize: '16px',
                fontWeight: 'bold',
                color: '#3b82f6',
                marginBottom: '10px',
                borderLeft: '4px solid #3b82f6',
                paddingLeft: '10px'
              }}>
                Strategic Themes
              </h2>
              <ul style={{ margin: 0, paddingLeft: '20px' }}>
                {content.strategic_themes?.map((theme, index) => (
                  <li key={index} style={{ marginBottom: '5px' }}>
                    {theme}
                  </li>
                ))}
              </ul>
            </div>

            {/* Data Monetization Readiness */}
            <div style={{ marginBottom: '25px' }}>
              <h2 style={{
                fontSize: '16px',
                fontWeight: 'bold',
                color: '#10b981',
                marginBottom: '10px',
                borderLeft: '4px solid #10b981',
                paddingLeft: '10px'
              }}>
                Data Monetization Readiness
              </h2>
              <div style={{ marginBottom: '15px' }}>
                <strong>Readiness Score: </strong>
                <span style={{
                  padding: '2px 8px',
                  borderRadius: '4px',
                  fontSize: '11px',
                  fontWeight: 'bold',
                  backgroundColor: content.data_monetization_readiness?.score === 'High' ? '#dcfce7' : 
                                 content.data_monetization_readiness?.score === 'Medium' ? '#fef3c7' : '#fee2e2',
                  color: content.data_monetization_readiness?.score === 'High' ? '#166534' : 
                         content.data_monetization_readiness?.score === 'Medium' ? '#92400e' : '#991b1b'
                }}>
                  {content.data_monetization_readiness?.score || 'Medium'}
                </span>
              </div>
              <div style={{ display: 'flex', gap: '30px' }}>
                <div style={{ flex: 1 }}>
                  <h3 style={{
                    fontSize: '14px',
                    fontWeight: 'bold',
                    color: '#059669',
                    marginBottom: '8px'
                  }}>
                    Key Strengths
                  </h3>
                  <ul style={{ margin: 0, paddingLeft: '16px', fontSize: '11px' }}>
                    {content.data_monetization_readiness?.key_strengths?.map((strength, index) => (
                      <li key={index} style={{ marginBottom: '3px' }}>
                        {strength}
                      </li>
                    ))}
                  </ul>
                </div>
                <div style={{ flex: 1 }}>
                  <h3 style={{
                    fontSize: '14px',
                    fontWeight: 'bold',
                    color: '#dc2626',
                    marginBottom: '8px'
                  }}>
                    Improvement Areas
                  </h3>
                  <ul style={{ margin: 0, paddingLeft: '16px', fontSize: '11px' }}>
                    {content.data_monetization_readiness?.improvement_areas?.map((area, index) => (
                      <li key={index} style={{ marginBottom: '3px' }}>
                        {area}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>

            {/* Recommended Next Steps */}
            <div style={{ marginBottom: '25px' }}>
              <h2 style={{
                fontSize: '16px',
                fontWeight: 'bold',
                color: '#f59e0b',
                marginBottom: '10px',
                borderLeft: '4px solid #f59e0b',
                paddingLeft: '10px'
              }}>
                Recommended Next Steps
              </h2>
              <table style={{
                width: '100%',
                borderCollapse: 'collapse',
                fontSize: '11px'
              }}>
                <thead>
                  <tr style={{ backgroundColor: '#f9fafb' }}>
                    <th style={{
                      border: '1px solid #e5e7eb',
                      padding: '8px',
                      textAlign: 'left',
                      fontWeight: 'bold'
                    }}>
                      Priority
                    </th>
                    <th style={{
                      border: '1px solid #e5e7eb',
                      padding: '8px',
                      textAlign: 'left',
                      fontWeight: 'bold'
                    }}>
                      Timeline
                    </th>
                    <th style={{
                      border: '1px solid #e5e7eb',
                      padding: '8px',
                      textAlign: 'left',
                      fontWeight: 'bold'
                    }}>
                      Action
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {content.recommended_next_steps?.map((step, index) => (
                    <tr key={index}>
                      <td style={{
                        border: '1px solid #e5e7eb',
                        padding: '8px',
                        fontWeight: 'bold',
                        color: step.priority === 'High' ? '#991b1b' : 
                               step.priority === 'Medium' ? '#92400e' : '#0c4a6e'
                      }}>
                        {step.priority}
                      </td>
                      <td style={{
                        border: '1px solid #e5e7eb',
                        padding: '8px'
                      }}>
                        {step.timeline}
                      </td>
                      <td style={{
                        border: '1px solid #e5e7eb',
                        padding: '8px'
                      }}>
                        {step.action}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}

        {/* PDF Footer */}
        <div style={{
          borderTop: '1px solid #e5e7eb',
          paddingTop: '15px',
          marginTop: '30px',
          display: 'flex',
          justifyContent: 'space-between',
          fontSize: '10px',
          color: '#6b7280'
        }}>
          <div>Generated by Adaptive Product Data Value Accelerator</div>
          <div>Date: {new Date().toLocaleDateString()}</div>
        </div>
      </div>

      {/* Toast Notification */}
      {showToast && (
        <div style={{
          position: 'fixed',
          bottom: '20px',
          right: '20px',
          backgroundColor: '#18365E',
          color: 'white',
          padding: '12px 20px',
          borderRadius: '8px',
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
          fontFamily: 'Montserrat, system-ui, sans-serif',
          fontSize: '14px',
          fontWeight: '500',
          zIndex: 1000,
          animation: 'slideIn 0.3s ease-out'
        }}>
          {toastMessage}
        </div>
      )}

      {/* Toast Animation Styles */}
      <style jsx>{`
        @keyframes slideIn {
          from {
            transform: translateX(100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
      `}</style>
    </div>
  );
};

export default StrategySummaryPage;
