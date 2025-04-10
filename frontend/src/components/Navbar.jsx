// src/components/Navbar.jsx
import React, { useEffect } from 'react';


const Navbar = () => {
  useEffect(() => {
    const darkMode = localStorage.getItem('darkMode');
    if (darkMode === 'enabled') enableDarkMode();
  }, []);

  const toggleDarkMode = () => {
    if (document.body.classList.contains('dark-mode')) {
      disableDarkMode();
    } else {
      enableDarkMode();
    }
  };

  const enableDarkMode = () => {
    document.body.classList.add('dark-mode');
    localStorage.setItem('darkMode', 'enabled');
  };

  const disableDarkMode = () => {
    document.body.classList.remove('dark-mode');
    localStorage.setItem('darkMode', 'disabled');
  };

  return (
    <div className="navbar">
      <ul>
        <li><a href="index.html">Image</a></li>
        <li><a href="gallery.html">Gallery</a></li>
      </ul>
      
    </div>
  );
};

export default Navbar;
