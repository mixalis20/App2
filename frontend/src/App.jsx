// App.js
import React, { useState, useRef } from 'react';
import Navbar from './components/Navbar';
import UploadForm from './components/UploadForm.jsx';
import CanvasArea from './components/CanvasArea.jsx';
import ResizeModal from './components/ResizeModal.jsx';
import MessageBox from './components/MessageBox.jsx';
import  './App.css';
import './Navbar.css';
import './CanvasArea.css';
import CustomButton from './components/CustomButton.jsx';

const App = () => {
  const [image, setImage] = useState(null);
  const [annotations, setAnnotations] = useState([]);
  const [showResize, setShowResize] = useState(false);
  const [message, setMessage] = useState({ text: '', type: '' });
  const canvasRef = useRef(null);

  const showMessage = (text, type = 'info') => {
    setMessage({ text, type });
    setTimeout(() => setMessage({ text: '', type: '' }), 3000);
  };

  const tryeMe = ()=>{
    alert("Hello")
  }

  return (
    <div className="app">
      <Navbar toggleDark />
      {message.text && <MessageBox text={message.text} type={message.type} />}
      <h1>Upload Image</h1>
      <UploadForm setImage={setImage} showMessage={showMessage} />
      <CustomButton color={"blue"} onClick={tryeMe}>
        <img src='https://img.freepik.com/free-photo/sunset-time-tropical-beach-sea-with-coconut-palm-tree_74190-1075.jpg?semt=ais_hybrid&w=740'/>
      </CustomButton>
      <CanvasArea
        image={image}
        annotations={annotations}
        setAnnotations={setAnnotations}
        canvasRef={canvasRef}
      />
      <button onClick={() => setShowResize(true)} className="button">Resize Image</button>
      <ResizeModal
        show={showResize}
        onClose={() => setShowResize(false)}
        image={image}
        canvasRef={canvasRef}
        annotations={annotations}
        setAnnotations={setAnnotations}
        showMessage={showMessage}
      />
    </div>
  );
};

export default App;
