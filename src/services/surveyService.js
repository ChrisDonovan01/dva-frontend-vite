import axios from 'axios';

// Base API configuration
// Use a simpler approach for environment variables
const getEnvVar = (viteName, fallback) => {
  try {
    // For Vite
    if (import.meta && import.meta.env && import.meta.env[viteName]) {
      return import.meta.env[viteName];
    }
  } catch (e) {
    // import.meta not available
  }
  return fallback;
};

const API_BASE_URL = getEnvVar('VITE_API_URL', 'http://localhost:3000');
const API_TIMEOUT = parseInt(getEnvVar('VITE_API_TIMEOUT', '30000'));
const MAX_RETRIES = parseInt(getEnvVar('VITE_MAX_RETRIES', '3'));
const RETRY_DELAY = parseInt(getEnvVar('VITE_RETRY_DELAY', '1000'));

// Create axios instance with defaults
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: API_TIMEOUT,
  headers: {
    'Content-Type': 'application/json',
    'X-Client-Version': getEnvVar('VITE_APP_VERSION', '1.0.0'),
  },
  withCredentials: true, // Include cookies if needed
});

// Request queue for offline support
let requestQueue = [];
let isOnline = navigator.onLine;

// Listen for online/offline events
window.addEventListener('online', () => {
  isOnline = true;
  processQueuedRequests();
});

window.addEventListener('offline', () => {
  isOnline = false;
});

// Process queued requests when back online
const processQueuedRequests = async () => {
  while (requestQueue.length > 0) {
    const request = requestQueue.shift();
    try {
      await request();
    } catch (error) {
      console.error('Error processing queued request:', error);
    }
  }
};

// Retry logic with exponential backoff
const retryRequest = async (fn, retries = MAX_RETRIES, delay = RETRY_DELAY) => {
  try {
    return await fn();
  } catch (error) {
    if (retries <= 0) throw error;
    
    // Don't retry on client errors (4xx) except 408, 429
    if (error.response?.status >= 400 && 
        error.response?.status < 500 && 
        error.response?.status !== 408 && 
        error.response?.status !== 429) {
      throw error;
    }
    
    console.log(`Retrying request... (${MAX_RETRIES - retries + 1}/${MAX_RETRIES})`);
    await new Promise(resolve => setTimeout(resolve, delay));
    return retryRequest(fn, retries - 1, delay * 2);
  }
};

// Cache implementation
class SimpleCache {
  constructor(ttl = 5 * 60 * 1000) { // 5 minutes default
    this.cache = new Map();
    this.ttl = ttl;
  }
  
  set(key, value) {
    this.cache.set(key, {
      value,
      timestamp: Date.now()
    });
  }
  
  get(key) {
    const item = this.cache.get(key);
    if (!item) return null;
    
    if (Date.now() - item.timestamp > this.ttl) {
      this.cache.delete(key);
      return null;
    }
    
    return item.value;
  }
  
  clear() {
    this.cache.clear();
  }
  
  delete(key) {
    this.cache.delete(key);
  }
}

const cache = new SimpleCache();

// Add request interceptor for auth token and request tracking
api.interceptors.request.use(
  (config) => {
    // Add auth token
    const token = localStorage.getItem('authToken') || sessionStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    // Add request ID for tracking
    config.headers['X-Request-ID'] = generateRequestId();
    
    // Add timestamp
    config.metadata = { startTime: new Date() };
    
    // Log request in development
    const isDev = getEnvVar('VITE_NODE_ENV', 'development') === 'development';
    if (isDev) {
      console.log(`API Request: ${config.method?.toUpperCase()} ${config.url}`, config.data);
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add response interceptor for error handling and response transformation
api.interceptors.response.use(
  (response) => {
    // Log response time in development
    const isDev = getEnvVar('VITE_NODE_ENV', 'development') === 'development';
    if (isDev && response.config.metadata) {
      const duration = new Date() - response.config.metadata.startTime;
      console.log(`API Response: ${response.config.url} (${duration}ms)`, response.data);
    }
    
    return response;
  },
  async (error) => {
    const { config, response } = error;
    
    // Handle network errors
    if (!response && !isOnline) {
      // Queue request for later if it's a safe method
      if (config && ['GET', 'HEAD', 'OPTIONS'].includes(config.method.toUpperCase())) {
        requestQueue.push(() => api.request(config));
        return Promise.reject(new Error('Request queued for offline processing'));
      }
    }
    
    // Handle timeout
    if (error.code === 'ECONNABORTED') {
      console.error('Request timeout:', config?.url);
      return Promise.reject(new Error('Request timeout. Please try again.'));
    }
    
    // Handle 401 Unauthorized
    if (response?.status === 401) {
      // Clear auth tokens
      localStorage.removeItem('authToken');
      sessionStorage.removeItem('authToken');
      
      // Redirect to login if needed
      if (window.location.pathname !== '/login') {
        window.location.href = '/login?expired=true';
      }
      
      return Promise.reject(new Error('Authentication required'));
    }
    
    // Handle 404/405 with fallback endpoints for save operations
    if ((response?.status === 404 || response?.status === 405) && 
        config?.url?.includes('/responses') && 
        config?.method === 'post') {
      
      console.log('Trying fallback save endpoint...');
      
      // Extract data from original request
      const data = typeof config.data === 'string' ? JSON.parse(config.data) : config.data;
      const { client_id, survey_type } = data;
      
      // Try fallback endpoints in order
      const fallbackEndpoints = [
        `/survey/${survey_type}/responses/${client_id}`,
        `/survey/${survey_type}/responses`,
        `/api/survey/${survey_type}/responses`,
        `/survey/${survey_type}`,
      ];
      
      for (const endpoint of fallbackEndpoints) {
        try {
          config.url = endpoint;
          const response = await api.request(config);
          return response;
        } catch (fallbackError) {
          if (fallbackError.response?.status !== 404 && fallbackError.response?.status !== 405) {
            throw fallbackError;
          }
        }
      }
    }
    
    // Handle rate limiting
    if (response?.status === 429) {
      const retryAfter = response.headers['retry-after'];
      const delay = retryAfter ? parseInt(retryAfter) * 1000 : 5000;
      
      console.log(`Rate limited. Retrying after ${delay}ms`);
      await new Promise(resolve => setTimeout(resolve, delay));
      
      return api.request(config);
    }
    
    // Handle 5xx errors with retry
    if (response?.status >= 500) {
      console.error(`Server error (${response.status}):`, response.data);
      // Retry will be handled by retryRequest wrapper
    }
    
    return Promise.reject(error);
  }
);

// Helper function to generate request ID
const generateRequestId = () => {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};

// Helper function to build query string
const buildQueryString = (params) => {
  const query = new URLSearchParams();
  Object.keys(params).forEach(key => {
    if (params[key] !== undefined && params[key] !== null) {
      query.append(key, params[key]);
    }
  });
  return query.toString();
};

/**
 * Get survey definition (questions and sections)
 */
export const getSurveyDefinition = async (surveyType, options = {}) => {
  const cacheKey = `survey-definition-${surveyType}`;
  
  // Check cache first
  if (!options.skipCache) {
    const cached = cache.get(cacheKey);
    if (cached) {
      console.log('Using cached survey definition');
      return cached;
    }
  }
  
  try {
    // Try multiple endpoints for survey questions
    const endpoints = [
      `/survey/${surveyType}/questions`,
      `/survey/questions/${surveyType}`,
      `/api/survey/${surveyType}/questions`,
      `/surveys/${surveyType}/definition`,
    ];
    
    for (const endpoint of endpoints) {
      try {
        const response = await retryRequest(() => api.get(endpoint, {
          params: options.params,
        }));
        
        if (response.data) {
          // Validate response structure
          if (!response.data.sections || !response.data.questions) {
            console.warn('Invalid survey definition structure, adding defaults');
            response.data.sections = response.data.sections || [];
            response.data.questions = response.data.questions || [];
          }
          
          // Cache successful response
          cache.set(cacheKey, response.data);
          
          return response.data;
        }
      } catch (err) {
        console.log(`Endpoint ${endpoint} failed, trying next...`);
      }
    }
    
    // If all fail, return mock data for development
    console.warn('Using mock survey data');
    return getMockSurveyData(surveyType);
  } catch (error) {
    console.error('Error fetching survey definition:', error);
    throw error;
  }
};

/**
 * Get saved survey responses
 */
export const getSurveyResponses = async (clientId, surveyType, options = {}) => {
  const cacheKey = `survey-responses-${clientId}-${surveyType}`;
  
  // Check cache first
  if (!options.skipCache) {
    const cached = cache.get(cacheKey);
    if (cached) {
      console.log('Using cached survey responses');
      return cached;
    }
  }
  
  try {
    // Try multiple endpoint patterns
    const endpoints = [
      `/survey/responses/${clientId}/${surveyType}`,
      `/survey/${surveyType}/responses/${clientId}`,
      `/api/survey/responses?${buildQueryString({ client_id: clientId, survey_type: surveyType })}`,
      `/surveys/${surveyType}/clients/${clientId}/responses`,
    ];
    
    for (const endpoint of endpoints) {
      try {
        const response = await api.get(endpoint, {
          params: options.params,
        });
        
        if (response.data) {
          // Cache successful response
          cache.set(cacheKey, response.data);
          return response.data;
        }
      } catch (err) {
        if (err.response?.status !== 404) {
          throw err;
        }
      }
    }
    
    // No saved responses found
    return null;
  } catch (error) {
    console.error('Error fetching survey responses:', error);
    if (error.response?.status === 404) {
      return null; // No saved responses yet
    }
    throw error;
  }
};

/**
 * Save survey responses with optimistic updates and conflict resolution
 */
export const saveSurveyResponses = async (clientId, surveyType, data, options = {}) => {
  try {
    // Clear response cache since we're updating
    cache.delete(`survey-responses-${clientId}-${surveyType}`);
    
    const payload = {
      client_id: clientId,
      survey_type: surveyType,
      ...data,
      version: data.version || 1, // For conflict resolution
      client_timestamp: new Date().toISOString(),
    };
    
    // Try primary endpoint first
    try {
      const response = await retryRequest(() => 
        api.post('/survey/responses', payload, {
          headers: {
            'X-Idempotency-Key': options.idempotencyKey || generateRequestId(),
          }
        })
      );
      return response.data;
    } catch (error) {
      // If primary fails, interceptor will handle fallbacks
      if (error.response?.status === 409) {
        // Handle conflict
        console.warn('Conflict detected, attempting to merge responses');
        const serverData = await getSurveyResponses(clientId, surveyType, { skipCache: true });
        const mergedData = mergeResponses(serverData, data);
        return saveSurveyResponses(clientId, surveyType, mergedData, options);
      }
      throw error;
    }
  } catch (error) {
    console.error('Error saving survey responses:', error);
    
    // Queue for offline if network error
    if (!isOnline) {
      queueOfflineSave(clientId, surveyType, data);
      return { queued: true, ...data };
    }
    
    throw error;
  }
};

/**
 * Batch save multiple survey responses
 */
export const batchSaveSurveyResponses = async (responses) => {
  try {
    const response = await retryRequest(() =>
      api.post('/survey/responses/batch', { responses })
    );
    
    // Clear cache for all saved surveys
    responses.forEach(r => {
      cache.delete(`survey-responses-${r.client_id}-${r.survey_type}`);
    });
    
    return response.data;
  } catch (error) {
    console.error('Error batch saving survey responses:', error);
    throw error;
  }
};

/**
 * Complete a survey
 */
export const completeSurvey = async (clientId, surveyType, userId) => {
  try {
    // Clear caches
    cache.delete(`survey-responses-${clientId}-${surveyType}`);
    cache.delete(`survey-status-${clientId}-${surveyType}`);
    
    const response = await retryRequest(() =>
      api.post('/survey/complete', {
        client_id: clientId,
        survey_type: surveyType,
        user_id: userId,
        completed_at: new Date().toISOString(),
      })
    );
    
    return response.data;
  } catch (error) {
    console.error('Error completing survey:', error);
    throw error;
  }
};

/**
 * Get survey status
 */
export const getSurveyStatus = async (clientId, surveyType) => {
  const cacheKey = `survey-status-${clientId}-${surveyType}`;
  const cached = cache.get(cacheKey);
  if (cached) return cached;
  
  try {
    const response = await api.get(`/survey/status/${clientId}/${surveyType}`);
    cache.set(cacheKey, response.data);
    return response.data;
  } catch (error) {
    console.error('Error fetching survey status:', error);
    
    // Return default status on error
    if (error.response?.status === 404) {
      return {
        completed: false,
        started: false,
        progress: 0,
      };
    }
    throw error;
  }
};

/**
 * Get all surveys status for a client
 */
export const getAllSurveysStatus = async (clientId) => {
  const cacheKey = `all-surveys-status-${clientId}`;
  const cached = cache.get(cacheKey);
  if (cached) return cached;
  
  try {
    const response = await api.get(`/survey/status/${clientId}`);
    cache.set(cacheKey, response.data);
    return response.data;
  } catch (error) {
    console.error('Error fetching all surveys status:', error);
    throw error;
  }
};

/**
 * Upload file for survey question
 */
export const uploadSurveyFile = async (file, metadata = {}) => {
  const formData = new FormData();
  formData.append('file', file);
  Object.keys(metadata).forEach(key => {
    formData.append(key, metadata[key]);
  });
  
  try {
    const response = await retryRequest(() =>
      api.post('/survey/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        onUploadProgress: (progressEvent) => {
          const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          if (metadata.onProgress) {
            metadata.onProgress(percentCompleted);
          }
        },
      })
    );
    
    return response.data;
  } catch (error) {
    console.error('Error uploading file:', error);
    throw error;
  }
};

/**
 * Download survey responses as file
 */
export const downloadSurveyResponses = async (clientId, surveyType, format = 'json') => {
  try {
    const response = await api.get(`/survey/export/${clientId}/${surveyType}`, {
      params: { format },
      responseType: 'blob',
    });
    
    // Create download link
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `survey-${surveyType}-${clientId}-${Date.now()}.${format}`);
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
    
    return true;
  } catch (error) {
    console.error('Error downloading survey responses:', error);
    throw error;
  }
};

/**
 * Validate survey responses
 */
export const validateSurveyResponses = async (surveyType, responses) => {
  try {
    const response = await api.post(`/survey/${surveyType}/validate`, { responses });
    return response.data;
  } catch (error) {
    console.error('Error validating survey responses:', error);
    
    // Return validation errors from server
    if (error.response?.status === 422) {
      return error.response.data;
    }
    throw error;
  }
};

/**
 * Get survey analytics
 */
export const getSurveyAnalytics = async (clientId, surveyType) => {
  const cacheKey = `survey-analytics-${clientId}-${surveyType}`;
  const cached = cache.get(cacheKey);
  if (cached) return cached;
  
  try {
    const response = await api.get(`/survey/analytics/${clientId}/${surveyType}`);
    cache.set(cacheKey, response.data);
    return response.data;
  } catch (error) {
    console.error('Error fetching survey analytics:', error);
    throw error;
  }
};

/**
 * Normalize responses from various formats
 */
export const normalizeResponses = (rawData, questions) => {
  if (!rawData) return {};
  
  let normalized = {};
  
  // Handle different response formats
  if (rawData.responses && typeof rawData.responses === 'object') {
    // Format: { responses: { [id]: value } }
    normalized = { ...rawData.responses };
  } else if (Array.isArray(rawData)) {
    // Format: [{ question_id: x, response: y }]
    rawData.forEach(item => {
      const questionId = item.question_id || item.id || item.questionId;
      const value = item.response || item.value || item.answer;
      if (questionId) {
        normalized[questionId] = value;
      }
    });
  } else if (typeof rawData === 'object') {
    // Format: { [id]: value } or other object formats
    Object.keys(rawData).forEach(key => {
      // Skip metadata fields
      if (!['client_id', 'survey_type', 'timestamp', 'progress', 'completed', 
            'version', 'metadata', 'created_at', 'updated_at'].includes(key)) {
        normalized[key] = rawData[key];
      }
    });
  }
  
  // Process responses based on question types
  questions.forEach(question => {
    const questionId = question.id;
    const value = normalized[questionId];
    
    if (value !== undefined && value !== null) {
      const responseType = question.response_type || question.type;
      const isMultiSelect = ['multi_select', 'checkbox'].includes(responseType);
      
      if (isMultiSelect) {
        // Convert CSV strings to arrays
        if (typeof value === 'string') {
          if (value.includes(',')) {
            normalized[questionId] = value.split(',').map(v => v.trim()).filter(v => v);
          } else if (value.includes(';')) {
            normalized[questionId] = value.split(';').map(v => v.trim()).filter(v => v);
          } else {
            normalized[questionId] = value ? [value] : [];
          }
        } else if (!Array.isArray(value)) {
          normalized[questionId] = value ? [value] : [];
        }
      } else if (responseType === 'number') {
        // Ensure numbers are properly typed
        normalized[questionId] = value === '' ? null : Number(value);
      } else if (responseType === 'boolean') {
        // Handle boolean values
        normalized[questionId] = value === 'true' || value === true;
      } else {
        // Ensure single-select values are strings
        if (Array.isArray(value) && value.length > 0) {
          normalized[questionId] = value[0];
        }
      }
    }
  });
  
  return normalized;
};

/**
 * Merge responses for conflict resolution
 */
const mergeResponses = (serverData, clientData) => {
  const merged = { ...serverData };
  
  // Use client data but preserve server metadata
  merged.responses = { ...serverData.responses, ...clientData.responses };
  merged.version = (serverData.version || 0) + 1;
  merged.merged_at = new Date().toISOString();
  
  // Merge progress info, taking the higher values
  if (clientData.progress && serverData.progress) {
    merged.progress = {
      answered: Math.max(clientData.progress.answered || 0, serverData.progress.answered || 0),
      total: clientData.progress.total || serverData.progress.total,
      percentage: Math.max(clientData.progress.percentage || 0, serverData.progress.percentage || 0),
    };
  }
  
  return merged;
};

/**
 * Queue offline save
 */
const queueOfflineSave = (clientId, surveyType, data) => {
  const key = `offline-survey-${clientId}-${surveyType}`;
  const queue = JSON.parse(localStorage.getItem('offline-survey-queue') || '[]');
  
  // Update or add to queue
  const existingIndex = queue.findIndex(item => 
    item.clientId === clientId && item.surveyType === surveyType
  );
  
  const queueItem = {
    clientId,
    surveyType,
    data,
    timestamp: new Date().toISOString(),
  };
  
  if (existingIndex >= 0) {
    queue[existingIndex] = queueItem;
  } else {
    queue.push(queueItem);
  }
  
  localStorage.setItem('offline-survey-queue', JSON.stringify(queue));
  localStorage.setItem(key, JSON.stringify(data));
};

/**
 * Process offline queue
 */
export const processOfflineQueue = async () => {
  const queue = JSON.parse(localStorage.getItem('offline-survey-queue') || '[]');
  const processed = [];
  const failed = [];
  
  for (const item of queue) {
    try {
      await saveSurveyResponses(item.clientId, item.surveyType, item.data);
      processed.push(item);
      
      // Remove individual item from storage
      localStorage.removeItem(`offline-survey-${item.clientId}-${item.surveyType}`);
    } catch (error) {
      console.error('Failed to process offline item:', error);
      failed.push(item);
    }
  }
  
  // Update queue with only failed items
  localStorage.setItem('offline-survey-queue', JSON.stringify(failed));
  
  return {
    processed: processed.length,
    failed: failed.length,
    remaining: failed,
  };
};

/**
 * Clear all caches
 */
export const clearAllCaches = () => {
  cache.clear();
  console.log('All caches cleared');
};

/**
 * Get mock survey data for development
 */
const getMockSurveyData = (surveyType) => {
  const mockData = {
    strategy: {
      sections: [
        { id: 'goals', title: 'Strategic Goals', description: 'Define your primary objectives', order: 1 },
        { id: 'priorities', title: 'Priorities', description: 'Identify key focus areas', order: 2 },
        { id: 'challenges', title: 'Challenges', description: 'Acknowledge potential obstacles', order: 3 },
      ],
      questions: [
        {
          id: 'q1',
          section_id: 'goals',
          question_text: 'What are your primary strategic objectives for data monetization?',
          description: 'Please be specific about your goals',
          response_type: 'long_text',
          required: true,
          max_length: 500,
          order: 1,
        },
        {
          id: 'q2',
          section_id: 'goals',
          question_text: 'Select your top priorities:',
          response_type: 'multi_select',
          options: ['Revenue Growth', 'Cost Reduction', 'Innovation', 'Compliance', 'Market Expansion'],
          required: true,
          order: 2,
        },
        {
          id: 'q3',
          section_id: 'priorities',
          question_text: 'What is your timeline for implementation?',
          response_type: 'single_select',
          options: ['3 months', '6 months', '12 months', '18+ months'],
          required: true,
          order: 3,
        },
        {
          id: 'q4',
          section_id: 'priorities',
          question_text: 'Rate your current readiness level:',
          response_type: 'rating',
          max_rating: 5,
          required: true,
          order: 4,
        },
        {
          id: 'q5',
          section_id: 'challenges',
          question_text: 'What are your biggest challenges?',
          response_type: 'long_text',
          required: false,
          max_length: 1000,
          order: 5,
        },
        {
          id: 'q6',
          section_id: 'challenges',
          question_text: 'Upload any relevant documentation:',
          response_type: 'file',
          accept: '.pdf,.doc,.docx',
          required: false,
          order: 6,
        },
      ],
    },
    capabilities: {
      sections: [
        { id: 'technical', title: 'Technical Capabilities', order: 1 },
        { id: 'organizational', title: 'Organizational Capabilities', order: 2 },
      ],
      questions: [
        {
          id: 'c1',
          section_id: 'technical',
          question_text: 'Rate your current data infrastructure:',
          response_type: 'single_select',
          options: ['Basic', 'Intermediate', 'Advanced', 'Expert'],
          required: true,
          order: 1,
        },
        {
          id: 'c2',
          section_id: 'organizational',
          question_text: 'Do you have a dedicated data team?',
          response_type: 'single_select',
          options: ['Yes', 'No', 'Planning to build one'],
          required: true,
          order: 2,
        },
        {
          id: 'c3',
          section_id: 'organizational',
          question_text: 'How many data professionals do you have?',
          response_type: 'number',
          min: 0,
          max: 1000,
          required: false,
          depends_on: { question_id: 'c2', value: 'Yes' },
          order: 3,
        },
      ],
    },
    readiness: {
      sections: [
        { id: 'assessment', title: 'Readiness Assessment', order: 1 },
      ],
      questions: [
        {
          id: 'r1',
          section_id: 'assessment',
          question_text: 'How ready is your organization for data monetization?',
          response_type: 'single_select',
          options: ['Not Ready', 'Somewhat Ready', 'Ready', 'Very Ready'],
          required: true,
          order: 1,
        },
        {
          id: 'r2',
          section_id: 'assessment',
          question_text: 'Email for follow-up:',
          response_type: 'email',
          required: true,
          validation_type: 'email',
          order: 2,
        },
      ],
    },
  };
  
  return mockData[surveyType] || mockData.strategy;
};

// Initialize offline queue processing when online
if (isOnline) {
  processOfflineQueue().then(result => {
    if (result.processed > 0) {
      console.log(`Processed ${result.processed} offline survey saves`);
    }
  });
}

// Export all functions
export default {
  getSurveyDefinition,
  getSurveyResponses,
  saveSurveyResponses,
  batchSaveSurveyResponses,
  completeSurvey,
  normalizeResponses,
  getSurveyStatus,
  getAllSurveysStatus,
  uploadSurveyFile,
  downloadSurveyResponses,
  validateSurveyResponses,
  getSurveyAnalytics,
  processOfflineQueue,
  clearAllCaches,
};