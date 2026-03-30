import React, { useState, useRef } from "react";
import { KeyRound, X, QrCode } from "lucide-react";
import { BrowserMultiFormatReader } from "@zxing/browser";
import axios from "axios";

export default function EnterCode() {
  const [code, setCode] = useState("");
  const [scanning, setScanning] = useState(false);
  const [loading, setLoading] = useState(false);
  const videoRef = useRef(null);

  // 🔢 Handle keypad number press
  const handlePress = (num) => {
    if (code.length < 6) setCode(code + num);
  };

  // ❌ Delete last digit
  const handleDelete = () => setCode(code.slice(0, -1));

  // ✅ Confirm code or scan QR
  const handleConfirmOrQR = async () => {
    if (code.length === 0) {
      // Start QR scanning
      setScanning(true);
      const codeReader = new BrowserMultiFormatReader();
      try {
        const result = await codeReader.decodeOnceFromVideoDevice(
          undefined,
          videoRef.current
        );
        console.log("QR Code detected:", result.text);
        setCode(result.text); // set scanned code
        setScanning(false);
        handleVerifyCode(result.text); // auto verify QR
      } catch (err) {
        console.error(err);
        alert("QR scan failed");
        setScanning(false);
      }
    } else {
      // Manual code entered
      handleVerifyCode(code);
    }
  };

  // 🔹 Call backend to verify code
  const handleVerifyCode = async (enteredCode) => {
  try {
    setLoading(true);

    await axios.post(
      "http://localhost:9090/api/guard/verify",
      {
        code: enteredCode,
      }
    );

    alert("✅ Entry Granted");
  } catch (err) {
    console.error(err);
    alert("❌ Invalid or expired code");
  } finally {
    setLoading(false);
    setCode("");
  }
};

  return (
    <div className="h-full bg-[#0b1d2d] text-white flex flex-col lg:h-[91%] lg:mt-16 lg:ml-2 relative">
      {/* QR Scanner */}
      {scanning && (
        <div className="absolute inset-0 bg-black/70 flex flex-col items-center justify-center z-50">
          <video ref={videoRef} className="w-80 h-80 rounded" />
          <button
            className="mt-4 px-4 py-2 bg-red-600 rounded"
            onClick={() => setScanning(false)}
          >
            Close
          </button>
        </div>
      )}

      {/* 🔢 CODE DOTS */}
      <div className="flex justify-center gap-3 mt-10">
        {[...Array(6)].map((_, i) => (
          <div
            key={i}
            className={`h-3 w-3 rounded-full ${code[i] ? "bg-white" : "border border-white"}`}
          />
        ))}
      </div>

      {/* 🔢 KEYPAD */}
      <div className="flex-1 flex items-center justify-center">
        <div className="grid grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
            <button
              key={num}
              onClick={() => handlePress(num)}
              className="h-16 w-16 rounded-full border border-white text-xl font-semibold hover:bg-white hover:text-[#0b1d2d]"
            >
              {num}
            </button>
          ))}

          {/* CONFIRM / QR */}
          <button
            onClick={handleConfirmOrQR}
            className="h-16 w-16 rounded-full border border-white flex items-center justify-center hover:bg-white hover:text-[#0b1d2d]"
          >
            {code.length === 0 ? <QrCode /> : <KeyRound />}
          </button>

          {/* ZERO */}
          <button
            onClick={() => handlePress(0)}
            className="h-16 w-16 rounded-full border border-white text-xl font-semibold hover:bg-white hover:text-[#0b1d2d]"
          >
            0
          </button>

          {/* DELETE */}
          <button
            onClick={handleDelete}
            className="h-16 w-16 rounded-full border border-white flex items-center justify-center hover:bg-white hover:text-[#0b1d2d]"
          >
            <X />
          </button>
        </div>
      </div>

      {/* Loading overlay */}
      {loading && (
        <div className="absolute inset-0 bg-black/50 flex items-center justify-center z-40">
          <p className="text-white text-lg">Verifying...</p>
        </div>
      )}
    </div>
  );
}