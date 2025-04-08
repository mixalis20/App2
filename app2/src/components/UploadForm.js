import React, { useRef, useEffect, useState } from "react";
import ResizeModal from "./ResizeModal";

function UploadForm() {
  const [image, setImage] = useState(null);
  const canvasRef = useRef(null);
  const [showResizeModal, setShowResizeModal] = useState(false);
  const [annotations, setAnnotations] = useState([]);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [isDrawing, setIsDrawing] = useState(false);
  const [startX, setStartX] = useState(0);
  const [startY, setStartY] = useState(0);

  const handleUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => setImage(e.target.result);
      reader.readAsDataURL(file);
    }
  };

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
    const ctx = canvasRef.current.getContext("2d");
    ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
    const img = new Image();
    img.src = image;
    img.onload = () => {
      ctx.drawImage(img, 0, 0);
      annotations.forEach((ann) => {
        ctx.strokeStyle = "blue";
        ctx.lineWidth = 2;
        ctx.strokeRect(ann.x, ann.y, ann.width, ann.height);
        ctx.font = "12px Arial";
        ctx.fillText(ann.title, ann.x, ann.y - 5);
      });
    };
  };

  return (
    <div className="upload-container">
      <label>Upload Image:</label>
      <input type="file" accept="image/*" onChange={handleUpload} />
      <canvas ref={canvasRef} onMouseDown={handleMouseDown} onMouseUp={handleMouseUp}></canvas>
      <div className="controls">
        <button onClick={() => setShowResizeModal(true)}>Resize Image</button>
      </div>
      {showResizeModal && <ResizeModal closeModal={() => setShowResizeModal(false)} applyResize={applyResize} />}
      <h3>Annotations:</h3>
      <ul>
        {annotations.map((ann, index) => (
          <li key={index}>{ann.title}: {ann.description}</li>
        ))}
      </ul>
    </div>
  );
}

export default UploadForm;
