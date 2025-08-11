import React, { useState, useEffect } from 'react';
import SurveyQuestion from './SurveyQuestion';
import SurveyCompleteModal from './SurveyCompleteModal';
import SurveyService from '../services/surveyService';
import { 
  CAPABILITIES_SURVEY_QUESTIONS, 
  CAPABILITIES_SURVEY_SECTIONS,
  getCapabilitiesQuestionsBySection,
  getTotalCapabilitiesQuestions 
} from '../data/capabilities_survey_questions';

const CurrentCapabilitiesSurvey = ({ 
  isOpen,
  onClose,
  userProfile, 
  onComplete,
  onSaveAndExit,
  isCompleted = false,
  completionStatus = null 
}) => {
  const [responses, setResponses] = useState({});
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [currentSectionIndex, setCurrentSectionIndex] = useState(0);
  const [showCompleteModal, setShowCompleteModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [autoSaveStatus, setAutoSaveStatus] = useState('');
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(true);

  const totalQuestions = getTotalCapabilitiesQuestions();
  
  // Get current section and questions
  const currentSection = CAPABILITIES_SURVEY_SECTIONS[currentSectionIndex] || CAPABILITIES_SURVEY_SECTIONS[0];
  const sectionQuestions = currentSection ? getCapabilitiesQuestionsBySection(currentSection.id) : [];
  const currentQuestion = sectionQuestions[currentQuestionIndex];

  // Load saved responses on mount - FIXED VERSION
  useEffect(() => {
    const loadSavedResponses = async () => {
      if (!userProfile?.client_id || !isOpen) {
        setIsLoading(false);
        return;
      }
      
      setIsLoading(true);
      try {
        console.log('Loading capabilities responses for client:', userProfile.client_id);
        const result = await SurveyService.loadCapabilitiesResponses(userProfile.client_id);
        console.log('Raw capabilities response:', result);
        
        if (result) {
          const validResponses = {};
          
          // Check if we have the actual responses object
          const responseData = result.responses || result;
          
          // Iterate through all questions to find responses
          CAPABILITIES_SURVEY_QUESTIONS.forEach(question => {
            const questionId = question.id;
            
            // Check various possible response locations
            let value = responseData[questionId] || 
                       responseData[`question_${questionId}`] ||
                       responseData[questionId.replace('cap_', '')];
            
            if (value !== undefined && value !== null && value !== '') {
              // Parse the response based on question type
              if (question.response_type === 'multi_select' || question.response_type === 'checkbox') {
                // Handle multi-select responses
                if (typeof value === 'string') {
                  // Split comma-separated string into array
                  validResponses[questionId] = value.split(',').map(v => v.trim()).filter(v => v);
                } else if (Array.isArray(value)) {
                  validResponses[questionId] = value;
                } else {
                  validResponses[questionId] = [];
                }
              } else {
                // Single select or text responses
                validResponses[questionId] = value;
              }
            }
          });
          
          console.log('Parsed responses:', validResponses);
          setResponses(validResponses);
        }
      } catch (error) {
        console.error('Failed to load capabilities responses:', error);
      } finally {
        setIsLoading(false);
      }
    };

    if (isOpen) {
      loadSavedResponses();
    }
  }, [isOpen, userProfile?.client_id]);

  // Handle response change with auto-save
  const handleResponseChange = async (questionId, value) => {
    if (isCompleted) return;
    
    const newResponses = { ...responses, [questionId]: value };
    setResponses(newResponses);
    
    console.log('Response changed:', questionId, value);
    console.log('All responses now:', newResponses);

    // Clear errors
    if (errors[questionId]) {
      setErrors(prev => ({
        ...prev,
        [questionId]: null
      }));
    }

    // Auto-save
    if (userProfile?.client_id && value) {
      try {
        setAutoSaveStatus('saving');
        
        const question = CAPABILITIES_SURVEY_QUESTIONS.find(q => q.id === questionId);
        await SurveyService.saveCapabilitiesResponse({
          client_id: userProfile.client_id,
          user_id: userProfile.user_id || 'anonymous',
          question_id: questionId,
          question_text: question?.question_text || '',
          response: Array.isArray(value) ? value.join(', ') : value.toString(),
          response_type: question?.response_type || 'text'
        });
        
        setAutoSaveStatus('saved');
        setTimeout(() => setAutoSaveStatus(''), 2000);
      } catch (error) {
        console.error('Auto-save failed:', error);
        setAutoSaveStatus('error');
        setTimeout(() => setAutoSaveStatus(''), 3000);
      }
    }
  };

  // Validation
  const validateCurrentQuestion = () => {
    if (!currentQuestion?.required) return true;
    
    const response = responses[currentQuestion.id];
    const isValid = response && (
      Array.isArray(response) ? response.length > 0 : response.toString().trim() !== ''
    );

    if (!isValid) {
      setErrors(prev => ({
        ...prev,
        [currentQuestion.id]: 'This question is required'
      }));
    }

    return isValid;
  };

  // Navigation handlers
  const handleNext = () => {
    if (!validateCurrentQuestion()) return;

    if (currentQuestionIndex < sectionQuestions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    } else if (currentSectionIndex < CAPABILITIES_SURVEY_SECTIONS.length - 1) {
      setCurrentSectionIndex(currentSectionIndex + 1);
      setCurrentQuestionIndex(0);
    }
  };

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    } else if (currentSectionIndex > 0) {
      const newSectionIndex = currentSectionIndex - 1;
      const prevSectionQuestions = getCapabilitiesQuestionsBySection(
        CAPABILITIES_SURVEY_SECTIONS[newSectionIndex].id
      );
      setCurrentSectionIndex(newSectionIndex);
      setCurrentQuestionIndex(prevSectionQuestions.length - 1);
    }
  };

  const handleSectionClick = (sectionIndex) => {
    setCurrentSectionIndex(sectionIndex);
    setCurrentQuestionIndex(0);
  };

  // Check position
  const isFirstQuestion = () => {
    return currentSectionIndex === 0 && currentQuestionIndex === 0;
  };

  const isLastQuestion = () => {
    const isLastSection = currentSectionIndex === CAPABILITIES_SURVEY_SECTIONS.length - 1;
    const isLastQuestionInSection = currentQuestionIndex === sectionQuestions.length - 1;
    return isLastSection && isLastQuestionInSection;
  };

  // Submit handler
  const handleFinalSubmit = async () => {
    if (!validateCurrentQuestion()) return;

    const requiredQuestions = CAPABILITIES_SURVEY_QUESTIONS.filter(q => q.required);
    const missingResponses = requiredQuestions.filter(q => !responses[q.id] || 
      (Array.isArray(responses[q.id]) && responses[q.id].length === 0));

    if (missingResponses.length > 0) {
      alert(`Please complete all required questions before submitting. Missing: ${missingResponses.length} questions.`);
      return;
    }

    setIsSubmitting(true);

    try {
      await SurveyService.recordCapabilitiesCompletion({
        client_id: userProfile.client_id,
        user_id: userProfile.user_id || 'anonymous',
        completed_at: new Date().toISOString()
      });

      if (onComplete) {
        onComplete({
          responses,
          completedAt: new Date().toISOString(),
          surveyType: 'capabilities'
        });
      }

      setShowCompleteModal(true);
    } catch (error) {
      console.error('Failed to submit capabilities survey:', error);
      alert('Failed to submit survey. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCompleteModalClose = () => {
    setShowCompleteModal(false);
    if (onSaveAndExit) {
      onSaveAndExit();
    } else if (onClose) {
      onClose();
    }
  };

  // Enhanced progress calculation
  const getOverallProgress = () => {
    const answeredCount = Object.keys(responses).length;
    return {
      current: answeredCount,
      total: totalQuestions,
      percentage: totalQuestions > 0 ? (answeredCount / totalQuestions) * 100 : 0
    };
  };

  const getNavigationLabel = () => {
    if (isLastQuestion()) {
      return 'Complete Survey';
    }
    
    if (currentQuestionIndex === sectionQuestions.length - 1 && 
        currentSectionIndex < CAPABILITIES_SURVEY_SECTIONS.length - 1) {
      const nextSection = CAPABILITIES_SURVEY_SECTIONS[currentSectionIndex + 1];
      return `Next Section: ${nextSection?.title}`;
    }
    
    return 'Next →';
  };

  // Custom question rendering with enhanced styling
  const renderQuestionOptions = () => {
    if (!currentQuestion) return null;

    // For SurveyQuestion component compatibility
    if (currentQuestion.options) {
      const responseType = currentQuestion.response_type || currentQuestion.type;
      const isMultiSelect = responseType === 'multi_select' || responseType === 'checkbox';

      return (
        <div>
          {currentQuestion.options.map((option, index) => {
            const isSelected = isMultiSelect
              ? (responses[currentQuestion.id] || []).includes(option)
              : responses[currentQuestion.id] === option;

            return (
              <label
                key={index}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  padding: '1rem 1.5rem',
                  backgroundColor: isSelected ? '#EFF6FF' : 'white',
                  border: `2px solid ${isSelected ? '#2563EB' : '#e5e7eb'}`,
                  borderRadius: '8px',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  marginBottom: '0.75rem'
                }}
                onMouseEnter={(e) => {
                  if (!isSelected) {
                    e.currentTarget.style.backgroundColor = '#f9fafb';
                    e.currentTarget.style.borderColor = '#d1d5db';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isSelected) {
                    e.currentTarget.style.backgroundColor = 'white';
                    e.currentTarget.style.borderColor = '#e5e7eb';
                  }
                }}
              >
                <input
                  type={isMultiSelect ? 'checkbox' : 'radio'}
                  name={currentQuestion.id}
                  value={option}
                  checked={isSelected}
                  onChange={(e) => {
                    if (isMultiSelect) {
                      const currentValues = responses[currentQuestion.id] || [];
                      const newValues = e.target.checked
                        ? [...currentValues, option]
                        : currentValues.filter(v => v !== option);
                      handleResponseChange(currentQuestion.id, newValues);
                    } else {
                      handleResponseChange(currentQuestion.id, option);
                    }
                  }}
                  style={{
                    width: '20px',
                    height: '20px',
                    marginRight: '1rem',
                    cursor: 'pointer',
                    accentColor: '#2563EB'
                  }}
                />
                <span style={{
                  fontSize: '1rem',
                  color: isSelected ? '#1f2937' : '#374151',
                  fontWeight: isSelected ? '500' : '400'
                }}>
                  {option}
                </span>
              </label>
            );
          })}
        </div>
      );
    }

    // Fallback to SurveyQuestion component
    return (
      <SurveyQuestion
        question={currentQuestion}
        response={responses[currentQuestion.id]}
        onResponseChange={(value) => handleResponseChange(currentQuestion.id, value)}
        error={errors[currentQuestion.id]}
        disabled={isCompleted}
      />
    );
  };

  // Don't render if not open
  if (!isOpen) {
    return null;
  }

  const progress = getOverallProgress();

  // Debug logging
  console.log('Current question:', currentQuestion);
  console.log('Current response:', responses[currentQuestion?.id]);
  console.log('Progress:', progress);

  return (
    <>
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
        zIndex: 9999
      }}>
        <div style={{
          backgroundColor: 'white',
          width: '90%',
          maxWidth: '1200px',
          height: '90vh',
          borderRadius: '12px',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          position: 'relative'
        }}>
          {/* Header with breadcrumb */}
          <div style={{
            backgroundColor: 'white',
            borderBottom: '1px solid #e5e7eb',
            padding: '1rem 1.5rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '2rem',
              flex: 1
            }}>
              {/* Breadcrumb */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                fontSize: '0.875rem',
                color: '#6b7280'
              }}>
                <span>DVA Platform</span>
                <span>›</span>
                <span>Client Data Input</span>
                <span>›</span>
                <span>Current Capabilities Survey</span>
                <span>›</span>
                <span style={{ color: '#1f2937', fontWeight: '500' }}>
                  {currentSection?.title || 'Loading...'}
                </span>
              </div>
            </div>
            
            {/* Question Progress */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '1rem'
            }}>
              <span style={{
                fontSize: '0.875rem',
                color: '#6b7280'
              }}>
                {currentSection?.title || ''}
              </span>
              <span style={{
                fontSize: '0.875rem',
                color: '#6b7280'
              }}>
                Question {currentQuestionIndex + 1} of {sectionQuestions.length}
              </span>
              <button
                onClick={onClose}
                style={{
                  padding: '0.5rem',
                  backgroundColor: 'transparent',
                  border: 'none',
                  cursor: 'pointer',
                  fontSize: '1.5rem',
                  color: '#6b7280',
                  lineHeight: 1
                }}
              >
                ×
              </button>
            </div>
          </div>

          {/* Main Content */}
          <div style={{
            flex: 1,
            display: 'flex',
            overflow: 'hidden'
          }}>
            {/* Enhanced Sidebar */}
            <div style={{
              width: '280px',
              backgroundColor: '#2c3e50',
              color: 'white',
              padding: '1.5rem',
              overflowY: 'auto',
              display: 'flex',
              flexDirection: 'column'
            }}>
              <div>
                <h2 style={{
                  fontSize: '1.125rem',
                  fontWeight: '600',
                  marginBottom: '0.5rem'
                }}>
                  DVA Survey
                </h2>
                <p style={{
                  fontSize: '0.875rem',
                  opacity: 0.9,
                  marginBottom: '1.5rem'
                }}>
                  Current Capabilities Assessment
                </p>

                {/* Enhanced Overall Progress */}
                <div style={{ marginBottom: '2rem' }}>
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    marginBottom: '0.5rem',
                    fontSize: '0.875rem'
                  }}>
                    <span>Overall Progress</span>
                    <span style={{ fontWeight: '600' }}>
                      {progress.current} of {progress.total}
                    </span>
                  </div>
                  <div style={{
                    height: '8px',
                    backgroundColor: 'rgba(255, 255, 255, 0.2)',
                    borderRadius: '4px',
                    overflow: 'hidden',
                    position: 'relative'
                  }}>
                    <div style={{
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      width: `${progress.percentage}%`,
                      height: '100%',
                      backgroundColor: '#FF6E4C',
                      transition: 'width 0.3s ease',
                      borderRadius: '4px',
                      minWidth: progress.percentage > 0 ? '8px' : '0'
                    }} />
                  </div>
                </div>

                {/* Enhanced Sections with completion tracking */}
                <div>
                  <h3 style={{
                    fontSize: '0.75rem',
                    textTransform: 'uppercase',
                    opacity: 0.7,
                    marginBottom: '1rem',
                    letterSpacing: '0.05em'
                  }}>
                    SECTIONS
                  </h3>
                  {CAPABILITIES_SURVEY_SECTIONS.map((section, index) => {
                    const sectionQs = getCapabilitiesQuestionsBySection(section.id);
                    const answeredCount = sectionQs.filter(q => responses[q.id]).length;
                    const isActive = index === currentSectionIndex;
                    const isComplete = answeredCount === sectionQs.length && sectionQs.length > 0;
                    
                    return (
                      <div
                        key={section.id}
                        onClick={() => handleSectionClick(index)}
                        style={{
                          padding: '0.75rem 1rem',
                          marginBottom: '0.5rem',
                          backgroundColor: isActive ? 'rgba(255, 255, 255, 0.1)' : 'transparent',
                          borderRadius: '8px',
                          cursor: 'pointer',
                          transition: 'all 0.2s ease'
                        }}
                        onMouseEnter={(e) => {
                          if (!isActive) {
                            e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.05)';
                          }
                        }}
                        onMouseLeave={(e) => {
                          if (!isActive) {
                            e.currentTarget.style.backgroundColor = 'transparent';
                          }
                        }}
                      >
                        <div style={{
                          display: 'flex',
                          alignItems: 'flex-start',
                          gap: '0.75rem'
                        }}>
                          <div style={{
                            width: '32px',
                            height: '32px',
                            borderRadius: '50%',
                            backgroundColor: isActive ? '#FF6E4C' : 
                                           isComplete ? '#4ade80' : 
                                           'rgba(255, 255, 255, 0.2)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '0.875rem',
                            fontWeight: '600',
                            flexShrink: 0
                          }}>
                            {isComplete ? '✓' : index + 1}
                          </div>
                          <div style={{ flex: 1 }}>
                            <div style={{
                              fontSize: '0.875rem',
                              fontWeight: '500',
                              marginBottom: '0.25rem'
                            }}>
                              {section.title}
                            </div>
                            <div style={{
                              fontSize: '0.75rem',
                              opacity: 0.7,
                              lineHeight: '1.3'
                            }}>
                              {section.description}
                            </div>
                            {answeredCount > 0 && (
                              <div style={{
                                fontSize: '0.75rem',
                                marginTop: '0.5rem',
                                color: isComplete ? '#4ade80' : '#fbbf24',
                                fontWeight: '500'
                              }}>
                                {answeredCount}/{sectionQs.length} completed
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Footer */}
              <div style={{
                marginTop: 'auto',
                paddingTop: '2rem',
                borderTop: '1px solid rgba(255, 255, 255, 0.1)'
              }}>
                <div style={{
                  fontSize: '0.75rem',
                  opacity: 0.7,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem'
                }}>
                  <span>🏢</span>
                  <span>Data Value Accelerator</span>
                </div>
              </div>
            </div>

            {/* Question Content Area */}
            <div style={{
              flex: 1,
              padding: '3rem',
              overflowY: 'auto',
              display: 'flex',
              flexDirection: 'column',
              backgroundColor: '#fafafa'
            }}>
              {isLoading ? (
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  height: '100%'
                }}>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{
                      width: '48px',
                      height: '48px',
                      border: '4px solid #e5e7eb',
                      borderTop: '4px solid #FF6E4C',
                      borderRadius: '50%',
                      animation: 'spin 1s linear infinite',
                      margin: '0 auto 1rem'
                    }} />
                    <p style={{ color: '#6b7280' }}>Loading saved responses...</p>
                  </div>
                </div>
              ) : currentQuestion ? (
                <>
                  <div style={{ flex: 1 }}>
                    <h2 style={{
                      fontSize: '1.5rem',
                      fontWeight: '600',
                      color: '#1f2937',
                      marginBottom: '2rem'
                    }}>
                      Question {currentQuestionIndex + 1} of {sectionQuestions.length}
                    </h2>
                    
                    {/* Question Text */}
                    <p style={{
                      fontSize: '1.125rem',
                      color: '#374151',
                      marginBottom: '2rem',
                      lineHeight: '1.6'
                    }}>
                      {currentQuestion.question_text || currentQuestion.text}
                      {currentQuestion.required && (
                        <span style={{ color: '#ef4444', marginLeft: '0.25rem' }}>*</span>
                      )}
                    </p>

                    {/* Enhanced Options */}
                    {renderQuestionOptions()}

                    {/* Error message */}
                    {errors[currentQuestion.id] && (
                      <div style={{
                        color: '#ef4444',
                        fontSize: '0.875rem',
                        marginTop: '0.5rem'
                      }}>
                        {errors[currentQuestion.id]}
                      </div>
                    )}

                    {/* Auto-save status */}
                    {autoSaveStatus && (
                      <div style={{
                        position: 'fixed',
                        top: '5rem',
                        right: '2rem',
                        backgroundColor: autoSaveStatus === 'saved' ? '#10b981' : 
                                       autoSaveStatus === 'saving' ? '#f59e0b' : '#ef4444',
                        color: 'white',
                        padding: '0.5rem 1rem',
                        borderRadius: '6px',
                        fontSize: '0.875rem',
                        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        zIndex: 10000
                      }}>
                        {autoSaveStatus === 'saved' ? '✓ Saved' : 
                         autoSaveStatus === 'saving' ? '⟳ Saving...' : '⚠ Save Error'}
                      </div>
                    )}
                  </div>

                  {/* Enhanced Navigation */}
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    paddingTop: '2rem',
                    borderTop: '1px solid #e5e7eb',
                    marginTop: '2rem'
                  }}>
                    <button
                      onClick={handlePrevious}
                      disabled={isFirstQuestion()}
                      style={{
                        padding: '0.75rem 1.5rem',
                        backgroundColor: 'white',
                        border: '2px solid #e5e7eb',
                        borderRadius: '8px',
                        color: isFirstQuestion() ? '#9ca3af' : '#374151',
                        fontSize: '1rem',
                        fontWeight: '500',
                        cursor: isFirstQuestion() ? 'not-allowed' : 'pointer',
                        opacity: isFirstQuestion() ? 0.5 : 1,
                        transition: 'all 0.2s ease'
                      }}
                    >
                      ← Previous
                    </button>

                    <div style={{
                      fontSize: '0.875rem',
                      color: '#6b7280'
                    }}>
                      Progress: {progress.current} of {progress.total}
                    </div>

                    <button
                      onClick={isLastQuestion() ? handleFinalSubmit : handleNext}
                      disabled={isSubmitting}
                      style={{
                        padding: '0.75rem 1.5rem',
                        backgroundColor: isSubmitting ? '#9ca3af' : '#FF6E4C',
                        border: 'none',
                        borderRadius: '8px',
                        color: 'white',
                        fontSize: '1rem',
                        fontWeight: '500',
                        cursor: isSubmitting ? 'not-allowed' : 'pointer',
                        transition: 'all 0.2s ease',
                        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
                      }}
                    >
                      {isSubmitting ? 'Submitting...' : getNavigationLabel()}
                    </button>
                  </div>
                </>
              ) : (
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  height: '100%',
                  color: '#6b7280'
                }}>
                  No question available
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Completion Modal */}
      {showCompleteModal && (
        <SurveyCompleteModal
          title="🎉 Current Capabilities Survey Complete!"
          message="You can now continue to the next step in your data readiness journey."
          onClose={handleCompleteModalClose}
          onNavigate={() => {
            handleCompleteModalClose();
          }}
          navigationLabel="Continue to Data Readiness"
        />
      )}

      {/* Add keyframe animation for spinner */}
      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </>
  );
};

export default CurrentCapabilitiesSurvey;