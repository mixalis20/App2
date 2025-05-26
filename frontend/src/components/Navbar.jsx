import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import './Navbar.css';

// --- HamburgerMenu Component ---
const HamburgerMenu = () => {
  const [active, setActive] = useState(false);
  const toggleMenu = () => setActive(!active);

  return (
    <>
      <div
        className={`ham-menu ${active ? 'active' : ''}`}
        onClick={toggleMenu}
        style={{ cursor: 'pointer' }}
        aria-label="Toggle menu"
      >
        <span></span>
        <span></span>
        <span></span>
      </div>

      <nav className={`off-screen-menu ${active ? 'active' : ''}`}>
        <ul>
          <li><Link to="/" onClick={() => setActive(false)}>Upload</Link></li>
          <li><Link to="/gallery" onClick={() => setActive(false)}>Gallery</Link></li>
        </ul>
      </nav>
    </>
  );
};

// --- Navbar ---
const Navbar = () => {
  return (
    <div className="navbar">
      <HamburgerMenu />
      <ul>
        <li><Link to="/">Upload</Link></li>
        <li><Link to="/gallery">Gallery</Link></li>
      </ul>
    </div>
  );
};

export default Navbar;
