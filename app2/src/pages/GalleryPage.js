import React, { useState } from "react";
import Gallery from "../components/Gallery";
import ImageModal from "../components/ImageModal";

function GalleryPage() {
  const [selectedImage, setSelectedImage] = useState(null);

  return (
    <div>
      <h1>Image Gallery</h1>
      <Gallery setSelectedImage={setSelectedImage} />
      {selectedImage && <ImageModal image={selectedImage} closeModal={() => setSelectedImage(null)} />}
    </div>
  );
}

export default GalleryPage;
