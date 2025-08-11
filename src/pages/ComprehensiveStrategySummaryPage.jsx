import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import html2pdf from 'html2pdf.js';
import SurveyService from '../services/surveyService';
import './ComprehensiveStrategySummaryPage.css';

const ComprehensiveStrategySummaryPage = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('strategy');
  const [summaries, setSummaries] = useState({
    strategy: null,
    capabilities: null,
    readiness: null,
    integrated: null
  });
  const [loading, setLoading] = useState({
    strategy: false,
    capabilities: false,
    readiness: false,
    integrated: false
  });
  const [completionStatus, setCompletionStatus] = useState({
    strategy: false,
    capabilities: false,
    readiness: false
  });
  const [error, setError] = useState(null);
  const [toastMessage, setToastMessage] = useState('');

  const mockClientId = 101; // Replace with actual client ID from context

  useEffect(() => {
    checkCompletionStatus();
    loadAllSummaries();
  }, []);

  const checkCompletionStatus = async () => {
    try {
      const [strategyStatus, capabilitiesStatus, readinessStatus] = await Promise.all([
        SurveyService.getSurveyCompletionStatus(mockClientId),
        SurveyService.getCapabilitiesCompletionStatus(mockClientId),
        SurveyService.getReadinessCompletionStatus(mockClientId)
      ]);

      setCompletionStatus({
        strategy: strategyStatus?.completed || false,
        capabilities: capabilitiesStatus?.completed || false,
        readiness: readinessStatus?.completed || false
      });
    } catch (err) {
      console.error('Failed to check completion status:', err);
    }
  };

  const loadAllSummaries = async () => {
    // Load existing summaries
    try {
      const [strategySummary, capabilitiesSummary] = await Promise.all([
        SurveyService.getStrategySummary(mockClientId).catch(() => null),
        SurveyService.getCapabilitiesSummary(mockClientId).catch(() => null)
      ]);

      setSummaries(prev => ({
        ...prev,
        strategy: strategySummary?.summary_data || strategySummary,
        capabilities: capabilitiesSummary?.summary_data || capabilitiesSummary
      }));
    } catch (err) {
      console.error('Failed to load summaries:', err);
    }
  };

  const generateSummary = async (summaryType) => {
    try {
      setLoading(prev => ({ ...prev, [summaryType]: true }));
      setError(null);

      let result;
      switch (summaryType) {
        case 'strategy':
          result = await SurveyService.generateStrategySummary(mockClientId);
          break;
        case 'capabilities':
          result = await SurveyService.generateCapabilitiesSummary(mockClientId);
          break;
        case 'readiness':
          // Implement readiness summary generation when available
          throw new Error('Readiness summary generation not yet implemented');
        case 'integrated':
          // Implement integrated summary generation when available
          throw new Error('Integrated summary generation not yet implemented');
        default:
          throw new Error('Invalid summary type');
      }

      setSummaries(prev => ({
        ...prev,
        [summaryType]: result.summary_data || result
      }));

      showToast(`${summaryType.charAt(0).toUpperCase() + summaryType.slice(1)} summary generated successfully!`);
    } catch (err) {
      console.error(`Failed to generate ${summaryType} summary:`, err);
      setError(`Failed to generate ${summaryType} summary: ${err.message}`);
    } finally {
      setLoading(prev => ({ ...prev, [summaryType]: false }));
    }
  };

  const downloadPDF = (summaryType) => {
    const element = document.getElementById(`${summaryType}-summary-content`);
    if (!element) return;

    const opt = {
      margin: 1,
      filename: `DVA-${summaryType.charAt(0).toUpperCase() + summaryType.slice(1)}-Summary.pdf`,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2 },
      jsPDF: { unit: 'in', format: 'letter', orientation: 'portrait' }
    };

    html2pdf().set(opt).from(element).save();
    showToast('PDF download started!');
  };

  const copyToClipboard = async (summaryType) => {
    const summary = summaries[summaryType];
    if (!summary) return;

    let textContent = '';
    if (summaryType === 'strategy') {
      textContent = summary.summary_text || summary.executive_summary || 'No summary available';
    } else if (summaryType === 'capabilities') {
      textContent = summary.executive_summary || 'No summary available';
    }

    try {
      await navigator.clipboard.writeText(textContent);
      showToast('Summary copied to clipboard!');
    } catch (err) {
      console.error('Failed to copy to clipboard:', err);
      showToast('Failed to copy to clipboard');
    }
  };

  const shareWithLeadership = (summaryType) => {
    // Implement sharing functionality (email, link generation, etc.)
    showToast('Sharing functionality will be implemented soon!');
  };

  const showToast = (message) => {
    setToastMessage(message);
    setTimeout(() => setToastMessage(''), 3000);
  };

  const getCompletedCount = () => {
    return Object.values(completionStatus).filter(Boolean).length;
  };

  const isIntegratedUnlocked = () => {
    return completionStatus.strategy && completionStatus.capabilities && completionStatus.readiness;
  };

  const renderTabButton = (tabKey, label, isLocked = false) => (
    <button
      key={tabKey}
      className={`tab-button ${activeTab === tabKey ? 'active' : ''} ${isLocked ? 'locked' : ''}`}
      onClick={() => !isLocked && setActiveTab(tabKey)}
      disabled={isLocked}
    >
      {label}
      {isLocked && <span className="lock-icon">🔒</span>}
      {summaries[tabKey] && !isLocked && <span className="new-badge">NEW</span>}
    </button>
  );

  const renderStrategySummary = () => {
    const summary = summaries.strategy;
    
    if (!completionStatus.strategy) {
      return (
        <div className="summary-placeholder">
          <h3>Strategy Survey Required</h3>
          <p>Complete the Strategic Priorities Survey to generate your strategy summary.</p>
          <button onClick={() => navigate('/client-data-input')} className="btn-primary">
            Complete Strategy Survey
          </button>
        </div>
      );
    }

    if (!summary) {
      return (
        <div className="summary-placeholder">
          <h3>Generate Strategy Summary</h3>
          <p>Your Strategic Priorities Survey is complete. Generate your AI-powered strategy summary.</p>
          <button 
            onClick={() => generateSummary('strategy')} 
            className="btn-primary"
            disabled={loading.strategy}
          >
            {loading.strategy ? 'Generating...' : 'Generate Strategy Summary'}
          </button>
        </div>
      );
    }

    return (
      <div id="strategy-summary-content" className="summary-content">
        <div className="executive-summary-card">
          <div className="card-header">
            <div className="card-icon">🎯</div>
            <div>
              <h2>Strategic Priorities Summary</h2>
              <p className="timestamp">Last updated: {new Date().toLocaleDateString()}</p>
            </div>
          </div>
          <div className="summary-text">
            {summary.summary_text || summary.executive_summary || 'No summary available'}
          </div>
        </div>

        {summary.key_insights && (
          <div className="highlights-section">
            <div className="highlights-grid">
              <div className="highlight-card strengths">
                <h3>🌟 Strategic Strengths</h3>
                <ul>
                  {summary.key_insights.slice(0, 3).map((insight, index) => (
                    <li key={index}>{insight}</li>
                  ))}
                </ul>
              </div>
              <div className="highlight-card gaps">
                <h3>⚠️ Key Focus Areas</h3>
                <ul>
                  {summary.recommendations?.slice(0, 3).map((rec, index) => (
                    <li key={index}>{rec}</li>
                  )) || ['Focus areas will be identified in the summary']}
                </ul>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  const renderCapabilitiesSummary = () => {
    const summary = summaries.capabilities;
    
    if (!completionStatus.capabilities) {
      return (
        <div className="summary-placeholder">
          <h3>Capabilities Survey Required</h3>
          <p>Complete the Data Analytics Capabilities Survey to generate your capabilities summary.</p>
          <button onClick={() => navigate('/client-data-input')} className="btn-primary">
            Complete Capabilities Survey
          </button>
        </div>
      );
    }

    if (!summary) {
      return (
        <div className="summary-placeholder">
          <h3>Generate Capabilities Summary</h3>
          <p>Your Data Analytics Capabilities Survey is complete. Generate your AI-powered capabilities summary.</p>
          <button 
            onClick={() => generateSummary('capabilities')} 
            className="btn-primary"
            disabled={loading.capabilities}
          >
            {loading.capabilities ? 'Generating...' : 'Generate Capabilities Summary'}
          </button>
        </div>
      );
    }

    return (
      <div id="capabilities-summary-content" className="summary-content">
        <div className="executive-summary-card">
          <div className="card-header">
            <div className="card-icon">📊</div>
            <div>
              <h2>Capabilities Assessment Summary</h2>
              <p className="timestamp">Last updated: {new Date().toLocaleDateString()}</p>
            </div>
          </div>
          <div className="summary-text">
            {summary.executive_summary || 'No summary available'}
          </div>
          {summary.overall_maturity && (
            <div className="maturity-badge">
              <span className="maturity-label">Overall Maturity:</span>
              <span className={`maturity-level ${summary.overall_maturity.toLowerCase()}`}>
                {summary.overall_maturity}
              </span>
            </div>
          )}
        </div>

        {(summary.strengths || summary.improvement_areas) && (
          <div className="highlights-section">
            <div className="highlights-grid">
              <div className="highlight-card strengths">
                <h3>✅ Top Strengths</h3>
                <ul>
                  {(summary.strengths || []).map((strength, index) => (
                    <li key={index}>{strength}</li>
                  ))}
                </ul>
              </div>
              <div className="highlight-card gaps">
                <h3>🔧 Improvement Areas</h3>
                <ul>
                  {(summary.improvement_areas || []).map((area, index) => (
                    <li key={index}>{area}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  const renderReadinessSummary = () => {
    return (
      <div className="summary-placeholder">
        <h3>Readiness Summary</h3>
        <p>Data Readiness & Governance summary generation will be available soon.</p>
        <button className="btn-secondary" disabled>
          Coming Soon
        </button>
      </div>
    );
  };

  const renderIntegratedSummary = () => {
    if (!isIntegratedUnlocked()) {
      return (
        <div className="summary-placeholder locked">
          <div className="lock-icon-large">🔒</div>
          <h3>Integrated Strategy Summary</h3>
          <p>Complete all three surveys to unlock your comprehensive integrated strategy summary.</p>
          <div className="completion-progress">
            <p>{getCompletedCount()} of 3 surveys completed</p>
            <div className="progress-indicators">
              <span className={completionStatus.strategy ? 'complete' : 'incomplete'}>Strategy</span>
              <span className={completionStatus.capabilities ? 'complete' : 'incomplete'}>Capabilities</span>
              <span className={completionStatus.readiness ? 'complete' : 'incomplete'}>Readiness</span>
            </div>
          </div>
        </div>
      );
    }

    return (
      <div className="summary-placeholder">
        <h3>Generate Integrated Summary</h3>
        <p>All surveys are complete! Generate your comprehensive integrated strategy summary.</p>
        <button 
          onClick={() => generateSummary('integrated')} 
          className="btn-primary"
          disabled={loading.integrated}
        >
          {loading.integrated ? 'Generating...' : 'Generate Integrated Summary'}
        </button>
      </div>
    );
  };

  const renderSummaryContent = () => {
    switch (activeTab) {
      case 'strategy':
        return renderStrategySummary();
      case 'capabilities':
        return renderCapabilitiesSummary();
      case 'readiness':
        return renderReadinessSummary();
      case 'integrated':
        return renderIntegratedSummary();
      default:
        return null;
    }
  };

  const renderActionsBar = () => {
    const currentSummary = summaries[activeTab];
    if (!currentSummary || activeTab === 'integrated') return null;

    return (
      <div className="actions-bar">
        <button onClick={() => downloadPDF(activeTab)} className="btn-secondary">
          📄 Download PDF
        </button>
        <button onClick={() => copyToClipboard(activeTab)} className="btn-secondary">
          📋 Copy to Clipboard
        </button>
        <button onClick={() => shareWithLeadership(activeTab)} className="btn-secondary">
          📧 Share with Leadership
        </button>
      </div>
    );
  };

  return (
    <div className="comprehensive-strategy-summary-page">
      {/* Header */}
      <div className="page-header">
        <button onClick={() => navigate('/client-data-input')} className="back-button">
          ← Back to Data Inputs
        </button>
        <div className="header-content">
          <h1>Strategy Summary</h1>
          <p className="subtitle">LLM-generated summaries based on your organization's strategic inputs</p>
          <div className="progress-display">
            <span className="progress-text">{getCompletedCount()} of 4 summaries generated</span>
            <div className="progress-indicators">
              <span className={`indicator ${summaries.strategy ? 'complete' : 'incomplete'}`}>
                {summaries.strategy ? '✔️' : '⏳'} Strategy
              </span>
              <span className={`indicator ${summaries.capabilities ? 'complete' : 'incomplete'}`}>
                {summaries.capabilities ? '✔️' : '⏳'} Capabilities
              </span>
              <span className={`indicator ${summaries.readiness ? 'complete' : 'incomplete'}`}>
                {summaries.readiness ? '✔️' : '⏳'} Readiness
              </span>
              <span className={`indicator ${summaries.integrated ? 'complete' : isIntegratedUnlocked() ? 'available' : 'locked'}`}>
                {summaries.integrated ? '✔️' : isIntegratedUnlocked() ? '🔓' : '🔒'} Integrated Summary
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="tab-navigation">
        {renderTabButton('strategy', 'Strategy Summary')}
        {renderTabButton('capabilities', 'Capabilities Summary')}
        {renderTabButton('readiness', 'Readiness Summary')}
        {renderTabButton('integrated', 'Integrated Strategy', !isIntegratedUnlocked())}
      </div>

      {/* Summary Content */}
      <div className="summary-container">
        {renderSummaryContent()}
        {renderActionsBar()}
      </div>

      {/* Error Display */}
      {error && (
        <div className="error-toast">
          <p>{error}</p>
          <button onClick={() => setError(null)}>×</button>
        </div>
      )}

      {/* Toast Messages */}
      {toastMessage && (
        <div className="toast-message">
          <p>{toastMessage}</p>
        </div>
      )}
    </div>
  );
};

export default ComprehensiveStrategySummaryPage;
