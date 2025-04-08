import React, { useRef, useEffect, useState } from "react";
import ResizeModal from "./ResizeModal";

function CanvasEditor({ image }) {
  const canvasRef = useRef(null);
  const [showResizeModal, setShowResizeModal] = useState(false);
  const [annotations, setAnnotations] = useState([]);
  const [isDrawing, setIsDrawing] = useState(false);
  const [startX, setStartX] = useState(0);
  const [startY, setStartY] = useState(0);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");

  useEffect(() => {
    if (!image) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    const img = new Image();
    img.src = image;
    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;
      ctx.drawImage(img, 0, 0);
      drawAnnotations();
    };
  }, [image]);

  const applyResize = (width, height) => {
    if (!width || !height) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    const img = new Image();
    img.src = canvas.toDataURL();
    img.onload = () => {
      canvas.width = width;
      canvas.height = height;
      ctx.drawImage(img, 0, 0, width, height);
      drawAnnotations();
    };
    setShowResizeModal(false);
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
    drawAnnotations();
  };

  const drawAnnotations = () => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(new Image(), 0, 0);

    annotations.forEach((annotation) => {
      ctx.strokeStyle = "red";
      ctx.lineWidth = 2;
      ctx.strokeRect(annotation.x, annotation.y, annotation.width, annotation.height);
      ctx.font = "12px Arial";
      ctx.fillText(annotation.title, annotation.x, annotation.y - 5);
    });
  };

  return (
    <div className="canvas-container">
      <canvas
        ref={canvasRef}
        onMouseDown={handleMouseDown}
        onMouseUp={handleMouseUp}
      ></canvas>
      <div className="controls">
        <button onClick={() => setShowResizeModal(true)}>Resize Image</button>
        <button onClick={() => drawAnnotations()}>Redraw Annotations</button>
      </div>
      {showResizeModal && <ResizeModal closeModal={() => setShowResizeModal(false)} applyResize={applyResize} />}
      <div>
        <label>Title:</label>
        <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} />
        <label>Description:</label>
        <input type="text" value={description} onChange={(e) => setDescription(e.target.value)} />
      </div>
     
    </div>
  );
}

export default CanvasEditor;