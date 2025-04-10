// src/components/UploadForm.jsx
import React, { useState } from 'react';

const UploadForm = ({ setImage, showMessage }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
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
        body: JSON.stringify({
          image: imageData,
          annotations: [], // θα γεμίσει από το App αν θες
          category,
        }),
      });

      if (response.ok) {
        showMessage('Επιτυχής αποθήκευση!', 'success');
      } else {
        showMessage('Σφάλμα στην αποθήκευση.', 'error');
      }
    } catch (err) {
      console.error(err);
      showMessage('Σφάλμα σύνδεσης με server.', 'error');
    }
  };

  return (
    <div className="upload-form">
      <label>Upload Image:</label>
      <input type="file" accept="image/*" onChange={handleUpload} />

      

      <label>Category:</label>
      <select value={category} onChange={(e) => setCategory(e.target.value)}>
        <option value="--">--</option>
        <option value="nature">Nature</option>
        <option value="city">City</option>
        <option value="animals">Animals</option>
      </select>

      <button onClick={handleSave} className="button">Save Image</button>
    </div>
  );
};

export default UploadForm;
