import React, { useState } from "react";

function ResizeModal({ closeModal, applyResize }) {
  const [newWidth, setNewWidth] = useState("");
  const [newHeight, setNewHeight] = useState("");

  const handleApply = () => {
    if (!newWidth || !newHeight || newWidth <= 0 || newHeight <= 0) {
      alert("Please enter valid dimensions!");
      return;
    }
    applyResize(parseInt(newWidth), parseInt(newHeight));
    closeModal(); // ✅ Κλείσιμο του modal μετά την αλλαγή
  };

  return (
    <div className="modal">
      <div className="modal-content">
        <span className="close" onClick={closeModal}>&times;</span>
        <h2>Resize Image</h2>
        <label>New Width:</label>
        <input type="number" value={newWidth} onChange={(e) => setNewWidth(e.target.value)} />
        <label>New Height:</label>
        <input type="number" value={newHeight} onChange={(e) => setNewHeight(e.target.value)} />
        <button onClick={handleApply}>Apply</button>
      </div>
    </div>
  );
}

export default ResizeModal;
