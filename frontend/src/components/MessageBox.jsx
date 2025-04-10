// src/components/MessageBox.jsx
import React from 'react';
import './MessageBox.css'; // Αν θες styling (προαιρετικό)

const MessageBox = ({ text, type }) => {
  return (
    <div className={`message-box ${type}`}>
      {text}
    </div>
  );
};

export default MessageBox;
