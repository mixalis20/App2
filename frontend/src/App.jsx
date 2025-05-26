// App.jsx
import React, { useState, useRef, useEffect } from 'react';
import './App.css';
import './Navbar.css';
import './CanvasArea.css';

// === Navbar ===
const Navbar = () => {
  return (
    <div className="navbar">
      <ul>
        <li><a href="index.html" id="imageLink">Image</a></li>
        <li><a href="gallery.html" id="galleryLink">Gallery</a></li>
      </ul>
    </div>
  );
};

// === MessageBox ===
const MessageBox = ({ text, type }) => {
  return <div className={`message-box ${type}`}>{text}</div>;
};

// === UploadForm with inline annotation fields ===
const UploadForm = ({ setImage, showMessage, title, setTitle, description, setDescription }) => {
  const [category, setCategory] = useState('--');

  const handleUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (ev) => {
      const img = new Image();
      img.onload = () => setImage(img);
      img.src = ev.target.result;
    };
    reader.readAsDataURL(file);
  };

  const handleSave = async () => {
    const canvas = document.querySelector('canvas');
    const imageData = canvas.toDataURL();

    if (!imageData || category === '--') {
      showMessage('Επιλέξτε εικόνα και κατηγορία!', 'error');
      return;
    }

    try {
      const response = await fetch('http://localhost:5000/api/images', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ image: imageData, annotations: [], category }),
      });

      response.ok ? showMessage('Επιτυχής αποθήκευση!', 'success') : showMessage('Σφάλμα στην αποθήκευση.', 'error');
    } catch (err) {
      console.error(err);
      showMessage('Σφάλμα σύνδεσης με server.', 'error');
    }
  };

  return (
    <div className="upload-form" style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'flex-end' }}>
      <div>
        <label>Upload Image:</label><br />
        <input type="file" accept="image/*" onChange={handleUpload} />
      </div>
      <div>
        <label>Category:</label><br />
        <select value={category} onChange={(e) => setCategory(e.target.value)}>
          <option value="--">--</option>
          <option value="nature">Nature</option>
          <option value="city">City</option>
          <option value="animals">Animals</option>
        </select>
      </div>
      <div>
        <label>Annotation Title:</label><br />
        <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Enter title..." />
      </div>
      <div>
        <label>Description:</label><br />
        <input type="text" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Enter description..." />
      </div>
      <div>
        <button onClick={handleSave} className="button">Save Image</button>
      </div>
    </div>
  );
};

// === CanvasArea ===
const CanvasArea = ({ image, annotations, setAnnotations, canvasRef, title, description }) => {
  const [isDrawing, setIsDrawing] = useState(false);
  const [startPoint, setStartPoint] = useState({ x: 0, y: 0 });
  const ctxRef = useRef(null);

  useEffect(() => {
    if (canvasRef.current && image) {
      ctxRef.current = canvasRef.current.getContext('2d');
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
    if (!isDrawing || !image) return;

    const rect = canvasRef.current.getBoundingClientRect();
    const endX = e.clientX - rect.left;
    const endY = e.clientY - rect.top;

    drawImageAndAnnotations();

    const ctx = ctxRef.current;
    ctx.strokeStyle = 'red';
    ctx.lineWidth = 2;
    ctx.strokeRect(startPoint.x, startPoint.y, endX - startPoint.x, endY - startPoint.y);
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
  };

  return (
    <div className="canvas-area">
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

// === App ===
const App = () => {
  const [image, setImage] = useState(null);
  const [annotations, setAnnotations] = useState([]);
  const [message, setMessage] = useState({ text: '', type: '' });
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const canvasRef = useRef(null);

  const showMessage = (text, type = 'info') => {
    setMessage({ text, type });
    setTimeout(() => setMessage({ text: '', type: '' }), 3000);
  };

  return (
    <div className="app">
      <Navbar />
      {message.text && <MessageBox text={message.text} type={message.type} />}
      <h1>Upload Image</h1>
      <UploadForm
        setImage={setImage}
        showMessage={showMessage}
        title={title}
        setTitle={setTitle}
        description={description}
        setDescription={setDescription}
      />
      <CanvasArea
        image={image}
        annotations={annotations}
        setAnnotations={setAnnotations}
        canvasRef={canvasRef}
        title={title}
        description={description}
      />
    </div>
  );
};

export default App;
