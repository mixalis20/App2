import React, { useState, useRef, useEffect } from 'react';
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Link
} from 'react-router-dom';

import './App.css';
import CanvasArea from "./components/CanvasArea";
import Navbar from './components/Navbar';
import UploadForm from "./components/Upload";



import Gallery from './Gallery';

// --- HamburgerMenu Component ---
const HamburgerMenu = () => {
  const [active, setActive] = useState(false);
  const toggleMenu = () => setActive(!active);

  return (
    <>
      <div 
        className={`ham-menu ${active ? 'active' : ''}`} 
        onClick={toggleMenu} 
        style={{ cursor: 'pointer' }}
        aria-label="Toggle menu"
      >
        <span></span>
        <span></span>
        <span></span>
      </div>

      <nav className={`off-screen-menu ${active ? 'active' : ''}`}>
        <ul>
          <li><Link to="/" onClick={() => setActive(false)}>Upload</Link></li>
          <li><Link to="/gallery" onClick={() => setActive(false)}>Gallery</Link></li>
        </ul>
      </nav>
    </>
  );
};



// --- MessageBox ---
const MessageBox = ({ text, type }) => {
  return <div className={`message-box ${type}`}>{text}</div>;
};





// --- UploadPage ---
const UploadPage = () => {
  const [image, setImage] = useState(null);
  const [annotations, setAnnotations] = useState([]);
  const [message, setMessage] = useState({ text: '', type: '' });
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('--');
  const canvasRef = useRef(null);

  const [showResizeModal, setShowResizeModal] = useState(false);
  const [resizeWidth, setResizeWidth] = useState(0);
  const [resizeHeight, setResizeHeight] = useState(0);

  const showMessage = (text, type = 'info') => {
    setMessage({ text, type });
    setTimeout(() => setMessage({ text: '', type: '' }), 3000);
  };

  useEffect(() => {
    if (image) {
      setResizeWidth(image.width);
      setResizeHeight(image.height);
    }
  }, [image]);

  const handleResize = () => {
    if (!image) {
      showMessage('Δεν υπάρχει εικόνα για αλλαγή μεγέθους.', 'error');
      return;
    }
    if (resizeWidth <= 0 || resizeHeight <= 0) {
      showMessage('Εισάγετε θετικές διαστάσεις.', 'error');
      return;
    }

    const canvas = document.createElement('canvas');
    canvas.width = resizeWidth;
    canvas.height = resizeHeight;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(image, 0, 0, resizeWidth, resizeHeight);

    const resizedImg = new Image();
    resizedImg.onload = () => {
      setImage(resizedImg);
      setShowResizeModal(false);
      showMessage('Η εικόνα άλλαξε μέγεθος!', 'success');
    };
    resizedImg.src = canvas.toDataURL();
  };

  const handleSave = async () => {
    const canvas = canvasRef.current;
    if (!canvas) {
      showMessage('Δεν υπάρχει καμβάς.', 'error');
      return;
    }
    const imageData = canvas.toDataURL();

    if (!imageData || category === '--') {
      showMessage('Επιλέξτε εικόνα και κατηγορία!', 'error');
      return;
    }

    try {
      const response = await fetch('http://localhost:5000/api/images', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          image: imageData,
          annotations,
          category,
          title,
          description
        }),
      });

      response.ok
        ? showMessage('Επιτυχής αποθήκευση!', 'success')
        : showMessage('Σφάλμα στην αποθήκευση.', 'error');
    } catch (err) {
      console.error(err);
      showMessage('Σφάλμα σύνδεσης με server.', 'error');
    }
  };

  return (
    <div className="app">
      {message.text && <MessageBox text={message.text} type={message.type} />}
      <h1 style={{ textAlign: 'center', marginBottom: '20px', color: '#3f51b5' }}>Upload Image</h1>

      <UploadForm
        setImage={setImage}
        showMessage={showMessage}
        title={title}
        setTitle={setTitle}
        description={description}
        setDescription={setDescription}
        category={category}
        setCategory={setCategory}
      />

      <div className="button-group">
        <button onClick={() => setAnnotations([])} className="button">Καθαρισμός σημειώσεων</button>
        <button onClick={() => setShowResizeModal(true)} className="button">Resize Image</button>
        <button onClick={handleSave} className="button primary">💾 Save Image</button>
      </div>

      <CanvasArea
        image={image}
        annotations={annotations}
        setAnnotations={setAnnotations}
        canvasRef={canvasRef}
        title={title}
        description={description}
        setTitle={setTitle}
        setDescription={setDescription}
      />

      {showResizeModal && (
        <div className="modal-overlay" onClick={() => setShowResizeModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h2>Resize Image</h2>
            <div className="resize-inputs">
              <label>
                Width:
                <input type="number" value={resizeWidth} onChange={(e) => setResizeWidth(Number(e.target.value))} min={1} />
              </label>
              <label>
                Height:
                <input type="number" value={resizeHeight} onChange={(e) => setResizeHeight(Number(e.target.value))} min={1} />
              </label>
            </div>
            <div className="modal-buttons">
              <button onClick={handleResize} className="modal-button">Apply</button>
              <button onClick={() => setShowResizeModal(false)} className="modal-button">Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// --- Main App with Router ---
const App = () => {
  return (
    <Router>
      <Navbar />
      <Routes>
        <Route path="/" element={<UploadPage />} />
        <Route path="/gallery" element={<Gallery />} />
      </Routes>
    </Router>
  );
};

export default App;
