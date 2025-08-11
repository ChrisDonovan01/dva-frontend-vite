// src/components/summaries/StrategySummaryView.jsx
import React from 'react';

const StrategySummaryView = ({ summary }) => {
  if (!summary) {
    return <p style={{ color: '#6b7280' }}>No strategy summary available.</p>;
  }

  return (
    <div style={{ fontFamily: 'system-ui, sans-serif', lineHeight: '1.6', color: '#374151' }}>
      {summary.executive_summary && (
        <section style={{ marginBottom: '2rem' }}>
          <h2 style={{ color: '#18365E', fontSize: '1.25rem', fontWeight: '600' }}>Executive Summary</h2>
          <p>{summary.executive_summary}</p>
        </section>
      )}

      {summary.strategic_themes && summary.strategic_themes.length > 0 && (
        <section style={{ marginBottom: '2rem' }}>
          <h2 style={{ color: '#18365E', fontSize: '1.25rem', fontWeight: '600' }}>Strategic Themes</h2>
          <ul>
            {summary.strategic_themes.map((theme, index) => (
              <li key={index}>{theme}</li>
            ))}
          </ul>
        </section>
      )}

      {summary.data_monetization_readiness && (
        <section style={{ marginBottom: '2rem' }}>
          <h2 style={{ color: '#18365E', fontSize: '1.25rem', fontWeight: '600' }}>Data Monetization Readiness</h2>
          <p>{summary.data_monetization_readiness}</p>
        </section>
      )}

      {summary.recommended_next_steps && summary.recommended_next_steps.length > 0 && (
        <section style={{ marginBottom: '2rem' }}>
          <h2 style={{ color: '#18365E', fontSize: '1.25rem', fontWeight: '600' }}>Recommended Next Steps</h2>
          <ul>
            {summary.recommended_next_steps.map((step, index) => (
              <li key={index}>{step.action || step}</li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
};

export default StrategySummaryView;
