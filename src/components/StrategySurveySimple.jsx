import React, { useState, useEffect } from 'react';
import SurveyService from '../services/surveyService';
import SurveyNavigation from './SurveyNavigation';
import SurveyBreadcrumb from './SurveyBreadcrumb';

const StrategySurveySimple = ({ 
  userProfile,
  onComplete, 
  onSaveAndExit,
  onGoToSummary,
  initialResponses = {},
  initialCompletionStatus = false
}) => {
  const [responses, setResponses] = useState(initialResponses);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showCompleteModal, setShowCompleteModal] = useState(false);

  // Simple survey questions for testing
  const questions = [
    {
      id: 'Q1',
      question_text: 'What is your organization\'s top strategic priority for the next 2 years?',
      response_type: 'radio',
      options: [
        'Improve operational efficiency',
        'Enhance patient outcomes',
        'Reduce costs and waste',
        'Drive revenue growth',
        'Strengthen competitive position'
      ],
      required: true
    },
    {
      id: 'Q2',
      question_text: 'How would you rate your current data analytics maturity?',
      response_type: 'radio',
      options: [
        'Basic - Limited analytics capabilities',
        'Developing - Some analytics in place',
        'Advanced - Strong analytics capabilities',
        'Leading - Industry-leading analytics'
      ],
      required: true
    },
    {
      id: 'Q3',
      question_text: 'What are your primary analytics goals? (Select all that apply)',
      response_type: 'checkbox',
      options: [
        'Improve patient outcomes',
        'Reduce operational costs',
        'Enhance clinical decision-making',
        'Optimize resource allocation',
        'Support population health management'
      ],
      required: true
    }
  ];

  const currentQuestion = questions[currentQuestionIndex];
  const isLastQuestion = currentQuestionIndex === questions.length - 1;

  const handleResponseChange = (value) => {
    setResponses(prev => ({
      ...prev,
      [currentQuestion.id]: value
    }));

    // Auto-save if user profile is available
    if (userProfile?.client_id) {
      saveResponse(currentQuestion.id, value);
    }
  };

  const saveResponse = async (questionId, response) => {
    try {
      await SurveyService.saveSurveyResponse({
        client_id: userProfile.client_id,
        user_id: userProfile.user_id || 'demo_user',
        question_id: questionId,
        question_text: currentQuestion.question_text,
        response: Array.isArray(response) ? response.join(', ') : response.toString(),
        response_type: currentQuestion.response_type
      });
    } catch (error) {
      console.error('Failed to save response:', error);
    }
  };

  const handleNext = () => {
    if (isLastQuestion) {
      handleSubmit();
    } else {
      setCurrentQuestionIndex(prev => prev + 1);
    }
  };

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1);
    }
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    
    try {
      // Record completion
      if (userProfile?.client_id) {
        await SurveyService.recordSurveyCompletion({
          client_id: userProfile.client_id,
          user_id: userProfile.user_id || 'demo_user',
          completed_at: new Date().toISOString()
        });
      }

      // Trigger completion callback
      if (onComplete) {
        onComplete({
          responses,
          completedAt: new Date().toISOString(),
          surveyType: 'strategy'
        });
      }

      setShowCompleteModal(true);
    } catch (error) {
      console.error('Failed to submit survey:', error);
      alert('Failed to submit survey. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderQuestion = () => {
    if (!currentQuestion) return null;

    return (
      <div style={{ marginBottom: '32px' }}>
        <h3 style={{
          fontSize: '20px',
          fontWeight: '600',
          color: '#18365E',
          marginBottom: '16px',
          fontFamily: 'Montserrat, sans-serif'
        }}>
          Question {currentQuestionIndex + 1} of {questions.length}
        </h3>
        
        <p style={{
          fontSize: '18px',
          color: '#374151',
          marginBottom: '24px',
          lineHeight: '1.6',
          fontFamily: 'Montserrat, sans-serif'
        }}>
          {currentQuestion.question_text}
        </p>

        {currentQuestion.response_type === 'radio' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {currentQuestion.options.map((option, index) => (
              <label key={index} style={{
                display: 'flex',
                alignItems: 'center',
                padding: '12px',
                border: '2px solid #e5e7eb',
                borderRadius: '8px',
                cursor: 'pointer',
                backgroundColor: responses[currentQuestion.id] === option ? '#f0f9ff' : 'white',
                borderColor: responses[currentQuestion.id] === option ? '#18365E' : '#e5e7eb',
                fontFamily: 'Montserrat, sans-serif'
              }}>
                <input
                  type="radio"
                  name={currentQuestion.id}
                  value={option}
                  checked={responses[currentQuestion.id] === option}
                  onChange={(e) => handleResponseChange(e.target.value)}
                  style={{ marginRight: '12px' }}
                />
                {option}
              </label>
            ))}
          </div>
        )}

        {currentQuestion.response_type === 'checkbox' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {currentQuestion.options.map((option, index) => (
              <label key={index} style={{
                display: 'flex',
                alignItems: 'center',
                padding: '12px',
                border: '2px solid #e5e7eb',
                borderRadius: '8px',
                cursor: 'pointer',
                backgroundColor: (responses[currentQuestion.id] || []).includes(option) ? '#f0f9ff' : 'white',
                borderColor: (responses[currentQuestion.id] || []).includes(option) ? '#18365E' : '#e5e7eb',
                fontFamily: 'Montserrat, sans-serif'
              }}>
                <input
                  type="checkbox"
                  value={option}
                  checked={(responses[currentQuestion.id] || []).includes(option)}
                  onChange={(e) => {
                    const currentValues = responses[currentQuestion.id] || [];
                    const newValues = e.target.checked
                      ? [...currentValues, option]
                      : currentValues.filter(v => v !== option);
                    handleResponseChange(newValues);
                  }}
                  style={{ marginRight: '12px' }}
                />
                {option}
              </label>
            ))}
          </div>
        )}
      </div>
    );
  };

  // Define sections for navigation
  const sections = [
    {
      id: 'strategic_priorities',
      title: 'Strategic Priorities',
      description: 'Key organizational focus areas'
    },
    {
      id: 'data_analytics',
      title: 'Data & Analytics',
      description: 'Current capabilities assessment'
    },
    {
      id: 'goals_objectives',
      title: 'Goals & Objectives',
      description: 'Future state planning'
    }
  ];

  const currentSectionId = currentQuestionIndex < 1 ? 'strategic_priorities' : 
                          currentQuestionIndex < 2 ? 'data_analytics' : 'goals_objectives';
  const currentSectionTitle = sections.find(s => s.id === currentSectionId)?.title || 'Survey';

  const breadcrumbItems = [
    'DVA Platform',
    'Client Data Input',
    'Organizational Strategy Survey',
    currentSectionTitle
  ];

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
        backgroundColor: '#f8f9fa',
        borderRight: '1px solid #e5e7eb',
        display: 'flex',
        flexDirection: 'column'
      }}>
        {/* Sidebar Header */}
        <div style={{
          padding: '24px 20px',
          borderBottom: '1px solid #e5e7eb',
          backgroundColor: 'white'
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
              color: '#18365E',
              margin: 0
            }}>
              DVA Survey
            </h2>
            <button
              onClick={() => window.history.back()}
              style={{
                background: 'none',
                border: 'none',
                fontSize: '20px',
                color: '#6b7280',
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
            color: '#6b7280',
            margin: 0,
            lineHeight: '1.4'
          }}>
            Organizational Strategy Assessment
          </p>
        </div>

        {/* Progress Overview */}
        <div style={{
          padding: '20px',
          borderBottom: '1px solid #e5e7eb',
          backgroundColor: 'white'
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
              color: '#374151'
            }}>
              Overall Progress
            </span>
            <span style={{
              fontSize: '14px',
              color: '#6b7280'
            }}>
              {currentQuestionIndex + 1} of {questions.length}
            </span>
          </div>
          <div style={{
            width: '100%',
            height: '8px',
            backgroundColor: '#e5e7eb',
            borderRadius: '4px',
            overflow: 'hidden'
          }}>
            <div style={{
              width: `${((currentQuestionIndex + 1) / questions.length) * 100}%`,
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
              color: '#374151',
              margin: 0,
              textTransform: 'uppercase',
              letterSpacing: '0.5px'
            }}>
              Sections
            </h3>
          </div>
          {sections.map((section, index) => {
            const isActive = currentSectionId === section.id;
            
            return (
              <div
                key={section.id}
                style={{
                  padding: '12px 20px',
                  backgroundColor: isActive ? '#f0f9ff' : 'transparent',
                  borderLeft: isActive ? '3px solid #18365E' : '3px solid transparent',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px'
                }}
              >
                <div style={{
                  width: '24px',
                  height: '24px',
                  borderRadius: '50%',
                  backgroundColor: isActive ? '#18365E' : '#e5e7eb',
                  color: isActive ? 'white' : '#6b7280',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '12px',
                  fontWeight: '600',
                  flexShrink: 0
                }}>
                  {index + 1}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{
                    fontSize: '14px',
                    fontWeight: isActive ? '600' : '500',
                    color: isActive ? '#18365E' : '#374151',
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
            );
          })}
        </div>

        {/* Footer */}
        <div style={{
          padding: '16px 20px',
          borderTop: '1px solid #e5e7eb',
          backgroundColor: 'white'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            fontSize: '12px',
            color: '#6b7280'
          }}>
            <div style={{
              width: '16px',
              height: '16px',
              backgroundColor: '#18365E',
              borderRadius: '2px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
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
              <div style={{
                width: '80px',
                height: '6px',
                backgroundColor: '#e5e7eb',
                borderRadius: '3px',
                overflow: 'hidden'
              }}>
                <div style={{
                  width: `${((currentQuestionIndex + 1) / questions.length) * 100}%`,
                  height: '100%',
                  backgroundColor: '#FF6E4C',
                  transition: 'width 0.3s ease'
                }} />
              </div>
            </div>
          </div>
        </div>

        {/* Question Content */}
        <div style={{
          flex: 1,
          padding: '32px',
          overflowY: 'auto'
        }}>
        {renderQuestion()}

          {/* Navigation */}
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            paddingTop: '24px',
            borderTop: '1px solid #e5e7eb'
          }}>
            <button
              onClick={handlePrevious}
              disabled={currentQuestionIndex === 0}
              style={{
                padding: '12px 24px',
                backgroundColor: currentQuestionIndex === 0 ? '#f3f4f6' : 'white',
                border: '2px solid #18365E',
                color: currentQuestionIndex === 0 ? '#9ca3af' : '#18365E',
                borderRadius: '8px',
                fontSize: '16px',
                fontWeight: '500',
                cursor: currentQuestionIndex === 0 ? 'not-allowed' : 'pointer',
                fontFamily: 'Montserrat, sans-serif'
              }}
            >
              ← Previous
            </button>

            <div style={{
              fontSize: '14px',
              color: '#6b7280',
              fontFamily: 'Montserrat, sans-serif'
            }}>
              Progress: {currentQuestionIndex + 1} of {questions.length}
            </div>

            <button
              onClick={handleNext}
              disabled={isSubmitting}
              style={{
                padding: '12px 24px',
                backgroundColor: isSubmitting ? '#9ca3af' : '#FF6E4C',
                border: 'none',
                color: 'white',
                borderRadius: '8px',
                fontSize: '16px',
                fontWeight: '500',
                cursor: isSubmitting ? 'not-allowed' : 'pointer',
                fontFamily: 'Montserrat, sans-serif'
              }}
            >
              {isSubmitting ? 'Submitting...' : isLastQuestion ? 'Complete Survey' : 'Next →'}
            </button>
          </div>
        </div>
      </div>

      {/* Completion Modal */}
      {showCompleteModal && (
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
            textAlign: 'center',
            fontFamily: 'Montserrat, sans-serif'
          }}>
            <div style={{ fontSize: '48px', marginBottom: '16px' }}>🎉</div>
            <h2 style={{
              fontSize: '24px',
              fontWeight: '700',
              color: '#18365E',
              marginBottom: '16px'
            }}>
              Survey Complete!
            </h2>
            <p style={{
              fontSize: '16px',
              color: '#6b7280',
              marginBottom: '24px',
              lineHeight: '1.6'
            }}>
              Thank you for completing the Organizational Strategy survey. Your responses will help us create a personalized strategy summary.
            </p>
            <button
              onClick={() => {
                setShowCompleteModal(false);
                if (onGoToSummary) onGoToSummary();
              }}
              style={{
                padding: '12px 24px',
                backgroundColor: '#FF6E4C',
                border: 'none',
                color: 'white',
                borderRadius: '8px',
                fontSize: '16px',
                fontWeight: '500',
                cursor: 'pointer',
                fontFamily: 'Montserrat, sans-serif'
              }}
            >
              View Strategy Summary
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default StrategySurveySimple;
