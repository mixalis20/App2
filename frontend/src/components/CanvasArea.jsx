import React, { useEffect, useRef, useState } from 'react';


const CanvasArea = ({ image, annotations, setAnnotations, canvasRef }) => {
  const [isDrawing, setIsDrawing] = useState(false);
  const [startPoint, setStartPoint] = useState({ x: 0, y: 0 });
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');

  const ctxRef = useRef(null);

  useEffect(() => {
    if (canvasRef.current) {
      ctxRef.current = canvasRef.current.getContext('2d');
      if (image) {
        drawImageAndAnnotations();
      }
    }
  }, [image, annotations]);

  const drawImageAndAnnotations = () => {
    const canvas = canvasRef.current;
    const ctx = ctxRef.current;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    canvas.width = image.width;
    canvas.height = image.height;
    ctx.drawImage(image, 0, 0);

    annotations.forEach((ann) => {
      ctx.strokeStyle = 'blue';
      ctx.lineWidth = 2;
      ctx.strokeRect(ann.x, ann.y, ann.width, ann.height);
      ctx.font = '12px Arial';
      ctx.fillText(ann.title, ann.x, ann.y - 5);
    });
  };

  const handleMouseDown = (e) => {
    const rect = canvasRef.current.getBoundingClientRect();
    setStartPoint({ x: e.clientX - rect.left, y: e.clientY - rect.top });
    setIsDrawing(true);
  };

  const handleMouseMove = (e) => {
    if (!isDrawing) return;

    const rect = canvasRef.current.getBoundingClientRect();
    const endX = e.clientX - rect.left;
    const endY = e.clientY - rect.top;

    drawImageAndAnnotations();

    const ctx = ctxRef.current;
    ctx.strokeStyle = 'red';
    ctx.lineWidth = 2;
    ctx.strokeRect(
      startPoint.x,
      startPoint.y,
      endX - startPoint.x,
      endY - startPoint.y
    );
  };

  const handleMouseUp = (e) => {
    setIsDrawing(false);

    const rect = canvasRef.current.getBoundingClientRect();
    const endX = e.clientX - rect.left;
    const endY = e.clientY - rect.top;

    const newAnnotation = {
      x: Math.min(startPoint.x, endX),
      y: Math.min(startPoint.y, endY),
      width: Math.abs(endX - startPoint.x),
      height: Math.abs(endY - startPoint.y),
      title: title || 'Annotation',
      description: description || '',
    };

    setAnnotations((prev) => [...prev, newAnnotation]);
    setTitle('');
    setDescription('');
  };

  return (
    <div className="canvas-area">
      <div className="input-container">
        <div>
          <label>Annotation Title:</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Enter title..."
          />
        </div>
        <div>
          <label>Description:</label>
          <input
            type="text"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Enter description..."
          />
        </div>
      </div>
      <canvas
        ref={canvasRef}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        style={{ border: '1px solid black', marginTop: '10px' }}
      />
    </div>
  );
};

export default CanvasArea;
