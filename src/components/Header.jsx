// src/components/Header.jsx
import React from 'react';
import { Settings, Logout } from '@mui/icons-material';
import Logo from '../assets/adaptive-product-logo.png';

export default function Header() {
  return (
    <header style={{
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: '12px 24px',
      borderBottom: '1px solid #d1d5db',
      backgroundColor: '#ffffff',
      position: 'sticky',
      top: 0,
      zIndex: 10,
      width: '100%'
    }}>
      <div style={{ display: 'flex', alignItems: 'center' }}>
        {/* Logo reduced by 25% from h-[87px] to h-[65px] */}
        <img 
          src={Logo} 
          alt="Adaptive Product" 
          style={{ height: '65px', marginRight: '12px' }} 
        />
        <h1 style={{
          fontSize: '1.875rem', // ~30px for clear hierarchy
          fontWeight: '700', // Bold for prominence
          marginLeft: '12px',
          transform: 'translateY(1px)',
          color: '#18365E', // dva-blue color
          margin: 0,
          fontFamily: 'Montserrat, system-ui, sans-serif'
        }}>
          Data Value Accelerator
        </h1>
      </div>
      {/* Settings and Logout icons moved to the header and size increased */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        {/* Icons increased by 25% using larger font size */}
        <button 
          title="Settings" 
          style={{
            backgroundColor: 'transparent',
            border: 'none',
            color: '#6b7280',
            cursor: 'pointer',
            fontSize: '24px'
          }}
          onMouseEnter={(e) => e.target.style.color = '#374151'}
          onMouseLeave={(e) => e.target.style.color = '#6b7280'}
        >
          <Settings style={{ fontSize: '24px' }} />
        </button>
        <button 
          title="Logout" 
          style={{
            backgroundColor: 'transparent',
            border: 'none',
            color: '#6b7280',
            cursor: 'pointer',
            fontSize: '24px'
          }}
          onMouseEnter={(e) => e.target.style.color = '#374151'}
          onMouseLeave={(e) => e.target.style.color = '#6b7280'}
        >
          <Logout style={{ fontSize: '24px' }} />
        </button>
        {/* Updated welcome message */}
        <span style={{ fontSize: '14px', color: '#6b7280', marginLeft: '16px' }}>
          Welcome back Chris!
        </span>
      </div>
    </header>
  );
}
