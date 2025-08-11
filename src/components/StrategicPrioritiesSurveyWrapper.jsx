// src/components/StrategicPrioritiesSurveyWrapper.jsx
import React from 'react';
import UnifiedSurveyModal from './UnifiedSurveyModal';

// If UnifiedSurveyModal exists and handles the modal wrapper
const StrategicPrioritiesSurveyWrapper = ({
  isOpen,
  onClose,
  userProfile,
  initialResponses,          // backward compatibility
  initialCompletionStatus,   // backward compatibility
  onComplete,
  onSaveAndExit,
}) => {
  const clientId = userProfile?.client_id || userProfile?.clientId;
  const userId = userProfile?.user_id || userProfile?.userId || 'admin';

  return (
    <UnifiedSurveyModal
      isOpen={isOpen}
      onClose={onClose}
      surveyType="strategy"
      surveyTitle="Strategic Priorities Assessment"
      clientId={clientId}
      userId={userId}
      userProfile={userProfile}
      initialResponses={initialResponses}
      isCompleted={initialCompletionStatus?.completed || false}
      onComplete={onComplete}
      onSaveAndExit={onSaveAndExit}
    />
  );
};

export default StrategicPrioritiesSurveyWrapper;

// --- Optional wrappers (named exports) ---
export const CurrentCapabilitiesSurveyWrapper = ({
  isOpen,
  onClose,
  userProfile,
  isCompleted,
  completionStatus,
  onComplete,
  onSaveAndExit,
}) => {
  const clientId = userProfile?.client_id || userProfile?.clientId;
  const userId = userProfile?.user_id || userProfile?.userId || 'admin';

  return (
    <UnifiedSurveyModal
      isOpen={isOpen}
      onClose={onClose}
      surveyType="capabilities"
      surveyTitle="Data & Analytics Capabilities Assessment"
      clientId={clientId}
      userId={userId}
      userProfile={userProfile}
      isCompleted={isCompleted || completionStatus?.completed || false}
      onComplete={onComplete}
      onSaveAndExit={onSaveAndExit}
    />
  );
};

export const DataReadinessSurveyWrapper = ({
  isOpen,
  onClose,
  userProfile,
  initialResponses,
  initialCompletionStatus,
  onComplete,
  onSaveAndExit,
}) => {
  const clientId = userProfile?.client_id || userProfile?.clientId;
  const userId = userProfile?.user_id || userProfile?.userId || 'admin';

  return (
    <UnifiedSurveyModal
      isOpen={isOpen}
      onClose={onClose}
      surveyType="readiness"
      surveyTitle="Data Readiness & Governance Assessment"
      clientId={clientId}
      userId={userId}
      userProfile={userProfile}
      initialResponses={initialResponses}
      isCompleted={initialCompletionStatus?.completed || false}
      onComplete={onComplete}
      onSaveAndExit={onSaveAndExit}
    />
  );
};