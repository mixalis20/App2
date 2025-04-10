import React, { useState } from "react";
import Navbar from "./components/Navbar";
import UploadPage from "./pages/UploadPage";

import "./App.css";

function App() {
  const [darkMode, setDarkMode] = useState(localStorage.getItem("darkMode") === "enabled");

  const toggleDarkMode = () => {
    const newMode = !darkMode;
    setDarkMode(newMode);
    localStorage.setItem("darkMode", newMode ? "enabled" : "disabled");
  };

  return (
    <div className={darkMode ? "dark-mode" : ""}>
      <Navbar toggleDarkMode={toggleDarkMode} darkMode={darkMode} />
      <UploadPage />
    </div>
  );
}

export default App;
