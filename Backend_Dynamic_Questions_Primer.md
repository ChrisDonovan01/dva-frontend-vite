# Backend Dynamic Question Loading - Technical Primer for ChatGPT

## URGENT PROBLEM SUMMARY
A Node.js Express backend is **failing to serve survey questions** from a BigQuery `survey_questions_master` table, preventing React frontend components from loading questions dynamically. The endpoint returns 404 errors despite being properly mounted.

## CORE ISSUE
- **Expected**: `GET /api/survey/questions/strategy` returns JSON with questions from BigQuery
- **Actual**: `Cannot GET /api/survey/questions/strategy` (404 error)
- **Critical**: Frontend surveys show "Failed to load survey questions" instead of actual survey content

## TECHNICAL CONTEXT

### Backend Architecture
```javascript
// dva-backend/server.js
const express = require('express');
const loadSurveyQuestions = require('./routes/loadSurveyQuestions');

// Route mounting (appears correct)
app.use('/api/survey/questions', loadSurveyQuestions);

// Server should run on port 3001
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`DVA Backend server running on port ${PORT}`);
});
```

### Question Loading Route
```javascript
// dva-backend/routes/loadSurveyQuestions.js
const express = require('express');
const { BigQuery } = require('@google-cloud/bigquery');
const router = express.Router();

// GET /api/survey/questions/:surveyType
router.get('/:surveyType', async (req, res) => {
  try {
    const { surveyType } = req.params;
    
    const query = `
      SELECT 
        question_id,
        section,
        question_text,
        question_type,
        options,
        required,
        display_order
      FROM \`dva_dataset.survey_questions_master\`
      WHERE survey_type = @surveyType
      ORDER BY display_order ASC
    `;
    
    const [rows] = await bigquery.query({
      query: query,
      params: { surveyType: surveyType }
    });
    
    const questions = rows.map(row => ({
      id: row.question_id,
      section: row.section,
      text: row.question_text,
      type: row.question_type,
      options: row.options ? JSON.parse(row.options) : null,
      required: row.required,
      order: row.display_order
    }));
    
    res.json({
      success: true,
      survey_type: surveyType,
      questions: questions,
      question_count: questions.length
    });
    
  } catch (error) {
    console.error('❌ Error loading survey questions:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to load survey questions',
      error: error.message
    });
  }
});

module.exports = router;
```

### Frontend Integration
```javascript
// dva-frontend-vite/src/services/surveyService.js
export class SurveyService {
  static async loadSurveyQuestions(surveyType) {
    try {
      const response = await fetch(`http://localhost:3001/api/survey/questions/${surveyType}`);
      const data = await handleApiResponse(response);
      return data.questions;
    } catch (error) {
      console.error(`Failed to load ${surveyType} questions:`, error);
      return [];
    }
  }
}

// dva-frontend-vite/src/components/StrategicPrioritiesSurvey.jsx
useEffect(() => {
  const loadQuestions = async () => {
    try {
      const loadedQuestions = await SurveyService.loadStrategyQuestions();
      setQuestions(transformedQuestions);
      setQuestionsLoading(false);
    } catch (error) {
      console.error('❌ Failed to load questions:', error);
      setQuestionsLoading(false);
    }
  };
  
  loadQuestions();
}, []);
```

## DEBUGGING EVIDENCE

### 1. Server Status Check
```bash
$ ps aux | grep node
# No dva-backend server process found on port 3001
```

### 2. Endpoint Test
```bash
$ curl -s "http://localhost:3001/api/survey/questions/strategy"
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<title>Error</title>
</head>
<body>
<pre>Cannot GET /api/survey/questions/strategy</pre>
</body>
</html>
```

### 3. Frontend Console Error
```javascript
// Browser console shows:
SurveyService: Loading questions for survey type: strategy
❌ SurveyService: Failed to load strategy questions: Error: HTTP 404
// Results in: "Failed to load survey questions. Please try again."
```

## BIGQUERY DATA STRUCTURE

### survey_questions_master Table Schema
```sql
CREATE TABLE dva_dataset.survey_questions_master (
  question_id STRING,
  survey_type STRING,  -- 'strategy', 'capabilities', 'readiness'
  section STRING,
  question_text STRING,
  question_type STRING,  -- 'radio', 'checkbox', 'text_long', 'likert_1_5'
  options STRING,  -- JSON array for choices
  required BOOLEAN,
  display_order INT64,
  created_at TIMESTAMP,
  updated_at TIMESTAMP,
  version INT64,
  is_active BOOLEAN
);
```

### Sample Data
```sql
-- strategy survey questions exist in table
SELECT question_id, survey_type, question_text 
FROM dva_dataset.survey_questions_master 
WHERE survey_type = 'strategy' 
ORDER BY display_order;

-- Returns: strategic_priority, competitive_advantage, market_position, etc.
```

## EXPECTED BEHAVIOR

### 1. Backend Server Startup
```bash
$ cd dva-backend
$ npm start
DVA Backend server running on port 3001
📊 BigQuery client initialized
✅ All routes mounted successfully
```

### 2. Successful API Response
```json
GET /api/survey/questions/strategy
{
  "success": true,
  "survey_type": "strategy",
  "questions": [
    {
      "id": "strategic_priority",
      "section": "Strategic Vision",
      "text": "What is your organization's top strategic priority for the next 3–5 years?",
      "type": "radio",
      "options": ["Expand market presence", "Improve patient outcomes", ...],
      "required": true,
      "order": 1
    },
    // ... more questions
  ],
  "question_count": 9
}
```

### 3. Frontend Success Flow
```javascript
// Console should show:
SurveyService: Loading questions for survey type: strategy
✅ Loaded 9 questions for strategy
// Survey modal displays with real questions from BigQuery
```

## POTENTIAL ROOT CAUSES

### 1. Server Startup Issues
- Backend server not starting properly
- Port 3001 already in use
- Missing environment variables or credentials
- Package.json scripts misconfigured

### 2. Route Configuration Problems
- Route mounting order conflicts
- Express router middleware issues
- Path parameter parsing problems
- CORS configuration blocking requests

### 3. BigQuery Connection Issues
- Missing or invalid GCP service account credentials
- BigQuery client initialization failures
- Query syntax errors or parameter binding issues
- Dataset/table permissions problems

### 4. Environment Configuration
- Missing .env file or incorrect environment variables
- Node.js version compatibility issues
- Missing npm dependencies
- File path resolution problems

## DEBUGGING CHECKLIST

### Backend Server
- [ ] Verify server starts without errors on port 3001
- [ ] Check all required npm packages are installed
- [ ] Confirm GCP credentials file exists and is valid
- [ ] Test BigQuery connection independently
- [ ] Verify route mounting order in server.js

### API Endpoint
- [ ] Test endpoint directly with curl/Postman
- [ ] Check Express router configuration
- [ ] Verify parameter parsing (:surveyType)
- [ ] Confirm BigQuery query syntax and parameters
- [ ] Test with different survey types (strategy, capabilities, readiness)

### Frontend Integration
- [ ] Verify API base URL matches backend port
- [ ] Check network requests in browser dev tools
- [ ] Confirm error handling in SurveyService
- [ ] Test question transformation logic
- [ ] Verify React component state management

## SUCCESS CRITERIA

1. **Backend server starts successfully** and listens on port 3001
2. **API endpoint responds** with valid JSON containing questions from BigQuery
3. **Frontend loads questions dynamically** and displays survey modal correctly
4. **All three survey types work** (strategy, capabilities, readiness)
5. **Error handling gracefully** handles BigQuery or network failures

## FILES TO EXAMINE

### Backend
- `dva-backend/server.js` - Main server configuration
- `dva-backend/routes/loadSurveyQuestions.js` - Question loading endpoint
- `dva-backend/package.json` - Dependencies and scripts
- `dva-backend/.env` - Environment configuration
- `dva-backend/gcp-service-account.json` - BigQuery credentials

### Frontend
- `dva-frontend-vite/src/services/surveyService.js` - API service layer
- `dva-frontend-vite/src/components/StrategicPrioritiesSurvey.jsx` - Survey component

## IMMEDIATE NEXT STEPS

1. **Diagnose why backend server isn't starting** on port 3001
2. **Fix server startup issues** (dependencies, credentials, configuration)
3. **Test API endpoint** returns valid question data from BigQuery
4. **Verify frontend integration** loads questions dynamically
5. **Extend to other survey types** (capabilities, readiness)

---

**GOAL**: Replace hardcoded frontend question arrays with dynamic loading from the canonical BigQuery `survey_questions_master` table, ensuring all surveys use the same centralized question definitions for consistency and maintainability.
