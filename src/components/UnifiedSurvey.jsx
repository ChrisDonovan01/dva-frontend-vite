import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { 
  ChevronLeft, 
  ChevronRight, 
  Check, 
  AlertCircle, 
  Save, 
  Loader2,
  HelpCircle,
  FileText,
  Upload,
  X,
  Eye,
  Edit3,
  Star,
  Lock
} from 'lucide-react';
import * as surveyService from '../services/surveyService';
import SurveyCompleteModal from './SurveyCompleteModal';

const UnifiedSurvey = ({
  isOpen,
  onClose,
  userProfile,
  clientId,
  userId,
  surveyType,
  surveyTitle,
  loadQuestionsFunction,
  loadResponsesFunction,
  saveResponseFunction,
  recordCompletionFunction,
  onComplete,
  onSaveAndExit,
  isCompleted = false,
  allowEdit = true,
  showReview = true,
  enableDraftRecovery = true,
  enableKeyboardNavigation = true
}) => {
  // State management
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState('idle'); // 'idle', 'saving', 'saved', 'error'
  const [sections, setSections] = useState([]);
  const [questions, setQuestions] = useState([]);
  const [responses, setResponses] = useState({});
  const [currentSectionIndex, setCurrentSectionIndex] = useState(0);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [errors, setErrors] = useState({});
  const [showCompleteModal, setShowCompleteModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [viewMode, setViewMode] = useState('edit'); // 'edit', 'review', 'completed'
  const [showHelp, setShowHelp] = useState({});
  const [uploadedFiles, setUploadedFiles] = useState({});
  const [draftExists, setDraftExists] = useState(false);
  const [sessionStartTime] = useState(new Date().toISOString());
  const [lastSaveTime, setLastSaveTime] = useState(null);
  const [focusedQuestion, setFocusedQuestion] = useState(null);
  const [validationWarnings, setValidationWarnings] = useState({});

  // Refs for debounce and cleanup
  const saveTimeoutRef = useRef(null);
  const abortControllerRef = useRef(null);
  const fileInputRefs = useRef({});
  const questionRefs = useRef({});

  // Derive effective IDs
  const effectiveClientId = clientId || userProfile?.client_id || userProfile?.clientId || 'default';
  const effectiveUserId = userId || userProfile?.user_id || userProfile?.userId || 'anonymous';

  // Check if survey is already completed
  const isSurveyCompleted = isCompleted || viewMode === 'completed';
  const canEdit = allowEdit && !isSurveyCompleted && viewMode === 'edit';

  // Helper functions
  const getQuestionsBySection = useCallback((sectionId) => {
    return questions.filter(q => (q.section_id || q.section) === sectionId);
  }, [questions]);

  const getTotalQuestions = useCallback(() => {
    return questions.length;
  }, [questions]);

  const getRequiredQuestions = useCallback(() => {
    return questions.filter(q => q.required);
  }, [questions]);

  const getAnsweredQuestions = useCallback(() => {
    return questions.filter(q => {
      const response = responses[q.id];
      if (!response) return false;
      if (Array.isArray(response)) return response.length > 0;
      if (typeof response === 'string') return response.trim() !== '';
      if (typeof response === 'object' && response.file) return true;
      return response !== null && response !== undefined;
    }).length;
  }, [questions, responses]);

  const getAnsweredRequiredQuestions = useCallback(() => {
    return getRequiredQuestions().filter(q => {
      const response = responses[q.id];
      if (!response) return false;
      if (Array.isArray(response)) return response.length > 0;
      if (typeof response === 'string') return response.trim() !== '';
      if (typeof response === 'object' && response.file) return true;
      return response !== null && response !== undefined;
    }).length;
  }, [getRequiredQuestions, responses]);

  const getSectionProgress = useCallback((sectionId) => {
    const sectionQuestions = getQuestionsBySection(sectionId);
    const answered = sectionQuestions.filter(q => {
      const response = responses[q.id];
      if (!response) return false;
      if (Array.isArray(response)) return response.length > 0;
      if (typeof response === 'string') return response.trim() !== '';
      if (typeof response === 'object' && response.file) return true;
      return response !== null && response !== undefined;
    }).length;
    const required = sectionQuestions.filter(q => q.required).length;
    const requiredAnswered = sectionQuestions.filter(q => {
      if (!q.required) return false;
      const response = responses[q.id];
      if (!response) return false;
      if (Array.isArray(response)) return response.length > 0;
      if (typeof response === 'string') return response.trim() !== '';
      if (typeof response === 'object' && response.file) return true;
      return response !== null && response !== undefined;
    }).length;
    
    return { 
      answered, 
      total: sectionQuestions.length,
      required,
      requiredAnswered,
      isComplete: requiredAnswered === required && required > 0
    };
  }, [getQuestionsBySection, responses]);

  // Check for question dependencies
  const isQuestionVisible = useCallback((question) => {
    if (!question.depends_on) return true;
    
    const dependency = question.depends_on;
    const dependentResponse = responses[dependency.question_id];
    
    if (!dependentResponse) return false;
    
    if (dependency.value) {
      if (Array.isArray(dependentResponse)) {
        return dependentResponse.includes(dependency.value);
      }
      return dependentResponse === dependency.value;
    }
    
    return !!dependentResponse;
  }, [responses]);

  // Draft recovery functions
  const saveDraft = useCallback(() => {
    if (enableDraftRecovery) {
      const draft = {
        responses,
        timestamp: new Date().toISOString(),
        sectionIndex: currentSectionIndex,
        questionIndex: currentQuestionIndex
      };
      localStorage.setItem(`survey_draft_${surveyType}_${effectiveClientId}`, JSON.stringify(draft));
    }
  }, [enableDraftRecovery, responses, currentSectionIndex, currentQuestionIndex, surveyType, effectiveClientId]);

  const loadDraft = useCallback(() => {
    if (enableDraftRecovery) {
      const draftKey = `survey_draft_${surveyType}_${effectiveClientId}`;
      const draft = localStorage.getItem(draftKey);
      if (draft) {
        try {
          const parsed = JSON.parse(draft);
          setDraftExists(true);
          return parsed;
        } catch (e) {
          console.error('Error parsing draft:', e);
        }
      }
    }
    return null;
  }, [enableDraftRecovery, surveyType, effectiveClientId]);

  const clearDraft = useCallback(() => {
    if (enableDraftRecovery) {
      localStorage.removeItem(`survey_draft_${surveyType}_${effectiveClientId}`);
      setDraftExists(false);
    }
  }, [enableDraftRecovery, surveyType, effectiveClientId]);

  // Load survey definition
  const loadSurveyDefinition = useCallback(async () => {
    try {
      setLoading(true);
      console.log(`Loading ${surveyType} survey definition...`);
      
      let data;
      if (loadQuestionsFunction) {
        data = await loadQuestionsFunction();
      } else {
        data = await surveyService.getSurveyDefinition(surveyType);
      }
      
      if (data) {
        setSections(data.sections || []);
        setQuestions(data.questions || []);
        console.log(`Loaded ${data.questions?.length || 0} questions across ${data.sections?.length || 0} sections`);
      }
    } catch (error) {
      console.error('Error loading survey definition:', error);
      setErrors({ global: 'Failed to load survey questions. Please try again.' });
    }
  }, [surveyType, loadQuestionsFunction]);

  // Load saved responses
  const loadSavedResponses = useCallback(async () => {
    try {
      console.log(`Loading saved responses for client ${effectiveClientId}...`);
      
      // Check for draft first
      const draft = loadDraft();
      if (draft && !isSurveyCompleted) {
        const useDraft = window.confirm('A draft of your survey was found. Would you like to continue where you left off?');
        if (useDraft) {
          setResponses(draft.responses);
          setCurrentSectionIndex(draft.sectionIndex || 0);
          setCurrentQuestionIndex(draft.questionIndex || 0);
          console.log('Loaded draft responses');
          return;
        }
      }
      
      // Load saved responses from server
      let data;
      if (loadResponsesFunction) {
        data = await loadResponsesFunction(effectiveClientId);
      } else {
        data = await surveyService.getSurveyResponses(effectiveClientId, surveyType);
      }
      
      if (data) {
        const normalized = surveyService.normalizeResponses(data, questions);
        setResponses(normalized);
        
        // Check if survey is completed
        if (data.completed) {
          setViewMode('completed');
        }
        
        console.log(`Loaded ${Object.keys(normalized).length} saved responses`);
      }
    } catch (error) {
      console.error('Error loading saved responses:', error);
      // Don't show error for missing responses, just start fresh
    } finally {
      setLoading(false);
    }
  }, [effectiveClientId, surveyType, questions, loadResponsesFunction, loadDraft, isSurveyCompleted]);

  // Autosave function
  const autoSave = useCallback(async (currentResponses, progress) => {
    try {
      setSaveStatus('saving');
      saveDraft(); // Save to local storage as well
      
      const payload = {
        responses: currentResponses,
        progress: {
          answered: getAnsweredQuestions(),
          total: getTotalQuestions(),
          requiredAnswered: getAnsweredRequiredQuestions(),
          requiredTotal: getRequiredQuestions().length,
          percentage: Math.round((getAnsweredQuestions() / getTotalQuestions()) * 100)
        },
        metadata: {
          sessionStartTime,
          lastSaveTime: new Date().toISOString(),
          currentSection: sections[currentSectionIndex]?.id,
          currentQuestion: questions[currentQuestionIndex]?.id
        },
        timestamp: new Date().toISOString()
      };

      if (saveResponseFunction) {
        await saveResponseFunction({
          client_id: effectiveClientId,
          survey_type: surveyType,
          ...payload
        });
      } else {
        await surveyService.saveSurveyResponses(effectiveClientId, surveyType, payload);
      }
      
      setLastSaveTime(new Date().toISOString());
      setSaveStatus('saved');
      setTimeout(() => setSaveStatus('idle'), 2000);
    } catch (error) {
      console.error('Error saving responses:', error);
      setSaveStatus('error');
      setTimeout(() => setSaveStatus('idle'), 3000);
    }
  }, [effectiveClientId, surveyType, saveResponseFunction, getAnsweredQuestions, getTotalQuestions, 
      getAnsweredRequiredQuestions, getRequiredQuestions, saveDraft, sessionStartTime, 
      sections, currentSectionIndex, questions, currentQuestionIndex]);

  // Handle response change with debounced autosave
  const handleResponseChange = useCallback((questionId, value) => {
    if (!canEdit) return;
    
    const newResponses = { ...responses, [questionId]: value };
    setResponses(newResponses);
    setErrors(prev => ({ ...prev, [questionId]: null }));
    setValidationWarnings(prev => ({ ...prev, [questionId]: null }));
    
    // Clear existing timeout
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }
    
    // Set new timeout for autosave
    saveTimeoutRef.current = setTimeout(() => {
      autoSave(newResponses);
    }, 1000);
  }, [responses, autoSave, canEdit]);

  // Handle file upload
  const handleFileUpload = useCallback(async (questionId, file) => {
    if (!canEdit) return;
    
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      setErrors(prev => ({ ...prev, [questionId]: 'File size must be less than 10MB' }));
      return;
    }
    
    // Store file reference
    setUploadedFiles(prev => ({ ...prev, [questionId]: file }));
    handleResponseChange(questionId, { 
      file: file.name, 
      size: file.size, 
      type: file.type 
    });
  }, [handleResponseChange, canEdit]);

  // Validate required questions
  const validateSection = useCallback(() => {
    const currentSection = sections[currentSectionIndex];
    if (!currentSection) return true;
    
    const sectionQuestions = getQuestionsBySection(currentSection.id);
    const visibleQuestions = sectionQuestions.filter(isQuestionVisible);
    const newErrors = {};
    const newWarnings = {};
    let isValid = true;
    
    visibleQuestions.forEach(question => {
      const response = responses[question.id];
      
      // Check required fields
      if (question.required) {
        if (!response || (Array.isArray(response) && response.length === 0) || 
            (typeof response === 'string' && response.trim() === '')) {
          newErrors[question.id] = 'This question is required';
          isValid = false;
        }
      }
      
      // Additional validation
      if (response) {
        // Email validation
        if (question.validation_type === 'email' && typeof response === 'string') {
          const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
          if (!emailRegex.test(response)) {
            newErrors[question.id] = 'Please enter a valid email address';
            isValid = false;
          }
        }
        
        // Phone validation
        if (question.validation_type === 'phone' && typeof response === 'string') {
          const phoneRegex = /^\+?[\d\s-()]+$/;
          if (!phoneRegex.test(response) || response.replace(/\D/g, '').length < 10) {
            newErrors[question.id] = 'Please enter a valid phone number';
            isValid = false;
          }
        }
        
        // Number range validation
        if (question.response_type === 'number' && question.min !== undefined && question.max !== undefined) {
          const numValue = parseFloat(response);
          if (numValue < question.min || numValue > question.max) {
            newErrors[question.id] = `Value must be between ${question.min} and ${question.max}`;
            isValid = false;
          }
        }
        
        // Text length validation
        if (typeof response === 'string' && question.max_length && response.length > question.max_length) {
          newWarnings[question.id] = `Response exceeds recommended length (${response.length}/${question.max_length})`;
        }
      }
    });
    
    setErrors(newErrors);
    setValidationWarnings(newWarnings);
    return isValid;
  }, [sections, currentSectionIndex, getQuestionsBySection, responses, isQuestionVisible]);

  // Validate entire survey
  const validateAllSections = useCallback(() => {
    let allErrors = {};
    let isValid = true;
    
    sections.forEach((section, index) => {
      const sectionQuestions = getQuestionsBySection(section.id);
      const visibleQuestions = sectionQuestions.filter(isQuestionVisible);
      
      visibleQuestions.forEach(question => {
        if (question.required) {
          const response = responses[question.id];
          if (!response || (Array.isArray(response) && response.length === 0) || 
              (typeof response === 'string' && response.trim() === '')) {
            allErrors[question.id] = `Required question in section: ${section.title || section.name}`;
            isValid = false;
          }
        }
      });
    });
    
    setErrors(allErrors);
    return isValid;
  }, [sections, getQuestionsBySection, responses, isQuestionVisible]);

  // Navigation handlers
  const handleNext = useCallback(() => {
    if (validateSection() && currentSectionIndex < sections.length - 1) {
      setCurrentSectionIndex(prev => prev + 1);
      setCurrentQuestionIndex(0);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [validateSection, currentSectionIndex, sections.length]);

  const handlePrevious = useCallback(() => {
    if (currentSectionIndex > 0) {
      setCurrentSectionIndex(prev => prev - 1);
      setCurrentQuestionIndex(0);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [currentSectionIndex]);

  const handleSectionClick = useCallback((index) => {
    if (validateSection() || index < currentSectionIndex) {
      setCurrentSectionIndex(index);
      setCurrentQuestionIndex(0);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [validateSection, currentSectionIndex]);

  const handleQuestionNavigation = useCallback((direction) => {
    const sectionQuestions = getQuestionsBySection(sections[currentSectionIndex]?.id);
    const visibleQuestions = sectionQuestions.filter(isQuestionVisible);
    
    if (direction === 'next' && currentQuestionIndex < visibleQuestions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    } else if (direction === 'prev' && currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1);
    }
  }, [currentSectionIndex, currentQuestionIndex, sections, getQuestionsBySection, isQuestionVisible]);

  // Review mode toggle
  const toggleReviewMode = useCallback(() => {
    if (viewMode === 'edit' && validateAllSections()) {
      setViewMode('review');
    } else if (viewMode === 'review') {
      setViewMode('edit');
    }
  }, [viewMode, validateAllSections]);

  // Submit survey
  const handleSubmit = useCallback(async () => {
    if (!validateAllSections()) {
      alert('Please complete all required questions before submitting.');
      return;
    }
    
    try {
      setSubmitting(true);
      
      // Save final responses with completed flag
      const finalPayload = {
        responses,
        progress: {
          answered: getAnsweredQuestions(),
          total: getTotalQuestions(),
          requiredAnswered: getAnsweredRequiredQuestions(),
          requiredTotal: getRequiredQuestions().length,
          percentage: 100
        },
        completed: true,
        completedAt: new Date().toISOString(),
        sessionDuration: new Date() - new Date(sessionStartTime),
        timestamp: new Date().toISOString()
      };
      
      if (saveResponseFunction) {
        await saveResponseFunction({
          client_id: effectiveClientId,
          survey_type: surveyType,
          ...finalPayload
        });
      } else {
        await surveyService.saveSurveyResponses(effectiveClientId, surveyType, finalPayload);
      }
      
      // Record completion
      if (recordCompletionFunction) {
        await recordCompletionFunction({
          client_id: effectiveClientId,
          survey_type: surveyType,
          user_id: effectiveUserId
        });
      } else {
        await surveyService.completeSurvey(effectiveClientId, surveyType, effectiveUserId);
      }
      
      // Clear caches to ensure HomePage updates immediately
      surveyService.clearAllCaches();
      
      // Clear draft
      clearDraft();
      
      // Show completion modal
      setShowCompleteModal(true);
      setViewMode('completed');
      
      // Call onComplete callback if provided
      if (onComplete) {
        onComplete({
          clientId: effectiveClientId,
          surveyType,
          responses,
          timestamp: new Date().toISOString()
        });
      }
    } catch (error) {
      console.error('Error submitting survey:', error);
      setErrors({ global: 'Failed to submit survey. Please try again.' });
    } finally {
      setSubmitting(false);
    }
  }, [validateAllSections, responses, effectiveClientId, surveyType, effectiveUserId, 
      saveResponseFunction, recordCompletionFunction, onComplete, clearDraft,
      getAnsweredQuestions, getTotalQuestions, getAnsweredRequiredQuestions, 
      getRequiredQuestions, sessionStartTime]);

  // Save and exit
  const handleSaveAndExit = useCallback(async () => {
    try {
      setSaving(true);
      await autoSave(responses);
      
      // Clear caches to ensure HomePage reflects changes
      surveyService.clearAllCaches();
      
      if (onSaveAndExit) {
        onSaveAndExit();
      } else if (onClose) {
        onClose();
      }
    } catch (error) {
      console.error('Error saving before exit:', error);
    } finally {
      setSaving(false);
    }
  }, [responses, autoSave, onSaveAndExit, onClose]);

  // Keyboard navigation
  useEffect(() => {
    if (!enableKeyboardNavigation || !isOpen) return;
    
    const handleKeyPress = (e) => {
      // Ignore if user is typing in an input
      if (['INPUT', 'TEXTAREA', 'SELECT'].includes(e.target.tagName)) return;
      
      switch(e.key) {
        case 'ArrowRight':
        case 'PageDown':
          handleNext();
          break;
        case 'ArrowLeft':
        case 'PageUp':
          handlePrevious();
          break;
        case 'Enter':
          if (e.ctrlKey || e.metaKey) {
            handleSubmit();
          }
          break;
        case 's':
          if (e.ctrlKey || e.metaKey) {
            e.preventDefault();
            autoSave(responses);
          }
          break;
        default:
          break;
      }
    };
    
    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [enableKeyboardNavigation, isOpen, handleNext, handlePrevious, handleSubmit, autoSave, responses]);

  // Render question based on type
  const renderQuestion = useCallback((question) => {
    const value = responses[question.id] || '';
    const error = errors[question.id];
    const warning = validationWarnings[question.id];
    const isReadOnly = !canEdit;
    
    const baseInputClass = `w-full px-4 py-2 border rounded-lg transition-colors ${
      isReadOnly ? 'bg-gray-50 cursor-not-allowed' : 'focus:ring-2 focus:ring-blue-500 focus:border-transparent'
    } ${error ? 'border-red-500' : 'border-gray-300'}`;
    
    switch (question.response_type || question.type) {
      case 'text':
      case 'short_text':
        return (
          <input
            type="text"
            value={value}
            onChange={(e) => handleResponseChange(question.id, e.target.value)}
            className={baseInputClass}
            placeholder={isReadOnly ? '' : 'Enter your response...'}
            readOnly={isReadOnly}
            maxLength={question.max_length}
          />
        );
        
      case 'long_text':
      case 'textarea':
        return (
          <div className="relative">
            <textarea
              value={value}
              onChange={(e) => handleResponseChange(question.id, e.target.value)}
              rows={4}
              className={baseInputClass}
              placeholder={isReadOnly ? '' : 'Enter your response...'}
              readOnly={isReadOnly}
              maxLength={question.max_length}
            />
            {question.max_length && !isReadOnly && (
              <div className="absolute bottom-2 right-2 text-xs text-gray-400">
                {value.length}/{question.max_length}
              </div>
            )}
          </div>
        );
        
      case 'single_select':
      case 'radio':
        return (
          <div className="space-y-2">
            {(question.options || []).map((option, idx) => (
              <label key={idx} className={`flex items-center space-x-3 ${isReadOnly ? 'cursor-default' : 'cursor-pointer'}`}>
                <input
                  type="radio"
                  name={`question-${question.id}`}
                  value={option}
                  checked={value === option}
                  onChange={(e) => handleResponseChange(question.id, e.target.value)}
                  className="w-4 h-4 text-blue-600 focus:ring-blue-500"
                  disabled={isReadOnly}
                />
                <span className={`${isReadOnly ? 'text-gray-500' : 'text-gray-700'}`}>{option}</span>
              </label>
            ))}
          </div>
        );
        
      case 'multi_select':
      case 'checkbox':
        const selectedValues = Array.isArray(value) ? value : [];
        return (
          <div className="space-y-2">
            {(question.options || []).map((option, idx) => (
              <label key={idx} className={`flex items-center space-x-3 ${isReadOnly ? 'cursor-default' : 'cursor-pointer'}`}>
                <input
                  type="checkbox"
                  value={option}
                  checked={selectedValues.includes(option)}
                  onChange={(e) => {
                    const newValues = e.target.checked
                      ? [...selectedValues, option]
                      : selectedValues.filter(v => v !== option);
                    handleResponseChange(question.id, newValues);
                  }}
                  className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                  disabled={isReadOnly}
                />
                <span className={`${isReadOnly ? 'text-gray-500' : 'text-gray-700'}`}>{option}</span>
              </label>
            ))}
          </div>
        );
        
      case 'number':
        return (
          <input
            type="number"
            value={value}
            onChange={(e) => handleResponseChange(question.id, e.target.value)}
            className={baseInputClass}
            placeholder={isReadOnly ? '' : 'Enter a number...'}
            readOnly={isReadOnly}
            min={question.min}
            max={question.max}
            step={question.step || 1}
          />
        );
        
      case 'date':
        return (
          <input
            type="date"
            value={value}
            onChange={(e) => handleResponseChange(question.id, e.target.value)}
            className={baseInputClass}
            readOnly={isReadOnly}
            min={question.min_date}
            max={question.max_date}
          />
        );
        
      case 'email':
        return (
          <input
            type="email"
            value={value}
            onChange={(e) => handleResponseChange(question.id, e.target.value)}
            className={baseInputClass}
            placeholder={isReadOnly ? '' : 'Enter email address...'}
            readOnly={isReadOnly}
          />
        );
        
      case 'phone':
        return (
          <input
            type="tel"
            value={value}
            onChange={(e) => handleResponseChange(question.id, e.target.value)}
            className={baseInputClass}
            placeholder={isReadOnly ? '' : 'Enter phone number...'}
            readOnly={isReadOnly}
          />
        );
        
      case 'rating':
      case 'scale':
        const maxRating = question.max_rating || 5;
        const currentRating = parseInt(value) || 0;
        return (
          <div className="flex items-center space-x-2">
            {[...Array(maxRating)].map((_, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleResponseChange(question.id, idx + 1)}
                disabled={isReadOnly}
                className={`p-1 transition-colors ${isReadOnly ? 'cursor-default' : 'cursor-pointer hover:scale-110'}`}
              >
                <Star 
                  className={`w-8 h-8 ${
                    idx < currentRating 
                      ? 'fill-yellow-400 text-yellow-400' 
                      : 'text-gray-300'
                  }`}
                />
              </button>
            ))}
            {currentRating > 0 && (
              <span className="ml-3 text-sm text-gray-600">
                {currentRating} / {maxRating}
              </span>
            )}
          </div>
        );
        
      case 'file':
        const fileInfo = uploadedFiles[question.id] || value;
        return (
          <div className="space-y-2">
            <input
              ref={el => fileInputRefs.current[question.id] = el}
              type="file"
              onChange={(e) => handleFileUpload(question.id, e.target.files[0])}
              className="hidden"
              accept={question.accept || '*'}
              disabled={isReadOnly}
            />
            {fileInfo && typeof fileInfo === 'object' && fileInfo.file ? (
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200">
                <div className="flex items-center space-x-3">
                  <FileText className="w-5 h-5 text-gray-500" />
                  <div>
                    <p className="text-sm font-medium text-gray-700">{fileInfo.file}</p>
                    <p className="text-xs text-gray-500">
                      {(fileInfo.size / 1024).toFixed(2)} KB
                    </p>
                  </div>
                </div>
                {!isReadOnly && (
                  <button
                    type="button"
                    onClick={() => {
                      setUploadedFiles(prev => {
                        const newFiles = { ...prev };
                        delete newFiles[question.id];
                        return newFiles;
                      });
                      handleResponseChange(question.id, null);
                    }}
                    className="p-1 text-red-500 hover:bg-red-50 rounded"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
            ) : (
              !isReadOnly && (
                <button
                  type="button"
                  onClick={() => fileInputRefs.current[question.id]?.click()}
                  className="flex items-center space-x-2 px-4 py-2 border-2 border-dashed border-gray-300 rounded-lg hover:border-gray-400 transition-colors"
                >
                  <Upload className="w-5 h-5 text-gray-500" />
                  <span className="text-gray-600">Choose file</span>
                </button>
              )
            )}
          </div>
        );
        
      case 'dropdown':
      case 'select':
        return (
          <select
            value={value}
            onChange={(e) => handleResponseChange(question.id, e.target.value)}
            className={baseInputClass}
            disabled={isReadOnly}
          >
            <option value="">Select an option...</option>
            {(question.options || []).map((option, idx) => (
              <option key={idx} value={option}>
                {option}
              </option>
            ))}
          </select>
        );
        
      default:
        return (
          <div className="text-gray-500 italic">
            Unsupported question type: {question.response_type || question.type}
          </div>
        );
    }
  }, [responses, errors, validationWarnings, canEdit, handleResponseChange, handleFileUpload, uploadedFiles]);

  // Effects
  useEffect(() => {
    if (isOpen) {
      loadSurveyDefinition();
    }
  }, [isOpen, loadSurveyDefinition]);

  useEffect(() => {
    if (questions.length > 0 && isOpen) {
      loadSavedResponses();
    }
  }, [questions, isOpen, loadSavedResponses]);

  useEffect(() => {
    // Auto-save on window close
    const handleBeforeUnload = (e) => {
      if (Object.keys(responses).length > 0 && !isSurveyCompleted) {
        saveDraft();
        e.preventDefault();
        e.returnValue = '';
      }
    };
    
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [responses, saveDraft, isSurveyCompleted]);

  useEffect(() => {
    // Cleanup on unmount
    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  // Don't render if not open
  if (!isOpen) return null;

  // Loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center space-y-4">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
          <p className="text-gray-600">Loading survey...</p>
        </div>
      </div>
    );
  }

  const currentSection = sections[currentSectionIndex];
  const sectionQuestions = currentSection ? getQuestionsBySection(currentSection.id) : [];
  const visibleSectionQuestions = sectionQuestions.filter(isQuestionVisible);
  const overallProgress = Math.round((getAnsweredQuestions() / getTotalQuestions()) * 100) || 0;
  const requiredProgress = getRequiredQuestions().length > 0 
    ? Math.round((getAnsweredRequiredQuestions() / getRequiredQuestions().length) * 100) 
    : 100;

  // Review mode view
  if (viewMode === 'review') {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Review Your Responses</h2>
              <button
                onClick={toggleReviewMode}
                className="flex items-center space-x-2 px-4 py-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
              >
                <Edit3 className="w-4 h-4" />
                <span>Edit Responses</span>
              </button>
            </div>
            
            <div className="space-y-8">
              {sections.map((section) => {
                const questions = getQuestionsBySection(section.id).filter(isQuestionVisible);
                return (
                  <div key={section.id} className="border-b border-gray-200 pb-6">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4">
                      {section.title || section.name}
                    </h3>
                    <div className="space-y-4">
                      {questions.map((question) => {
                        const response = responses[question.id];
                        return (
                          <div key={question.id} className="bg-gray-50 p-4 rounded-lg">
                            <p className="text-sm font-medium text-gray-700 mb-2">
                              {question.question_text || question.text}
                            </p>
                            <p className="text-gray-900">
                              {Array.isArray(response) 
                                ? response.join(', ') 
                                : response || <span className="italic text-gray-400">No response</span>}
                            </p>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
            
            <div className="mt-8 flex justify-between">
              <button
                onClick={toggleReviewMode}
                className="px-6 py-2 border border-gray-300 rounded-lg font-medium text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Back to Edit
              </button>
              <button
                onClick={handleSubmit}
                disabled={submitting}
                className="flex items-center space-x-2 px-6 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:bg-blue-300"
              >
                {submitting ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>Submitting...</span>
                  </>
                ) : (
                  <>
                    <Check className="w-5 h-5" />
                    <span>Submit Survey</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Completed view
  if (viewMode === 'completed' && !showCompleteModal) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-2xl mx-auto">
          <div className="bg-white rounded-lg shadow-lg p-8 text-center">
            <div className="mb-6">
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                <Check className="w-10 h-10 text-green-600" />
              </div>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Survey Completed</h2>
            <p className="text-gray-600 mb-8">
              Thank you for completing the {surveyTitle || surveyType} survey. Your responses have been saved successfully.
            </p>
            {allowEdit && (
              <button
                onClick={() => setViewMode('review')}
                className="flex items-center space-x-2 px-6 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors mx-auto"
              >
                <Eye className="w-5 h-5" />
                <span>View Responses</span>
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-full bg-gray-50">
      {/* Left Sidebar - Section Navigation */}
      <div className="w-64 bg-white border-r border-gray-200 overflow-y-auto">
        <div className="p-4">
          <h3 className="font-semibold text-gray-900 mb-4">Survey Sections</h3>
          <div className="space-y-2">
            {sections.map((section, index) => {
              const progress = getSectionProgress(section.id);
              const isActive = index === currentSectionIndex;
              const isAccessible = index <= currentSectionIndex || progress.requiredAnswered === progress.required;
              
              return (
                <button
                  key={section.id}
                  onClick={() => isAccessible && handleSectionClick(index)}
                  className={`w-full text-left p-3 rounded-lg transition-all ${
                    isActive 
                      ? 'bg-blue-50 border-l-4 border-blue-600' 
                      : isAccessible
                      ? 'hover:bg-gray-50 cursor-pointer'
                      : 'opacity-50 cursor-not-allowed'
                  }`}
                  disabled={!isAccessible}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <p className={`text-sm font-medium ${
                        isActive ? 'text-blue-900' : isAccessible ? 'text-gray-700' : 'text-gray-400'
                      }`}>
                        {section.title || section.name}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        {progress.answered}/{progress.total} completed
                        {progress.required > 0 && (
                          <span className="ml-1">
                            ({progress.requiredAnswered}/{progress.required} required)
                          </span>
                        )}
                      </p>
                    </div>
                    {progress.isComplete && (
                      <Check className="w-5 h-5 text-green-600 flex-shrink-0 ml-2" />
                    )}
                    {!isAccessible && (
                      <Lock className="w-4 h-4 text-gray-400 flex-shrink-0 ml-2" />
                    )}
                  </div>
                  {section.description && isActive && (
                    <p className="text-xs text-gray-500 mt-2">
                      {section.description}
                    </p>
                  )}
                </button>
              );
            })}
          </div>
        </div>
        
        {/* Overall Progress */}
        <div className="p-4 border-t border-gray-200">
          <div className="space-y-3">
            <div>
              <div className="mb-2 flex justify-between text-sm">
                <span className="text-gray-600">Overall Progress</span>
                <span className="font-medium text-gray-900">{overallProgress}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${overallProgress}%` }}
                />
              </div>
            </div>
            
            {getRequiredQuestions().length > 0 && (
              <div>
                <div className="mb-2 flex justify-between text-sm">
                  <span className="text-gray-600">Required Questions</span>
                  <span className="font-medium text-gray-900">{requiredProgress}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-green-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${requiredProgress}%` }}
                  />
                </div>
              </div>
            )}
          </div>
          
          <p className="text-xs text-gray-500 mt-3">
            {getAnsweredQuestions()} of {getTotalQuestions()} questions answered
          </p>
          
          {lastSaveTime && (
            <p className="text-xs text-gray-400 mt-1">
              Last saved: {new Date(lastSaveTime).toLocaleTimeString()}
            </p>
          )}
          
          {draftExists && !isSurveyCompleted && (
            <button
              onClick={clearDraft}
              className="text-xs text-red-600 hover:text-red-700 mt-2"
            >
              Clear draft
            </button>
          )}
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto">
        {/* Compact Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-3 z-10">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <h2 className="text-lg font-semibold text-gray-900">
                {currentSection?.title || currentSection?.name}
              </h2>
              <span className="text-sm text-gray-500">
                Question {Math.min(currentQuestionIndex + 1, visibleSectionQuestions.length)} of {visibleSectionQuestions.length}
              </span>
            </div>
            
            <div className="flex items-center space-x-4">
              {/* Save Status Indicator */}
              <div className="flex items-center space-x-2">
                {saveStatus === 'saving' && (
                  <div className="flex items-center space-x-2 text-blue-600">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span className="text-sm">Saving...</span>
                  </div>
                )}
                {saveStatus === 'saved' && (
                  <div className="flex items-center space-x-2 text-green-600">
                    <Check className="w-4 h-4" />
                    <span className="text-sm">Saved</span>
                  </div>
                )}
                {saveStatus === 'error' && (
                  <div className="flex items-center space-x-2 text-red-600">
                    <AlertCircle className="w-4 h-4" />
                    <span className="text-sm">Error saving</span>
                  </div>
                )}
              </div>
              
              {/* View Toggle */}
              {showReview && !isSurveyCompleted && currentSectionIndex === sections.length - 1 && (
                <button
                  onClick={toggleReviewMode}
                  className="flex items-center space-x-1 px-3 py-1 text-sm text-blue-600 hover:bg-blue-50 rounded transition-colors"
                >
                  <Eye className="w-4 h-4" />
                  <span>Review</span>
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Questions */}
        <div className="p-6">
          {errors.global && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-center space-x-2">
                <AlertCircle className="w-5 h-5 text-red-600" />
                <p className="text-red-800">{errors.global}</p>
              </div>
            </div>
          )}

          {isSurveyCompleted && !allowEdit && (
            <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-center space-x-2">
                <Lock className="w-5 h-5 text-blue-600" />
                <p className="text-blue-800">
                  This survey has been completed and is now read-only.
                </p>
              </div>
            </div>
          )}

          <div className="space-y-6">
            {visibleSectionQuestions.map((question, index) => (
              <div 
                key={question.id} 
                ref={el => questionRefs.current[question.id] = el}
                className={`bg-white p-6 rounded-lg shadow-sm border transition-all ${
                  focusedQuestion === question.id 
                    ? 'border-blue-400 ring-2 ring-blue-200' 
                    : 'border-gray-200'
                }`}
                onFocus={() => setFocusedQuestion(question.id)}
                onBlur={() => setFocusedQuestion(null)}
              >
                <div className="mb-4">
                  <div className="flex items-start justify-between">
                    <label className="block text-sm font-medium text-gray-900 mb-2 flex-1">
                      {index + 1}. {question.question_text || question.text}
                      {question.required && (
                        <span className="text-red-500 ml-1">*</span>
                      )}
                    </label>
                    {question.help_text && (
                      <button
                        type="button"
                        onClick={() => setShowHelp(prev => ({ ...prev, [question.id]: !prev[question.id] }))}
                        className="ml-2 p-1 text-gray-400 hover:text-gray-600 transition-colors"
                      >
                        <HelpCircle className="w-5 h-5" />
                      </button>
                    )}
                  </div>
                  
                  {question.description && (
                    <p className="text-sm text-gray-600 mb-3">{question.description}</p>
                  )}
                  
                  {showHelp[question.id] && question.help_text && (
                    <div className="mb-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                      <p className="text-sm text-blue-800">{question.help_text}</p>
                    </div>
                  )}
                </div>
                
                {renderQuestion(question)}
                
                {errors[question.id] && (
                  <p className="mt-2 text-sm text-red-600 flex items-center">
                    <AlertCircle className="w-4 h-4 mr-1" />
                    {errors[question.id]}
                  </p>
                )}
                
                {validationWarnings[question.id] && (
                  <p className="mt-2 text-sm text-yellow-600 flex items-center">
                    <AlertCircle className="w-4 h-4 mr-1" />
                    {validationWarnings[question.id]}
                  </p>
                )}
              </div>
            ))}
          </div>

          {/* Navigation Buttons */}
          <div className="mt-8 flex items-center justify-between">
            <button
              onClick={handlePrevious}
              disabled={currentSectionIndex === 0}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                currentSectionIndex === 0
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              <ChevronLeft className="w-5 h-5" />
              <span>Previous</span>
            </button>

            <div className="flex items-center space-x-3">
              <button
                onClick={handleSaveAndExit}
                disabled={saving || isSurveyCompleted}
                className="px-4 py-2 border border-gray-300 rounded-lg font-medium text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {saving ? (
                  <span className="flex items-center space-x-2">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Saving...</span>
                  </span>
                ) : (
                  'Save & Exit'
                )}
              </button>

              {currentSectionIndex === sections.length - 1 ? (
                showReview && !isSurveyCompleted ? (
                  <button
                    onClick={toggleReviewMode}
                    className="flex items-center space-x-2 px-6 py-2 bg-orange-600 text-white rounded-lg font-medium hover:bg-orange-700 transition-colors"
                  >
                    <Eye className="w-5 h-5" />
                    <span>Review & Submit</span>
                  </button>
                ) : !isSurveyCompleted ? (
                  <button
                    onClick={handleSubmit}
                    disabled={submitting}
                    className="flex items-center space-x-2 px-6 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:bg-blue-300"
                  >
                    {submitting ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        <span>Submitting...</span>
                      </>
                    ) : (
                      <>
                        <Check className="w-5 h-5" />
                        <span>Complete Survey</span>
                      </>
                    )}
                  </button>
                ) : null
              ) : (
                <button
                  onClick={handleNext}
                  className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
                >
                  <span>Next</span>
                  <ChevronRight className="w-5 h-5" />
                </button>
              )}
            </div>
          </div>

          {/* Keyboard shortcuts help */}
          {enableKeyboardNavigation && (
            <div className="mt-6 text-xs text-gray-400 text-center">
              Keyboard shortcuts: ← Previous | → Next | Ctrl+S Save | Ctrl+Enter Submit
            </div>
          )}
        </div>
      </div>

      {/* Complete Modal */}
      {showCompleteModal && (
        <SurveyCompleteModal
          isOpen={showCompleteModal}
          onClose={() => {
            setShowCompleteModal(false);
            if (onClose) onClose();
          }}
          surveyType={surveyType}
          surveyTitle={surveyTitle || `${surveyType.charAt(0).toUpperCase() + surveyType.slice(1)} Survey`}
        />
      )}
    </div>
  );
};

export default UnifiedSurvey;