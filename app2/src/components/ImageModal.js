import React, { useState } from "react";

function ImageModal({ image, closeModal }) {
  const [tags, setTags] = useState([]);
  const [newTag, setNewTag] = useState("");

  const addTag = () => {
    if (newTag.trim() !== "") {
      setTags([...tags, newTag.trim()]);
      setNewTag("");
    }
  };

  return (
    <div className="modal">
      <div className="modal-content">
        <span className="close" onClick={closeModal}>&times;</span>
        
        <div className="modal-left">
          <img src={image} alt="Selected" />
        </div>

        <div className="modal-right">
          <h4>Add Tags:</h4>
          <input type="text" value={newTag} onChange={(e) => setNewTag(e.target.value)} placeholder="Enter tags..." />
          <button onClick={addTag}>Add</button>

          <div className="tags">
            {tags.map((tag, index) => (
              <span key={index} className="tag">{tag}</span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default ImageModal;
