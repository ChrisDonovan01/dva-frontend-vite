import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import html2pdf from 'html2pdf.js';
import './CapabilitiesSummaryPage.css';

const CapabilitiesSummaryPage = () => {
  const navigate = useNavigate();
  const [summaryData, setSummaryData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [generating, setGenerating] = useState(false);

  const mockClientId = 101; // Replace with actual client ID from context

  useEffect(() => {
    fetchCapabilitiesSummary();
  }, []);

  const fetchCapabilitiesSummary = async () => {
    try {
      setLoading(true);
      const response = await fetch(`http://localhost:3001/api/survey/capabilities/summary/${mockClientId}`);
      
      if (response.ok) {
        const data = await response.json();
        setSummaryData(data.summary_data);
      } else if (response.status === 404) {
        // No summary exists yet
        setSummaryData(null);
      } else {
        throw new Error('Failed to fetch capabilities summary');
      }
    } catch (err) {
      console.error('Error fetching capabilities summary:', err);
      setError('Unable to load capabilities summary. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const generateCapabilitiesSummary = async () => {
    try {
      setGenerating(true);
      setError(null);

      const response = await fetch('http://localhost:3001/api/survey/capabilities/summary/generate-summary', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ client_id: mockClientId }),
      });

      if (response.ok) {
        const data = await response.json();
        setSummaryData(data.summary_data);
      } else {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to generate capabilities summary');
      }
    } catch (err) {
      console.error('Error generating capabilities summary:', err);
      setError('Failed to generate capabilities summary. Please ensure the capabilities survey is completed.');
    } finally {
      setGenerating(false);
    }
  };

  const downloadPDF = () => {
    const element = document.getElementById('capabilities-summary-content');
    const opt = {
      margin: 1,
      filename: 'DVA-Capabilities-Summary.pdf',
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2 },
      jsPDF: { unit: 'in', format: 'letter', orientation: 'portrait' }
    };

    html2pdf().set(opt).from(element).save();
  };

  const getScoreColor = (score) => {
    if (score >= 4) return '#4CAF50'; // Green
    if (score >= 3) return '#FF9800'; // Orange
    return '#F44336'; // Red
  };

  const getScoreLabel = (score) => {
    if (score >= 4) return 'Strong';
    if (score >= 3) return 'Developing';
    return 'Needs Attention';
  };

  if (loading) {
    return (
      <div className="capabilities-summary-page">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading capabilities summary...</p>
        </div>
      </div>
    );
  }

  if (error && !summaryData) {
    return (
      <div className="capabilities-summary-page">
        <div className="error-container">
          <h2>Unable to Load Summary</h2>
          <p>{error}</p>
          <button onClick={() => navigate('/client-data-input')} className="btn-secondary">
            Return to Dashboard
          </button>
        </div>
      </div>
    );
  }

  if (!summaryData) {
    return (
      <div className="capabilities-summary-page">
        <div className="no-summary-container">
          <h2>Capabilities Summary</h2>
          <p>No capabilities summary has been generated yet.</p>
          <p>Complete the Data Analytics Capabilities Survey to generate your summary.</p>
          <div className="action-buttons">
            <button 
              onClick={generateCapabilitiesSummary} 
              className="btn-primary"
              disabled={generating}
            >
              {generating ? 'Generating Summary...' : 'Generate Capabilities Summary'}
            </button>
            <button onClick={() => navigate('/client-data-input')} className="btn-secondary">
              Return to Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="capabilities-summary-page">
      {/* Header Section */}
      <div className="summary-header">
        <button onClick={() => navigate('/client-data-input')} className="back-button">
          ← Back to Dashboard
        </button>
        <div className="header-content">
          <h1>Capabilities Summary</h1>
          <p className="subheader">An executive overview of current analytics infrastructure and operational readiness</p>
        </div>
        <div className="header-actions">
          <button onClick={downloadPDF} className="btn-secondary">
            📄 Download PDF
          </button>
          <button onClick={generateCapabilitiesSummary} className="btn-primary" disabled={generating}>
            {generating ? 'Regenerating...' : '🔄 Regenerate'}
          </button>
        </div>
      </div>

      <div id="capabilities-summary-content" className="summary-content">
        {/* Executive Summary Card */}
        <div className="executive-summary-card">
          <div className="card-header">
            <div className="card-icon">📊</div>
            <h2>Executive Summary</h2>
          </div>
          <p className="executive-summary-text">{summaryData.executive_summary}</p>
          {summaryData.overall_maturity && (
            <div className="maturity-badge">
              <span className="maturity-label">Overall Maturity:</span>
              <span className={`maturity-level ${summaryData.overall_maturity.toLowerCase()}`}>
                {summaryData.overall_maturity}
              </span>
            </div>
          )}
        </div>

        {/* Capability Scores */}
        <div className="capability-scores-section">
          <h2>Capability Assessment</h2>
          <div className="scores-grid">
            {Object.entries(summaryData.capability_scores || {}).map(([key, capability]) => (
              <div key={key} className="score-card">
                <div className="score-header">
                  <h3>{capability.label}</h3>
                  <div className="score-indicator">
                    <span className="score-value" style={{ color: getScoreColor(capability.score) }}>
                      {capability.score}/5
                    </span>
                    <span className="score-label" style={{ color: getScoreColor(capability.score) }}>
                      {getScoreLabel(capability.score)}
                    </span>
                  </div>
                </div>
                <div className="progress-bar">
                  <div 
                    className="progress-fill" 
                    style={{ 
                      width: `${(capability.score / 5) * 100}%`,
                      backgroundColor: getScoreColor(capability.score)
                    }}
                  ></div>
                </div>
                <p className="score-description">{capability.description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Insights Module */}
        <div className="insights-section">
          <div className="insights-grid">
            {/* Strengths */}
            <div className="insights-card strengths">
              <div className="insights-header">
                <div className="insights-icon">✅</div>
                <h3>Top Capability Strengths</h3>
              </div>
              <ul className="insights-list">
                {(summaryData.strengths || []).map((strength, index) => (
                  <li key={index}>{strength}</li>
                ))}
              </ul>
            </div>

            {/* Improvement Areas */}
            <div className="insights-card improvements">
              <div className="insights-header">
                <div className="insights-icon">⚠️</div>
                <h3>Key Areas for Improvement</h3>
              </div>
              <ul className="insights-list">
                {(summaryData.improvement_areas || []).map((area, index) => (
                  <li key={index}>{area}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* Priority Focus */}
        {summaryData.priority_focus && (
          <div className="priority-focus-section">
            <div className="priority-card">
              <div className="priority-header">
                <div className="priority-icon">🎯</div>
                <h3>Priority Focus Area</h3>
              </div>
              <p className="priority-text">{summaryData.priority_focus}</p>
            </div>
          </div>
        )}

        {/* AI Recommendations */}
        <div className="recommendations-section">
          <div className="recommendations-header">
            <h2>AI-Powered Recommendations</h2>
            <p>Actionable next steps to enhance your analytics capabilities</p>
          </div>
          <div className="recommendations-list">
            {(summaryData.recommendations || []).map((recommendation, index) => (
              <div key={index} className="recommendation-item">
                <div className="recommendation-number">{index + 1}</div>
                <p>{recommendation}</p>
              </div>
            ))}
          </div>
          <div className="recommendations-cta">
            <button className="btn-primary">
              📋 View Full Capability Playbook
            </button>
          </div>
        </div>

        {/* Share Section */}
        <div className="share-section">
          <h3>Share with Leadership</h3>
          <div className="share-buttons">
            <button onClick={downloadPDF} className="btn-secondary">
              📄 Download as PDF
            </button>
            <button className="btn-secondary">
              📧 Email Summary
            </button>
            <button className="btn-secondary">
              🔗 Copy Link
            </button>
          </div>
        </div>
      </div>

      {error && (
        <div className="error-toast">
          <p>{error}</p>
          <button onClick={() => setError(null)}>×</button>
        </div>
      )}
    </div>
  );
};

export default CapabilitiesSummaryPage;
