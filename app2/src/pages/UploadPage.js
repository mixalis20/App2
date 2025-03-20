import React, { useState } from "react";
import UploadForm from "../components/UploadForm";
import CanvasEditor from "../components/CanvasEditor";

function UploadPage() {
  const [image, setImage] = useState(null);

  return (
    <div>
      <h1>Upload, Annotate & Resize Images</h1>
      <UploadForm onImageUpload={setImage} />
      <CanvasEditor image={image} />
    </div>
  );
}

export default UploadPage;
