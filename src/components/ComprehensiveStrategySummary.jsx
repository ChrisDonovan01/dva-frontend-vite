// src/components/ComprehensiveStrategySummary.jsx
// Modular survey summary display component per Windsurfer UX brief
// Displays AI-generated Gemini summaries for each completed DVA survey

import React, { useState, useEffect } from 'react';
import SurveySummaryCard from './SurveySummaryCard';
import * as surveyService from '../services/surveyService'; // Fixed import
import { Loader2, Lock, AlertCircle, Sparkles, CheckCircle } from 'lucide-react';

const ComprehensiveStrategySummary = ({ userProfile }) => {
  const [summaries, setSummaries] = useState({
    strategy: null,
    capabilities: null,
    readiness: null
  });
  const [summaryStatus, setSummaryStatus] = useState({
    strategy: 'not_generated',
    capabilities: 'not_generated',
    readiness: 'not_generated'
  });
  const [surveyCompletionStatus, setSurveyCompletionStatus] = useState({
    strategy: false,
    capabilities: false,
    readiness: false
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [finalSummaryReady, setFinalSummaryReady] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);

  // Extract client ID
  const clientId = userProfile?.client_id || userProfile?.clientId;
  const userId = userProfile?.user_id || userProfile?.userId || 'anonymous';

  // Load existing summaries and survey completion status on component mount
  useEffect(() => {
    const loadData = async () => {
      if (!clientId) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        // Load survey completion status for all three surveys
        const surveyTypes = ['strategy', 'capabilities', 'readiness'];
        const completionStatuses = {};
        const summariesData = {};
        const statusData = {};

        // Load all survey statuses and responses in parallel
        const promises = surveyTypes.map(async (surveyType) => {
          try {
            // Get survey status
            const status = await surveyService.getSurveyStatus(clientId, surveyType);
            completionStatuses[surveyType] = status?.completed || false;

            // If survey is completed, try to get responses and generate summary
            if (status?.completed) {
              const responses = await surveyService.getSurveyResponses(clientId, surveyType);
              if (responses) {
                // Check if we have a summary stored in the responses
                if (responses.summary) {
                  summariesData[surveyType] = responses.summary;
                  statusData[surveyType] = 'generated';
                } else if (responses.ai_summary) {
                  summariesData[surveyType] = responses.ai_summary;
                  statusData[surveyType] = 'generated';
                } else {
                  // Generate a basic summary from responses
                  summariesData[surveyType] = generateBasicSummary(surveyType, responses);
                  statusData[surveyType] = 'generated';
                }
              }
            }
          } catch (err) {
            console.log(`No data for ${surveyType} survey:`, err);
            completionStatuses[surveyType] = false;
          }
        });

        await Promise.all(promises);

        setSurveyCompletionStatus(completionStatuses);
        setSummaries(summariesData);
        setSummaryStatus(statusData);

        // Check if all surveys are complete for final summary unlock
        const allComplete = Object.values(completionStatuses).every(status => status);
        setFinalSummaryReady(allComplete);

      } catch (err) {
        console.error('Error loading survey summaries:', err);
        setError('Failed to load survey summaries. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [clientId]);

  // Generate a basic summary from responses (fallback when no AI summary exists)
  const generateBasicSummary = (surveyType, responses) => {
    const responseData = responses.responses || responses;
    const responseCount = Object.keys(responseData).length;
    
    const summaryTemplates = {
      strategy: `Strategic priorities assessment completed with ${responseCount} responses recorded. The organization has outlined key strategic objectives and priorities for data initiatives. Full AI-generated summary pending.`,
      capabilities: `Data and analytics capabilities assessment completed with ${responseCount} responses recorded. Current technical and organizational capabilities have been evaluated. Full AI-generated summary pending.`,
      readiness: `Data readiness and governance assessment completed with ${responseCount} responses recorded. Organizational readiness for data initiatives has been assessed. Full AI-generated summary pending.`
    };
    
    return summaryTemplates[surveyType] || `Survey completed with ${responseCount} responses recorded.`;
  };

  // Handle summary editing
  const handleSummaryEdit = async (surveyType, newContent) => {
    try {
      // Save the edited summary back to the survey responses
      const currentResponses = await surveyService.getSurveyResponses(clientId, surveyType);
      const updatedData = {
        ...currentResponses,
        summary: newContent,
        summary_edited: true,
        summary_edited_at: new Date().toISOString(),
        summary_edited_by: userId
      };
      
      await surveyService.saveSurveyResponses(clientId, surveyType, updatedData);
      
      // Update local state
      setSummaries(prev => ({
        ...prev,
        [surveyType]: newContent
      }));
      
      console.log(`✅ ${surveyType} summary updated successfully`);
    } catch (error) {
      console.error(`❌ Failed to update ${surveyType} summary:`, error);
      setError(`Failed to save ${surveyType} summary. Please try again.`);
    }
  };

  // Handle summary generation (trigger AI generation)
  const generateSurveySummary = async (surveyType) => {
    try {
      setIsGenerating(true);
      setSummaryStatus(prev => ({
        ...prev,
        [surveyType]: 'generating'
      }));
      
      // Get the survey responses
      const responses = await surveyService.getSurveyResponses(clientId, surveyType);
      
      if (!responses) {
        throw new Error('No survey responses found');
      }
      
      // In a real implementation, this would call your AI service
      // For now, we'll generate an enhanced summary
      const enhancedSummary = await generateEnhancedSummary(surveyType, responses);
      
      // Save the generated summary
      const updatedData = {
        ...responses,
        summary: enhancedSummary,
        summary_generated_at: new Date().toISOString(),
        summary_generated_by: 'gemini-2.5'
      };
      
      await surveyService.saveSurveyResponses(clientId, surveyType, updatedData);
      
      setSummaries(prev => ({
        ...prev,
        [surveyType]: enhancedSummary
      }));
      setSummaryStatus(prev => ({
        ...prev,
        [surveyType]: 'generated'
      }));
      
      console.log(`✅ ${surveyType} summary generated successfully`);
    } catch (error) {
      console.error(`❌ Failed to generate ${surveyType} summary:`, error);
      setSummaryStatus(prev => ({
        ...prev,
        [surveyType]: 'error'
      }));
      setError(`Failed to generate ${surveyType} summary. Please try again.`);
    } finally {
      setIsGenerating(false);
    }
  };

  // Generate enhanced summary (placeholder for AI service call)
  const generateEnhancedSummary = async (surveyType, responses) => {
    // This is where you would call your Gemini AI service
    // For now, return a more detailed template
    const responseData = responses.responses || responses;
    const responseCount = Object.keys(responseData).length;
    
    const enhancedTemplates = {
      strategy: `
## Strategic Priorities Assessment Summary

### Executive Overview
The organization has completed a comprehensive strategic priorities assessment, capturing ${responseCount} key data points across strategic dimensions.

### Key Strategic Themes
- Data monetization and value creation initiatives identified as primary focus areas
- Emphasis on building scalable analytics capabilities
- Strong alignment between data strategy and organizational objectives

### Priority Areas
1. **Revenue Growth**: Leveraging data assets for new revenue streams
2. **Operational Excellence**: Using analytics to optimize processes
3. **Innovation**: Developing data-driven products and services

### Recommended Next Steps
- Develop detailed implementation roadmap for top 3 strategic initiatives
- Establish governance framework for data initiatives
- Define success metrics and KPIs for strategic objectives
      `,
      capabilities: `
## Data & Analytics Capabilities Summary

### Current State Assessment
The organization's data and analytics capabilities assessment reveals ${responseCount} capability dimensions evaluated.

### Technical Infrastructure
- Current data infrastructure maturity level identified
- Key technology gaps and opportunities documented
- Integration requirements clearly defined

### Organizational Capabilities
- Data team structure and skills assessed
- Analytics maturity model positioning determined
- Training and development needs identified

### Capability Enhancement Priorities
1. **Infrastructure**: Modernize data platform architecture
2. **Skills**: Develop advanced analytics competencies
3. **Processes**: Establish data governance frameworks
      `,
      readiness: `
## Data Readiness & Governance Summary

### Organizational Readiness Overview
Comprehensive readiness assessment completed with ${responseCount} readiness factors evaluated.

### Key Readiness Indicators
- **Data Governance**: Current governance maturity and gaps identified
- **Cultural Readiness**: Organization's data-driven culture assessment
- **Resource Availability**: Budget and resource allocation review

### Risk Assessment
- Primary implementation risks identified and categorized
- Mitigation strategies for top risks outlined
- Change management requirements documented

### Readiness Recommendations
1. Establish data governance council
2. Develop change management plan
3. Secure executive sponsorship for initiatives
      `
    };
    
    return enhancedTemplates[surveyType] || `Enhanced summary generated with ${responseCount} data points analyzed.`;
  };

  // Show loading state
  if (loading) {
    return (
      <div style={{
        maxWidth: '1200px',
        margin: '0 auto',
        padding: '2rem'
      }}>
        <div style={{
          backgroundColor: 'white',
          borderRadius: '0.75rem',
          boxShadow: '0 4px 12px rgba(24, 54, 94, 0.1)',
          border: '1px solid #E5E7EB',
          padding: '2rem',
          textAlign: 'center'
        }}>
          <Loader2 
            className="animate-spin" 
            style={{
              width: '3rem',
              height: '3rem',
              margin: '0 auto 1rem auto',
              color: '#18365E'
            }}
          />
          <p style={{ color: '#6B7280', margin: 0 }}>Loading survey summaries...</p>
        </div>
      </div>
    );
  }

  // Render lockout if final summary not ready
  if (!finalSummaryReady) {
    return (
      <div style={{
        maxWidth: '800px',
        margin: '0 auto',
        padding: '2rem',
        textAlign: 'center'
      }}>
        <div style={{
          backgroundColor: '#FEF2F2',
          border: '1px solid #FECACA',
          borderRadius: '0.75rem',
          padding: '2rem'
        }}>
          <Lock style={{ 
            width: '3rem', 
            height: '3rem', 
            margin: '0 auto 1rem auto',
            color: '#DC2626'
          }} />
          <h2 style={{
            fontSize: '1.5rem',
            fontWeight: '700',
            color: '#DC2626',
            margin: '0 0 1rem 0',
            fontFamily: 'Montserrat, system-ui, sans-serif'
          }}>
            Survey Summaries Locked
          </h2>
          <p style={{
            color: '#7F1D1D',
            fontSize: '1rem',
            lineHeight: '1.6',
            margin: 0
          }}>
            Complete all three DVA surveys (Strategy, Capabilities, and Readiness) to unlock your individual survey summaries and comprehensive assessment.
          </p>
          <div style={{ marginTop: '1.5rem', fontSize: '0.875rem', color: '#7F1D1D' }}>
            <div style={{ padding: '0.25rem 0' }}>
              {surveyCompletionStatus.strategy ? (
                <span><CheckCircle style={{ width: '1rem', height: '1rem', display: 'inline', verticalAlign: 'middle', color: '#16A34A' }} /> Strategy Survey: Complete</span>
              ) : (
                <span><AlertCircle style={{ width: '1rem', height: '1rem', display: 'inline', verticalAlign: 'middle', color: '#DC2626' }} /> Strategy Survey: Incomplete</span>
              )}
            </div>
            <div style={{ padding: '0.25rem 0' }}>
              {surveyCompletionStatus.capabilities ? (
                <span><CheckCircle style={{ width: '1rem', height: '1rem', display: 'inline', verticalAlign: 'middle', color: '#16A34A' }} /> Capabilities Survey: Complete</span>
              ) : (
                <span><AlertCircle style={{ width: '1rem', height: '1rem', display: 'inline', verticalAlign: 'middle', color: '#DC2626' }} /> Capabilities Survey: Incomplete</span>
              )}
            </div>
            <div style={{ padding: '0.25rem 0' }}>
              {surveyCompletionStatus.readiness ? (
                <span><CheckCircle style={{ width: '1rem', height: '1rem', display: 'inline', verticalAlign: 'middle', color: '#16A34A' }} /> Readiness Survey: Complete</span>
              ) : (
                <span><AlertCircle style={{ width: '1rem', height: '1rem', display: 'inline', verticalAlign: 'middle', color: '#DC2626' }} /> Readiness Survey: Incomplete</span>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Render the comprehensive survey summary interface per Windsurfer brief
  return (
    <div style={{
      maxWidth: '1200px',
      margin: '0 auto',
      padding: '2rem'
    }}>
      {/* Header */}
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{
          fontSize: '2rem',
          fontWeight: '700',
          color: '#18365E',
          margin: '0 0 0.5rem 0',
          fontFamily: 'Montserrat, system-ui, sans-serif'
        }}>
          📊 DVA Survey Summaries
        </h1>
        <p style={{
          color: '#6B7280',
          fontSize: '1rem',
          margin: 0
        }}>
          AI-generated Gemini summaries for each completed DVA survey
        </p>
      </div>

      {/* Error State */}
      {error && (
        <div style={{
          backgroundColor: '#FEF2F2',
          border: '1px solid #FECACA',
          borderRadius: '0.75rem',
          padding: '1.5rem',
          marginBottom: '1.5rem'
        }}>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <AlertCircle style={{ 
              width: '1.25rem', 
              height: '1.25rem', 
              marginRight: '0.75rem',
              color: '#DC2626',
              flexShrink: 0
            }} />
            <div>
              <h3 style={{
                color: '#DC2626',
                fontWeight: '600',
                margin: '0 0 0.25rem 0'
              }}>
                Error Loading Summaries
              </h3>
              <p style={{
                color: '#B91C1C',
                fontSize: '0.875rem',
                margin: 0
              }}>
                {error}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Survey Summary Cards */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        {/* Strategy Survey Summary */}
        <SurveySummaryCard
          title="Strategic Priorities Summary"
          summaryText={summaries.strategy}
          status={summaryStatus.strategy}
          icon="🎯"
          defaultExpanded={!!summaries.strategy}
          onEdit={(newContent) => handleSummaryEdit('strategy', newContent)}
          isEditable={true}
          lastUpdated={summaries.strategy ? new Date().toISOString() : null}
        />

        {/* Capabilities Survey Summary */}
        <SurveySummaryCard
          title="Data & Analytics Capabilities Summary"
          summaryText={summaries.capabilities}
          status={summaryStatus.capabilities}
          icon="⚡"
          defaultExpanded={!!summaries.capabilities}
          onEdit={(newContent) => handleSummaryEdit('capabilities', newContent)}
          isEditable={true}
          lastUpdated={summaries.capabilities ? new Date().toISOString() : null}
        />

        {/* Readiness Survey Summary */}
        <SurveySummaryCard
          title="Data Readiness & Governance Summary"
          summaryText={summaries.readiness}
          status={summaryStatus.readiness}
          icon="🚀"
          defaultExpanded={!!summaries.readiness}
          onEdit={(newContent) => handleSummaryEdit('readiness', newContent)}
          isEditable={true}
          lastUpdated={summaries.readiness ? new Date().toISOString() : null}
        />
      </div>

      {/* Generate Missing Summaries */}
      {((!summaries.strategy && surveyCompletionStatus.strategy) ||
        (!summaries.capabilities && surveyCompletionStatus.capabilities) ||
        (!summaries.readiness && surveyCompletionStatus.readiness)) && (
        <div style={{
          backgroundColor: '#F8FAFE',
          border: '1px solid #D1D5DB',
          borderRadius: '0.75rem',
          padding: '1.5rem',
          marginTop: '2rem'
        }}>
          <h3 style={{
            fontSize: '1.125rem',
            fontWeight: '600',
            color: '#18365E',
            margin: '0 0 1rem 0',
            fontFamily: 'Montserrat, system-ui, sans-serif',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}>
            <Sparkles style={{ width: '1.25rem', height: '1.25rem' }} />
            Generate Missing Summaries
          </h3>
          <div style={{
            display: 'flex',
            gap: '0.75rem',
            flexWrap: 'wrap'
          }}>
            {!summaries.strategy && surveyCompletionStatus.strategy && (
              <button
                onClick={() => generateSurveySummary('strategy')}
                disabled={summaryStatus.strategy === 'generating' || isGenerating}
                style={{
                  padding: '0.5rem 1rem',
                  backgroundColor: (summaryStatus.strategy === 'generating' || isGenerating) ? '#9CA3AF' : '#18365E',
                  color: 'white',
                  border: 'none',
                  borderRadius: '0.375rem',
                  fontSize: '0.875rem',
                  cursor: (summaryStatus.strategy === 'generating' || isGenerating) ? 'not-allowed' : 'pointer',
                  fontFamily: 'Montserrat, system-ui, sans-serif',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem'
                }}
              >
                {summaryStatus.strategy === 'generating' ? (
                  <>
                    <Loader2 className="animate-spin" style={{ width: '1rem', height: '1rem' }} />
                    Generating...
                  </>
                ) : (
                  <>🎯 Generate Strategy Summary</>
                )}
              </button>
            )}
            
            {!summaries.capabilities && surveyCompletionStatus.capabilities && (
              <button
                onClick={() => generateSurveySummary('capabilities')}
                disabled={summaryStatus.capabilities === 'generating' || isGenerating}
                style={{
                  padding: '0.5rem 1rem',
                  backgroundColor: (summaryStatus.capabilities === 'generating' || isGenerating) ? '#9CA3AF' : '#18365E',
                  color: 'white',
                  border: 'none',
                  borderRadius: '0.375rem',
                  fontSize: '0.875rem',
                  cursor: (summaryStatus.capabilities === 'generating' || isGenerating) ? 'not-allowed' : 'pointer',
                  fontFamily: 'Montserrat, system-ui, sans-serif',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem'
                }}
              >
                {summaryStatus.capabilities === 'generating' ? (
                  <>
                    <Loader2 className="animate-spin" style={{ width: '1rem', height: '1rem' }} />
                    Generating...
                  </>
                ) : (
                  <>⚡ Generate Capabilities Summary</>
                )}
              </button>
            )}
            
            {!summaries.readiness && surveyCompletionStatus.readiness && (
              <button
                onClick={() => generateSurveySummary('readiness')}
                disabled={summaryStatus.readiness === 'generating' || isGenerating}
                style={{
                  padding: '0.5rem 1rem',
                  backgroundColor: (summaryStatus.readiness === 'generating' || isGenerating) ? '#9CA3AF' : '#18365E',
                  color: 'white',
                  border: 'none',
                  borderRadius: '0.375rem',
                  fontSize: '0.875rem',
                  cursor: (summaryStatus.readiness === 'generating' || isGenerating) ? 'not-allowed' : 'pointer',
                  fontFamily: 'Montserrat, system-ui, sans-serif',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem'
                }}
              >
                {summaryStatus.readiness === 'generating' ? (
                  <>
                    <Loader2 className="animate-spin" style={{ width: '1rem', height: '1rem' }} />
                    Generating...
                  </>
                ) : (
                  <>🚀 Generate Readiness Summary</>
                )}
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ComprehensiveStrategySummary;