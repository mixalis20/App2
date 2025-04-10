import React, { useRef, useState, useEffect } from "react";

function ImageEditor() {
  const canvasRef = useRef(null);
  const [image, setImage] = useState(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [startX, setStartX] = useState(0);
  const [startY, setStartY] = useState(0);
  const [annotations, setAnnotations] = useState([]);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [showResizeModal, setShowResizeModal] = useState(false);
  const [newWidth, setNewWidth] = useState("");
  const [newHeight, setNewHeight] = useState("");

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

  const handleUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => setImage(e.target.result);
    reader.readAsDataURL(file);
  };

  const handleMouseDown = (e) => {
    const rect = canvasRef.current.getBoundingClientRect();
    setStartX(e.clientX - rect.left);
    setStartY(e.clientY - rect.top);
    setIsDrawing(true);
  };

  const handleMouseUp = (e) => {
    if (!isDrawing) return;
    setIsDrawing(false);
    const rect = canvasRef.current.getBoundingClientRect();
    const endX = e.clientX - rect.left;
    const endY = e.clientY - rect.top;
    const annotation = {
      x: Math.min(startX, endX),
      y: Math.min(startY, endY),
      width: Math.abs(endX - startX),
      height: Math.abs(endY - startY),
      title,
      description,
    };
    setAnnotations((prev) => [...prev, annotation]);
    setTitle("");
    setDescription("");
    drawAll(annotation);
  };

  const drawAll = (newAnnotation) => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    const img = new Image();
    img.src = image;
    img.onload = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0);
      [...annotations, newAnnotation].forEach((ann) => {
        ctx.strokeStyle = "blue";
        ctx.lineWidth = 2;
        ctx.strokeRect(ann.x, ann.y, ann.width, ann.height);
        ctx.font = "12px Arial";
        ctx.fillStyle = "blue";
        ctx.fillText(ann.title, ann.x, ann.y - 5);
      });
    };
  };

  const handleResize = () => {
    const width = parseInt(newWidth);
    const height = parseInt(newHeight);
    if (!width || !height) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    const img = new Image();
    img.src = canvas.toDataURL();
    img.onload = () => {
      canvas.width = width;
      canvas.height = height;
      ctx.drawImage(img, 0, 0, width, height);
      setShowResizeModal(false);
    };
  };

  const saveImage = () => {
    const link = document.createElement("a");
    link.download = "edited_image.png";
    link.href = canvasRef.current.toDataURL();
    link.click();
  };

  return (
    <div className="editor">
      <h2>Image Editor</h2>

      <input type="file" accept="image/*" onChange={handleUpload} />

      <div>
        <label>Title:</label>
        <input value={title} onChange={(e) => setTitle(e.target.value)} />
        <label>Description:</label>
        <input value={description} onChange={(e) => setDescription(e.target.value)} />
      </div>

      <canvas
        ref={canvasRef}
        onMouseDown={handleMouseDown}
        onMouseUp={handleMouseUp}
        className="canvas"
        style={{ border: "1px solid black" }}
      ></canvas>

      <div>
        <button onClick={() => setShowResizeModal(true)}>Resize</button>
        <button onClick={saveImage}>Save Image</button>
      </div>

      {showResizeModal && (
        <div className="modal">
          <h3>Resize Image</h3>
          <label>Width:</label>
          <input
            type="number"
            value={newWidth}
            onChange={(e) => setNewWidth(e.target.value)}
          />
          <label>Height:</label>
          <input
            type="number"
            value={newHeight}
            onChange={(e) => setNewHeight(e.target.value)}
          />
          <button onClick={handleResize}>Apply</button>
          <button onClick={() => setShowResizeModal(false)}>Cancel</button>
        </div>
      )}

      <div>
        <h3>Annotations</h3>
        <ul>
          {annotations.map((ann, i) => (
            <li key={i}>{ann.title}: {ann.description}</li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export default ImageEditor;
