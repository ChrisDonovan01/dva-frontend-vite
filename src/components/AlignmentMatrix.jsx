import React from 'react';

const AlignmentMatrix = ({ filters }) => (
  <div className="bg-white p-4 rounded shadow">
    <h2 className="text-lg font-semibold mb-4">Alignment Matrix</h2>
    <table className="w-full text-sm">
      <thead>
        <tr className="text-left text-gray-500">
          <th>Initiative</th>
          <th>Cost</th>
          <th>Quality</th>
          <th>Access</th>
        </tr>
      </thead>
      <tbody>
        {["ED Optimization", "Pop Health Analytics", "Virtual Care"].map((initiative, idx) => (
          <tr key={idx} className="border-t">
            <td className="py-2 font-medium">{initiative}</td>
            {["🟢", "🟡", "🔴"].map((score, i) => (
              <td key={i} className="py-2">{score}</td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);

export default AlignmentMatrix;
