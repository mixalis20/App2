import React from "react";

function Navbar({ toggleDarkMode, darkMode }) {
  return (
    <nav className="navbar">
      <ul>
        <li><a href="/">Image</a></li>
        <li><a href="/gallery">Gallery</a></li>
      </ul>
     
    </nav>
    
  );
}

export default Navbar;
