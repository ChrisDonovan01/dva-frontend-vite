// src/components/NetworkStatusBanner.jsx
import { useState, useEffect } from 'react';
import { checkBackendHealth } from '../services/http';

export default function NetworkStatusBanner() {
  const [isOffline, setIsOffline] = useState(false);
  const [checking, setChecking] = useState(false);

  const checkStatus = async () => {
    setChecking(true);
    try {
      const isHealthy = await checkBackendHealth();
      setIsOffline(!isHealthy);
    } catch (error) {
      setIsOffline(true);
    } finally {
      setChecking(false);
    }
  };

  useEffect(() => {
    // Initial check
    checkStatus();
    
    // Check every 30 seconds
    const interval = setInterval(checkStatus, 30000);
    
    // Cleanup
    return () => clearInterval(interval);
  }, []);

  // Don't show banner if backend is online
  if (!isOffline) return null;

  return (
    <div className="fixed top-0 left-0 right-0 bg-red-600 text-white px-4 py-2 z-50 shadow-lg">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <svg className="w-5 h-5" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor">
            <path d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path>
          </svg>
          <span className="font-medium">Backend server is offline. Please ensure it's running on port 8080.</span>
        </div>
        <button 
          onClick={checkStatus}
          disabled={checking}
          className="px-3 py-1 bg-white text-red-600 rounded hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {checking ? 'Checking...' : 'Retry'}
        </button>
      </div>
    </div>
  );
}