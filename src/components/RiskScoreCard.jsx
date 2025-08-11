// Risk Score Card Component for Client Data Input Configurator
// Real-time visual score cards with red-yellow-green indicators

import React, { useState } from 'react';

const ScoreDial = ({ score, maxScore = 100, label, color }) => {
  const percentage = (score / maxScore) * 100;
  const circumference = 2 * Math.PI * 45; // radius = 45
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: '8px'
    }}>
      <div style={{ position: 'relative', width: '100px', height: '100px' }}>
        <svg width="100" height="100" style={{ transform: 'rotate(-90deg)' }}>
          {/* Background circle */}
          <circle
            cx="50"
            cy="50"
            r="45"
            stroke="#e5e7eb"
            strokeWidth="8"
            fill="transparent"
          />
          {/* Progress circle */}
          <circle
            cx="50"
            cy="50"
            r="45"
            stroke={color}
            strokeWidth="8"
            fill="transparent"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            style={{
              transition: 'stroke-dashoffset 0.5s ease-in-out'
            }}
          />
        </svg>
        
        {/* Score text in center */}
        <div style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          textAlign: 'center'
        }}>
          <div style={{
            fontSize: '20px',
            fontWeight: 'bold',
            color: '#374151'
          }}>
            {score}
          </div>
          <div style={{
            fontSize: '10px',
            color: '#6b7280'
          }}>
            /{maxScore}
          </div>
        </div>
      </div>
      
      <span style={{
        fontSize: '12px',
        fontWeight: '600',
        color: '#374151',
        textAlign: 'center'
      }}>
        {label}
      </span>
    </div>
  );
};

const RiskScoreCard = ({ 
  readinessScore = 0, 
  alignmentIndex = 0, 
  integrationRisk = 0,
  showTooltips = true 
}) => {
  const [activeTooltip, setActiveTooltip] = useState(null);

  const getScoreColor = (score) => {
    if (score >= 80) return '#10b981'; // Green
    if (score >= 60) return '#f59e0b'; // Yellow
    return '#ef4444'; // Red
  };

  const getRiskColor = (risk) => {
    if (risk <= 20) return '#10b981'; // Green (low risk)
    if (risk <= 50) return '#f59e0b'; // Yellow (medium risk)
    return '#ef4444'; // Red (high risk)
  };

  const getScoreStatus = (score) => {
    if (score >= 80) return 'Excellent';
    if (score >= 60) return 'Good';
    if (score >= 40) return 'Fair';
    return 'Needs Improvement';
  };

  const getRiskStatus = (risk) => {
    if (risk <= 20) return 'Low Risk';
    if (risk <= 50) return 'Medium Risk';
    return 'High Risk';
  };

  const tooltipContent = {
    readiness: {
      title: 'Readiness Score',
      description: 'Measures your organization\'s preparedness for data value acceleration initiatives based on current capabilities and infrastructure.'
    },
    alignment: {
      title: 'Alignment Index',
      description: 'Evaluates how well your strategic goals align with DVA opportunities and organizational priorities.'
    },
    integration: {
      title: 'Integration Risk',
      description: 'Assesses potential challenges and risks associated with implementing DVA solutions in your current environment.'
    }
  };

  const Tooltip = ({ content, isVisible }) => {
    if (!isVisible) return null;
    
    return (
      <div style={{
        position: 'absolute',
        top: '-80px',
        left: '50%',
        transform: 'translateX(-50%)',
        backgroundColor: '#1f2937',
        color: 'white',
        padding: '12px',
        borderRadius: '6px',
        fontSize: '12px',
        width: '200px',
        zIndex: 10,
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)'
      }}>
        <div style={{ fontWeight: '600', marginBottom: '4px' }}>
          {content.title}
        </div>
        <div style={{ lineHeight: '1.4' }}>
          {content.description}
        </div>
        {/* Arrow */}
        <div style={{
          position: 'absolute',
          top: '100%',
          left: '50%',
          transform: 'translateX(-50%)',
          width: 0,
          height: 0,
          borderLeft: '6px solid transparent',
          borderRight: '6px solid transparent',
          borderTop: '6px solid #1f2937'
        }} />
      </div>
    );
  };

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
        marginBottom: '24px',
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
          Real-Time Scoring Dashboard
        </h2>
        
        <p style={{
          color: '#6b7280',
          fontSize: '14px',
          lineHeight: '1.6',
          margin: 0
        }}>
          Live scoring based on your input data. Scores update automatically as you complete surveys and upload documents.
        </p>
      </div>

      {/* Score Dials */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))',
        gap: '24px',
        marginBottom: '24px'
      }}>
        
        {/* Readiness Score */}
        <div 
          style={{ 
            position: 'relative',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            padding: '16px',
            backgroundColor: '#f8fafc',
            borderRadius: '8px',
            cursor: showTooltips ? 'pointer' : 'default'
          }}
          onMouseEnter={() => showTooltips && setActiveTooltip('readiness')}
          onMouseLeave={() => setActiveTooltip(null)}
        >
          <ScoreDial 
            score={readinessScore} 
            label="Readiness Score" 
            color={getScoreColor(readinessScore)}
          />
          <div style={{
            marginTop: '8px',
            fontSize: '12px',
            fontWeight: '600',
            color: getScoreColor(readinessScore)
          }}>
            {getScoreStatus(readinessScore)}
          </div>
          {showTooltips && (
            <Tooltip 
              content={tooltipContent.readiness} 
              isVisible={activeTooltip === 'readiness'} 
            />
          )}
        </div>

        {/* Alignment Index */}
        <div 
          style={{ 
            position: 'relative',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            padding: '16px',
            backgroundColor: '#f8fafc',
            borderRadius: '8px',
            cursor: showTooltips ? 'pointer' : 'default'
          }}
          onMouseEnter={() => showTooltips && setActiveTooltip('alignment')}
          onMouseLeave={() => setActiveTooltip(null)}
        >
          <ScoreDial 
            score={alignmentIndex} 
            label="Alignment Index" 
            color={getScoreColor(alignmentIndex)}
          />
          <div style={{
            marginTop: '8px',
            fontSize: '12px',
            fontWeight: '600',
            color: getScoreColor(alignmentIndex)
          }}>
            {getScoreStatus(alignmentIndex)}
          </div>
          {showTooltips && (
            <Tooltip 
              content={tooltipContent.alignment} 
              isVisible={activeTooltip === 'alignment'} 
            />
          )}
        </div>

        {/* Integration Risk */}
        <div 
          style={{ 
            position: 'relative',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            padding: '16px',
            backgroundColor: '#f8fafc',
            borderRadius: '8px',
            cursor: showTooltips ? 'pointer' : 'default'
          }}
          onMouseEnter={() => showTooltips && setActiveTooltip('integration')}
          onMouseLeave={() => setActiveTooltip(null)}
        >
          <ScoreDial 
            score={integrationRisk} 
            label="Integration Risk" 
            color={getRiskColor(integrationRisk)}
          />
          <div style={{
            marginTop: '8px',
            fontSize: '12px',
            fontWeight: '600',
            color: getRiskColor(integrationRisk)
          }}>
            {getRiskStatus(integrationRisk)}
          </div>
          {showTooltips && (
            <Tooltip 
              content={tooltipContent.integration} 
              isVisible={activeTooltip === 'integration'} 
            />
          )}
        </div>
      </div>

      {/* Summary Status */}
      <div style={{
        padding: '16px',
        backgroundColor: '#f0f9ff',
        border: '1px solid #0ea5e9',
        borderRadius: '8px'
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          marginBottom: '8px'
        }}>
          <div style={{
            width: '16px',
            height: '16px',
            borderRadius: '50%',
            backgroundColor: '#0ea5e9',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white',
            fontSize: '10px',
            fontWeight: 'bold'
          }}>
            ℹ
          </div>
          <span style={{
            fontSize: '14px',
            fontWeight: '600',
            color: '#0ea5e9'
          }}>
            Scoring Status
          </span>
        </div>
        
        <p style={{
          margin: 0,
          fontSize: '12px',
          color: '#0369a1',
          lineHeight: '1.4'
        }}>
          Scores are calculated in real-time based on completed surveys and uploaded documents. 
          Complete all input sections to get your final DVA readiness assessment.
        </p>
      </div>
    </div>
  );
};

export default RiskScoreCard;
