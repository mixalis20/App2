// UploadForm.js
import React, { useState, useRef } from "react";

function UploadForm({ onImageUpload }) {
  const [annotations, setAnnotations] = useState([]);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const canvasRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [startX, setStartX] = useState(0);
  const [startY, setStartY] = useState(0);

  const handleUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => onImageUpload(e.target.result);
      reader.readAsDataURL(file);
    }
  };

  const handleMouseDown = (e) => {
    setIsDrawing(true);
    const rect = canvasRef.current.getBoundingClientRect();
    setStartX(e.clientX - rect.left);
    setStartY(e.clientY - rect.top);
  };

  const handleMouseUp = (e) => {
    if (!isDrawing) return;
    setIsDrawing(false);

    const rect = canvasRef.current.getBoundingClientRect();
    const endX = e.clientX - rect.left;
    const endY = e.clientY - rect.top;

    const newAnnotation = {
      x: Math.min(startX, endX),
      y: Math.min(startY, endY),
      width: Math.abs(endX - startX),
      height: Math.abs(endY - startY),
      title,
      description,
    };

    setAnnotations([...annotations, newAnnotation]);
    setTitle("");
    setDescription("");
    drawAnnotations([...annotations, newAnnotation]);
  };

  const drawAnnotations = (annotationsToDraw) => {
    const ctx = canvasRef.current.getContext("2d");
    ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);

    annotationsToDraw.forEach((annotation) => {
      ctx.strokeStyle = "blue";
      ctx.lineWidth = 2;
      ctx.strokeRect(annotation.x, annotation.y, annotation.width, annotation.height);
      ctx.font = "12px Arial";
      ctx.fillText(annotation.title, annotation.x, annotation.y - 5);
    });
  };

  return (
    <div className="upload-container">
      <label>Upload Image:</label>
      <input type="file" accept="image/*" onChange={handleUpload} />

      <label>Title:</label>
      <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Enter annotation title..." />

      <label>Description:</label>
      <input type="text" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Enter annotation description..." />

      <canvas
        ref={canvasRef}
        width={500}
        height={400}
        onMouseDown={handleMouseDown}
        onMouseUp={handleMouseUp}
        className="annotation-canvas"
      ></canvas>

      <div>
        <h3>Annotations:</h3>
        <ul>
          {annotations.map((ann, index) => (
            <li key={index}>{ann.title}: {ann.description}</li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export default UploadForm;
