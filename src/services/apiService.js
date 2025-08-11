const BACKEND_URL = process.env.REACT_APP_BACKEND_URL; // Use environment variable for backend URL

export const generateStrategicInsights = async (componentName, additionalParams = {}) => {
  try {
    const response = await fetch(`${BACKEND_URL}/api/generate-strategic-insights`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ componentName, additionalParams }),
    });

    const data = await response.json();

    if (data.success) {
      return { jsx: data.jsx, insights: data.insights };
    } else {
      throw new Error(data.error || "Failed to fetch insights from backend.");
    }
  } catch (error) {
    console.error('API service error:', error);
    throw error;
  }
};

export const getStrategicAlignmentScores = async (client_id, use_case_id) => {
  try {
    const response = await fetch(`${BACKEND_URL}/api/get-strategic-alignment-scores`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ client_id, use_case_id }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();

    if (data.success) {
      return data.scores;
    } else {
      throw new Error(data.error || "Failed to fetch strategic alignment scores from backend.");
    }
  } catch (error) {
    console.error('API service error:', error);
    throw error;
  }
};