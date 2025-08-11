import React, { useState, useEffect } from 'react';
import SurveyService from '../services/surveyService';

const StrategicPrioritiesSurvey = ({ 
  userProfile,
  onComplete, 
  onSaveAndExit,
  onGoToSummary,
  initialResponses = {},
  initialCompletionStatus = false
}) => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [responses, setResponses] = useState(initialResponses);
  const [questions, setQuestions] = useState([]);
  const [questionsLoading, setQuestionsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showCompleteModal, setShowCompleteModal] = useState(false);

  // Debug: Log every render and prop values
  console.log('🎬 StrategicPrioritiesSurvey RENDER - Props received:');
  console.log('  - initialResponses:', initialResponses);
  console.log('  - responses state:', responses);

  // Fix: Sync responses state when initialResponses changes
  useEffect(() => {
    console.log('🚀 initialResponses changed:', initialResponses);
    if (initialResponses && Object.keys(initialResponses).length > 0) {
      console.log('🚀 Syncing responses state with initialResponses');
      setResponses(initialResponses);
    }
  }, [initialResponses]);

  // Fallback questions in case backend loading fails
  const fallbackQuestions = [
    {
      question_id: 'sp_q1',
      section: 'Strategic Vision',
      question_text: 'What is your organization\'s top strategic priority for the next 3–5 years?',
      response_type: 'radio',
      choices: ['Expand market presence', 'Improve patient outcomes', 'Increase operational efficiency', 'Strengthen financial resilience', 'Other']
    },
    {
      question_id: 'sp_q2',
      section: 'Strategic Vision',
      question_text: 'How important is data and analytics in achieving your strategic goals?',
      response_type: 'likert_1_5',
      choices: ['Not Important', 'Slightly Important', 'Moderately Important', 'Very Important', 'Extremely Important']
    },
    {
      question_id: 'sp_q3',
      section: 'Data & Innovation',
      question_text: 'What role does technology adoption play in your organization\'s strategy?',
      response_type: 'radio',
      choices: ['Leading edge adopter', 'Early adopter', 'Mainstream adopter', 'Conservative adopter', 'Technology follower']
    },
    {
      question_id: 'sp_q4',
      section: 'Data & Innovation',
      question_text: 'Which data-driven initiatives are most critical to your organization?',
      response_type: 'checkbox',
      choices: ['Predictive analytics', 'Real-time dashboards', 'AI/ML capabilities', 'Data integration', 'Regulatory compliance', 'Cost optimization']
    },
    {
      question_id: 'sp_q5',
      section: 'Financial Objectives',
      question_text: 'What are your primary revenue and investment strategy goals?',
      response_type: 'radio',
      choices: ['Increase revenue growth', 'Reduce operational costs', 'Improve profit margins', 'Expand service offerings', 'Enter new markets']
    },
    {
      question_id: 'sp_q6',
      section: 'Financial Objectives',
      question_text: 'How do you measure ROI for data and analytics investments?',
      response_type: 'radio',
      choices: ['Cost savings', 'Revenue increase', 'Efficiency gains', 'Quality improvements', 'Risk reduction', 'We don\'t measure ROI']
    },
    {
      question_id: 'sp_q7',
      section: 'Optional Context',
      question_text: 'What additional strategic context would help us understand your priorities?',
      response_type: 'textarea',
      choices: []
    },
    {
      question_id: 'sp_q8',
      section: 'Optional Context',
      question_text: 'What are your biggest strategic challenges or obstacles?',
      response_type: 'textarea',
      choices: []
    },
    {
      question_id: 'sp_q9',
      section: 'Optional Context',
      question_text: 'Any other strategic priorities or goals we should consider?',
      response_type: 'textarea',
      choices: []
    }
  ];

  // Load questions from backend on component mount
  useEffect(() => {
    const loadQuestions = async () => {
      try {
        setQuestionsLoading(true);
        console.log('🔄 Loading strategy questions from master table...');
        const questionsData = await SurveyService.loadStrategyQuestions();
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

  // Auto-save response when it changes
  useEffect(() => {
    const saveResponse = async () => {
      if (questions.length > 0 && currentQuestionIndex < questions.length) {
        const currentQuestion = questions[currentQuestionIndex];
        if (currentQuestion && responses[currentQuestion.question_id] !== undefined) {
          try {
            await SurveyService.saveStrategyResponse(
              userProfile?.client_id || 101,
              userProfile?.user_id || 'demo_user',
              currentQuestion.question_id,
              responses[currentQuestion.question_id]
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

  // Show loading screen while questions are loading
  if (questionsLoading) {
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

  const currentQuestion = questions[currentQuestionIndex];
  const isLastQuestion = currentQuestionIndex === questions.length - 1;

  // Define sections for navigation
  const sections = [
    {
      id: 'strategic_vision',
      title: 'Strategic Vision',
      description: 'Core priorities and differentiators'
    },
    {
      id: 'data_innovation',
      title: 'Data & Innovation',
      description: 'Technology adoption mindset'
    },
    {
      id: 'financial_objectives',
      title: 'Financial Objectives',
      description: 'Revenue and investment strategy'
    },
    {
      id: 'optional_context',
      title: 'Optional Context',
      description: 'Additional strategic context'
    }
  ];

  // Get current section based on question
  const getCurrentSection = () => {
    if (!currentQuestion) return sections[0];
    const sectionMap = {
      'Strategic Vision': 'strategic_vision',
      'Data & Innovation': 'data_innovation',
      'Financial Objectives': 'financial_objectives',
      'Optional Context': 'optional_context'
    };
    const sectionId = sectionMap[currentQuestion.section] || 'strategic_vision';
    return sections.find(s => s.id === sectionId) || sections[0];
  };

  const currentSection = getCurrentSection();

  // Define breadcrumb items
  const breadcrumbItems = [
    'DVA Platform',
    'Client Data Input', 
    'Strategic Priorities Survey',
    currentSection?.title || 'Strategic Vision'
  ];

  // Get current section title for breadcrumb
  const currentSectionTitle = currentSection?.title || 'Strategic Vision';

  const handleResponseChange = (value) => {
    if (currentQuestion) {
      setResponses(prev => ({
        ...prev,
        [currentQuestion.question_id]: value
      }));
    }
  };

  const handleNext = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    }
  };

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };

  const handleComplete = async () => {
    setIsSubmitting(true);
    try {
      await SurveyService.recordStrategyCompletion(
        userProfile?.client_id || 101,
        userProfile?.user_id || 'demo_user'
      );
      setShowCompleteModal(true);
    } catch (error) {
      console.error('Error completing survey:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderQuestion = () => {
    if (!currentQuestion) return null;

    const currentValue = responses[currentQuestion.question_id] || '';

    switch (currentQuestion.response_type) {
      case 'radio':
      case 'likert_1_5':
        return (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {currentQuestion.choices?.map((choice, index) => (
              <label
                key={index}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  padding: '16px',
                  border: '2px solid',
                  borderColor: currentValue === choice ? '#0ea5e9' : '#e5e7eb',
                  borderRadius: '8px',
                  backgroundColor: currentValue === choice ? '#f0f9ff' : 'white',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease'
                }}
              >
                <input
                  type="radio"
                  name={currentQuestion.question_id}
                  value={choice}
                  checked={currentValue === choice}
                  onChange={(e) => handleResponseChange(e.target.value)}
                  style={{
                    marginRight: '12px',
                    accentColor: '#0ea5e9'
                  }}
                />
                <span style={{
                  fontSize: '16px',
                  color: '#374151',
                  fontWeight: currentValue === choice ? '500' : '400'
                }}>
                  {choice}
                </span>
              </label>
            ))}
          </div>
        );

      case 'checkbox':
        const selectedValues = Array.isArray(currentValue) ? currentValue : [];
        return (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {currentQuestion.choices?.map((choice, index) => (
              <label
                key={index}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  padding: '12px',
                  border: '1px solid #e5e7eb',
                  borderRadius: '6px',
                  cursor: 'pointer'
                }}
              >
                <input
                  type="checkbox"
                  checked={selectedValues.includes(choice)}
                  onChange={(e) => {
                    const newValues = e.target.checked
                      ? [...selectedValues, choice]
                      : selectedValues.filter(v => v !== choice);
                    handleResponseChange(newValues);
                  }}
                  style={{ marginRight: '8px' }}
                />
                {choice}
              </label>
            ))}
          </div>
        );

      case 'textarea':
        return (
          <textarea
            value={currentValue}
            onChange={(e) => handleResponseChange(e.target.value)}
            placeholder="Please provide your response..."
            style={{
              width: '100%',
              minHeight: '120px',
              padding: '12px',
              border: '1px solid #e5e7eb',
              borderRadius: '6px',
              fontSize: '16px',
              fontFamily: 'inherit',
              resize: 'vertical'
            }}
          />
        );

      default:
        return (
          <input
            type="text"
            value={currentValue}
            onChange={(e) => handleResponseChange(e.target.value)}
            placeholder="Please provide your response..."
            style={{
              width: '100%',
              padding: '12px',
              border: '1px solid #e5e7eb',
              borderRadius: '6px',
              fontSize: '16px'
            }}
          />
        );
    }
  };

  // Survey Complete Modal
  if (showCompleteModal) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg shadow-xl p-8 max-w-md w-full mx-4">
          <div className="text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Survey Complete!</h3>
            <p className="text-gray-600 mb-6">
              Thank you for completing the Strategic Priorities Survey. Your responses have been saved and will help us create your personalized strategy summary.
            </p>
            <div className="flex gap-3 justify-center">
              <button
                onClick={() => {
                  if (onSaveAndExit) {
                    onSaveAndExit(responses, Object.keys(responses).length);
                  }
                }}
                className="px-6 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Return to Dashboard
              </button>
              {onGoToSummary && (
                <button
                  onClick={onGoToSummary}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  View Summary
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{
      display: 'flex',
      height: '100vh',
      fontFamily: 'Montserrat, sans-serif',
      backgroundColor: '#f9fafb'
    }}>
      {/* Left Navigation Sidebar */}
      <div style={{
        width: '280px',
        backgroundColor: '#18365E',
        color: 'white',
        display: 'flex',
        flexDirection: 'column'
      }}>
        {/* Sidebar Header */}
        <div style={{
          padding: '24px 20px',
          borderBottom: '1px solid rgba(255, 255, 255, 0.1)'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '12px'
          }}>
            <h2 style={{
              fontSize: '18px',
              fontWeight: '700',
              color: 'white',
              margin: 0
            }}>
              DVA Survey
            </h2>
            <button
              onClick={() => {
                if (onSaveAndExit) {
                  onSaveAndExit(responses, Object.keys(responses).length);
                }
              }}
              style={{
                background: 'none',
                border: 'none',
                fontSize: '20px',
                color: 'rgba(255, 255, 255, 0.7)',
                cursor: 'pointer',
                padding: '4px',
                borderRadius: '4px'
              }}
              title="Close Survey"
            >
              ✕
            </button>
          </div>
          <p style={{
            fontSize: '14px',
            color: 'rgba(255, 255, 255, 0.8)',
            margin: 0,
            lineHeight: '1.4'
          }}>
            Strategic Priorities Assessment
          </p>
        </div>

        {/* Progress Overview */}
        <div style={{
          padding: '20px',
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
              {(() => {
                // Calculate how many questions have responses
                const completedCount = questions.filter(q => {
                  const response = responses[q.question_id];
                  return response && response.toString().trim() !== '';
                }).length;
                return `${completedCount} of ${questions.length}`;
              })()}
            </span>
          </div>
          <div style={{
            width: '100%',
            height: '8px',
            backgroundColor: 'rgba(255, 255, 255, 0.2)',
            borderRadius: '4px',
            overflow: 'hidden'
          }}>
            <div style={{
              width: `${(() => {
                // Calculate completion percentage based on answered questions
                const completedCount = questions.filter(q => {
                  const response = responses[q.question_id];
                  return response && response.toString().trim() !== '';
                }).length;
                return (completedCount / questions.length) * 100;
              })()}%`,
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
          padding: '16px 0'
        }}>
          <div style={{
            padding: '0 20px 12px 20px'
          }}>
            <h3 style={{
              fontSize: '14px',
              fontWeight: '600',
              color: 'white',
              margin: 0,
              textTransform: 'uppercase',
              letterSpacing: '0.5px'
            }}>
              Sections
            </h3>
          </div>
          {sections.map((section, index) => (
            <div
              key={section.id}
              style={{
                padding: '12px 20px',
                margin: '0 16px 8px 16px',
                borderRadius: '8px',
                backgroundColor: currentSection?.id === section.id ? 'rgba(255, 255, 255, 0.1)' : 'transparent',
                border: currentSection?.id === section.id ? '1px solid rgba(255, 255, 255, 0.2)' : '1px solid transparent',
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
                  backgroundColor: currentSection?.id === section.id ? '#FF6E4C' : 'rgba(255, 255, 255, 0.2)',
                  color: currentSection?.id === section.id ? 'white' : 'rgba(255, 255, 255, 0.6)',
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
                    color: currentSection?.id === section.id ? 'white' : 'rgba(255, 255, 255, 0.9)',
                    marginBottom: '2px'
                  }}>
                    {section.title}
                  </div>
                  <div style={{
                    fontSize: '12px',
                    color: 'rgba(255, 255, 255, 0.7)',
                    lineHeight: '1.3'
                  }}>
                    {section.description}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div style={{
          padding: '16px 20px',
          borderTop: '1px solid rgba(255, 255, 255, 0.1)'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            fontSize: '12px',
            color: 'rgba(255, 255, 255, 0.8)'
          }}>
            <div style={{
              width: '16px',
              height: '16px',
              backgroundColor: 'white',
              borderRadius: '2px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#18365E',
              fontSize: '10px',
              fontWeight: '700'
            }}>
              DVA
            </div>
            Data Value Acceleration
          </div>
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
          backgroundColor: 'white',
          borderBottom: '1px solid #e5e7eb',
          padding: '16px 32px'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}>
            {/* Breadcrumb Navigation */}
            <nav style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              fontSize: '14px'
            }}>
              {breadcrumbItems.map((item, index) => (
                <React.Fragment key={index}>
                  {index > 0 && (
                    <span style={{ 
                      color: '#6b7280',
                      margin: '0 4px'
                    }}>
                      ›
                    </span>
                  )}
                  <span style={{
                    color: index === breadcrumbItems.length - 1 ? '#18365E' : '#6b7280',
                    fontWeight: index === breadcrumbItems.length - 1 ? '600' : '400'
                  }}>
                    {item}
                  </span>
                </React.Fragment>
              ))}
            </nav>

            {/* Progress Indicator */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '16px',
              fontSize: '14px',
              color: '#6b7280'
            }}>
              <span style={{
                padding: '4px 12px',
                backgroundColor: '#f0f9ff',
                color: '#18365E',
                borderRadius: '20px',
                fontSize: '12px',
                fontWeight: '500'
              }}>
                {currentSectionTitle}
              </span>
              <span>
                Question {currentQuestionIndex + 1} of {questions.length}
              </span>
            </div>
          </div>
        </div>

        {/* Question Content */}
        <div style={{
          flex: 1,
          padding: '32px',
          overflowY: 'auto'
        }}>
          <div style={{
            maxWidth: '800px',
            margin: '0 auto'
          }}>
            <h1 style={{
              fontSize: '28px',
              fontWeight: '700',
              color: '#18365E',
              marginBottom: '8px',
              lineHeight: '1.2'
            }}>
              Question {currentQuestionIndex + 1} of {questions.length}
            </h1>
            
            <p style={{
              fontSize: '18px',
              color: '#374151',
              marginBottom: '32px',
              lineHeight: '1.6'
            }}>
              {currentQuestion?.question_text}
            </p>

            {/* Render question based on response type */}
            {renderQuestion()}
          </div>
        </div>

        {/* Navigation Footer */}
        <div style={{
          borderTop: '1px solid #e5e7eb',
          padding: '24px 32px',
          backgroundColor: '#f9fafb'
        }}>
          <div style={{
            maxWidth: '800px',
            margin: '0 auto',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}>
            <button
              onClick={handlePrevious}
              disabled={currentQuestionIndex === 0}
              style={{
                padding: '12px 24px',
                border: '1px solid #d1d5db',
                borderRadius: '8px',
                backgroundColor: 'white',
                color: currentQuestionIndex === 0 ? '#9ca3af' : '#374151',
                cursor: currentQuestionIndex === 0 ? 'not-allowed' : 'pointer',
                fontWeight: '500',
                fontSize: '14px',
                opacity: currentQuestionIndex === 0 ? 0.5 : 1
              }}
            >
              ← Previous
            </button>

            <span style={{
              fontSize: '14px',
              color: '#6b7280'
            }}>
              Progress: {currentQuestionIndex + 1} of {questions.length}
            </span>

            {isLastQuestion ? (
              <button
                onClick={handleComplete}
                disabled={isSubmitting}
                style={{
                  padding: '12px 24px',
                  border: 'none',
                  borderRadius: '8px',
                  backgroundColor: '#FF6E4C',
                  color: 'white',
                  cursor: isSubmitting ? 'not-allowed' : 'pointer',
                  fontWeight: '500',
                  fontSize: '14px',
                  opacity: isSubmitting ? 0.7 : 1
                }}
              >
                {isSubmitting ? 'Completing...' : 'Complete Survey'}
              </button>
            ) : (
              <button
                onClick={handleNext}
                style={{
                  padding: '12px 24px',
                  border: 'none',
                  borderRadius: '8px',
                  backgroundColor: '#FF6E4C',
                  color: 'white',
                  cursor: 'pointer',
                  fontWeight: '500',
                  fontSize: '14px'
                }}
              >
                Next →
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default StrategicPrioritiesSurvey;
