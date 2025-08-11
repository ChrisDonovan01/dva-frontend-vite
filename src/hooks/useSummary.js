// src/hooks/useSummary.js
import { useState, useCallback, useEffect, useRef } from 'react';
import SurveyService from '../services/surveyService';

const DEBUG_MODAL = process.env.NODE_ENV === 'development';

const useSummary = ({ clientId, summaryType, userId } = {}) => {
  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalKey, setModalKey] = useState(0);
  
  // Data state
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState(null);
  
  // Refs
  const isMounted = useRef(true);
  const abortControllerRef = useRef(null);
  const lastTriggerRef = useRef(null);

  // Debug logging helper
  const log = useCallback((message, data) => {
    if (DEBUG_MODAL) {
      console.debug(`[useSummary] ${message}`, data || '');
    }
  }, []);

  useEffect(() => {
    isMounted.current = true;
    return () => {
      isMounted.current = false;
      // Cleanup any pending requests on unmount
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
        abortControllerRef.current = null;
      }
    };
  }, []);

  // Cleanup function to abort any pending requests
  const cleanup = useCallback(() => {
    if (abortControllerRef.current) {
      log('Aborting previous request');
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
  }, [log]);

  const refresh = useCallback(async () => {
    if (!clientId || !summaryType) {
      console.log('Missing clientId or summaryType:', { clientId, summaryType });
      return;
    }
    
    // Cleanup any previous requests
    cleanup();
    
    setLoading(true);
    setError(null);
    
    // Create new abort controller for this request
    const controller = new AbortController();
    abortControllerRef.current = controller;
    
    try {
      console.log('Fetching summary:', { clientId, summaryType });
      
      // Pass abort signal to the service if it supports it
      const summaryData = await SurveyService.getSummary(clientId, summaryType, {
        signal: controller.signal
      }).catch(err => {
        // Handle abort error gracefully
        if (err.name === 'AbortError') {
          log('Fetch was aborted');
          return null;
        }
        throw err;
      });
      
      if (isMounted.current && summaryData !== null) {
        setData(summaryData);
        console.log('Summary data loaded:', summaryData);
      }
    } catch (err) {
      console.error('Error fetching summary:', err);
      if (isMounted.current && err.name !== 'AbortError') {
        setError(err.message || 'Failed to load summary');
        setData(null);
      }
    } finally {
      if (isMounted.current) {
        setLoading(false);
      }
      // Clear abort controller reference if it's still the same one
      if (abortControllerRef.current === controller) {
        abortControllerRef.current = null;
      }
    }
  }, [clientId, summaryType, cleanup, log]);

  const generate = useCallback(async () => {
    if (!clientId || !summaryType) return;
    
    setGenerating(true);
    setError(null);
    
    try {
      const result = await SurveyService.completeSurvey(clientId, summaryType, userId || 'admin');
      if (result && isMounted.current) {
        await refresh(); // Reload the summary after generation
      }
    } catch (err) {
      console.error('Error generating summary:', err);
      if (isMounted.current) {
        setError(err.message || 'Failed to generate summary');
      }
    } finally {
      if (isMounted.current) {
        setGenerating(false);
      }
    }
  }, [clientId, summaryType, userId, refresh]);

  const reset = useCallback(() => {
    console.log('Resetting summary state');
    cleanup(); // Abort any pending requests
    setData(null);
    setLoading(false);
    setGenerating(false);
    setError(null);
  }, [cleanup]);

  // Modal control functions
  const openModal = useCallback(async (type, newClientId) => {
    log('Opening modal', { type, newClientId });
    
    // Store the trigger element for focus restoration
    if (document.activeElement instanceof HTMLElement) {
      lastTriggerRef.current = document.activeElement;
    }

    // Reset any previous state
    setError(null);
    setData(null);
    setIsModalOpen(true);
    
    // If we have new parameters, fetch the data
    if (type && newClientId) {
      setLoading(true);
      
      try {
        console.log('Fetching summary for modal:', { clientId: newClientId, summaryType: type });
        const summaryData = await SurveyService.getSummary(newClientId, type);
        
        if (isMounted.current) {
          setData(summaryData);
          console.log('Modal summary data loaded:', summaryData);
        }
      } catch (err) {
        console.error('Error fetching modal summary:', err);
        if (isMounted.current) {
          setError(err.message || 'Failed to load summary');
        }
      } finally {
        if (isMounted.current) {
          setLoading(false);
        }
      }
    }
  }, [log]);

  const closeModal = useCallback(() => {
    log('Closing modal');
    
    // Abort any pending requests
    cleanup();
    
    // Reset modal state
    setIsModalOpen(false);
    
    // Increment key to force fresh component instance
    setModalKey(prev => prev + 1);
    
    // Clear data state for clean next open
    setData(null);
    setError(null);
    setLoading(false);
    setGenerating(false);
    
    // Restore focus to trigger element
    setTimeout(() => {
      if (lastTriggerRef.current && document.body.contains(lastTriggerRef.current)) {
        lastTriggerRef.current.focus();
        log('Focus restored to trigger');
      }
      lastTriggerRef.current = null;
    }, 100);
  }, [cleanup, log]);

  // Clear state when summaryType changes
  useEffect(() => {
    if (summaryType) {
      console.log('Summary type changed to:', summaryType);
      // Clear previous data when switching summary types
      setData(null);
      setError(null);
    }
  }, [summaryType]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      cleanup();
    };
  }, [cleanup]);

  return {
    // Original data properties
    data,
    loading,
    generating,
    error,
    refresh,
    generate,
    reset,
    
    // New modal control properties
    isModalOpen,
    modalKey,
    openModal,
    closeModal
  };
};

export default useSummary;