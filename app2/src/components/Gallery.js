import React, { useState } from "react";

const images = [
  { src: "/images/nature1.jpg", category: "nature" },
  { src: "/images/city1.jpg", category: "city" },
  { src: "/images/animal1.jpg", category: "animals" },
];

function Gallery({ setSelectedImage }) {
  const [category, setCategory] = useState("all");

  const filteredImages = category === "all" ? images : images.filter(img => img.category === category);

  return (
    <div>
      <label>Filter by Category:</label>
      <select value={category} onChange={(e) => setCategory(e.target.value)}>
        <option value="all">All</option>
        <option value="nature">Nature</option>
        <option value="city">City</option>
        <option value="animals">Animals</option>
      </select>

      <div className="gallery">
        {filteredImages.map((img, index) => (
          <img key={index} src={img.src} alt="" onClick={() => setSelectedImage(img.src)} />
        ))}
      </div>
    </div>
  );
}

export default Gallery;
