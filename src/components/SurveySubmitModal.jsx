// Survey Submit Modal Component
// Displays completion confirmation and unlocks next steps

import React from 'react';

const SurveySubmitModal = ({ 
  isOpen, 
  onClose, 
  onConfirm, 
  isSubmitting = false,
  completedQuestions,
  totalQuestions 
}) => {
  if (!isOpen) return null;

  const isComplete = completedQuestions === totalQuestions;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-md w-full p-6 shadow-2xl">
        {/* Header */}
        <div className="text-center mb-6">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          
          <h2 className="text-xl font-bold text-slate-800 mb-2">
            {isComplete ? 'Survey Complete!' : 'Incomplete Survey'}
          </h2>
          
          <p className="text-sm text-slate-600">
            {isComplete 
              ? 'Thank you for completing the Strategy Survey. Your responses will help us create a personalized data strategy for your organization.'
              : `You have completed ${completedQuestions} of ${totalQuestions} questions. Please complete all questions before submitting.`
            }
          </p>
        </div>

        {/* Progress Summary */}
        <div className="bg-gray-50 rounded-lg p-4 mb-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700">Progress</span>
            <span className="text-sm font-bold text-[#FF6E4C]">
              {Math.round((completedQuestions / totalQuestions) * 100)}%
            </span>
          </div>
          
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-[#FF6E4C] h-2 rounded-full transition-all duration-300"
              style={{ width: `${(completedQuestions / totalQuestions) * 100}%` }}
            />
          </div>
          
          <p className="text-xs text-gray-500 mt-2">
            {completedQuestions} of {totalQuestions} questions answered
          </p>
        </div>

        {/* Next Steps Preview */}
        {isComplete && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <h3 className="text-sm font-semibold text-blue-800 mb-2">
              🎉 What happens next?
            </h3>
            <ul className="text-xs text-blue-700 space-y-1">
              <li>• Your responses will be saved to our secure database</li>
              <li>• The Strategy Summary tab will be unlocked</li>
              <li>• You'll receive a preliminary data strategy report</li>
              <li>• Next survey modules will become available</li>
            </ul>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 text-gray-600 border border-gray-300 rounded-xl hover:bg-gray-50 transition-colors"
            disabled={isSubmitting}
          >
            {isComplete ? 'Review Answers' : 'Continue Survey'}
          </button>
          
          {isComplete && (
            <button
              onClick={onConfirm}
              disabled={isSubmitting}
              className="flex-1 px-4 py-2 bg-[#FF6E4C] text-white rounded-xl hover:bg-orange-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
            >
              {isSubmitting ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Submitting...
                </>
              ) : (
                'Submit Survey'
              )}
            </button>
          )}
        </div>

        {/* Error State */}
        {!isComplete && (
          <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-xs text-red-600 text-center">
              Please complete all required questions before submitting the survey.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default SurveySubmitModal;
