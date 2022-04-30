import React, { useState, useRef } from "react";

import ReactCrop from "react-image-crop";
import "react-image-crop/dist/ReactCrop.css";

import { compressAccurately, downloadFile } from "image-conversion";

export default function Crop() {
  //const allowedFileTypes = `image/gif image/png, image/jpeg, image/x-png`;
  // const [viewImage, setViewImage] = useState(undefined);
  const [imgSrc, setImgSrc] = useState("");
  //const previewCanvasRef = useRef(null);
  const imgRef = useRef(null);
  const [crop, setCrop] = useState({
    unit: "%",
    width: 50,
    height: 50,
    x: 25,
    y: 25,
    aspect: 1,
  });
  const [completedCrop, setCompletedCrop] = useState();
  //const [imageUrl, setImageUrl] = useState(undefined);
  const maxSize = 50; //max output size in Kb

  //Select files

  function onSelectFile(e) {
    if (e.target.files && e.target.files.length > 0) {
      //setCrop(undefined) // Makes crop preview update between images.
      const reader = new FileReader();
      reader.addEventListener("load", () =>
        setImgSrc(reader.result.toString() || "")
      );
      reader.readAsDataURL(e.target.files[0]);
    }
  }

  //Save files

  function handleFinishCrop(e) {
    userCrop(completedCrop);
  }

  function userCrop(crop) {
    if (imgRef.current && crop.width && crop.height) {
      getCroppedImage(imgRef.current, crop, "newFile.jpeg").then(
        console.log("finished inner")
      );
    }
    console.log("finished");
  }
  async function getCroppedImage(image, crop, fileName) {
    const imageCanvas = document.createElement("canvas");
    const scaleX = image.naturalWidth / image.width;
    const scaleY = image.naturalHeight / image.height;
    imageCanvas.width = crop.width;
    imageCanvas.height = crop.height;
    const imgCx = imageCanvas.getContext("2d");
    imgCx.drawImage(
      image,
      crop.x * scaleX,
      crop.y * scaleY,
      crop.width * scaleX,
      crop.height * scaleY,
      0,
      0,
      crop.width,
      crop.height
    );
    return new Promise((reject, resolve) => {
      imageCanvas.toBlob((blob) => {
        if (!blob) {
          console.log("failed");
          reject(new Error("the image canvas is empty"));
          return;
        }
        blob.name = fileName;
        let imageURL;
        window.URL.revokeObjectURL(imageURL);
        imageURL = window.URL.createObjectURL(blob);
        console.log(blob);
        if (blob.size > maxSize * 1024) {
          console.log("big");
          compressAccurately(blob, maxSize).then((res) => {
            //The res in the promise is a compressed Blob type (which can be treated as a File type) file;
            downloadFile(res);
          });
        } else {
          console.log("small");
          downloadFile(blob);
        }
        resolve(imageURL);
        //setImageUrl(blob);
        //window.location.replace(imageURL); //to redirect to the blob
      }, "image/png");
    });
  }

  //Use button to trigger file upload
  const fileInput = useRef(null);
  function handleClick(e) {
    fileInput.current.click();
  }

  return (
    <div className="crop">
      <input
        type="file"
        accept="image/*"
        multiple={false}
        ref={fileInput}
        onChange={onSelectFile}
      />
      <button onClick={handleClick}>Upload image</button>
      {Boolean(imgSrc) && (
        <>
          <ReactCrop
            crop={crop}
            onChange={(_, percentCrop) => setCrop(percentCrop)}
            onComplete={(c) => setCompletedCrop(c)}
            aspect={1}
          >
            <img ref={imgRef} alt="Crop me" src={imgSrc} />
          </ReactCrop>
          <button onClick={handleFinishCrop}>Accept</button>
        </>
      )}
    </div>
  );
}
