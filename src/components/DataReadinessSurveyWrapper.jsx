// src/components/DataReadinessSurveyWrapper.jsx
import React from 'react';
import UnifiedSurvey from './UnifiedSurvey';
import * as surveyService from '../services/surveyService';

const DataReadinessSurveyWrapper = ({
  isOpen,
  onClose,
  userProfile,
  onComplete,
  onSaveAndExit,
  initialResponses = {},
  initialCompletionStatus = null
}) => {
  // Extract clientId from userProfile for service calls
  const clientId = userProfile?.client_id || userProfile?.clientId;
  const userId = userProfile?.user_id || userProfile?.userId;

  // Custom wrapper functions that use the survey service
  const loadQuestionsFunction = async () => {
    try {
      const definition = await surveyService.getSurveyDefinition('readiness');
      return definition;
    } catch (error) {
      console.error('Error loading readiness questions:', error);
      throw error;
    }
  };

  const loadResponsesFunction = async (clientId) => {
    try {
      // First check if we have initial responses passed as props
      if (initialResponses && Object.keys(initialResponses).length > 0) {
        console.log('Using initial responses provided via props');
        return { responses: initialResponses };
      }
      
      // Otherwise load from server
      const responses = await surveyService.getSurveyResponses(clientId, 'readiness');
      return responses;
    } catch (error) {
      console.error('Error loading readiness responses:', error);
      // Return null if no responses found (not an error condition)
      if (error.response?.status === 404) {
        // If we have initial responses, use them even if server returns 404
        if (initialResponses && Object.keys(initialResponses).length > 0) {
          return { responses: initialResponses };
        }
        return null;
      }
      throw error;
    }
  };

  const saveResponseFunction = async (data) => {
    try {
      const result = await surveyService.saveSurveyResponses(
        data.client_id || clientId,
        'readiness',
        data
      );
      return result;
    } catch (error) {
      console.error('Error saving readiness responses:', error);
      throw error;
    }
  };

  const recordCompletionFunction = async (data) => {
    try {
      const result = await surveyService.completeSurvey(
        data.client_id || clientId,
        'readiness',
        data.user_id || userId
      );
      return result;
    } catch (error) {
      console.error('Error recording readiness completion:', error);
      throw error;
    }
  };

  return (
    <UnifiedSurvey
      isOpen={isOpen}
      onClose={onClose}
      userProfile={userProfile}
      clientId={clientId}
      userId={userId}
      surveyType="readiness"
      surveyTitle="Data Readiness & Governance Assessment"
      loadQuestionsFunction={loadQuestionsFunction}
      loadResponsesFunction={loadResponsesFunction}
      saveResponseFunction={saveResponseFunction}
      recordCompletionFunction={recordCompletionFunction}
      onComplete={onComplete}
      onSaveAndExit={onSaveAndExit}
      isCompleted={initialCompletionStatus?.completed || false}
      allowEdit={!initialCompletionStatus?.completed}
      showReview={true}
      enableDraftRecovery={true}
      enableKeyboardNavigation={true}
    />
  );
};

export default DataReadinessSurveyWrapper;