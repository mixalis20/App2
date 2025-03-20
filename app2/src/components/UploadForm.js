import React from "react";

function UploadForm({ onImageUpload }) {
  const handleUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => onImageUpload(e.target.result);
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="upload-container">
      <label>Upload Image:</label>
      <input type="file" accept="image/*" onChange={handleUpload} />

      <label>Title:</label>
      <input type="text" placeholder="Enter annotation title..." />

      <label>Description:</label>
      <input type="text" placeholder="Enter annotation description..." />

      <label>Category:</label>
      <select>
        <option value="">-- Select Category --</option>
        <option value="nature">Nature</option>
        <option value="city">City</option>
        <option value="animals">Animals</option>
      </select>
    </div>
  );
}

export default UploadForm;
