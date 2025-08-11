import React from 'react';
import './AnalyticsSummaryWidget.css';

const AnalyticsSummaryWidget = ({ title, data }) => {
  return (
    <div className="analytics-summary-widget">
      <h2 className="widget-title">{title}</h2>
      <div className="widget-content">
        {data.map((item, index) => (
          <div key={index} className="data-item">
            <span className="data-label">{item.label}</span>
            <span className="data-value">{item.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AnalyticsSummaryWidget;
