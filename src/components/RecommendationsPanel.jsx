import React from 'react';

const RecommendationsPanel = () => (
  <div className="bg-white p-4 rounded shadow">
    <h2 className="text-lg font-semibold mb-2">Top Recommendations</h2>
    <ul className="space-y-3">
      {[
        { name: "Refocus Virtual Care", reason: "Low ROI + Misaligned" },
        { name: "Retire ED Dashboard", reason: "Duplicative effort" },
        { name: "Expand Pop Health", reason: "Strong alignment potential" }
      ].map((rec, idx) => (
        <li key={idx} className="border p-2 rounded bg-gray-50">
          <p className="font-medium">{rec.name}</p>
          <p className="text-xs text-gray-600">{rec.reason}</p>
        </li>
      ))}
    </ul>
  </div>
);

export default RecommendationsPanel;
