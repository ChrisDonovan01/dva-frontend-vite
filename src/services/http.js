// src/services/http.js

/**
 * Centralized HTTP configuration and URL builder
 * Handles API base URL resolution for both development and production
 */

import axios from 'axios';

// Get API base URL from environment or use defaults
export const API_BASE_URL = (() => {
  // First check for environment variable
  if (import.meta.env.VITE_API_URL) {
    return import.meta.env.VITE_API_URL.replace(/\/+$/, '');
  }
  
  // Default for local development
  if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
    return 'http://localhost:8080'; // Your backend runs on 8080
  }
  
  // Production: use same origin
  return window.location.origin;
})();

// API prefix if your backend routes are under /api
export const API_PREFIX = import.meta.env.VITE_API_PREFIX || '';

/**
 * Build full API URL for a given path
 * @param {string} path - API endpoint path (should start with /)
 * @returns {string} Full URL for the API endpoint
 */
export function apiUrl(path) {
  // Ensure path starts with /
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  return `${API_BASE_URL}${API_PREFIX}${normalizedPath}`;
}

/**
 * Check if the backend is reachable
 * @returns {Promise<boolean>}
 */
export async function checkBackendHealth() {
  try {
    // Try to fetch a lightweight endpoint that should always exist
    // Using the progress endpoint with a test client ID
    const response = await fetch(apiUrl('/survey/progress/101/all'), {
      method: 'GET',
      mode: 'cors',
      cache: 'no-cache'
    });
    return response.ok;
  } catch (error) {
    console.warn('Backend health check failed:', error);
    return false;
  }
}

// Create and configure axios instance
export const apiClient = axios.create({
  baseURL: `${API_BASE_URL}${API_PREFIX}`,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000, // 30 second timeout
});

// Add request interceptor for debugging
apiClient.interceptors.request.use(
  (config) => {
    console.log(`[API Request] ${config.method?.toUpperCase()} ${config.url}`);
    return config;
  },
  (error) => {
    console.error('[API Request Error]', error);
    return Promise.reject(error);
  }
);

// Add response interceptor for error handling
apiClient.interceptors.response.use(
  (response) => {
    console.log(`[API Response] ${response.config.method?.toUpperCase()} ${response.config.url}:`, response.status);
    return response;
  },
  (error) => {
    if (error.code === 'ERR_NETWORK' || error.code === 'ERR_CONNECTION_REFUSED') {
      console.error('[API Error] Backend server is not reachable. Please ensure the backend is running on port 8080');
      // You can also trigger a global notification here if you have a notification system
    } else if (error.response) {
      // The request was made and the server responded with a status code
      // that falls out of the range of 2xx
      console.error('[API Error]', error.response.status, error.response.data?.message || error.message);
    } else if (error.request) {
      // The request was made but no response was received
      console.error('[API Error] No response received:', error.message);
    } else {
      // Something happened in setting up the request that triggered an Error
      console.error('[API Error]', error.message);
    }
    return Promise.reject(error);
  }
);

// Helper function to handle API errors consistently
export function handleApiError(error, defaultMessage = 'An error occurred') {
  if (error.code === 'ERR_NETWORK' || error.code === 'ERR_CONNECTION_REFUSED') {
    return 'Cannot connect to server. Please ensure the backend is running on port 8080.';
  }
  
  if (error.response?.data?.message) {
    return error.response.data.message;
  }
  
  if (error.message) {
    return error.message;
  }
  
  return defaultMessage;
}

// Convenience methods for common HTTP operations
export const api = {
  get: (url, config) => apiClient.get(url, config),
  post: (url, data, config) => apiClient.post(url, data, config),
  put: (url, data, config) => apiClient.put(url, data, config),
  delete: (url, config) => apiClient.delete(url, config),
  patch: (url, data, config) => apiClient.patch(url, data, config),
};

export default apiClient;