import React, { useState, useRef, useEffect } from "react";
import { FaCog } from 'react-icons/fa';


import "./CanvasArea.css";

const CanvasArea = ({ image, annotations, setAnnotations, canvasRef, title, description, }) => {
  const [isDrawing, setIsDrawing] = useState(false);
  const [startPoint, setStartPoint] = useState({ x: 0, y: 0 });
  const ctxRef = useRef(null);

  const [selectedAnnotationIndex, setSelectedAnnotationIndex] = useState(null);
  const [editTitle, setEditTitle] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [showSidebar, setShowSidebar] = useState(false);

  useEffect(() => {
    if (canvasRef.current && image) {
      ctxRef.current = canvasRef.current.getContext("2d");
      drawImageAndAnnotations();
    }
  }, [image, annotations]);

  const drawImageAndAnnotations = () => {
    if (!image || !canvasRef.current || !ctxRef.current) return;

    const canvas = canvasRef.current;
    const ctx = ctxRef.current;
    canvas.width = image.width;
    canvas.height = image.height;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(image, 0, 0);

    annotations.forEach((ann) => {
      ctx.strokeStyle = "blue";
      ctx.lineWidth = 2;
      ctx.strokeRect(ann.x, ann.y, ann.width, ann.height);
      ctx.font = "12px Arial";
      ctx.fillStyle = "blue";
      ctx.fillText(ann.title, ann.x, ann.y - 5);
    });
  };

  const handleMouseDown = (e) => {
    if (!image) return;
    const rect = canvasRef.current.getBoundingClientRect();
    setStartPoint({ x: e.clientX - rect.left, y: e.clientY - rect.top });
    setIsDrawing(true);
  };

  const handleMouseMove = (e) => {
    if (!isDrawing || !image) return;

    const rect = canvasRef.current.getBoundingClientRect();
    const endX = e.clientX - rect.left;
    const endY = e.clientY - rect.top;

    drawImageAndAnnotations();

    const ctx = ctxRef.current;
    ctx.strokeStyle = "red";
    ctx.lineWidth = 2;
    ctx.strokeRect(startPoint.x, startPoint.y, endX - startPoint.x, endY - startPoint.y);
  };

  const handleMouseUp = (e) => {
    if (!image) return;
    setIsDrawing(false);

    const rect = canvasRef.current.getBoundingClientRect();
    const endX = e.clientX - rect.left;
    const endY = e.clientY - rect.top;

    const newAnnotation = {
      x: Math.min(startPoint.x, endX),
      y: Math.min(startPoint.y, endY),
      width: Math.abs(endX - startPoint.x),
      height: Math.abs(endY - startPoint.y),
      title: title || "Annotation",
      description: description || "",
    };

    setAnnotations((prev) => [...prev, newAnnotation]);
    setEditTitle('');
    setEditDescription('');

  };

  const handleCanvasClick = (e) => {
    if (!canvasRef.current || !image) return;

    const rect = canvasRef.current.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const clickY = e.clientY - rect.top;

    annotations.forEach((ann, index) => {
      if (
        clickX >= ann.x &&
        clickX <= ann.x + ann.width &&
        clickY >= ann.y &&
        clickY <= ann.y + ann.height
      ) {
        setSelectedAnnotationIndex(index);
        setEditTitle(ann.title);
        setEditDescription(ann.description);
      }
    });
  };

  return (
    <div className="canvas-area">
      <button
  className="settings-button"
  onClick={() => setShowSidebar((prev) => !prev)}
>
  <FaCog size={24} />
</button>


      <canvas
        ref={canvasRef}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onClick={handleCanvasClick}
        style={{ border: "1px solid black", marginTop: "10px" }}
      />

      

      {/* Sidebar editing (via ⚙️) */}
      {showSidebar && (
        <div className="annotation-editor-sidebar">
          <h4>Annotation Sidebar</h4>
          <label>Επιλογή:</label>
          <select
            value={selectedAnnotationIndex ?? ""}
            onChange={(e) => {
              const index = parseInt(e.target.value);
              setSelectedAnnotationIndex(index);
              setEditTitle(annotations[index]?.title || "");
              setEditDescription(annotations[index]?.description || "");
            }}
          >
            <option value="" disabled>-- Επιλογή --</option>
            {annotations.map((ann, i) => (
              <option key={i} value={i}>{ann.title || `Annotation ${i + 1}`}</option>
            ))}
          </select>

          {selectedAnnotationIndex !== null && (
            <>
              <label>Τίτλος:
                <input value={editTitle} onChange={(e) => setEditTitle(e.target.value)} />
              </label>
              <label>Περιγραφή:
                <textarea value={editDescription} onChange={(e) => setEditDescription(e.target.value)} />
              </label>
              <button
                onClick={() => {
                  const updated = [...annotations];
                  updated[selectedAnnotationIndex].title = editTitle;
                  updated[selectedAnnotationIndex].description = editDescription;
                  setAnnotations(updated);
                }}
              >
                Αποθήκευση
              </button>
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default CanvasArea;
