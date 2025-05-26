import React from "react";

const UploadForm = ({
  setImage,
  showMessage,
  title,
  setTitle,
  description,
  setDescription,
  annotations,
  category,
  setCategory,
  onSave
}) => {
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

  return (
    <div className="upload-form">
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
        <button onClick={onSave} className="button">Save Image</button>
      </div>
    </div>
  );
};

export default UploadForm;
