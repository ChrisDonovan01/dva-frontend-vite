// src/pages/HomePage.jsx
import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import ProgressStepper from '../components/ProgressStepper';
import StrategicPrioritiesSurveyWrapper from '../components/StrategicPrioritiesSurveyWrapper';
import CurrentCapabilitiesSurveyWrapper from '../components/CurrentCapabilitiesSurveyWrapper';
import DataReadinessSurveyWrapper from '../components/DataReadinessSurveyWrapper';
import OpportunityAssessmentResults from '../components/OpportunityAssessmentResults';
import UnifiedSummaryModal from '../components/UnifiedSummaryModal';
import NetworkStatusBanner from '../components/NetworkStatusBanner';  // ADD THIS IMPORT
import SurveyService from '../services/surveyService';
import useSummary from '../hooks/useSummary';

// Normalize progress data helper functions
const toAnswered = (val) => {
  if (Array.isArray(val)) return val.length;
  if (val && typeof val.answered === 'number') return val.answered;
  if (typeof val === 'number') return val;
  return 0;
};

const toTotal = (val, fallback = 0) => {
  if (Array.isArray(val)) return fallback; // legacy arrays didn't carry total
  if (val && typeof val.total === 'number') return val.total;
  return fallback;
};

const HomePage = () => {
  const { clientId = '101' } = useParams();
  
  // Tab state
  const [activeTab, setActiveTab] = useState('inputs');
  
  // Survey modal states
  const [showStrategicPrioritiesSurvey, setShowStrategicPrioritiesSurvey] = useState(false);
  const [showCurrentCapabilitiesSurvey, setShowCurrentCapabilitiesSurvey] = useState(false);
  const [showDataReadinessSurvey, setShowDataReadinessSurvey] = useState(false);
  
  // Summary modal state - using the hook
  const [currentSummaryType, setCurrentSummaryType] = useState(null);
  const [currentSummaryTitle, setCurrentSummaryTitle] = useState('');
  
  // Survey data states
  const [strategicPrioritiesResponses, setStrategicPrioritiesResponses] = useState({});
  const [dataAnalyticsResponses, setDataAnalyticsResponses] = useState({});
  const [dataReadinessResponses, setDataReadinessResponses] = useState({});
  
  // Progress count states
  const [strategyProgressCount, setStrategyProgressCount] = useState(0);
  const [capabilitiesProgressCount, setCapabilitiesProgressCount] = useState(0);
  const [readinessProgressCount, setReadinessProgressCount] = useState(0);
  
  // Completion status states
  const [strategicPrioritiesCompletionStatus, setStrategicPrioritiesCompletionStatus] = useState({ completed: false });
  const [dataAnalyticsCompletionStatus, setDataAnalyticsCompletionStatus] = useState({ completed: false });
  const [dataReadinessCompletionStatus, setDataReadinessCompletionStatus] = useState({ completed: false });
  
  // User profile
  const userProfile = {
    client_id: clientId,
    user_id: 'admin'
  };

  // Use the fixed summary hook
  const summary = useSummary({
    clientId: clientId,
    summaryType: currentSummaryType,
    userId: userProfile.user_id
  });

  // Load survey data using the new getAllProgress method
  const loadSurveyData = async () => {
    try {
      console.log('HomePage: Loading survey data for client:', clientId);
      
      // Use the consolidated getAllProgress method to get all survey progress
      const allProgress = await SurveyService.getAllProgress(clientId);
      
      // Process Strategy Survey
      const strategyCount = toAnswered(allProgress.strategy);
      const strategyTotal = toTotal(allProgress.strategy, 9);
      setStrategyProgressCount(strategyCount);
      
      // For backward compatibility, create responses object if we have progress
      if (strategyCount > 0) {
        const strategyResponses = {};
        for (let i = 1; i <= strategyCount; i++) {
          strategyResponses[`q${i}`] = true; // Placeholder response
        }
        setStrategicPrioritiesResponses(strategyResponses);
      } else {
        setStrategicPrioritiesResponses({});
      }
      
      const strategyCompleted = strategyCount >= strategyTotal;
      setStrategicPrioritiesCompletionStatus({ completed: strategyCompleted });
      console.log('HomePage: Strategy responses loaded:', strategyCount, 'responses');
      
      // Process Capabilities Survey
      const capabilitiesCount = toAnswered(allProgress.capabilities);
      const capabilitiesTotal = toTotal(allProgress.capabilities, 14);
      setCapabilitiesProgressCount(capabilitiesCount);
      
      // For backward compatibility, create responses object if we have progress
      if (capabilitiesCount > 0) {
        const capabilitiesResponses = {};
        for (let i = 1; i <= capabilitiesCount; i++) {
          capabilitiesResponses[`q${i}`] = true; // Placeholder response
        }
        setDataAnalyticsResponses(capabilitiesResponses);
      } else {
        setDataAnalyticsResponses({});
      }
      
      const capabilitiesCompleted = capabilitiesCount >= capabilitiesTotal;
      setDataAnalyticsCompletionStatus({ completed: capabilitiesCompleted });
      console.log('HomePage: Analytics responses loaded:', capabilitiesCount, 'responses');
      
      // Process Readiness Survey
      const readinessCount = toAnswered(allProgress.readiness);
      const readinessTotal = toTotal(allProgress.readiness, 14);
      setReadinessProgressCount(readinessCount);
      
      // For backward compatibility, create responses object if we have progress
      if (readinessCount > 0) {
        const readinessResponses = {};
        for (let i = 1; i <= readinessCount; i++) {
          readinessResponses[`q${i}`] = true; // Placeholder response
        }
        setDataReadinessResponses(readinessResponses);
      } else {
        setDataReadinessResponses({});
      }
      
      const readinessCompleted = readinessCount >= readinessTotal;
      setDataReadinessCompletionStatus({ completed: readinessCompleted });
      console.log('HomePage: Readiness responses loaded:', readinessCount, 'responses');
      
    } catch (error) {
      console.warn('HomePage: Error loading survey data:', error);
      
      // Set defaults on error
      setStrategyProgressCount(0);
      setCapabilitiesProgressCount(0);
      setReadinessProgressCount(0);
      setStrategicPrioritiesResponses({});
      setDataAnalyticsResponses({});
      setDataReadinessResponses({});
      setStrategicPrioritiesCompletionStatus({ completed: false });
      setDataAnalyticsCompletionStatus({ completed: false });
      setDataReadinessCompletionStatus({ completed: false });
    }
  };

  // Load data on mount and when clientId changes
  useEffect(() => {
    loadSurveyData();
  }, [clientId]);

  // Calculate progress for each survey using the new progress counts
  const getStrategicPrioritiesProgress = () => {
    return { completed: strategyProgressCount, total: 9 };
  };

  const getDataAnalyticsProgress = () => {
    return { completed: capabilitiesProgressCount, total: 14 };
  };

  const getDataReadinessProgress = () => {
    return { completed: readinessProgressCount, total: 14 };
  };

  // Handle View Summary button clicks - using the hook's openModal function
  const handleViewSummary = (type, title) => {
    console.log('🔍 handleViewSummary called:', { type, title });
    setCurrentSummaryType(type);
    setCurrentSummaryTitle(title);
    // Use the hook's openModal function
    summary.openModal(type, clientId);
  };

  return (
    <div style={{
      backgroundColor: '#f8fafc',
      minHeight: '100vh',
      margin: 0,
      padding: 0
    }}>
      {/* Network Status Banner - ADDED HERE */}
      <NetworkStatusBanner />
      
      {/* Header Section - Progress Stepper Only */}
      <div style={{
        backgroundColor: 'white',
        borderBottom: '1px solid #e5e7eb',
        padding: '0.5rem 0'
      }}>
        <div style={{
          maxWidth: '1400px',
          margin: '0',
          padding: '0 2rem'
        }}>
          <ProgressStepper 
            currentStep={activeTab === 'inputs' ? 1 : 2} 
            onStepClick={(step) => {
              if (step === 1) setActiveTab('inputs');
              if (step === 2) setActiveTab('summary');
            }}
          />
        </div>
      </div>
      
      {/* Main Content Container */}
      <div style={{
        padding: '1rem 2rem 1rem 2rem',
        maxWidth: '1400px',
        margin: '0'
      }}>

        {/* Main Content */}
        {activeTab === 'inputs' && (
          <div style={{
            backgroundColor: 'white',
            borderRadius: '12px',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
            padding: '1.5rem'
          }}>
            {/* Main Layout: Survey Cards + Document Upload */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: '2fr 1fr',
              gap: '2rem',
              alignItems: 'start'
            }}>
              {/* Survey Cards Column */}
              <div>
                {/* Survey Cards Grid */}
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(3, 1fr)',
                  gap: '1.5rem'
                }}>
                  {/* Strategic Priorities Survey Card */}
                  <div style={{
                    backgroundColor: 'white',
                    border: '1px solid #e2e8f0',
                    borderRadius: '12px',
                    padding: '1.5rem',
                    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.05)',
                    position: 'relative'
                  }}>
                    {/* Completion Badge */}
                    <div style={{
                      position: 'absolute',
                      top: '1rem',
                      right: '1rem',
                      backgroundColor: strategicPrioritiesCompletionStatus.completed ? '#D1FAE5' : '#F8FAFC',
                      color: strategicPrioritiesCompletionStatus.completed ? '#065F46' : '#64748b',
                      padding: '0.25rem 0.75rem',
                      borderRadius: '12px',
                      fontSize: '0.75rem',
                      fontWeight: '500',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.25rem'
                    }}>
                      {strategicPrioritiesCompletionStatus.completed && (
                        <span style={{ color: '#065F46' }}>✓</span>
                      )}
                      {strategicPrioritiesCompletionStatus.completed ? 'Complete' : 'Not Started'}
                    </div>

                    <h3 style={{
                      margin: '0 0 0.75rem 0',
                      fontSize: '1rem',
                      fontWeight: '600',
                      color: '#1f2937',
                      lineHeight: '1.2',
                      paddingRight: '5rem'
                    }}>
                      Strategic Priorities
                    </h3>
                    
                    <p style={{
                      margin: '0 0 1.5rem 0',
                      color: '#6b7280',
                      fontSize: '0.875rem',
                      lineHeight: '1.4'
                    }}>
                      Assess organizational strategy, innovation posture, and investment priorities.
                    </p>

                    {/* Progress */}
                    <div style={{
                      marginBottom: '1.5rem'
                    }}>
                      <div style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        marginBottom: '0.5rem'
                      }}>
                        <span style={{
                          fontSize: '0.875rem',
                          fontWeight: '500',
                          color: '#374151'
                        }}>
                          Progress
                        </span>
                        <span style={{
                          fontSize: '0.875rem',
                          fontWeight: '600',
                          color: strategicPrioritiesCompletionStatus.completed ? '#059669' : '#374151'
                        }}>
                          {getStrategicPrioritiesProgress().completed}/{getStrategicPrioritiesProgress().total} Completed
                        </span>
                      </div>
                      
                      <div style={{
                        width: '100%',
                        height: '8px',
                        backgroundColor: '#f3f4f6',
                        borderRadius: '4px',
                        overflow: 'hidden'
                      }}>
                        <div style={{
                          width: `${(getStrategicPrioritiesProgress().completed / getStrategicPrioritiesProgress().total) * 100}%`,
                          height: '100%',
                          backgroundColor: strategicPrioritiesCompletionStatus.completed ? '#059669' : '#6b7280',
                          borderRadius: '4px',
                          transition: 'width 0.3s ease'
                        }} />
                      </div>
                    </div>

                    {/* Buttons */}
                    <div style={{
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '0.75rem'
                    }}>
                      <button
                        onClick={() => setShowStrategicPrioritiesSurvey(true)}
                        style={{
                          backgroundColor: '#1f2937',
                          color: 'white',
                          border: 'none',
                          padding: '0.75rem 1rem',
                          borderRadius: '6px',
                          fontSize: '0.875rem',
                          fontWeight: '500',
                          cursor: 'pointer',
                          transition: 'all 0.2s ease',
                          width: '100%'
                        }}
                        onMouseOver={(e) => e.target.style.backgroundColor = '#111827'}
                        onMouseOut={(e) => e.target.style.backgroundColor = '#1f2937'}
                      >
                        Edit Survey
                      </button>
                      
                      {strategicPrioritiesCompletionStatus.completed && (
                        <button
                          onClick={() => {
                            console.log('Strategic View Summary clicked');
                            handleViewSummary('strategy', 'Strategic Priorities Summary');
                          }}
                          style={{
                            backgroundColor: '#ea580c',
                            color: 'white',
                            border: 'none',
                            padding: '0.75rem 1rem',
                            borderRadius: '6px',
                            fontSize: '0.875rem',
                            fontWeight: '500',
                            cursor: 'pointer',
                            transition: 'all 0.2s ease',
                            width: '100%',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '0.5rem'
                          }}
                          onMouseOver={(e) => e.target.style.backgroundColor = '#dc2626'}
                          onMouseOut={(e) => e.target.style.backgroundColor = '#ea580c'}
                        >
                          📄 View Summary
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Data & Analytics Capabilities Survey Card */}
                  <div style={{
                    backgroundColor: 'white',
                    border: '1px solid #e2e8f0',
                    borderRadius: '12px',
                    padding: '1.5rem',
                    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.05)',
                    position: 'relative'
                  }}>
                    {/* Completion Badge */}
                    <div style={{
                      position: 'absolute',
                      top: '1rem',
                      right: '1rem',
                      backgroundColor: dataAnalyticsCompletionStatus.completed ? '#D1FAE5' : '#F8FAFC',
                      color: dataAnalyticsCompletionStatus.completed ? '#065F46' : '#64748b',
                      padding: '0.25rem 0.75rem',
                      borderRadius: '12px',
                      fontSize: '0.75rem',
                      fontWeight: '500',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.25rem'
                    }}>
                      {dataAnalyticsCompletionStatus.completed && (
                        <span style={{ color: '#065F46' }}>✓</span>
                      )}
                      {dataAnalyticsCompletionStatus.completed ? 'Complete' : 'Not Started'}
                    </div>

                    <h3 style={{
                      margin: '0 0 0.75rem 0',
                      fontSize: '1rem',
                      fontWeight: '600',
                      color: '#1f2937',
                      lineHeight: '1.2',
                      paddingRight: '5rem'
                    }}>
                      Data & Analytics Capabilities
                    </h3>
                    
                    <p style={{
                      margin: '0 0 1.5rem 0',
                      color: '#6b7280',
                      fontSize: '0.875rem',
                      lineHeight: '1.4'
                    }}>
                      Evaluate current data infrastructure, analytics maturity, and technical capabilities.
                    </p>

                    {/* Progress */}
                    <div style={{
                      marginBottom: '1.5rem'
                    }}>
                      <div style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        marginBottom: '0.5rem'
                      }}>
                        <span style={{
                          fontSize: '0.875rem',
                          fontWeight: '500',
                          color: '#374151'
                        }}>
                          Progress
                        </span>
                        <span style={{
                          fontSize: '0.875rem',
                          fontWeight: '600',
                          color: dataAnalyticsCompletionStatus.completed ? '#059669' : '#374151'
                        }}>
                          {getDataAnalyticsProgress().completed}/{getDataAnalyticsProgress().total} Completed
                        </span>
                      </div>
                      
                      <div style={{
                        width: '100%',
                        height: '8px',
                        backgroundColor: '#f3f4f6',
                        borderRadius: '4px',
                        overflow: 'hidden'
                      }}>
                        <div style={{
                          width: `${(getDataAnalyticsProgress().completed / getDataAnalyticsProgress().total) * 100}%`,
                          height: '100%',
                          backgroundColor: dataAnalyticsCompletionStatus.completed ? '#059669' : '#6b7280',
                          borderRadius: '4px',
                          transition: 'width 0.3s ease'
                        }} />
                      </div>
                    </div>

                    {/* Buttons */}
                    <div style={{
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '0.75rem'
                    }}>
                      <button
                        onClick={() => setShowCurrentCapabilitiesSurvey(true)}
                        style={{
                          backgroundColor: '#1f2937',
                          color: 'white',
                          border: 'none',
                          padding: '0.75rem 1rem',
                          borderRadius: '6px',
                          fontSize: '0.875rem',
                          fontWeight: '500',
                          cursor: 'pointer',
                          transition: 'all 0.2s ease',
                          width: '100%'
                        }}
                        onMouseOver={(e) => e.target.style.backgroundColor = '#111827'}
                        onMouseOut={(e) => e.target.style.backgroundColor = '#1f2937'}
                      >
                        Edit Survey
                      </button>
                      
                      {dataAnalyticsCompletionStatus.completed && (
                        <button
                          onClick={() => {
                            console.log('Capabilities View Summary clicked');
                            handleViewSummary('capabilities', 'Data & Analytics Capabilities Summary');
                          }}
                          style={{
                            backgroundColor: '#ea580c',
                            color: 'white',
                            border: 'none',
                            padding: '0.75rem 1rem',
                            borderRadius: '6px',
                            fontSize: '0.875rem',
                            fontWeight: '500',
                            cursor: 'pointer',
                            transition: 'all 0.2s ease',
                            width: '100%',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '0.5rem'
                          }}
                          onMouseOver={(e) => e.target.style.backgroundColor = '#dc2626'}
                          onMouseOut={(e) => e.target.style.backgroundColor = '#ea580c'}
                        >
                          📄 View Summary
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Data Readiness & Governance Survey Card */}
                  <div style={{
                    backgroundColor: 'white',
                    border: '1px solid #e2e8f0',
                    borderRadius: '12px',
                    padding: '1.5rem',
                    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.05)',
                    position: 'relative'
                  }}>
                    {/* Completion Badge */}
                    <div style={{
                      position: 'absolute',
                      top: '1rem',
                      right: '1rem',
                      backgroundColor: dataReadinessCompletionStatus.completed ? '#D1FAE5' : '#F8FAFC',
                      color: dataReadinessCompletionStatus.completed ? '#065F46' : '#64748b',
                      padding: '0.25rem 0.75rem',
                      borderRadius: '12px',
                      fontSize: '0.75rem',
                      fontWeight: '500',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.25rem'
                    }}>
                      {dataReadinessCompletionStatus.completed && (
                        <span style={{ color: '#065F46' }}>✓</span>
                      )}
                      {dataReadinessCompletionStatus.completed ? 'Complete' : 'Not Started'}
                    </div>

                    <h3 style={{
                      margin: '0 0 0.75rem 0',
                      fontSize: '1rem',
                      fontWeight: '600',
                      color: '#1f2937',
                      lineHeight: '1.2',
                      paddingRight: '5rem'
                    }}>
                      Data Readiness and Governance
                    </h3>
                    
                    <p style={{
                      margin: '0 0 1.5rem 0',
                      color: '#6b7280',
                      fontSize: '0.875rem',
                      lineHeight: '1.4'
                    }}>
                      Assess data governance, security frameworks, and organizational readiness.
                    </p>

                    {/* Progress */}
                    <div style={{
                      marginBottom: '1.5rem'
                    }}>
                      <div style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        marginBottom: '0.5rem'
                      }}>
                        <span style={{
                          fontSize: '0.875rem',
                          fontWeight: '500',
                          color: '#374151'
                        }}>
                          Progress
                        </span>
                        <span style={{
                          fontSize: '0.875rem',
                          fontWeight: '600',
                          color: dataReadinessCompletionStatus.completed ? '#059669' : '#374151'
                        }}>
                          {getDataReadinessProgress().completed}/{getDataReadinessProgress().total} Completed
                        </span>
                      </div>
                      
                      <div style={{
                        width: '100%',
                        height: '8px',
                        backgroundColor: '#f3f4f6',
                        borderRadius: '4px',
                        overflow: 'hidden'
                      }}>
                        <div style={{
                          width: `${(getDataReadinessProgress().completed / getDataReadinessProgress().total) * 100}%`,
                          height: '100%',
                          backgroundColor: dataReadinessCompletionStatus.completed ? '#059669' : '#6b7280',
                          borderRadius: '4px',
                          transition: 'width 0.3s ease'
                        }} />
                      </div>
                    </div>

                    {/* Buttons */}
                    <div style={{
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '0.75rem'
                    }}>
                      <button
                        onClick={() => setShowDataReadinessSurvey(true)}
                        style={{
                          backgroundColor: '#1f2937',
                          color: 'white',
                          border: 'none',
                          padding: '0.75rem 1rem',
                          borderRadius: '6px',
                          fontSize: '0.875rem',
                          fontWeight: '500',
                          cursor: 'pointer',
                          transition: 'all 0.2s ease',
                          width: '100%'
                        }}
                        onMouseOver={(e) => e.target.style.backgroundColor = '#111827'}
                        onMouseOut={(e) => e.target.style.backgroundColor = '#1f2937'}
                      >
                        Edit Survey
                      </button>
                      
                      {dataReadinessCompletionStatus.completed && (
                        <button
                          onClick={() => {
                            console.log('Readiness View Summary clicked');
                            handleViewSummary('readiness', 'Data Readiness & Governance Summary');
                          }}
                          style={{
                            backgroundColor: '#ea580c',
                            color: 'white',
                            border: 'none',
                            padding: '0.75rem 1rem',
                            borderRadius: '6px',
                            fontSize: '0.875rem',
                            fontWeight: '500',
                            cursor: 'pointer',
                            transition: 'all 0.2s ease',
                            width: '100%',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '0.5rem'
                          }}
                          onMouseOver={(e) => e.target.style.backgroundColor = '#dc2626'}
                          onMouseOut={(e) => e.target.style.backgroundColor = '#ea580c'}
                        >
                          📄 View Summary
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Document Upload Section */}
              <div style={{
                backgroundColor: 'white',
                border: '1px solid #e2e8f0',
                borderRadius: '12px',
                padding: '1.5rem',
                boxShadow: '0 2px 4px rgba(0, 0, 0, 0.05)',
                height: 'fit-content'
              }}>
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: '1rem'
                }}>
                  <h3 style={{
                    margin: 0,
                    fontSize: '1.125rem',
                    fontWeight: '600',
                    color: '#1f2937'
                  }}>
                    Document Upload
                  </h3>
                  <span style={{
                    fontSize: '0.75rem',
                    color: '#6b7280',
                    fontWeight: '500'
                  }}>
                    Optional
                  </span>
                </div>
                
                <p style={{
                  margin: '0 0 1.5rem 0',
                  color: '#6b7280',
                  fontSize: '0.875rem',
                  lineHeight: '1.4'
                }}>
                  Upload strategic documents, data inventories, or technical specifications to enhance your analysis.
                </p>

                <div style={{
                  border: '2px dashed #d1d5db',
                  borderRadius: '8px',
                  padding: '2rem 1rem',
                  textAlign: 'center',
                  backgroundColor: '#f9fafb',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  marginBottom: '1rem'
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.borderColor = '#6b7280';
                  e.currentTarget.style.backgroundColor = '#f3f4f6';
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.borderColor = '#d1d5db';
                  e.currentTarget.style.backgroundColor = '#f9fafb';
                }}
                >
                  <div style={{
                    fontSize: '2rem',
                    marginBottom: '0.5rem'
                  }}>
                    📁
                  </div>
                  <p style={{
                    margin: '0 0 0.25rem 0',
                    fontSize: '0.875rem',
                    fontWeight: '500',
                    color: '#374151'
                  }}>
                    Drag and drop files here, or click to browse
                  </p>
                  <p style={{
                    margin: 0,
                    fontSize: '0.75rem',
                    color: '#6b7280'
                  }}>
                    PDF, DOCX, XLSX up to 10MB
                  </p>
                </div>

                <button style={{
                  backgroundColor: '#ea580c',
                  color: 'white',
                  border: 'none',
                  padding: '0.75rem 1rem',
                  borderRadius: '6px',
                  fontSize: '0.875rem',
                  fontWeight: '500',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  width: '100%'
                }}
                onMouseOver={(e) => e.target.style.backgroundColor = '#dc2626'}
                onMouseOut={(e) => e.target.style.backgroundColor = '#ea580c'}
                >
                  Choose Files
                </button>

                <p style={{
                  margin: '1rem 0 0 0',
                  fontSize: '0.75rem',
                  color: '#6b7280',
                  textAlign: 'center'
                }}>
                  Supported formats: PDF, DOCX, XLSX, CSV
                </p>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'summary' && (
          <div style={{
            backgroundColor: 'white',
            borderRadius: '12px',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
            padding: '2rem'
          }}>
            <OpportunityAssessmentResults clientId={clientId} />
          </div>
        )}
      </div>

      {/* Survey Modals */}
      {showStrategicPrioritiesSurvey && (
        <StrategicPrioritiesSurveyWrapper
          isOpen={true}
          onClose={() => {
            setShowStrategicPrioritiesSurvey(false);
            loadSurveyData();
          }}
          userProfile={userProfile}
          initialResponses={strategicPrioritiesResponses}
          initialCompletionStatus={strategicPrioritiesCompletionStatus}
          onComplete={() => {
            setShowStrategicPrioritiesSurvey(false);
            loadSurveyData();
          }}
          onSaveAndExit={() => {
            setShowStrategicPrioritiesSurvey(false);
            loadSurveyData();
          }}
        />
      )}

      {showCurrentCapabilitiesSurvey && (
        <CurrentCapabilitiesSurveyWrapper
          isOpen={true}
          onClose={() => {
            setShowCurrentCapabilitiesSurvey(false);
            loadSurveyData();
          }}
          userProfile={userProfile}
          isCompleted={dataAnalyticsCompletionStatus.completed}
          completionStatus={dataAnalyticsCompletionStatus}
          onComplete={() => {
            setShowCurrentCapabilitiesSurvey(false);
            loadSurveyData();
          }}
          onSaveAndExit={() => {
            setShowCurrentCapabilitiesSurvey(false);
            loadSurveyData();
          }}
        />
      )}

      {showDataReadinessSurvey && (
        <DataReadinessSurveyWrapper
          isOpen={true}
          onClose={() => {
            setShowDataReadinessSurvey(false);
            loadSurveyData();
          }}
          userProfile={userProfile}
          initialResponses={dataReadinessResponses}
          initialCompletionStatus={dataReadinessCompletionStatus}
          onComplete={() => {
            setShowDataReadinessSurvey(false);
            loadSurveyData();
          }}
          onSaveAndExit={() => {
            setShowDataReadinessSurvey(false);
            loadSurveyData();
          }}
        />
      )}

      {/* Use UnifiedSummaryModal with the hook's state and modalKey */}
      <UnifiedSummaryModal
        key={summary.modalKey}  // Force fresh instance on each open
        isOpen={summary.isModalOpen}
        onClose={summary.closeModal}
        summaryType={currentSummaryType}
        summaryTitle={currentSummaryTitle}
        clientId={clientId}
        userId={userProfile.user_id}
        modalKey={summary.modalKey}  // Pass modalKey as prop too
      />
    </div>
  );
};

export default HomePage;