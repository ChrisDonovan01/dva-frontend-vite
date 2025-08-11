// src/components/LogoutPage.js
import React from 'react';

function LogoutPage() {
  return (
    <div className="p-6">
      <h2 className="text-3xl font-bold text-blue-300 mb-4">Logout</h2>
      <p className="text-gray-400">You have been logged out. Thank you for using DVA.</p>
      {/* In a real app, this would trigger actual logout logic */}
    </div>
  );
}

export default LogoutPage;