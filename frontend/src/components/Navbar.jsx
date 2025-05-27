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
    <li><Link to="/settings" onClick={() => setActive(false)}>⚙️ Ρυθμίσεις</Link></li>
    <li><Link to="/help" onClick={() => setActive(false)}>❓ Οδηγίες Χρήσης</Link></li>
    <li><Link to="/contact" onClick={() => setActive(false)}>📬 Επικοινωνία</Link></li>
    <li><Link to="/about" onClick={() => setActive(false)}>ℹ️ Σχετικά με Εμάς</Link></li>
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
