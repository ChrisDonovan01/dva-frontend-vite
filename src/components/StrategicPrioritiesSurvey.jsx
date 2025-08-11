import React, { useState, useEffect, useRef } from 'react';
import surveyService from '../services/surveyService';

const StrategicPrioritiesSurvey = ({ 
  clientId,
  userId,
  surveyType = 'strategy',
  onClose,
  onComplete,
  onSaveAndExit,
  onRefresh
}) => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [responses, setResponses] = useState({});
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const abortControllerRef = useRef(null);

  // Load survey data
  useEffect(() => {
    const loadSurveyData = async () => {
      // Cancel any in-flight requests
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      abortControllerRef.current = new AbortController();

      setLoading(true);
      setError(null);

      try {
        // Load questions using the new normalized API
        const questionData = await surveyService.getSurveyDefinition(surveyType);
        
        // Extract questions from the structure
        let extractedQuestions = [];
        if (questionData) {
          if (Array.isArray(questionData)) {
            extractedQuestions = questionData;
          } else if (questionData.questions) {
            extractedQuestions = questionData.questions;
          } else if (questionData.sections) {
            // Extract questions from sections
            questionData.sections.forEach(section => {
              if (section.questions) {
                extractedQuestions.push(...section.questions);
              }
            });
          }
        }
        
        // Map to expected format if needed
        const formattedQuestions = extractedQuestions.map(q => ({
          question_id: q.question_id || q.id,
          section: q.section || 'General',
          question_text: q.question_text || q.text,
          response_type: q.response_type || q.type || 'text',
          choices: q.choices || q.options || []
        }));

        setQuestions(formattedQuestions.length > 0 ? formattedQuestions : getFallbackQuestions());

        // Load saved responses
        const savedResponses = await surveyService.getSurveyResponses(clientId, surveyType);
        if (savedResponses && typeof savedResponses === 'object') {
          setResponses(savedResponses);
        }
      } catch (err) {
        if (err.name !== 'AbortError') {
          console.error('Error loading survey:', err);
          setError('Failed to load survey. Please try again.');
          setQuestions(getFallbackQuestions());
        }
      } finally {
        setLoading(false);
      }
    };

    loadSurveyData();

    // Cleanup on unmount
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [clientId, surveyType]);

  const getFallbackQuestions = () => [
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
    }
  ];

  const sections = [
    { id: 'strategic_vision', title: 'Strategic Vision', description: 'Core priorities and differentiators' },
    { id: 'data_innovation', title: 'Data & Innovation', description: 'Technology adoption mindset' },
    { id: 'financial_objectives', title: 'Financial Objectives', description: 'Revenue and investment strategy' },
    { id: 'optional_context', title: 'Optional Context', description: 'Additional strategic context' }
  ];

  const getCurrentSection = () => {
    const currentQuestion = questions[currentQuestionIndex];
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

  const handleResponseChange = (value) => {
    const currentQuestion = questions[currentQuestionIndex];
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

  const handleSaveAndExit = async () => {
    if (saving) return;
    setSaving(true);
    setError(null);

    try {
      const payload = {
        responses,
        status: 'in_progress',
        lastUpdated: new Date().toISOString(),
        userId: userId || 'demo_user'
      };
      
      await surveyService.saveSurveyResponses(clientId, surveyType, payload);
      
      if (onSaveAndExit) {
        onSaveAndExit(responses, Object.keys(responses).length);
      }
    } catch (err) {
      console.error('Error saving survey:', err);
      setError('Failed to save survey. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleComplete = async () => {
    if (saving) return;
    setSaving(true);
    setError(null);

    try {
      const payload = {
        responses,
        status: 'complete',
        completedAt: new Date().toISOString(),
        userId: userId || 'demo_user'
      };

      await surveyService.saveSurveyResponses(clientId, surveyType, payload);
      await surveyService.completeSurvey(clientId, surveyType, userId || 'demo_user');
      
      if (onComplete) {
        onComplete();
      }
      if (onRefresh) {
        onRefresh();
      }
    } catch (err) {
      console.error('Error completing survey:', err);
      setError('Failed to complete survey. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const renderQuestion = () => {
    const currentQuestion = questions[currentQuestionIndex];
    if (!currentQuestion) return null;

    const currentValue = responses[currentQuestion.question_id] || '';

    switch (currentQuestion.response_type) {
      case 'radio':
      case 'likert_1_5':
        return (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {currentQuestion.choices?.map((choice, index) => (
              <label
                key={index}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  padding: '12px 16px',
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
                  disabled={saving}
                  style={{ marginRight: '12px', accentColor: '#0ea5e9' }}
                />
                <span style={{
                  fontSize: '15px',
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
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {currentQuestion.choices?.map((choice, index) => (
              <label
                key={index}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  padding: '10px 14px',
                  border: '1px solid #e5e7eb',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  backgroundColor: selectedValues.includes(choice) ? '#f0f9ff' : 'white'
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
                  disabled={saving}
                  style={{ marginRight: '10px' }}
                />
                <span style={{ fontSize: '15px', color: '#374151' }}>{choice}</span>
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
            disabled={saving}
            style={{
              width: '100%',
              minHeight: '120px',
              padding: '12px',
              border: '1px solid #e5e7eb',
              borderRadius: '6px',
              fontSize: '15px',
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
            disabled={saving}
            style={{
              width: '100%',
              padding: '12px',
              border: '1px solid #e5e7eb',
              borderRadius: '6px',
              fontSize: '15px'
            }}
          />
        );
    }
  };

  // Container styles for modal-safe rendering
  const containerStyles = {
    display: 'flex',
    height: '100%',
    maxHeight: '100%',
    fontFamily: 'Montserrat, sans-serif',
    backgroundColor: '#f9fafb',
    borderRadius: '12px',
    overflow: 'hidden'
  };

  if (loading) {
    return (
      <div style={containerStyles}>
        <div className="flex items-center justify-center w-full">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Loading Survey Questions</h3>
            <p className="text-gray-600">Please wait while we load your survey...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error && questions.length === 0) {
    return (
      <div style={containerStyles}>
        <div className="flex items-center justify-center w-full">
          <div className="text-center p-6">
            <p className="text-red-600 mb-4">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  const currentQuestion = questions[currentQuestionIndex];
  const isLastQuestion = currentQuestionIndex === questions.length - 1;
  const currentSection = getCurrentSection();
  const completedCount = questions.filter(q => {
    const response = responses[q.question_id];
    return response && response.toString().trim() !== '';
  }).length;

  return (
    <div style={containerStyles}>
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
          <h2 style={{ fontSize: '18px', fontWeight: '700', color: 'white', margin: 0 }}>
            DVA Survey
          </h2>
          <p style={{ fontSize: '14px', color: 'rgba(255, 255, 255, 0.8)', margin: 0, marginTop: '8px' }}>
            Strategic Priorities Assessment
          </p>
        </div>

        {/* Progress Overview */}
        <div style={{
          padding: '20px',
          borderBottom: '1px solid rgba(255, 255, 255, 0.1)'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
            <span style={{ fontSize: '14px', fontWeight: '600' }}>Overall Progress</span>
            <span style={{ fontSize: '14px', color: 'rgba(255, 255, 255, 0.8)' }}>
              {completedCount} of {questions.length}
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
              width: `${(completedCount / questions.length) * 100}%`,
              height: '100%',
              backgroundColor: '#FF6E4C',
              transition: 'width 0.3s ease'
            }} />
          </div>
        </div>

        {/* Section Navigation */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '16px 0' }}>
          <h3 style={{
            fontSize: '14px',
            fontWeight: '600',
            margin: '0 20px 12px',
            textTransform: 'uppercase',
            letterSpacing: '0.5px'
          }}>
            Sections
          </h3>
          {sections.map((section, index) => (
            <div
              key={section.id}
              style={{
                padding: '12px 20px',
                margin: '0 16px 8px',
                borderRadius: '8px',
                backgroundColor: currentSection?.id === section.id ? 'rgba(255, 255, 255, 0.1)' : 'transparent',
                cursor: 'pointer'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{
                  width: '24px',
                  height: '24px',
                  borderRadius: '50%',
                  backgroundColor: currentSection?.id === section.id ? '#FF6E4C' : 'rgba(255, 255, 255, 0.2)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '12px',
                  fontWeight: '600'
                }}>
                  {index + 1}
                </div>
                <div>
                  <div style={{ fontSize: '14px', fontWeight: '600' }}>{section.title}</div>
                  <div style={{ fontSize: '12px', color: 'rgba(255, 255, 255, 0.7)' }}>
                    {section.description}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Main Content Area */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', backgroundColor: 'white' }}>
        {/* Header */}
        <div style={{
          backgroundColor: 'white',
          borderBottom: '1px solid #e5e7eb',
          padding: '16px 32px'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '14px', color: '#6b7280' }}>
              Question {currentQuestionIndex + 1} of {questions.length}
            </span>
            <button
              onClick={handleSaveAndExit}
              disabled={saving}
              style={{
                background: 'none',
                border: 'none',
                fontSize: '20px',
                color: '#6b7280',
                cursor: saving ? 'not-allowed' : 'pointer',
                padding: '4px'
              }}
              title="Save & Exit"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Question Content */}
        <div style={{ flex: 1, padding: '32px', overflowY: 'auto' }}>
          {error && (
            <div style={{
              padding: '12px',
              backgroundColor: '#fef2f2',
              border: '1px solid #fecaca',
              borderRadius: '6px',
              marginBottom: '20px',
              color: '#dc2626'
            }}>
              {error}
            </div>
          )}
          <div style={{ maxWidth: '800px', margin: '0 auto' }}>
            <h1 style={{
              fontSize: '24px',
              fontWeight: '700',
              color: '#18365E',
              marginBottom: '24px'
            }}>
              {currentQuestion?.question_text}
            </h1>
            {renderQuestion()}
          </div>
        </div>

        {/* Navigation Footer */}
        <div style={{
          borderTop: '1px solid #e5e7eb',
          padding: '20px 32px',
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
              disabled={currentQuestionIndex === 0 || saving}
              style={{
                padding: '10px 20px',
                border: '1px solid #d1d5db',
                borderRadius: '8px',
                backgroundColor: 'white',
                color: currentQuestionIndex === 0 ? '#9ca3af' : '#374151',
                cursor: currentQuestionIndex === 0 || saving ? 'not-allowed' : 'pointer',
                fontWeight: '500',
                fontSize: '14px',
                opacity: currentQuestionIndex === 0 ? 0.5 : 1
              }}
            >
              ← Previous
            </button>

            <button
              onClick={handleSaveAndExit}
              disabled={saving}
              style={{
                padding: '10px 20px',
                border: '1px solid #d1d5db',
                borderRadius: '8px',
                backgroundColor: 'white',
                color: '#374151',
                cursor: saving ? 'not-allowed' : 'pointer',
                fontWeight: '500',
                fontSize: '14px'
              }}
            >
              {saving ? 'Saving...' : 'Save & Exit'}
            </button>

            {isLastQuestion ? (
              <button
                onClick={handleComplete}
                disabled={saving}
                style={{
                  padding: '10px 20px',
                  border: 'none',
                  borderRadius: '8px',
                  backgroundColor: '#FF6E4C',
                  color: 'white',
                  cursor: saving ? 'not-allowed' : 'pointer',
                  fontWeight: '500',
                  fontSize: '14px',
                  opacity: saving ? 0.7 : 1
                }}
              >
                {saving ? 'Completing...' : 'Complete Survey'}
              </button>
            ) : (
              <button
                onClick={handleNext}
                disabled={saving}
                style={{
                  padding: '10px 20px',
                  border: 'none',
                  borderRadius: '8px',
                  backgroundColor: '#FF6E4C',
                  color: 'white',
                  cursor: saving ? 'not-allowed' : 'pointer',
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