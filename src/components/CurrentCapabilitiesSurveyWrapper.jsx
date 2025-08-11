// src/components/CurrentCapabilitiesSurveyWrapper.jsx
import React from 'react';
import UnifiedSurvey from './UnifiedSurvey';
import * as surveyService from '../services/surveyService';

const CurrentCapabilitiesSurveyWrapper = ({
  isOpen,
  onClose,
  userProfile,
  onComplete,
  onSaveAndExit,
  isCompleted = false,
  completionStatus = null
}) => {
  // Extract clientId from userProfile for service calls
  const clientId = userProfile?.client_id || userProfile?.clientId;
  const userId = userProfile?.user_id || userProfile?.userId;

  // Custom wrapper functions that use the survey service
  const loadQuestionsFunction = async () => {
    try {
      const definition = await surveyService.getSurveyDefinition('capabilities');
      return definition;
    } catch (error) {
      console.error('Error loading capabilities questions:', error);
      throw error;
    }
  };

  const loadResponsesFunction = async (clientId) => {
    try {
      const responses = await surveyService.getSurveyResponses(clientId, 'capabilities');
      return responses;
    } catch (error) {
      console.error('Error loading capabilities responses:', error);
      // Return null if no responses found (not an error condition)
      if (error.response?.status === 404) {
        return null;
      }
      throw error;
    }
  };

  const saveResponseFunction = async (data) => {
    try {
      const result = await surveyService.saveSurveyResponses(
        data.client_id || clientId,
        'capabilities',
        data
      );
      return result;
    } catch (error) {
      console.error('Error saving capabilities responses:', error);
      throw error;
    }
  };

  const recordCompletionFunction = async (data) => {
    try {
      const result = await surveyService.completeSurvey(
        data.client_id || clientId,
        'capabilities',
        data.user_id || userId
      );
      return result;
    } catch (error) {
      console.error('Error recording capabilities completion:', error);
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
      surveyType="capabilities"
      surveyTitle="Data & Analytics Capabilities Assessment"
      loadQuestionsFunction={loadQuestionsFunction}
      loadResponsesFunction={loadResponsesFunction}
      saveResponseFunction={saveResponseFunction}
      recordCompletionFunction={recordCompletionFunction}
      onComplete={onComplete}
      onSaveAndExit={onSaveAndExit}
      isCompleted={isCompleted || completionStatus?.completed || false}
      allowEdit={!isCompleted && !completionStatus?.completed}
      showReview={true}
      enableDraftRecovery={true}
      enableKeyboardNavigation={true}
    />
  );
};

export default CurrentCapabilitiesSurveyWrapper;