// HeaderNavigation.js
import React from 'react';
import './HeaderNavigation.css';

const HeaderNavigation = () => {
  return (
    <header className="header-navigation">
      <div className="logo">
        <img src="logo.png" alt="Logo" />
      </div>
      <nav className="nav-links">
        <ul>
          <li><a href="#home">Home</a></li>
          <li><a href="#about">About</a></li>
          <li><a href="#services">Services</a></li>
          <li><a href="#contact">Contact</a></li>
        </ul>
      </nav>
    </header>
  );
};

export default HeaderNavigation;
