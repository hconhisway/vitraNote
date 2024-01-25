import React, { useState, useEffect } from "react";
import io from "socket.io-client";

const socket = io("http://localhost:3001");

function ImageUploader() {
  const [images, setImages] = useState<string[]>([]); // Specify the type of the array

  useEffect(() => {
    socket.on("new_image", (imageData: string) => {
      setImages((prevImages) => [...prevImages, imageData]);
    });
  }, []);

  const uploadImage = (event: React.ChangeEvent<HTMLInputElement>) => {
    // Type the event
    const file = event.target.files ? event.target.files[0] : null;
    if (file) {
      const reader = new FileReader();
      reader.onload = (e: ProgressEvent<FileReader>) => {
        // Type the event
        if (e.target && typeof e.target.result === "string") {
          socket.emit("upload", e.target.result);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div>
      <input type="file" onChange={uploadImage} />
      {images.map((image, index) => (
        <img key={index} src={image} alt="Uploaded" />
      ))}
    </div>
  );
}

export default ImageUploader;
