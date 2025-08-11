import React from 'react';

const FiltersToolbar = ({ filters, onChange }) => (
  <div className="bg-white p-4 rounded shadow flex items-center gap-4">
    <div>
      <label className="text-sm block text-gray-600">Goal</label>
      <select
        className="border rounded px-2 py-1"
        value={filters.goal}
        onChange={e => onChange({ ...filters, goal: e.target.value })}
      >
        <option>All</option>
        <option>Cost</option>
        <option>Quality</option>
        <option>Access</option>
      </select>
    </div>
    <div>
      <label className="text-sm block text-gray-600">Department</label>
      <select
        className="border rounded px-2 py-1"
        value={filters.department}
        onChange={e => onChange({ ...filters, department: e.target.value })}
      >
        <option>All</option>
        <option>Informatics</option>
        <option>Operations</option>
        <option>Finance</option>
      </select>
    </div>
  </div>
);

export default FiltersToolbar;
