// src/components/summaries/ReadinessSummaryView.jsx
import React from 'react';

const ReadinessSummaryView = ({ summary }) => {
  if (!summary) {
    return <p style={{ color: '#6b7280' }}>No readiness summary available.</p>;
  }

  return (
    <div style={{ fontFamily: 'system-ui, sans-serif', lineHeight: '1.6', color: '#374151' }}>
      {summary.executive_summary && (
        <section style={{ marginBottom: '2rem' }}>
          <h2 style={{ color: '#18365E', fontSize: '1.25rem', fontWeight: '600' }}>Executive Summary</h2>
          <p>{summary.executive_summary}</p>
        </section>
      )}

      {summary.readiness_gaps && summary.readiness_gaps.length > 0 && (
        <section style={{ marginBottom: '2rem' }}>
          <h2 style={{ color: '#18365E', fontSize: '1.25rem', fontWeight: '600' }}>Readiness Gaps</h2>
          <ul>
            {summary.readiness_gaps.map((gap, index) => (
              <li key={index}>{gap}</li>
            ))}
          </ul>
        </section>
      )}

      {summary.governance_recommendations && summary.governance_recommendations.length > 0 && (
        <section style={{ marginBottom: '2rem' }}>
          <h2 style={{ color: '#18365E', fontSize: '1.25rem', fontWeight: '600' }}>Governance Recommendations</h2>
          <ul>
            {summary.governance_recommendations.map((rec, index) => (
              <li key={index}>{rec.action || rec}</li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
};

export default ReadinessSummaryView;
