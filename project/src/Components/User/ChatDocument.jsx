import React, { useRef, useState } from "react";
import {
  FileText,
  Image,
  Camera,
  Headphones,
  User,
  BarChart3,
  CalendarDays,
  Sticker,
  Store,
  Zap
} from "lucide-react";

function ChatDocument({ onFileSelect, close }) {

  const docRef = useRef(null);
  const imageRef = useRef(null);
  const audioRef = useRef(null);

  const videoRef = useRef(null);
  const canvasRef = useRef(null);

  const [openCamera, setOpenCamera] = useState(false);

  const streamRef = useRef(null);

  /* CAMERA START */

  const startCamera = async () => {

    try {

      const stream = await navigator.mediaDevices.getUserMedia({ video: true });

      streamRef.current = stream;

      setOpenCamera(true);

      setTimeout(() => {

        if (videoRef.current) {

          videoRef.current.srcObject = stream;

        }

      }, 100);

    } catch (err) {

      alert("Camera access denied");

    }

  };

  /* CAPTURE PHOTO */

  const capturePhoto = () => {

    const video = videoRef.current;

    const canvas = canvasRef.current;

    canvas.width = video.videoWidth;

    canvas.height = video.videoHeight;

    const ctx = canvas.getContext("2d");

    ctx.drawImage(video, 0, 0);

    canvas.toBlob((blob) => {

      const file = new File([blob], "camera-photo.png", {
        type: "image/png"
      });

      if (onFileSelect) {

        onFileSelect(file, "image");

      }

      if (close) close();

    });

    stopCamera();

  };

  /* STOP CAMERA */

  const stopCamera = () => {

    if (streamRef.current) {

      streamRef.current.getTracks().forEach(track => track.stop());

    }

    setOpenCamera(false);

  };

  /* FILE HANDLE */

  const handleFile = (e, type) => {

    const file = e.target.files[0];

    if (!file) return;

    if (onFileSelect) {

      onFileSelect(file, type);

    }

    e.target.value = null;

    if (close) close();

  };

  /* MENU ITEMS */

  const menuItems = [

    {
      icon: <FileText size={18} className="text-indigo-500" />,
      label: "Document",
      action: () => docRef.current.click()
    },

    {
      icon: <Image size={18} className="text-blue-500" />,
      label: "Photos & videos",
      action: () => imageRef.current.click()
    },

    {
      icon: <Camera size={18} className="text-pink-500" />,
      label: "Camera",
      action: startCamera
    },

    {
      icon: <Headphones size={18} className="text-orange-500" />,
      label: "Audio",
      action: () => audioRef.current.click()
    },

    {
      icon: <User size={18} className="text-sky-500" />,
      label: "Contact",
      action: () => alert("Contact feature")
    },

    {
      icon: <BarChart3 size={18} className="text-yellow-500" />,
      label: "Poll",
      action: () => alert("Poll feature")
    },

    {
      icon: <CalendarDays size={18} className="text-red-500" />,
      label: "Event",
      action: () => alert("Event feature")
    },

    {
      icon: <Sticker size={18} className="text-green-500" />,
      label: "New sticker",
      action: () => alert("Sticker feature")
    },

    { divider: true },

    {
      icon: <Store size={18} className="text-gray-600" />,
      label: "Catalogue",
      action: () => alert("Catalogue")
    },

    {
      icon: <Zap size={18} className="text-yellow-600" />,
      label: "Quick replies",
      action: () => alert("Quick replies")
    }

  ];

  return (

    <>

      <div className="w-64 bg-white rounded-2xl shadow-lg p-2">

        {/* DOCUMENT */}

        <input
          type="file"
          ref={docRef}
          className="hidden"
          onChange={(e) => handleFile(e, "doc")}
        />

        {/* IMAGE / VIDEO */}

        <input
          type="file"
          ref={imageRef}
          className="hidden"
          accept="image/*,video/*"
          onChange={(e) => handleFile(e, "image")}
        />

        {/* AUDIO */}

        <input
          type="file"
          ref={audioRef}
          className="hidden"
          accept="audio/*"
          onChange={(e) => handleFile(e, "audio")}
        />

        {menuItems.map((item, index) =>

          item.divider ? (

            <div key={index} className="border-t my-2" />

          ) : (

            <div
              key={index}
              onClick={item.action}
              className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-100 cursor-pointer"
            >

              {item.icon}

              <span className="text-sm">

                {item.label}

              </span>

            </div>

          )

        )}

      </div>

      {/* CAMERA MODAL */}

      {openCamera && (

        <div className="fixed inset-0 bg-black flex flex-col items-center justify-center z-50">

          <video
            ref={videoRef}
            autoPlay
            className="w-96 rounded-lg"
          />

          <canvas
            ref={canvasRef}
            className="hidden"
          />

          <div className="flex gap-4 mt-4">

            <button
              onClick={capturePhoto}
              className="bg-green-500 text-white px-4 py-2 rounded"
            >
              Capture
            </button>

            <button
              onClick={stopCamera}
              className="bg-red-500 text-white px-4 py-2 rounded"
            >
              Close
            </button>

          </div>

        </div>

      )}

    </>

  );

}

export default ChatDocument;