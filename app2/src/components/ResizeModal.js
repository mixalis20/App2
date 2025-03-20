import React, { useState } from "react";

function ResizeModal({ closeModal, applyResize }) {
  const [newWidth, setNewWidth] = useState("");
  const [newHeight, setNewHeight] = useState("");

  return (
    <div className="modal">
      <div className="modal-content">
        <span className="close" onClick={closeModal}>&times;</span>
        <h2>Resize Image</h2>
        <label>New Width:</label>
        <input type="number" value={newWidth} onChange={(e) => setNewWidth(e.target.value)} />
        <label>New Height:</label>
        <input type="number" value={newHeight} onChange={(e) => setNewHeight(e.target.value)} />
        <button onClick={() => applyResize(newWidth, newHeight)}>Apply</button>
      </div>
    </div>
  );
}

export default ResizeModal;
