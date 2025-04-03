import React, { useRef, useEffect, useState } from "react";
import ResizeModal from "./ResizeModal";


function CanvasEditor() {
  const canvasRef = useRef(null);
  const ctxRef = useRef(null);
  const [image, setImage] = useState(null);
  const [showResizeModal, setShowResizeModal] = useState(false);
  const [annotations, setAnnotations] = useState([]);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [isDrawing, setIsDrawing] = useState(false);
  const [startX, setStartX] = useState(0);
  const [startY, setStartY] = useState(0);

  // Φόρτωση εικόνας στο canvas
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
      ctxRef.current = ctx;
    };
  }, [image]);

  // ✅ Λειτουργία αλλαγής μεγέθους εικόνας
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
      drawAnnotations(); // Επανασχεδίαση annotations μετά την αλλαγή μεγέθους
    };

    setShowResizeModal(false);
  };

  // ✅ Λειτουργία αποθήκευσης εικόνας
  const saveImage = () => {
    const link = document.createElement("a");
    link.href = canvasRef.current.toDataURL("image/png");
    link.download = "annotated_image.png";
    link.click();
  };

  // ✅ Ανέβασμα εικόνας από τον χρήστη
  const handleUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => setImage(e.target.result);
      reader.readAsDataURL(file);
    }
  };

  // ✅ Ξεκίνημα σχεδίασης annotation
  const handleMouseDown = (e) => {
    setIsDrawing(true);
    const rect = canvasRef.current.getBoundingClientRect();
    setStartX(e.clientX - rect.left);
    setStartY(e.clientY - rect.top);
  };

  // ✅ Ολοκλήρωση σχεδίασης annotation
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

    setAnnotations((prev) => [...prev, newAnnotation]);
    setTitle("");
    setDescription("");
    drawAnnotations([...annotations, newAnnotation]);
  };

  // ✅ Σχεδίαση annotations
  const drawAnnotations = (allAnnotations = annotations) => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Ξανασχεδιάζουμε την εικόνα μετά το καθάρισμα
    if (image) {
      const img = new Image();
      img.src = image;
      img.onload = () => ctx.drawImage(img, 0, 0);
    }

    allAnnotations.forEach((annotation) => {
      ctx.strokeStyle = "blue";
      ctx.lineWidth = 2;
      ctx.strokeRect(annotation.x, annotation.y, annotation.width, annotation.height);
      ctx.fillStyle = "blue";
      ctx.font = "12px Arial";
      ctx.fillText(annotation.title, annotation.x + 5, annotation.y - 5);
    });
  };

  return (
    <div className="canvas-container">
      

      <canvas
        ref={canvasRef}
        width={500}
        height={400}
        onMouseDown={handleMouseDown}
        onMouseUp={handleMouseUp}
        className="annotation-canvas"
      ></canvas>

      <div className="controls">
        <button onClick={() => setShowResizeModal(true)}>Resize Image</button>
        <button onClick={saveImage}>Save Image</button>
      </div>

      

      {showResizeModal && <ResizeModal closeModal={() => setShowResizeModal(false)} applyResize={applyResize} />}
    </div>
  );
}

export default CanvasEditor;
