import React from 'react';

const getScoreColor = (score) => {
  if (score >= 80) return { color: '#10b981', borderColor: '#10b981', backgroundColor: '#ecfdf5' }; // green
  if (score >= 60) return { color: '#f59e0b', borderColor: '#f59e0b', backgroundColor: '#fffbeb' }; // yellow/orange  
  return { color: '#ef4444', borderColor: '#ef4444', backgroundColor: '#fef2f2' }; // red
};

const StrategicAignmentDashboard = () => {
  const metrics = [
    { label: 'Strategic Alignment', score: 82 },
    { label: 'Financial ROI', score: 76 },
    { label: 'Ease of Implementation', score: 88 },
    { label: 'Data Readiness', score: 91 },
    { label: 'Market Differentiation', score: 67 },
    { label: 'Patient Impact', score: 79 },
  ];

  const recommendations = [
    'Activate Referral Analytics',
    'Refocus ED Dashboard Strategy',
    'Expand Population Health Model',
    'Optimize Virtual Care Use',
    'Publish Real-World Evidence',
  ];

  return (
    <div style={{
      padding: '24px',
      backgroundColor: '#f8fafc',
      minHeight: 'calc(100vh - 80px)',
      display: 'flex',
      flexDirection: 'column',
      gap: '24px'
    }}>
      {/* Breadcrumb Navigation */}
      <div style={{ marginBottom: '24px' }}>
        <nav style={{
          fontSize: '20px', // Increased by 6 points total from 14px
          fontFamily: 'Montserrat, system-ui, sans-serif',
          fontWeight: '700', // Bold for entire breadcrumb
          color: '#6b7280'
        }}>
          <a href="/" style={{
            color: '#FF6E4C',
            textDecoration: 'none',
            cursor: 'pointer',
            fontWeight: '700' // Bold
          }}
          onMouseEnter={(e) => e.target.style.textDecoration = 'underline'}
          onMouseLeave={(e) => e.target.style.textDecoration = 'none'}
          >
            Home
          </a>
          <span style={{ margin: '0 8px', color: '#FF6E4C', fontWeight: '700' }}>›</span>
          <span style={{ color: '#374151', fontWeight: '700' }}>Strategic Alignment Analysis</span>
        </nav>
        <p style={{
          fontSize: '14px',
          color: '#6b7280',
          margin: '8px 0 0 0',
          lineHeight: '1.5',
          fontFamily: 'Montserrat, system-ui, sans-serif'
        }}>
          Comprehensive analysis of strategic alignment, ROI potential, and implementation readiness across key metrics and initiatives.
        </p>
      </div>

      {/* Metric Score Cards */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '16px'
      }}>
        {metrics.map(({ label, score }) => {
          const colors = getScoreColor(score);
          return (
            <div
              key={label}
              style={{
                padding: '16px',
                borderRadius: '8px',
                boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
                borderLeft: `4px solid ${colors.borderColor}`,
                backgroundColor: colors.backgroundColor,
                color: colors.color
              }}
            >
              <div style={{
                fontSize: '2rem',
                fontWeight: 'bold',
                marginBottom: '4px'
              }}>{score}</div>
              <div style={{
                fontSize: '14px',
                fontWeight: '500',
                color: '#6b7280'
              }}>{label}</div>
            </div>
          );
        })}
      </div>

      {/* Metric Category Scores + Recommendations */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))',
        gap: '24px'
      }}>
        <div style={{
          backgroundColor: 'white',
          padding: '16px',
          borderRadius: '8px',
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
        }}>
          <h2 style={{
            fontSize: '24px',
            fontWeight: '600',
            color: '#FF6E4C', // DVA Orange for section headers
            fontFamily: 'Montserrat, system-ui, sans-serif',
            margin: '0 0 16px 0'
          }}>Metric Category Scores</h2>
          <ul style={{
            listStyle: 'none',
            padding: 0,
            margin: 0,
            fontSize: '14px',
            color: '#6b7280'
          }}>
            {metrics.map(({ label, score }) => {
              const colors = getScoreColor(score);
              return (
                <li key={label} style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  marginBottom: '8px',
                  paddingBottom: '4px'
                }}>
                  <span>{label}</span>
                  <span style={{ color: colors.color, fontWeight: '600' }}>{score}</span>
                </li>
              );
            })}
          </ul>
        </div>

        <div style={{
          backgroundColor: 'white',
          padding: '16px',
          borderRadius: '8px',
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '12px'
          }}>
            <h2 style={{
              fontSize: '24px',
              fontWeight: '600',
              color: '#FF6E4C', // DVA Orange for section headers
              fontFamily: 'Montserrat, system-ui, sans-serif',
              margin: 0
            }}>Top Recommendations</h2>
            <span style={{
              display: 'inline-block',
              backgroundColor: '#FF6E4C',
              color: 'white',
              fontSize: '12px',
              padding: '4px 8px',
              borderRadius: '4px'
            }}>Priority</span>
          </div>
          <ul style={{
            listStyle: 'none',
            padding: 0,
            margin: 0,
            fontSize: '14px'
          }}>
            {recommendations.map((rec, index) => (
              <li key={index} style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: '8px',
                marginBottom: '8px'
              }}>
                <span style={{
                  height: '8px',
                  width: '8px',
                  marginTop: '8px',
                  borderRadius: '50%',
                  backgroundColor: '#FF6E4C',
                  flexShrink: 0
                }} />
                <a 
                  href="#" 
                  style={{
                    color: '#1f2937',
                    textDecoration: 'none'
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.color = '#FF6E4C';
                    e.target.style.textDecoration = 'underline';
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.color = '#1f2937';
                    e.target.style.textDecoration = 'none';
                  }}
                >
                  {rec}
                </a>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Initiative Score Breakdown */}
      <div style={{
        backgroundColor: 'white',
        borderTop: '4px solid #FF6E4C',
        padding: '16px',
        borderRadius: '0 0 8px 8px',
        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
      }}>
        <h2 style={{
          fontSize: '24px',
          fontWeight: '600',
          color: '#FF6E4C', // DVA Orange for section headers
          fontFamily: 'Montserrat, system-ui, sans-serif',
          margin: '0 0 16px 0'
        }}>Initiative Score Breakdown</h2>
        <div style={{
          backgroundColor: '#f3f4f6',
          color: '#6b7280',
          textAlign: 'center',
          padding: '48px 12px',
          borderRadius: '8px',
          fontSize: '14px'
        }}>
          [Initiative Table or Matrix Placeholder]
        </div>
      </div>
    </div>
  );
};

export default StrategicAignmentDashboard;
