import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import SurveyService from '../services/surveyService';
import StrategicPrioritiesSurvey from '../components/StrategicPrioritiesSurvey';
import CurrentCapabilitiesSurvey from '../components/CurrentCapabilitiesSurvey';
import DataReadinessSurvey from '../components/DataReadinessSurvey';
import OpportunityAssessmentResults from '../components/OpportunityAssessmentResults';
import ComprehensiveStrategySummary from '../components/ComprehensiveStrategySummary';
import UnifiedSummaryModal from '../components/UnifiedSummaryModal';

// This is the main page component for configuring client settings and surveys.
const ClientConfiguratorPage = () => {
  // Extract the client ID from the URL parameters
  const { clientId } = useParams();
  
  // State for managing the active tab ('inputs' or 'results')
  const [activeTab, setActiveTab] = useState('inputs');
  
  // State variables to control the visibility of survey-specific modals
  const [showStrategicPrioritiesSurvey, setShowStrategicPrioritiesSurvey] = useState(false);
  const [showCurrentCapabilitiesSurvey, setShowCurrentCapabilitiesSurvey] = useState(false);
  const [showDataReadinessSurvey, setShowDataReadinessSurvey] = useState(false);
  
  // State variables for the unified summary modal
  const [showSummaryModal, setShowSummaryModal] = useState(false);
  const [currentSummaryType, setCurrentSummaryType] = useState(null);
  const [currentSummaryTitle, setCurrentSummaryTitle] = useState('');
  
  // State variables to hold the survey response data
  const [strategicPrioritiesResponses, setStrategicPrioritiesResponses] = useState({});
  const [dataAnalyticsResponses, setDataAnalyticsResponses] = useState({});
  const [dataReadinessResponses, setDataReadinessResponses] = useState({});
  
  // State variables to track the completion status and progress of each survey
  const [strategicPrioritiesCompletionStatus, setStrategicPrioritiesCompletionStatus] = useState({ completed: false });
  const [dataAnalyticsCompletionStatus, setDataAnalyticsCompletionStatus] = useState({ completed: false });
  const [dataReadinessCompletionStatus, setDataReadinessCompletionStatus] = useState({ completed: false });
  
  // State variables to track the existence of generated summaries
  const [hasStrategySummary, setHasStrategySummary] = useState(false);
  const [hasCapabilitiesSummary, setHasCapabilitiesSummary] = useState(false);
  const [hasReadinessSummary, setHasReadinessSummary] = useState(false);
  
  // State variables related to the comprehensive strategy summary
  const [summaryData, setSummaryData] = useState(null);
  const [isGeneratingSummary, setIsGeneratingSummary] = useState(false);
  const [summaryError, setSummaryError] = useState(null);
  const [activeSection, setActiveSection] = useState('executive-summary');
  const [showGenerateModal, setShowGenerateModal] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(null);
  
  // General UI state variables
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // User profile object, using the client ID from the URL
  const userProfile = {
    client_id: clientId || '101',
    name: 'Jamie Reynolds',
    role: 'Director of Informatics'
  };

  /**
   * useEffect hook to load client data on component mount or when clientId changes.
   */
  useEffect(() => {
    loadClientData();
  }, [clientId]);
  
  /**
   * Helper function to calculate the progress of a survey.
   * @param {object} responses - The survey response object.
   * @param {string} surveyType - The type of survey ('strategy', 'capabilities', 'readiness').
   * @returns {object} - An object containing progress details.
   */
  const calculateSurveyProgress = (responses, surveyType) => {
    const questionCounts = {
      strategy: 9,
      capabilities: 14,
      readiness: 14
    };

    const totalQuestions = questionCounts[surveyType] || 9;
    const validResponses = Object.values(responses || {}).filter(response => 
      response && response.toString().trim() !== ''
    ).length;
    
    let status, statusColor, progressBarColor;
    
    if (validResponses === 0) {
      status = 'Not Started';
      statusColor = '#64748b'; // Gray
      progressBarColor = '#e2e8f0'; // Light gray
    } else if (validResponses < totalQuestions) {
      status = 'In Progress';
      statusColor = '#64748b'; // Gray  
      progressBarColor = '#F97316'; // DVA brand orange
    } else {
      status = 'Completed';
      statusColor = '#166534'; // Green
      progressBarColor = '#10b981'; // Green
    }

    return {
      completed: validResponses,
      total: totalQuestions,
      percentage: Math.round((validResponses / totalQuestions) * 100),
      status: status,
      statusColor: statusColor,
      progressBarColor: progressBarColor,
      displayText: `${validResponses}/${totalQuestions} ${status}`
    };
  };

  /**
   * Async function to load all client data from the backend.
   */
  const loadClientData = async () => {
    try {
      setLoading(true);
      setError(null);

      const [
        strategicResponses,
        analyticsResponses, 
        readinessResponses
      ] = await Promise.all([
        SurveyService.loadStrategyResponses(userProfile.client_id).catch(() => ({ responses: {}, completed: false })),
        SurveyService.loadCapabilitiesResponses(userProfile.client_id).catch(() => ({ responses: {}, completed: false })),
        SurveyService.loadReadinessResponses(userProfile.client_id).catch(() => ({ responses: {}, completed: false }))
      ]);

      // Update state with the fetched responses
      setStrategicPrioritiesResponses(strategicResponses.responses || {});
      setDataAnalyticsResponses(analyticsResponses.responses || {});
      setDataReadinessResponses(readinessResponses.responses || {});

      // Calculate and set the progress status for each survey
      const strategicProgress = calculateSurveyProgress(strategicResponses.responses, 'strategy');
      const analyticsProgress = calculateSurveyProgress(analyticsResponses.responses, 'capabilities');
      const readinessProgress = calculateSurveyProgress(readinessResponses.responses, 'readiness');
      
      setStrategicPrioritiesCompletionStatus({ 
        completed: strategicProgress.completed === strategicProgress.total,
        progress: strategicProgress
      });
      setDataAnalyticsCompletionStatus({ 
        completed: analyticsProgress.completed === analyticsProgress.total,
        progress: analyticsProgress
      });
      setDataReadinessCompletionStatus({ 
        completed: readinessProgress.completed === readinessProgress.total,
        progress: readinessProgress
      });

      // Check for and update the existence of summaries
      const [strategySummary, capabilitiesSummary, readinessSummary] = await Promise.all([
        SurveyService.getSummary(userProfile.client_id, 'strategy').catch(() => null),
        SurveyService.getSummary(userProfile.client_id, 'capabilities').catch(() => null),
        SurveyService.getSummary(userProfile.client_id, 'readiness').catch(() => null)
      ]);
      
      setHasStrategySummary(!!(strategySummary?.summary));
      setHasCapabilitiesSummary(!!(capabilitiesSummary?.summary));
      setHasReadinessSummary(!!(readinessSummary?.summary));
    } catch (err) {
      console.error('Error loading client data:', err);
      setError('Unable to load client data. Check backend connectivity.');
    } finally {
      setLoading(false);
    }
  };

  /**
   * Handles displaying a summary modal.
   * @param {string} type - The type of summary to display.
   * @param {string} title - The title for the summary modal.
   */
  const handleViewSummary = (type, title) => {
    // Set all related state variables at once.
    // React will batch these into a single re-render, ensuring the modal
    // opens correctly with the right content.
    setCurrentSummaryType(type);
    setCurrentSummaryTitle(title);
    setShowSummaryModal(true);
  };
  
  /**
   * Helper function to render a single survey card. This modularizes the
   * repetitive JSX from the original file.
   * @param {object} props - Properties for the card.
   * @param {boolean} props.hasSummary - New prop to check if a summary exists.
   */
  const renderSurveyCard = ({ title, description, status, progress, onClick, onViewSummaryClick, hasSummary }) => {
    // The "View Summary" button is only shown if the survey is completed AND a summary exists.
    const showSummaryButton = status === "Completed" && hasSummary;
    
    // Determine status badge colors and text
    let badgeBg = '#F8FAFC';
    let badgeColor = '#64748b';
    let badgeBorder = '1px solid #e2e8f0';
    let badgeText = '○ Not Started';
    
    if (status === "Completed") {
      badgeBg = '#D1FAE5';
      badgeColor = '#065F46';
      badgeBorder = '1px solid #A7F3D0';
      badgeText = '✓ Complete';
    } else if (status === "In Progress") {
      badgeBg = '#FED7AA';
      badgeColor = '#EA580C';
      badgeBorder = '1px solid #FDBA74';
      badgeText = '◐ In Progress';
    }
    
    return (
      <div 
        style={{
          background: 'white',
          borderRadius: '12px',
          padding: '1.25rem',
          minHeight: '200px',
          display: 'flex',
          flexDirection: 'column',
          border: '1px solid #e5e7eb',
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)',
          transition: 'all 0.15s ease',
          cursor: 'pointer'
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = 'translateY(-2px)';
          e.currentTarget.style.boxShadow = '0 8px 25px rgba(0, 0, 0, 0.15)';
          e.currentTarget.style.borderColor = '#18365E';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = 'translateY(0)';
          e.currentTarget.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.08)';
          e.currentTarget.style.borderColor = '#e5e7eb';
        }}
      >
        {/* Header with Status Badge */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
          <h3 style={{
            color: '#18365E',
            fontFamily: 'Montserrat, system-ui, sans-serif',
            fontSize: '16px',
            fontWeight: '600',
            margin: 0,
            lineHeight: '1.4'
          }}>
            {title}
          </h3>
          <span style={{
            background: badgeBg,
            color: badgeColor,
            fontSize: '12px',
            fontWeight: '600',
            padding: '0.375rem 0.75rem',
            borderRadius: '20px',
            border: badgeBorder,
            whiteSpace: 'nowrap'
          }}>
            {badgeText}
          </span>
        </div>
        
        {/* Content Area - Flex Grow */}
        <div style={{ flex: 1, marginBottom: '1.5rem' }}>
          <p style={{
            color: '#64748b',
            fontSize: '15px',
            lineHeight: '1.6',
            margin: '0 0 1rem 0'
          }}>
            {description}
          </p>
        </div>

        {/* Bottom Section - Progress & Buttons */}
        <div style={{ marginTop: 'auto' }}>
          {/* Progress Section */}
          <div style={{ marginBottom: '1rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
              <span style={{
                fontSize: '12px',
                fontWeight: '500',
                color: '#64748b',
                fontFamily: 'Montserrat, system-ui, sans-serif'
              }}>Progress</span>
              <span style={{
                fontSize: '12px',
                fontWeight: '600',
                color: progress?.statusColor || '#64748b',
                fontFamily: 'Montserrat, system-ui, sans-serif'
              }}>
                {progress?.displayText || '0/9 Not Started'}
              </span>
            </div>
            <div style={{
              background: '#f1f5f9',
              borderRadius: '6px',
              height: '8px',
              overflow: 'hidden'
            }}>
              <div style={{
                background: progress?.progressBarColor || '#e2e8f0',
                height: '100%',
                width: `${progress?.percentage || 0}%`,
                borderRadius: '6px',
                transition: 'width 0.3s ease, background 0.3s ease'
              }} />
            </div>
          </div>
          
          {/* Survey Action Buttons */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', width: '100%' }}>
            <button
              onClick={onClick}
              style={{
                background: '#18365E',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                padding: '0.75rem 1.5rem',
                fontSize: '14px',
                fontWeight: '600',
                cursor: 'pointer',
                fontFamily: 'Montserrat, system-ui, sans-serif',
                width: '100%',
                transition: 'all 0.2s ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = '#1e40af';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = '#18365E';
              }}
            >
              {status === "Not Started" ? "Start Survey" : "Edit Survey"}
            </button>
            
            {/* View Summary Button is only shown if the survey is completed and a summary exists */}
            {showSummaryButton && (
              <button
                type="button"
                onClick={(e) => {
                  // This is a best practice to prevent the event from bubbling up
                  // and potentially conflicting with the parent div's hover effects.
                  e.stopPropagation();
                  onViewSummaryClick();
                }}
                style={{
                  background: '#FF6E4C',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  padding: '0.5rem 1.5rem',
                  fontSize: '13px',
                  fontWeight: '500',
                  cursor: 'pointer',
                  fontFamily: 'Montserrat, system-ui, sans-serif',
                  width: '100%',
                  transition: 'all 0.2s ease'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = '#E55A3C';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = '#FF6E4C';
                }}
              >
                📄 View Summary
              </button>
            )}
          </div>
        </div>
      </div>
    );
  };

  /**
   * Modularized function to render the Survey Cards section.
   */
  const renderSurveyCardsGrid = () => (
    <div style={{
      display: 'grid',
      gridTemplateColumns: '1fr 1fr 1fr',
      gap: '1.5rem'
    }}>
      {/* Render Strategic Priorities Survey Card */}
      {renderSurveyCard({
        title: 'Strategic Priorities',
        description: 'Assess organizational strategy, innovation posture, and investment priorities.',
        status: strategicPrioritiesCompletionStatus.progress?.status,
        progress: strategicPrioritiesCompletionStatus.progress,
        onClick: () => setShowStrategicPrioritiesSurvey(true),
        onViewSummaryClick: () => handleViewSummary('strategy', 'Strategic Priorities Summary'),
        hasSummary: hasStrategySummary // Pass the new prop here
      })}

      {/* Render Data & Analytics Capabilities Survey Card */}
      {renderSurveyCard({
        title: 'Data & Analytics Capabilities',
        description: 'Evaluate current data infrastructure, analytics maturity, and technical capabilities.',
        status: dataAnalyticsCompletionStatus.progress?.status,
        progress: dataAnalyticsCompletionStatus.progress,
        onClick: () => setShowCurrentCapabilitiesSurvey(true),
        onViewSummaryClick: () => handleViewSummary('capabilities', 'Data & Analytics Capabilities Summary'),
        hasSummary: hasCapabilitiesSummary // Pass the new prop here
      })}

      {/* Render Data Readiness & Governance Survey Card */}
      {renderSurveyCard({
        title: 'Data Readiness & Governance',
        description: 'Assess data governance, security frameworks, and organizational readiness.',
        status: dataReadinessCompletionStatus.progress?.status,
        progress: dataReadinessCompletionStatus.progress,
        onClick: () => setShowDataReadinessSurvey(true),
        onViewSummaryClick: () => handleViewSummary('readiness', 'Data Readiness & Governance Summary'),
        hasSummary: hasReadinessSummary // Pass the new prop here
      })}
    </div>
  );

  /**
   * Renders the main content for the 'Data Inputs' tab.
   */
  const renderDataInputsTab = () => {
    return (
      <div style={{ padding: '1rem 3rem' }}>
        {/* Main Layout: Survey Cards + Document Upload */}
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: '2fr 1fr', 
          gap: '1.5rem',
          marginTop: '1rem',
          marginBottom: '1rem',
          alignItems: 'start'
        }}>
          {/* Left: Survey Cards Section */}
          <div>
            {/* Section Header */}
            <div style={{
              textAlign: 'center',
              marginBottom: '0.5rem',
              marginTop: '0.25rem',
              position: 'relative'
            }}>
              {/* Background Band */}
              <div style={{
                position: 'absolute',
                top: '50%',
                left: '-2rem',
                right: '-2rem',
                height: '40px',
                background: 'linear-gradient(90deg, rgba(248, 250, 252, 0) 0%, rgba(248, 250, 252, 0.8) 20%, rgba(248, 250, 252, 1) 50%, rgba(248, 250, 252, 0.8) 80%, rgba(248, 250, 252, 0) 100%)',
                transform: 'translateY(-50%)',
                zIndex: 0
              }} />
              <h2 style={{
                color: '#64748b',
                fontFamily: 'Montserrat, system-ui, sans-serif',
                fontSize: '11px',
                fontWeight: '500',
                letterSpacing: '0.15em',
                textTransform: 'uppercase',
                margin: '0',
                position: 'relative',
                zIndex: 1,
                background: 'white',
                padding: '0.375rem 1.25rem',
                display: 'inline-block'
              }}>
                Strategic Assessment Surveys
              </h2>
            </div>
            
            {/* The new modularized survey cards grid */}
            {renderSurveyCardsGrid()}
          </div>
          
          {/* Right: Document Upload Section - placeholder from original */}
          <div style={{
            background: 'white',
            border: '1px solid #e5e7eb',
            borderRadius: '12px',
            padding: '1.25rem',
            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)',
            minHeight: '300px'
          }}>
            <h3 style={{
              color: '#18365E',
              fontFamily: 'Montserrat, system-ui, sans-serif',
              fontSize: '16px',
              fontWeight: '600',
              margin: '0 0 1rem 0'
            }}>
              Document Upload
            </h3>
            <p style={{ color: '#64748b' }}>
              Drag and drop documents here to analyze them and integrate into the summary.
            </p>
          </div>
        </div>
      </div>
    );
  };
  
  /**
   * Placeholder function for the 'Opportunity Assessment' tab.
   */
  const renderResultsTab = () => {
    return (
      <div style={{ padding: '2rem 3rem' }}>
        <OpportunityAssessmentResults />
        {/* The ComprehensiveStrategySummary component is rendered here.
            We pass the necessary props to it. */}
        <ComprehensiveStrategySummary 
          summaryData={summaryData}
          isGeneratingSummary={isGeneratingSummary}
          summaryError={summaryError}
          userProfile={userProfile}
          lastUpdated={lastUpdated}
          hasStrategySummary={hasStrategySummary}
          hasCapabilitiesSummary={hasCapabilitiesSummary}
          hasReadinessSummary={hasReadinessSummary}
          // The following handlers are placeholders for now
          onGenerateSummary={() => console.log('Generate summary clicked')}
          onViewSummary={() => console.log('View summary clicked')}
        />
      </div>
    );
  };

  /**
   * The main component return statement.
   * Renders the tabbed interface and the modals based on state.
   */
  return (
    <div style={{ fontFamily: 'Montserrat, system-ui, sans-serif', background: '#f8fafc', minHeight: '100vh', color: '#1f2937' }}>
      {/* Top Header Section */}
      <header style={{ padding: '2rem 3rem', borderBottom: '1px solid #e5e7eb', background: 'white' }}>
        <h1 style={{
          color: '#18365E',
          fontSize: '28px',
          fontWeight: '700',
          margin: 0
        }}>
          Client Configurator
        </h1>
        <p style={{
          color: '#6b7280',
          fontSize: '15px',
          margin: '0.5rem 0 0 0'
        }}>
          Tailor and assess a client's strategic priorities, capabilities, and data readiness.
        </p>
      </header>

      {/* Tabs Navigation */}
      <nav style={{ padding: '0 3rem', borderBottom: '1px solid #e5e7eb' }}>
        <ul style={{ display: 'flex', margin: 0, padding: 0, listStyle: 'none' }}>
          <li
            onClick={() => setActiveTab('inputs')}
            style={{
              padding: '1rem 1.5rem',
              cursor: 'pointer',
              fontWeight: activeTab === 'inputs' ? '600' : '500',
              borderBottom: activeTab === 'inputs' ? '2px solid #18365E' : '2px solid transparent',
              color: activeTab === 'inputs' ? '#18365E' : '#6b7280',
              transition: 'all 0.2s ease'
            }}
          >
            Data Inputs
          </li>
          <li
            onClick={() => setActiveTab('results')}
            style={{
              padding: '1rem 1.5rem',
              cursor: 'pointer',
              fontWeight: activeTab === 'results' ? '600' : '500',
              borderBottom: activeTab === 'results' ? '2px solid #18365E' : '2px solid transparent',
              color: activeTab === 'results' ? '#18365E' : '#6b7280',
              transition: 'all 0.2s ease'
            }}
          >
            Opportunity Assessment
          </li>
        </ul>
      </nav>

      {/* Main Content Area */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '5rem', color: '#64748b' }}>
          Loading client data...
        </div>
      ) : error ? (
        <div style={{ textAlign: 'center', padding: '5rem', color: '#ef4444' }}>
          Error: {error}
        </div>
      ) : (
        <>
          {activeTab === 'inputs' && renderDataInputsTab()}
          {activeTab === 'results' && renderResultsTab()}
        </>
      )}

      {/* Modals - These are tied to local state and are kept inline */}
      {showStrategicPrioritiesSurvey && (
        <StrategicPrioritiesSurvey
          clientId={userProfile.client_id}
          responses={strategicPrioritiesResponses}
          onClose={() => {
            setShowStrategicPrioritiesSurvey(false);
            loadClientData();
          }}
        />
      )}

      {showCurrentCapabilitiesSurvey && (
        <CurrentCapabilitiesSurvey
          clientId={userProfile.client_id}
          responses={dataAnalyticsResponses}
          onClose={() => {
            setShowCurrentCapabilitiesSurvey(false);
            loadClientData();
          }}
        />
      )}

      {showDataReadinessSurvey && (
        <DataReadinessSurvey
          clientId={userProfile.client_id}
          responses={dataReadinessResponses}
          onClose={() => {
            setShowDataReadinessSurvey(false);
            loadClientData();
          }}
        />
      )}

      {showSummaryModal && (
        <UnifiedSummaryModal
          isOpen={showSummaryModal}
          summaryType={currentSummaryType}
          title={currentSummaryTitle}
          onClose={() => setShowSummaryModal(false)}
        />
      )}
    </div>
  );
};

export default ClientConfiguratorPage;
