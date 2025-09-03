"use client";

import { useRef, useState, useCallback } from "react";
import Webcam from "react-webcam";

type Props = {
  /** called when the user accepts the shot */
  onCapture: (file: Blob) => void;
  /** close the overlay without taking a photo */
  onClose: () => void;
};

export default function CameraScanner({ onCapture, onClose }: Props) {
  const camRef = useRef<Webcam>(null);
  const [snapshot, setSnapshot] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  /* take still frame */
  const handleTakePhoto = useCallback(() => {
    const dataUrl = camRef.current?.getScreenshot();
    if (dataUrl) setSnapshot(dataUrl);
  }, []);

  /* accept */
  const handleUsePhoto = async () => {
    if (!snapshot) return;
    setBusy(true);
    try {
      const blob = await (await fetch(snapshot)).blob();
      onCapture(blob);
    } finally {
      setBusy(false);
    }
  };

  /* retake */
  const handleRetake = () => setSnapshot(null);

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black/80">
      {/* close */}
      <button
        onClick={onClose}
        className="absolute right-4 top-4 text-white text-3xl leading-none"
      >
        &times;
      </button>

      {/* live cam or frozen shot */}
      <div className="relative w-[90vw] max-w-md aspect-[3/4] overflow-hidden rounded-xl">
        {snapshot ? (
          <img
            src={snapshot}
            alt="snapshot"
            className="w-full h-full object-cover"
          />
        ) : (
          <Webcam
            ref={camRef}
            audio={false}
            screenshotFormat="image/jpeg"
            className="w-full h-full object-cover"
            videoConstraints={{ facingMode: "environment" }}
          />
        )}

        {/* white frame overlay */}
        <div className="absolute inset-0 border-4 border-white/70 rounded-xl pointer-events-none" />
      </div>

      {/* controls */}
      {snapshot ? (
        <div className="mt-6 flex gap-4">
          <button
            onClick={handleRetake}
            className="px-4 py-2 bg-gray-200 rounded"
            disabled={busy}
          >
            Retake
          </button>
          <button
            onClick={handleUsePhoto}
            className="px-4 py-2 bg-blue-600 text-white rounded disabled:opacity-50"
            disabled={busy}
          >
            {busy ? "Uploading…" : "Use photo"}
          </button>
        </div>
      ) : (
        <button
          onClick={handleTakePhoto}
          className="mt-6 w-20 h-20 rounded-full bg-white/30 border-4 border-white active:scale-95 transition"
        />
      )}
    </div>
  );
}
