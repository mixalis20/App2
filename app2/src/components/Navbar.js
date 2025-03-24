import React from "react";

function Navbar({ toggleDarkMode, darkMode }) {
  return (
    <nav className="navbar">
      <ul>
        <li><a href="/">Image</a></li>
        <li><a href="/Gallery">Gallery</a></li>
      </ul>
     
    </nav>
    
  );
}

export default Navbar;
