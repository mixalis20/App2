import React, { useRef, useEffect, useState } from "react";
import ResizeModal from "./ResizeModal";

function CanvasEditor({ image }) {
  const canvasRef = useRef(null);
  const [showResizeModal, setShowResizeModal] = useState(false);

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

  const saveImage = () => {
    const link = document.createElement("a");
    link.href = canvasRef.current.toDataURL("image/png");
    link.download = "edited_image.png";
    link.click();
  };

  return (
    <div className="canvas-container">
      <canvas ref={canvasRef}></canvas>

      <div className="controls">
        <button onClick={() => setShowResizeModal(true)}>Resize Image</button>
        <button onClick={saveImage}>Save Image</button>
      </div>

      {showResizeModal && (
        <ResizeModal
          closeModal={() => setShowResizeModal(false)}
          applyResize={applyResize}
        />
      )}
    </div>
  );
}

export default CanvasEditor;
