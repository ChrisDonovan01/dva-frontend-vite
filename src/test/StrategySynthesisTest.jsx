import React from 'react';
import StrategySynthesisPanel from '../components/StrategySynthesisPanel';

// Test component to verify Strategy Synthesis Panel functionality
const StrategySynthesisTest = () => {
  const mockInputStatus = {
    strategy: { completed: true },
    capabilities: { completed: true },
    interoperability: { completed: true }
  };

  const handleDownload = () => {
    console.log('Download test successful');
  };

  const handleUpgrade = () => {
    console.log('Upgrade test successful');
  };

  return (
    <div style={{ padding: '20px' }}>
      <h1>Strategy Synthesis Panel Test</h1>
      <StrategySynthesisPanel
        inputStatus={mockInputStatus}
        onDownload={handleDownload}
        onUpgrade={handleUpgrade}
        isGenerating={false}
        strategyContent={{ generated: true, timestamp: new Date().toISOString() }}
      />
    </div>
  );
};

export default StrategySynthesisTest;
