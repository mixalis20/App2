// src/components/ResizeModal.jsx
import React, { useState } from 'react';

const ResizeModal = ({ show, onClose, image, canvasRef, annotations, setAnnotations, showMessage }) => {
  const [newWidth, setNewWidth] = useState('');
  const [newHeight, setNewHeight] = useState('');

  const applyResize = () => {
    const width = parseInt(newWidth);
    const height = parseInt(newHeight);

    if (!width || !height || !image) {
      showMessage('Παρακαλώ εισάγετε σωστό πλάτος και ύψος.', 'error');
      return;
    }

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');

    // Κλίμακα για annotation resizing
    const scaleX = width / image.width;
    const scaleY = height / image.height;

    // Αλλαγή διαστάσεων εικόνας
    canvas.width = width;
    canvas.height = height;
    ctx.drawImage(image, 0, 0, width, height);

    // Αναπροσαρμογή annotations
    const scaledAnnotations = annotations.map((ann) => ({
      ...ann,
      x: ann.x * scaleX,
      y: ann.y * scaleY,
      width: ann.width * scaleX,
      height: ann.height * scaleY,
    }));

    setAnnotations(scaledAnnotations);

    scaledAnnotations.forEach((ann) => {
      ctx.strokeStyle = 'blue';
      ctx.lineWidth = 2;
      ctx.strokeRect(ann.x, ann.y, ann.width, ann.height);
      ctx.font = '12px Arial';
      ctx.fillText(ann.title, ann.x, ann.y - 5);
    });

    // Ενημέρωση διαστάσεων εικόνας
    image.width = width;
    image.height = height;

    onClose();
  };

  if (!show) return null;

  return (
    <div className="modal">
      <div className="modal-content">
        <span className="close" onClick={onClose}>&times;</span>
        <h2>Resize Image</h2>
        <label>Width:</label>
        <input
          type="number"
          value={newWidth}
          onChange={(e) => setNewWidth(e.target.value)}
          placeholder="New width"
        />
        <label>Height:</label>
        <input
          type="number"
          value={newHeight}
          onChange={(e) => setNewHeight(e.target.value)}
          placeholder="New height"
        />
        <button className="button" onClick={applyResize}>Apply Resize</button>
      </div>
    </div>
  );
};

export default ResizeModal;
