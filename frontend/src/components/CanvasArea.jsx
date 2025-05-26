import React, { useState, useRef, useEffect } from "react";
import "./CanvasArea.css";

const CanvasArea = ({ image, annotations, setAnnotations, canvasRef, title, description }) => {
  const [isDrawing, setIsDrawing] = useState(false);
  const [startPoint, setStartPoint] = useState({ x: 0, y: 0 });
  const ctxRef = useRef(null);

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
  };

  return (
    <div className="canvas-area">
      <canvas
        ref={canvasRef}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        style={{ border: "1px solid black", marginTop: "10px" }}
      />
    </div>
  );
};

export default CanvasArea;
