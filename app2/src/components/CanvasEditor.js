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

  // 🔹 Διορθωμένη συνάρτηση applyResize
  const applyResize = (width, height) => {
    if (!width || !height || width <= 0 || height <= 0) {
      alert("Invalid dimensions! Please enter positive values.");
      return;
    }

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");

    const img = new Image();
    img.src = canvas.toDataURL(); // Παίρνει την τρέχουσα εικόνα από τον καμβά
    img.onload = () => {
      canvas.width = width; // Ενημέρωση του μεγέθους του καμβά
      canvas.height = height;
      ctx.clearRect(0, 0, width, height); // Καθαρίζει τον καμβά
      ctx.drawImage(img, 0, 0, width, height); // Σχεδιάζει την εικόνα με το νέο μέγεθος
    };

    setShowResizeModal(false); // Κλείσιμο του modal
  };

  const saveImage = () => {
    const link = document.createElement("a");
    link.href = canvasRef.current.toDataURL("image/png");
    link.download = "resized_image.png";
    link.click();
  };

  return (
    <div className="canvas-container">
      <canvas ref={canvasRef}></canvas>

      <div className="controls">
        <button onClick={() => setShowResizeModal(true)}>Resize Image</button>
        <button onClick={saveImage}>Save Image</button>
      </div>

      {showResizeModal && <ResizeModal closeModal={() => setShowResizeModal(false)} applyResize={applyResize} />}
    </div>
  );
}

export default CanvasEditor;
