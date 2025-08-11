// src/components/summaries/CapabilitiesSummaryView.jsx
import React from 'react';

const CapabilitiesSummaryView = ({ summary }) => {
  if (!summary) {
    return <p style={{ color: '#6b7280' }}>No capabilities summary available.</p>;
  }

  return (
    <div style={{ fontFamily: 'system-ui, sans-serif', lineHeight: '1.6', color: '#374151' }}>
      {summary.executive_summary && (
        <section style={{ marginBottom: '2rem' }}>
          <h2 style={{ color: '#18365E', fontSize: '1.25rem', fontWeight: '600' }}>Executive Summary</h2>
          <p>{summary.executive_summary}</p>
        </section>
      )}

      {summary.maturity_themes && summary.maturity_themes.length > 0 && (
        <section style={{ marginBottom: '2rem' }}>
          <h2 style={{ color: '#18365E', fontSize: '1.25rem', fontWeight: '600' }}>Maturity Themes</h2>
          <ul>
            {summary.maturity_themes.map((theme, index) => (
              <li key={index}>{theme}</li>
            ))}
          </ul>
        </section>
      )}

      {summary.capability_risks && summary.capability_risks.length > 0 && (
        <section style={{ marginBottom: '2rem' }}>
          <h2 style={{ color: '#18365E', fontSize: '1.25rem', fontWeight: '600' }}>Capability Risks</h2>
          <ul>
            {summary.capability_risks.map((risk, index) => (
              <li key={index}>{risk}</li>
            ))}
          </ul>
        </section>
      )}

      {summary.modernization_recommendations && summary.modernization_recommendations.length > 0 && (
        <section style={{ marginBottom: '2rem' }}>
          <h2 style={{ color: '#18365E', fontSize: '1.25rem', fontWeight: '600' }}>Modernization Recommendations</h2>
          <ul>
            {summary.modernization_recommendations.map((rec, index) => (
              <li key={index}>{rec.action || rec}</li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
};

export default CapabilitiesSummaryView;