import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import {
  Home,
  Insights,
  Search,
  MenuBook,
  ChatBubble,
  CheckBoxOutlined,
  Menu
} from '@mui/icons-material';

export default function Sidebar() {
  const [expanded, setExpanded] = useState(false);

  const menuItems = [
    { name: 'Home', icon: <Home />, link: '/' },
    { name: 'Strategic Alignment', icon: <Insights />, link: '/strategic-alignment' },
    { name: 'Matrix', icon: <Search />, link: '/matrix' },
    { name: 'Data Product Playbook', icon: <MenuBook />, link: '/playbook' },
    { name: 'Chat', icon: <ChatBubble />, link: '/chat' },
    { name: 'Configurator', icon: <CheckBoxOutlined />, link: '/client-data-input/101' }
  ];

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#1f2937', // gray-900
      color: 'white',
      display: 'flex',
      flexDirection: 'column',
      width: expanded ? '224px' : '64px', // w-56 : w-16
      transition: 'width 0.3s'
    }}>
      <button
        style={{
          padding: '16px 0',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          borderBottom: '1px solid #374151', // border-gray-700
          backgroundColor: 'transparent',
          color: 'white',
          cursor: 'pointer'
        }}
        onClick={() => setExpanded(!expanded)}
        title={expanded ? 'Collapse Menu' : 'Expand Menu'}
        onMouseEnter={(e) => e.target.style.backgroundColor = '#374151'}
        onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
      >
        <Menu />
      </button>

      <nav style={{
        flex: 1,
        marginTop: '16px',
        display: 'flex',
        flexDirection: 'column',
        gap: '8px'
      }}>
        {menuItems.map(({ name, icon, link }) => (
          <NavLink
            key={name}
            to={link}
            style={({ isActive }) => ({
              display: 'flex',
              alignItems: 'center',
              padding: '8px 16px',
              borderRadius: '6px',
              transition: 'all 0.2s',
              textDecoration: 'none',
              color: isActive ? '#FF6E4C' : 'white',
              backgroundColor: isActive ? 'rgba(255, 110, 76, 0.1)' : 'transparent',
              fontWeight: isActive ? '500' : 'normal'
            })}
            title={expanded ? '' : name}
            onMouseEnter={(e) => {
              if (!e.target.closest('a').classList.contains('active')) {
                e.target.closest('a').style.backgroundColor = '#374151';
              }
            }}
            onMouseLeave={(e) => {
              if (!e.target.closest('a').classList.contains('active')) {
                e.target.closest('a').style.backgroundColor = 'transparent';
              }
            }}
          >
            <span style={{ fontSize: '20px' }}>{icon}</span>
            {expanded && <span style={{ marginLeft: '12px', whiteSpace: 'nowrap' }}>{name}</span>}
          </NavLink>
        ))}
      </nav>
    </div>
  );
}
