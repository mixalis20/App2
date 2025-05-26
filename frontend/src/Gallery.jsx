// Gallery.jsx
import React, { useState, useEffect, useRef } from 'react';
import './Gallery.css'; // Θα φτιάξουμε και αυτό

const Gallery = () => {
  const [images, setImages] = useState([]);
  const canvasRefs = useRef([]);

  useEffect(() => {
    fetch('http://localhost:5000/api/images')
      .then(res => res.json())
      .then(data => {
        setImages(data);
      })
      .catch(err => {
        console.error("Error loading gallery images:", err);
      });
  }, []);

  useEffect(() => {
    images.forEach((imgData, index) => {
      const canvas = canvasRefs.current[index];
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      const img = new Image();
      img.onload = () => {
        canvas.width = img.width;
        canvas.height = img.height;
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0);

        imgData.annotations.forEach(ann => {
          ctx.strokeStyle = 'blue';
          ctx.lineWidth = 2;
          ctx.strokeRect(ann.x, ann.y, ann.width, ann.height);
          ctx.font = '12px Arial';
          ctx.fillStyle = 'blue';
          ctx.fillText(ann.title, ann.x, ann.y - 5);
        });
      };
      img.src = imgData.image;
    });
  }, [images]);

  return (
    <div className="gallery">
      <h1>Gallery</h1>
      {images.length === 0 && <p>No images found.</p>}
      <div className="gallery-grid">
        {images.map((imgData, idx) => (
          <div key={idx} className="gallery-item">
            <canvas ref={el => canvasRefs.current[idx] = el} />
            <div className="image-info">
              <h3>{imgData.title}</h3>
              <p>{imgData.description}</p>
              <p><b>Category:</b> {imgData.category}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Gallery;
