import React, { useState, useEffect } from 'react';
import SurveyService from '../services/surveyService'; // Ensure this path is correct

const StrategySurvey = ({
  isOpen,
  onSaveAndExit,
  userProfile,
  initialResponses = {},
  initialCompletionStatus = false
}) => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [responses, setResponses] = useState(initialResponses);
  const [questions, setQuestions] = useState([]);
  const [questionsLoading, setQuestionsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [surveyCompleted, setSurveyCompleted] = useState(initialCompletionStatus);
  const [showExitConfirm, setShowExitConfirm] = useState(false);

  // Fallback questions in case backend loading fails
  const fallbackQuestions = [
    {
      question_id: 'strat_q1',
      section: 'Vision & Goals',
      question_text: 'How clearly defined is your organization\'s overall data strategy and vision?',
      response_type: 'likert_1_5',
      choices: ['Very Unclear', 'Somewhat Unclear', 'Moderately Clear', 'Clear', 'Very Clear']
    },
    {
      question_id: 'strat_q2',
      section: 'Vision & Goals',
      question_text: 'Are data-driven goals explicitly integrated into your business unit objectives?',
      response_type: 'radio',
      choices: ['Not at all', 'Minimally', 'Partially', 'Significantly', 'Fully']
    },
    {
      question_id: 'strat_q3',
      section: 'Leadership & Culture',
      question_text: 'To what extent does senior leadership champion data initiatives?',
      response_type: 'likert_1_5',
      choices: ['Not at all', 'Rarely', 'Sometimes', 'Often', 'Consistently']
    },
    {
      question_id: 'strat_q4',
      section: 'Leadership & Culture',
      question_text: 'Is there a dedicated role or committee responsible for data strategy oversight?',
      response_type: 'radio',
      choices: ['Yes, a CDO/Chief Data Officer', 'Yes, a Data Governance Committee', 'Yes, a Data Council', 'No, but planned', 'No']
    },
    {
      question_id: 'strat_q5',
      section: 'Investment & Resources',
      question_text: 'How adequately resourced (budget, personnel, tools) are your data initiatives?',
      response_type: 'likert_1_5',
      choices: ['Very Inadequate', 'Inadequate', 'Fair', 'Adequate', 'Very Adequate']
    },
    {
      question_id: 'strat_q6',
      section: 'Investment & Resources',
      question_text: 'What percentage of your IT budget is allocated to data-related projects?',
      response_type: 'radio',
      choices: ['<5%', '5-10%', '10-20%', '20-30%', '>30%']
    },
    {
      question_id: 'strat_q7',
      section: 'Data Ecosystem & Partnerships',
      question_text: 'How well do different departments collaborate on data sharing and analytics projects?',
      response_type: 'likert_1_5',
      choices: ['Poorly', 'Fairly', 'Moderately', 'Well', 'Excellent']
    },
    {
      question_id: 'strat_q8',
      section: 'Data Ecosystem & Partnerships',
      question_text: 'Do you actively engage with external partners (e.g., vendors, consultants) for data expertise?',
      response_type: 'radio',
      choices: ['Yes, extensively', 'Yes, sometimes', 'Minimally', 'No']
    },
    {
      question_id: 'strat_q9',
      section: 'Risk & Compliance',
      question_text: 'How confident are you in your organization\'s ability to comply with data privacy regulations (e.g., GDPR, CCPA)?',
      response_type: 'likert_1_5',
      choices: ['Very Low', 'Low', 'Moderate', 'High', 'Very High']
    },
    {
      question_id: 'strat_q10',
      section: 'Risk & Compliance',
      question_text: 'Is there a formal process for identifying and mitigating data-related risks?',
      response_type: 'radio',
      choices: ['Yes, well-defined', 'Yes, but informal', 'In development', 'No']
    },
    {
      question_id: 'strat_q11',
      section: 'Innovation & Future Readiness',
      question_text: 'How proactive is your organization in exploring new data technologies (e.g., AI, blockchain)?',
      response_type: 'likert_1_5',
      choices: ['Not at all', 'Minimally', 'Moderately', 'Significantly', 'Very Proactive']
    },
    {
      question_id: 'strat_q12',
      section: 'Innovation & Future Readiness',
      question_text: 'Which of the following emerging data trends are you actively investing in?',
      response_type: 'checkbox',
      choices: ['Machine Learning/AI', 'Big Data Analytics', 'Cloud Data Platforms', 'Data Governance Automation', 'Real-time Analytics', 'Data Virtualization']
    },
    {
      question_id: 'strat_q13',
      section: 'Measurement & KPIs',
      question_text: 'Are key performance indicators (KPIs) for data initiatives clearly defined and regularly tracked?',
      response_type: 'likert_1_5',
      choices: ['Not at all', 'Minimally', 'Partially', 'Significantly', 'Fully']
    },
    {
      question_id: 'strat_q14',
      section: 'Measurement & KPIs',
      question_text: 'How frequently are data strategy reviews conducted with key stakeholders?',
      response_type: 'radio',
      choices: ['Annually', 'Bi-annually', 'Quarterly', 'Monthly', 'Ad-hoc']
    }
  ];

  // Load questions from backend on component mount
  useEffect(() => {
    const loadQuestions = async () => {
      setQuestionsLoading(true);
      try {
        const fetchedQuestions = await SurveyService.loadSurveyQuestions('strategy');
        if (fetchedQuestions && fetchedQuestions.length > 0) {
          setQuestions(fetchedQuestions);
        } else {
          console.warn("No questions fetched from backend for strategy survey, using fallback questions.");
          setQuestions(fallbackQuestions);
        }
      } catch (error) {
        console.error("Failed to load strategy survey questions:", error);
        setQuestions(fallbackQuestions); // Use fallback questions on error
      } finally {
        setQuestionsLoading(false);
      }
    };

    if (isOpen) {
      loadQuestions();
    }
  }, [isOpen]);

  // Effect to update responses if initialResponses change
  useEffect(() => {
    setResponses(initialResponses);
    setSurveyCompleted(initialCompletionStatus);
    if (!initialCompletionStatus) {
      setCurrentQuestionIndex(0);
    }
  }, [initialResponses, initialCompletionStatus]);

  // If the survey is not open, don't render anything
  if (!isOpen) {
    return null;
  }

  const currentQuestion = questions[currentQuestionIndex];
  const isLastQuestion = currentQuestionIndex === questions.length - 1;

  const handleResponseChange = (questionId, value) => {
    setResponses(prevResponses => ({
      ...prevResponses,
      [questionId]: value
    }));
  };

  const handleNext = async () => {
    if (currentQuestion) {
      try {
        await SurveyService.saveSurveyResponse(
          userProfile.client_id,
          'strategy',
          currentQuestion.question_id,
          responses[currentQuestion.question_id]
        );
      } catch (error) {
        console.error("Error saving strategy survey response:", error);
      }
    }

    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(prevIndex => prevIndex + 1);
    }
  };

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prevIndex => prevIndex - 1);
    }
  };

  const handleComplete = async () => {
    if (!userProfile || !userProfile.client_id) {
      console.error("User profile or client_id is missing. Cannot complete strategy survey.");
      return;
    }

    setIsSubmitting(true);
    try {
      if (currentQuestion) {
        await SurveyService.saveSurveyResponse(
          userProfile.client_id,
          'strategy',
          currentQuestion.question_id,
          responses[currentQuestion.question_id]
        );
      }

      const completionResult = await SurveyService.completeSurvey(
        userProfile.client_id,
        'strategy',
        responses
      );

      if (completionResult.success) {
        setSurveyCompleted(true);
        console.log("Strategy survey completed successfully!");
        onSaveAndExit();
      } else {
        console.error("Failed to complete strategy survey:", completionResult.message);
      }
    } catch (error) {
      console.error("Error during strategy survey completion:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSaveAndExit = async () => {
    setShowExitConfirm(true);
  };

  const confirmSaveAndExit = async () => {
    setShowExitConfirm(false);
    if (currentQuestion) {
      try {
        await SurveyService.saveSurveyResponse(
          userProfile.client_id,
          'strategy',
          currentQuestion.question_id,
          responses[currentQuestion.question_id]
        );
      } catch (error) {
        console.error("Error saving strategy survey response on exit:", error);
      }
    }
    onSaveAndExit();
  };

  const cancelSaveAndExit = () => {
    setShowExitConfirm(false);
  };

  // Render loading state
  if (questionsLoading) {
    return (
      <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white p-8 rounded-lg shadow-xl text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
          <p className="text-lg text-gray-700">Loading strategy survey questions...</p>
        </div>
      </div>
    );
  }

  // Render survey content
  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50 font-inter">
      <div className="bg-white p-8 rounded-lg shadow-xl w-full max-w-2xl mx-4 my-8 flex flex-col h-[90vh]">
        <div className="flex justify-between items-center mb-6 pb-4 border-b border-gray-200">
          <h2 className="text-2xl font-semibold text-gray-800">Strategy Survey</h2>
          <button
            onClick={handleSaveAndExit}
            className="px-4 py-2 rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors duration-200 text-sm font-medium"
          >
            Save & Exit
          </button>
        </div>

        {showExitConfirm && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white p-8 rounded-lg shadow-xl text-center max-w-sm">
              <p className="text-lg mb-6 text-gray-800">Are you sure you want to save and exit?</p>
              <div className="flex justify-center space-x-4">
                <button
                  onClick={confirmSaveAndExit}
                  className="px-6 py-2 rounded-lg bg-orange-500 text-white font-medium hover:bg-orange-600 transition-colors duration-200"
                >
                  Yes, Exit
                </button>
                <button
                  onClick={cancelSaveAndExit}
                  className="px-6 py-2 rounded-lg border border-gray-300 text-gray-700 font-medium hover:bg-gray-100 transition-colors duration-200"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {surveyCompleted ? (
          <div className="flex flex-col items-center justify-center flex-grow text-center text-gray-700">
            <svg className="w-16 h-16 text-green-500 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>
            <h3 className="text-2xl font-semibold mb-2">Survey Completed!</h3>
            <p className="text-lg mb-6">Thank you for completing the Strategy Survey.</p>
            <button
              onClick={onSaveAndExit}
              className="px-6 py-3 rounded-lg bg-orange-500 text-white font-medium hover:bg-orange-600 transition-colors duration-200 shadow-md"
            >
              Close Survey
            </button>
          </div>
        ) : (
          <>
            <div className="flex-grow overflow-y-auto pr-4 mb-6">
              {currentQuestion && (
                <div className="bg-gray-50 p-6 rounded-lg shadow-inner mb-6">
                  <p className="text-sm font-medium text-orange-600 mb-2">{currentQuestion.section}</p>
                  <p className="text-lg font-semibold text-gray-800 mb-4">{currentQuestion.question_text}</p>

                  {/* Render different input types based on response_type */}
                  {currentQuestion.response_type === 'likert_1_5' && (
                    <div className="flex flex-col space-y-3">
                      {currentQuestion.choices.map((choice, index) => (
                        <label key={index} className="flex items-center p-3 border border-gray-200 rounded-md cursor-pointer hover:bg-gray-100 transition-colors duration-150">
                          <input
                            type="radio"
                            name={currentQuestion.question_id}
                            value={choice}
                            checked={responses[currentQuestion.question_id] === choice}
                            onChange={() => handleResponseChange(currentQuestion.question_id, choice)}
                            className="form-radio h-4 w-4 text-orange-500 focus:ring-orange-400"
                          />
                          <span className="ml-3 text-gray-700">{choice}</span>
                        </label>
                      ))}
                    </div>
                  )}

                  {currentQuestion.response_type === 'radio' && (
                    <div className="flex flex-col space-y-3">
                      {currentQuestion.choices.map((choice, index) => (
                        <label key={index} className="flex items-center p-3 border border-gray-200 rounded-md cursor-pointer hover:bg-gray-100 transition-colors duration-150">
                          <input
                            type="radio"
                            name={currentQuestion.question_id}
                            value={choice}
                            checked={responses[currentQuestion.question_id] === choice}
                            onChange={() => handleResponseChange(currentQuestion.question_id, choice)}
                            className="form-radio h-4 w-4 text-orange-500 focus:ring-orange-400"
                          />
                          <span className="ml-3 text-gray-700">{choice}</span>
                        </label>
                      ))}
                    </div>
                  )}

                  {currentQuestion.response_type === 'checkbox' && (
                    <div className="flex flex-col space-y-3">
                      {currentQuestion.choices.map((choice, index) => (
                        <label key={index} className="flex items-center p-3 border border-gray-200 rounded-md cursor-pointer hover:bg-gray-100 transition-colors duration-150">
                          <input
                            type="checkbox"
                            name={currentQuestion.question_id}
                            value={choice}
                            checked={responses[currentQuestion.question_id]?.includes(choice) || false}
                            onChange={(e) => {
                              const currentChoices = responses[currentQuestion.question_id] || [];
                              if (e.target.checked) {
                                handleResponseChange(currentQuestion.question_id, [...currentChoices, choice]);
                              } else {
                                handleResponseChange(currentQuestion.question_id, currentChoices.filter(item => item !== choice));
                              }
                            }}
                            className="form-checkbox h-4 w-4 text-orange-500 rounded focus:ring-orange-400"
                          />
                          <span className="ml-3 text-gray-700">{choice}</span>
                        </label>
                      ))}
                    </div>
                  )}
                  {/* Add more response types as needed */}
                </div>
              )}
            </div>

            <div className="flex justify-between items-center pt-4 border-t border-gray-200">
              <button
                onClick={handlePrevious}
                disabled={currentQuestionIndex === 0}
                className={`px-6 py-3 rounded-lg transition-colors duration-200 ${
                  currentQuestionIndex === 0
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    : 'bg-orange-500 text-white hover:bg-orange-600 shadow-md'
                } font-medium text-sm`}
              >
                ← Previous
              </button>

              <span className="text-sm text-gray-600 font-medium">
                Progress: {currentQuestionIndex + 1} of {questions.length}
              </span>

              {isLastQuestion ? (
                <button
                  onClick={handleComplete}
                  disabled={isSubmitting}
                  className={`px-6 py-3 rounded-lg transition-colors duration-200 ${
                    isSubmitting
                      ? 'bg-orange-300 text-white cursor-not-allowed'
                      : 'bg-orange-500 text-white hover:bg-orange-600 shadow-md'
                  } font-medium text-sm`}
                >
                  {isSubmitting ? 'Completing...' : 'Complete Survey'}
                </button>
              ) : (
                <button
                  onClick={handleNext}
                  className="px-6 py-3 rounded-lg bg-orange-500 text-white font-medium hover:bg-orange-600 transition-colors duration-200 shadow-md text-sm"
                >
                  Next →
                </button>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default StrategySurvey;
