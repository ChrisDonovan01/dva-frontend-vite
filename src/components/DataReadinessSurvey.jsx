// Data Readiness & Governance Survey Component
// Executive-ready one-question-at-a-time survey matching StrategicPrioritiesSurvey UI/UX

import React, { useState, useEffect } from 'react';
import SurveyService from '../services/surveyService';
import SurveyCompleteModal from './SurveyCompleteModal';
import ErrorBoundary from './ErrorBoundary';

// Data Readiness & Governance Survey Questions
const surveyQuestions = [
  {
    id: 'dr_accessibility_1',
    section: 'Data Accessibility',
    question: 'How easily can your organization access and retrieve data from various sources when needed?',
    type: 'likert_1_5',
    options: ['Very Difficult', 'Difficult', 'Moderate', 'Easy', 'Very Easy'],
    required: true
  },
  {
    id: 'dr_accessibility_2',
    section: 'Data Accessibility',
    question: 'What percentage of your organization\'s critical data is readily accessible for analysis and decision-making?',
    type: 'radio',
    options: [
      'Less than 25%',
      '25-50%',
      '51-75%',
      '76-90%',
      'More than 90%'
    ],
    required: true
  },
  {
    id: 'dr_accessibility_3',
    section: 'Data Accessibility',
    question: 'Which data accessibility challenges does your organization currently face?',
    type: 'checkbox',
    options: [
      'Data locked in legacy systems',
      'Lack of standardized data formats',
      'Complex approval processes for data access',
      'Technical barriers and system incompatibilities',
      'Regulatory and compliance restrictions',
      'Insufficient data documentation and cataloging'
    ],
    required: true
  },
  {
    id: 'dr_quality_1',
    section: 'Data Quality',
    question: 'How would you rate the overall quality and reliability of your organization\'s data?',
    type: 'likert_1_5',
    options: ['Very Poor', 'Poor', 'Fair', 'Good', 'Excellent'],
    required: true
  },
  {
    id: 'dr_quality_2',
    section: 'Data Quality',
    question: 'What data quality issues does your organization encounter most frequently?',
    type: 'checkbox',
    options: [
      'Incomplete or missing data',
      'Duplicate records and data redundancy',
      'Inconsistent data formats and standards',
      'Outdated or stale information',
      'Data entry errors and inaccuracies',
      'Lack of data validation processes'
    ],
    required: true
  },
  {
    id: 'dr_quality_3',
    section: 'Data Quality',
    question: 'Does your organization have automated data quality monitoring and validation processes in place?',
    type: 'radio',
    options: [
      'No automated processes - manual checks only',
      'Basic automated validation for critical data',
      'Moderate automation with some manual oversight',
      'Comprehensive automated quality monitoring',
      'Advanced AI-driven quality assurance systems'
    ],
    required: true
  },
  {
    id: 'dr_governance_1',
    section: 'Data Governance',
    question: 'How mature is your organization\'s data governance framework and policies?',
    type: 'likert_1_5',
    options: ['Very Immature', 'Developing', 'Moderate', 'Advanced', 'Industry Leading'],
    required: true
  },
  {
    id: 'dr_governance_2',
    section: 'Data Governance',
    question: 'Which data governance capabilities are currently implemented in your organization?',
    type: 'checkbox',
    options: [
      'Data stewardship roles and responsibilities',
      'Data classification and sensitivity labeling',
      'Data retention and lifecycle management',
      'Data lineage and impact analysis',
      'Data privacy and consent management',
      'Data access controls and audit trails'
    ],
    required: true
  },
  {
    id: 'dr_governance_3',
    section: 'Data Governance',
    question: 'How effectively does your organization enforce data governance policies and standards?',
    type: 'radio',
    options: [
      'No formal enforcement mechanisms',
      'Informal enforcement with limited oversight',
      'Moderate enforcement with some accountability',
      'Strong enforcement with clear consequences',
      'Automated enforcement with continuous monitoring'
    ],
    required: true
  },
  {
    id: 'dr_integration_1',
    section: 'Data Integration',
    question: 'How well integrated are your organization\'s data systems and sources?',
    type: 'likert_1_5',
    options: ['Highly Siloed', 'Mostly Siloed', 'Partially Integrated', 'Well Integrated', 'Fully Integrated'],
    required: true
  },
  {
    id: 'dr_integration_2',
    section: 'Data Integration',
    question: 'What is your organization\'s primary approach to data integration and interoperability?',
    type: 'radio',
    options: [
      'Manual data extraction and consolidation',
      'Basic ETL processes with scheduled updates',
      'Real-time data integration with APIs',
      'Modern data pipeline architecture',
      'Advanced data mesh or fabric approach'
    ],
    required: true
  },
  {
    id: 'dr_compliance_1',
    section: 'Compliance & Security',
    question: 'How confident is your organization in meeting current data privacy and regulatory requirements?',
    type: 'likert_1_5',
    options: ['Not Confident', 'Somewhat Confident', 'Moderately Confident', 'Very Confident', 'Extremely Confident'],
    required: true
  },
  {
    id: 'dr_compliance_2',
    section: 'Compliance & Security',
    question: 'Which compliance and security measures are currently implemented for your data?',
    type: 'checkbox',
    options: [
      'HIPAA compliance for healthcare data',
      'GDPR compliance for personal data',
      'SOX compliance for financial data',
      'Data encryption at rest and in transit',
      'Regular security audits and assessments',
      'Incident response and breach notification procedures'
    ],
    required: true
  },
  {
    id: 'dr_future_1',
    section: 'Future Readiness',
    question: 'What are your organization\'s key priorities for improving data readiness over the next 2-3 years? (Optional)',
    type: 'text_long',
    placeholder: 'Describe your strategic priorities for data accessibility, quality, governance, integration, and compliance...',
    required: false
  }
];

const DataReadinessSurvey = ({ 
  onComplete, 
  onSaveAndExit, 
  onGoToSummary, 
  userProfile, 
  initialResponses = {}, 
  initialCompletionStatus = false 
}) => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [responses, setResponses] = useState(initialResponses);
  const [questions, setQuestions] = useState([]);
  const [questionsLoading, setQuestionsLoading] = useState(true);

  // Fallback questions in case backend loading fails
  const fallbackQuestions = surveyQuestions.map(q => ({
    question_id: q.id,
    question_text: q.question,
    response_type: q.type,
    section: q.section,
    choices: q.options || null,
    required: q.required
  }));

  // Load questions from backend on component mount
  useEffect(() => {
    const loadQuestions = async () => {
      try {
        setQuestionsLoading(true);
        console.log('🔄 Loading readiness questions from master table...');
        const questionsData = await SurveyService.loadSurveyQuestions('readiness');
        console.log('✅ Loaded questions:', questionsData);
        setQuestions(questionsData);
      } catch (error) {
        console.error('❌ Failed to load questions:', error);
        console.log('🔄 Using fallback hardcoded questions');
        setQuestions(fallbackQuestions);
      } finally {
        setQuestionsLoading(false);
      }
    };

    loadQuestions();
  }, []);

  // Load existing responses from backend
  useEffect(() => {
    const loadResponses = async () => {
      if (userProfile?.client_id) {
        try {
          console.log('🔄 Loading existing readiness responses for client:', userProfile.client_id);
          const existingResponses = await SurveyService.loadReadinessResponses(userProfile.client_id);
          console.log('✅ Loaded readiness responses:', existingResponses);
          
          if (existingResponses && Object.keys(existingResponses).length > 0) {
            setResponses(existingResponses);
            console.log('📋 Pre-populated readiness responses:', existingResponses);
          }
        } catch (error) {
          console.error('❌ Failed to load readiness responses:', error);
        }
      }
    };

    loadResponses();
  }, [userProfile?.client_id]);

  // Sync responses state when initialResponses changes AND questions are loaded
  useEffect(() => {
    if (questions.length > 0 && initialResponses && Object.keys(initialResponses).length > 0) {
      console.log('🚀 DataReadiness: Syncing responses after questions loaded');
      console.log('🚀 DataReadiness: initialResponses:', initialResponses);
      setResponses(initialResponses);
    }
  }, [questions, initialResponses]);

  // Fix: Sync responses state when initialResponses changes (ChatGPT recommendation)
  useEffect(() => {
    console.log('🚀 DataReadiness initialResponses changed:', initialResponses);
    console.log('🚀 DataReadiness initialResponses type:', typeof initialResponses);
    console.log('🚀 DataReadiness initialResponses keys:', Object.keys(initialResponses || {}));
    console.log('🚀 DataReadiness sample response dr_accessibility_1:', initialResponses?.dr_accessibility_1);
    
    if (initialResponses && Object.keys(initialResponses).length > 0) {
      console.log('🚀 Syncing DataReadiness responses state with initialResponses');
      setResponses(initialResponses);
      console.log('🚀 DataReadiness responses state after sync:', initialResponses);
    } else {
      console.log('❌ DataReadiness initialResponses is empty or invalid');
    }
  }, [initialResponses]);

  // Additional fix: Ensure responses are synced when component is ready
  useEffect(() => {
    if (initialResponses && Object.keys(initialResponses).length > 0 && Object.keys(responses).length === 0) {
      console.log('🚀 DataReadiness: Component ready, syncing responses again');
      console.log('🚀 DataReadiness: initialResponses keys:', Object.keys(initialResponses));
      setResponses(initialResponses);
    }
  }, [initialResponses, responses]);
  const [isCompleted, setIsCompleted] = useState(initialCompletionStatus);
  const [showCompleteModal, setShowCompleteModal] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const currentQuestion = questions.length > 0 ? questions[currentQuestionIndex] : null;
  const totalQuestions = questions.length;
  
  // Calculate completion based on actual response values (not just keys)
  const completedCount = questions.filter(q => {
    const response = responses[q.question_id];
    return response && response.toString().trim() !== '';
  }).length;
  const progress = totalQuestions > 0 ? Math.round((completedCount / totalQuestions) * 100) : 0;

  // Auto-save response when it changes
  useEffect(() => {
    const saveResponse = async () => {
      if (questions.length > 0 && currentQuestionIndex < questions.length) {
        const currentQuestion = questions[currentQuestionIndex];
        if (currentQuestion && responses[currentQuestion.id] !== undefined) {
          try {
            await SurveyService.saveReadinessResponse(
              userProfile?.client_id || 101,
              userProfile?.user_id || 'demo_user',
              currentQuestion.id,
              responses[currentQuestion.id]
            );
          } catch (error) {
            console.error('Error saving response:', error);
          }
        }
      }
    };

    const timeoutId = setTimeout(saveResponse, 500);
    return () => clearTimeout(timeoutId);
  }, [responses, currentQuestionIndex, questions, userProfile]);

  const handleResponseChange = (value) => {
    if (currentQuestion) {
      setResponses({
        ...responses,
        [currentQuestion.id]: value
      });
    }
  };

  const handleNext = () => {
    if (currentQuestionIndex < totalQuestions - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    }
  };

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1);
    }
  };

  const handleComplete = async () => {
    setIsLoading(true);
    try {
      // 🎯 Trigger survey completion and LLM summary generation
      console.log('🎯 Completing Data Readiness & Governance Survey and triggering LLM summary generation...');
      const result = await SurveyService.completeReadinessSurvey(
        userProfile?.client_id || 101,
        userProfile?.user_id || 'user123'
      );
      
      console.log('✅ Readiness survey completion and LLM generation triggered successfully:', result);
      
      setIsCompleted(true);
      setShowCompleteModal(true);
      
      // Show success message
      console.log('🎉 Data Readiness & Governance Survey completed! LLM summary generation started in background.');
      
    } catch (error) {
      console.error('❌ Error completing readiness survey:', error);
      // Still show completion modal even if there's an error
      setIsCompleted(true);
      setShowCompleteModal(true);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveAndExit = () => {
    onSaveAndExit(responses, completedCount);
  };

  const renderQuestion = () => {
    if (!currentQuestion) {
      return <div>Loading question...</div>;
    }

    const questionId = currentQuestion.id || currentQuestion.question_id;
    const currentResponse = responses[questionId];
    const questionType = currentQuestion.type || currentQuestion.response_type;
    const questionOptions = currentQuestion.options || currentQuestion.choices;

    // Simple radio/likert rendering using working pattern from StrategicPrioritiesSurvey
    if (questionType === 'likert_1_5' || questionType === 'radio') {
      return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {questionOptions?.map((option, index) => (
            <label key={index} style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              padding: '16px',
              borderRadius: '8px',
              border: '2px solid #e5e7eb',
              cursor: 'pointer',
              backgroundColor: currentResponse === option ? '#dbeafe' : 'white',
              borderColor: currentResponse === option ? '#3b82f6' : '#e5e7eb',
              transition: 'all 0.2s ease'
            }}>
              <input
                type="radio"
                name={questionId}
                value={option}
                checked={currentResponse === option}
                onChange={(e) => handleResponseChange(e.target.value)}
                style={{ 
                  margin: 0,
                  width: '20px',
                  height: '20px',
                  accentColor: '#FF6E4C'
                }}
              />
              <span style={{ fontSize: '16px', color: '#374151', fontWeight: '500' }}>{option}</span>
            </label>
          ))}
        </div>
      );
    }

    // Simple checkbox rendering
    if (questionType === 'checkbox') {
      const selectedOptions = Array.isArray(currentResponse) ? currentResponse : [];
      return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {questionOptions?.map((option, index) => (
            <label key={index} style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              padding: '16px',
              borderRadius: '8px',
              border: '2px solid #e5e7eb',
              cursor: 'pointer',
              backgroundColor: selectedOptions.includes(option) ? '#dbeafe' : 'white',
              borderColor: selectedOptions.includes(option) ? '#3b82f6' : '#e5e7eb',
              transition: 'all 0.2s ease'
            }}>
              <input
                type="checkbox"
                checked={selectedOptions.includes(option)}
                onChange={(e) => {
                  const newSelection = e.target.checked
                    ? [...selectedOptions, option]
                    : selectedOptions.filter(opt => opt !== option);
                  handleResponseChange(newSelection);
                }}
                style={{ 
                  margin: 0,
                  width: '20px',
                  height: '20px',
                  accentColor: '#FF6E4C'
                }}
              />
              <span style={{ fontSize: '16px', color: '#374151', fontWeight: '500' }}>{option}</span>
            </label>
          ))}
        </div>
      );
    }

    // Simple text area rendering
    if (questionType === 'text_long') {
      return (
        <textarea
          value={currentResponse || ''}
          onChange={(e) => handleResponseChange(e.target.value)}
          placeholder="Enter your response..."
          style={{
            width: '100%',
            minHeight: '120px',
            padding: '16px',
            border: '2px solid #e5e7eb',
            borderRadius: '8px',
            fontSize: '16px',
            fontFamily: 'Montserrat, sans-serif',
            resize: 'vertical',
            outline: 'none'
          }}
        />
      );
    }

    return <div>Unsupported question type: {questionType}</div>;
  };

  if (isCompleted && showCompleteModal) {
    return (
      <SurveyCompleteModal
        title="Data Readiness & Governance Assessment Complete!"
        message="Thank you for completing the Data Readiness & Governance Survey. Your responses will help us evaluate your data accessibility, quality, governance, and integration capabilities."
        onViewSummary={() => {
          setShowCompleteModal(false);
          onGoToSummary();
        }}
        onContinue={() => {
          setShowCompleteModal(false);
          onComplete({ responses });
        }}
        showViewSummary={true}
        summaryButtonText="View Use Case Explorer"
      />
    );
  }

  // Show loading screen while questions are loading or if no current question
  if (questionsLoading || !currentQuestion) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-8 max-w-md w-full mx-4">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Loading Survey Questions</h3>
            <p className="text-gray-600">Please wait while we load your survey...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
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
        display: 'flex',
        height: '90vh',
        width: '95vw',
        maxWidth: '1400px',
        fontFamily: 'Montserrat, sans-serif',
        backgroundColor: '#f9fafb',
        borderRadius: '12px',
        overflow: 'hidden',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)'
      }}>
      {/* Left Navigation Sidebar - CLEAN PROFESSIONAL DESIGN */}
      <div style={{
        width: '280px',
        backgroundColor: '#18365E',
        color: 'white',
        display: 'flex',
        flexDirection: 'column'
      }}>
        {/* Sidebar Header */}
        <div style={{
          padding: '20px 20px',
          borderBottom: '1px solid rgba(255, 255, 255, 0.1)'
        }}>
          <div style={{
            marginBottom: '8px'
          }}>
            <h2 style={{
              fontSize: '18px',
              fontWeight: '700',
              color: 'white',
              margin: 0
            }}>
              DVA Survey
            </h2>
          </div>
          <p style={{
            fontSize: '14px',
            color: 'rgba(255, 255, 255, 0.8)',
            margin: 0,
            lineHeight: '1.4'
          }}>
            Data Readiness & Governance Assessment
          </p>
        </div>

        {/* Overall Progress */}
        <div style={{
          padding: '16px 20px',
          borderBottom: '1px solid rgba(255, 255, 255, 0.1)'
        }}>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '12px'
          }}>
            <span style={{
              fontSize: '14px',
              fontWeight: '600',
              color: 'white'
            }}>
              Overall Progress
            </span>
            <span style={{
              fontSize: '14px',
              color: 'rgba(255, 255, 255, 0.8)'
            }}>
              {completedCount} of {totalQuestions}
            </span>
          </div>
          <div style={{
            width: '100%',
            height: '6px',
            backgroundColor: '#f3f4f6',
            borderRadius: '3px',
            overflow: 'hidden'
          }}>
            <div style={{
              width: `${progress}%`,
              height: '100%',
              backgroundColor: '#FF6E4C',
              transition: 'width 0.3s ease'
            }} />
          </div>
        </div>

        {/* Section Navigation */}
        <div style={{
          flex: 1,
          overflowY: 'auto',
          padding: '12px 0'
        }}>
          <div style={{
            padding: '0 20px 12px 20px'
          }}>
            <h3 style={{
              fontSize: '14px',
              fontWeight: '600',
              color: 'rgba(255, 255, 255, 0.8)',
              margin: 0,
              textTransform: 'uppercase',
              letterSpacing: '0.5px'
            }}>
              Sections
            </h3>
          </div>
          {[
            {
              id: 'data_accessibility',
              title: 'Data Accessibility',
              description: 'Data access and retrieval capabilities'
            },
            {
              id: 'data_quality',
              title: 'Data Quality',
              description: 'Data accuracy and reliability'
            },
            {
              id: 'data_governance',
              title: 'Data Governance',
              description: 'Governance frameworks and policies'
            },
            {
              id: 'data_integration',
              title: 'Data Integration',
              description: 'System integration and interoperability'
            },
            {
              id: 'compliance_security',
              title: 'Compliance & Security',
              description: 'Security frameworks and compliance'
            },
            {
              id: 'future_readiness',
              title: 'Future Readiness',
              description: 'Future-focused capabilities'
            }
          ].map((section, index) => {
            const isCurrentSection = currentQuestion && (currentQuestion.section === section.title);
            
            return (
              <div
                key={section.id}
                style={{
                  padding: '8px 20px',
                  margin: '0 16px 4px 16px',
                  borderRadius: '6px',
                  backgroundColor: isCurrentSection ? 'rgba(255, 255, 255, 0.1)' : 'transparent',
                  border: isCurrentSection ? '1px solid rgba(255, 255, 255, 0.3)' : '1px solid transparent',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease'
                }}
              >
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px'
                }}>
                  <div style={{
                    width: '24px',
                    height: '24px',
                    borderRadius: '50%',
                    backgroundColor: isCurrentSection ? '#FF6E4C' : 'rgba(255, 255, 255, 0.2)',
                    color: isCurrentSection ? 'white' : 'rgba(255, 255, 255, 0.8)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '12px',
                    fontWeight: '600'
                  }}>
                    {index + 1}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{
                      fontSize: '14px',
                      fontWeight: '600',
                      color: isCurrentSection ? 'white' : 'rgba(255, 255, 255, 0.9)',
                      marginBottom: '2px'
                    }}>
                      {section.title}
                    </div>
                    <div style={{
                      fontSize: '12px',
                      color: '#6b7280',
                      lineHeight: '1.3'
                    }}>
                      {section.description}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Main Content Area */}
      <div style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        backgroundColor: 'white'
      }}>
        {/* Breadcrumb */}
        <div style={{
          padding: '16px 40px',
          borderBottom: '1px solid #e5e7eb',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          fontSize: '14px',
          color: '#6b7280'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span>DVA Platform</span>
            <span>›</span>
            <span>Client Data Input</span>
            <span>›</span>
            <span>Data Readiness & Governance Survey</span>
            <span>›</span>
            <span style={{ color: '#FF6E4C', fontWeight: '600' }}>
              {currentQuestion.section}
            </span>
          </div>
          <button
            onClick={handleSaveAndExit}
            style={{
              background: 'none',
              border: 'none',
              fontSize: '20px',
              color: '#6b7280',
              cursor: 'pointer',
              padding: '8px',
              borderRadius: '4px',
              transition: 'color 0.2s ease'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = '#18365E';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = '#6b7280';
            }}
            title="Close Survey"
          >
            ✕
          </button>
        </div>

        {/* Question Header */}
        <div style={{
          padding: '32px 40px 24px',
          borderBottom: '1px solid #f3f4f6'
        }}>
          <div style={{
            display: 'flex',
            justifyContent: 'flex-end',
            alignItems: 'center',
            marginBottom: '16px'
          }}>
            <span style={{
              fontSize: '14px',
              color: '#6b7280'
            }}>
              Question {currentQuestionIndex + 1} of {totalQuestions}
            </span>
          </div>
          <h1 style={{
            fontSize: '28px',
            fontWeight: '700',
            color: '#18365E',
            margin: 0,
            lineHeight: '1.3'
          }}>
            {currentQuestion.text}
          </h1>
          {currentQuestion.required && (
            <p style={{ 
              fontSize: '14px', 
              color: '#ef4444', 
              margin: '8px 0 0 0',
              fontWeight: '500'
            }}>
              * Required
            </p>
          )}
        </div>

        {/* Question Content */}
        <div style={{
          flex: 1,
          padding: '32px 40px',
          display: 'flex',
          flexDirection: 'column'
        }}>
          <div style={{ flex: 1 }}>
            {(() => {
              try {
                return renderQuestion();
              } catch (error) {
                console.error('❌ Error in renderQuestion:', error);
                return (
                  <div style={{ padding: '20px', textAlign: 'center', color: '#ef4444' }}>
                    <p>Error loading question. Please try refreshing the page.</p>
                    <p style={{ fontSize: '14px', color: '#6b7280' }}>{error.message}</p>
                  </div>
                );
              }
            })()} 
          </div>

          {/* Navigation */}
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginTop: '40px',
            paddingTop: '24px',
            borderTop: '1px solid #f3f4f6'
          }}>
            <button
              onClick={handlePrevious}
              disabled={currentQuestionIndex === 0 ? true : false}
              style={{
                padding: '12px 24px',
                borderRadius: '8px',
                border: '2px solid #d1d5db',
                backgroundColor: 'white',
                color: '#374151',
                fontSize: '16px',
                fontWeight: '600',
                cursor: currentQuestionIndex === 0 ? 'not-allowed' : 'pointer',
                opacity: currentQuestionIndex === 0 ? 0.5 : 1,
                transition: 'all 0.2s ease'
              }}
            >
              ← Previous
            </button>

            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '16px',
              fontSize: '14px',
              color: '#6b7280'
            }}>
              <span>Progress: {currentQuestionIndex + 1} of {totalQuestions}</span>
              <div style={{
                width: '120px',
                height: '6px',
                backgroundColor: 'rgba(255, 255, 255, 0.2)',
                borderRadius: '3px',
                overflow: 'hidden'
              }}>
                <div style={{
                  width: `${((currentQuestionIndex + 1) / totalQuestions) * 100}%`,
                  height: '100%',
                  backgroundColor: '#FF6E4C',
                  transition: 'width 0.3s ease'
                }} />
              </div>
            </div>

            <div style={{ display: 'flex', gap: '12px' }}>
              {currentQuestionIndex === totalQuestions - 1 ? (
                <button
                  onClick={handleComplete}
                  disabled={isLoading || !responses[currentQuestion.id] ? true : false}
                  style={{
                    padding: '12px 32px',
                    borderRadius: '8px',
                    border: 'none',
                    backgroundColor: '#FF6E4C',
                    color: 'white',
                    fontSize: '16px',
                    fontWeight: '600',
                    cursor: isLoading || !responses[currentQuestion.id] ? 'not-allowed' : 'pointer',
                    opacity: isLoading || !responses[currentQuestion.id] ? 0.5 : 1,
                    transition: 'all 0.2s ease'
                  }}
                >
                  {isLoading ? 'Completing...' : 'Complete Survey'}
                </button>
              ) : (
                <button
                  onClick={handleNext}
                  style={{
                    padding: '12px 32px',
                    borderRadius: '8px',
                    border: 'none',
                    backgroundColor: '#FF6E4C',
                    color: 'white',
                    fontSize: '16px',
                    fontWeight: '600',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease'
                  }}
                >
                  Next →
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
    </div>
  );
};

export default DataReadinessSurvey;
