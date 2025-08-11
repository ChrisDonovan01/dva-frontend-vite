import React from 'react';

const AlignmentScoreCard = () => (
  <div className="bg-white p-4 rounded shadow">
    <h2 className="text-lg font-semibold mb-2">Strategic Alignment Score</h2>
    <div className="flex items-center gap-4">
      <div className="text-4xl font-bold text-green-600">78%</div>
      <div>
        <p className="text-sm text-gray-600">↑ 6% from last quarter</p>
        <p className="text-sm text-gray-600">Benchmark: 71%</p>
      </div>
    </div>
  </div>
);

export default AlignmentScoreCard;
