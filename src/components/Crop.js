import React, { useState, useRef } from "react";

import ReactCrop, { centerCrop, makeAspectCrop } from "react-image-crop";
import "react-image-crop/dist/ReactCrop.css";

import { compressAccurately, downloadFile } from "image-conversion";

import Button from "./Button";

// Make and center a % aspect crop using some helper functions.
function centerAspectCrop(mediaWidth, mediaHeight, aspect) {
  return centerCrop(
    makeAspectCrop(
      {
        unit: "%",
        width: 90,
      },
      aspect,
      mediaWidth,
      mediaHeight
    ),
    mediaWidth,
    mediaHeight
  );
}

export default function Crop() {
  const [imgSrc, setImgSrc] = useState("");
  const imgRef = useRef(null);
  const [crop, setCrop] = useState(undefined);
  const [completedCrop, setCompletedCrop] = useState();
  const maxSize = 1024; //max output size in Kb
  const defaultAspect = 1;

  //Select files-------------------------------------------------------

  //Use separate button to trigger file upload
  const fileInput = useRef(null);
  function handleClick(e) {
    fileInput.current.click();
  }

  function onSelectFile(e) {
    if (e.target.files && e.target.files.length > 0) {
      setCrop(undefined); // Makes crop preview update between images.
      setCrop({ aspect: defaultAspect });
      const reader = new FileReader();
      reader.addEventListener("load", () =>
        setImgSrc(reader.result.toString() || "")
      );
      reader.readAsDataURL(e.target.files[0]);
    }
  }

  function onImageLoad(e) {
    const { width, height } = e.currentTarget;
    const newCrop = {};
    if (width > height) {
      newCrop.width = height;
      newCrop.height = height;
    } else {
      newCrop.width = width * 0.9;
      newCrop.height = width * 0.9;
    }
    newCrop.x = (width - newCrop.width) / 2;
    newCrop.y = (height - newCrop.height) / 2;
    newCrop.unit = "px";
    setCrop(newCrop);
    setCrop(centerAspectCrop(width, height, crop.aspect));
    setCompletedCrop(newCrop);
  }

  //Save files-------------------------------------------------------

  function handleAcceptCrop(e) {
    userCrop(completedCrop);
  }

  function userCrop(crop) {
    if (imgRef.current && crop.width && crop.height) {
      getCroppedImage(imgRef.current, crop, "newFile.jpeg").catch((error) => {
        console.error(error);
      });
    }
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
          reject(new Error("image canvas empty"));
          return;
        }
        blob.name = fileName;
        let imageURL;
        window.URL.revokeObjectURL(imageURL);
        imageURL = window.URL.createObjectURL(blob);
        if (blob.size > maxSize * 1024) {
          //Resize the download to max file size
          compressAccurately(blob, maxSize).then((res) => {
            //The res in the promise is a compressed Blob type (which can be treated as a File type) file;
            downloadFile(res);
          });
        } else {
          downloadFile(blob);
        }
        resolve(imageURL);
      }, "image/png");
    });
  }

  return (
    <div className="crop">
      <input
        type="file"
        accept="image/*"
        multiple={false}
        ref={fileInput}
        onChange={onSelectFile}
        style={{ display: "none" }}
      />
      <div className="controls flex flex-row justify-between p-2 bg-cyan-400">
        <Button text="Upload image" action={handleClick} />
        {Boolean(imgSrc) && <Button text="Accept" action={handleAcceptCrop} />}
      </div>
      {Boolean(imgSrc) && (
        <>
          <ReactCrop
            crop={crop}
            onChange={(_, percentCrop) => setCrop(percentCrop)}
            onComplete={(c) => setCompletedCrop(c)}
            aspect={1}
          >
            <img ref={imgRef} alt="Crop me" src={imgSrc} onLoad={onImageLoad} />
          </ReactCrop>
        </>
      )}
    </div>
  );
}
