'use client';
import React from 'react';
import { useTranscript } from '../../contexts/transcriptContext';
import 'katex/dist/katex.min.css';
import MarkdownLaTeXRenderer from './MarkdownLaTeXRenderer';
import TypeWriter from './typeWriter';
import { useState } from "react";
import CameraScanner from "../session/CameraScanner";  
import { scanWorkings } from "../../lib/api/scanWorkings";
import { useRealtimeSession } from "../../hooks/useRealtimeSession";
import { Button } from "../ui/button";          

interface SessionViewProps {
  sendMessageToRealtime: (message: string, workings?: Record<string, any>) => void ;
  onStartSession?: () => void;
  isConnected?: boolean; 
}

export function SessionView({ sendMessageToRealtime, onStartSession, isConnected = false }: SessionViewProps) {
  const [slates, setSlates] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState(false);
  const [scannerOpen, setScannerOpen] = useState(false);
  const [activePQ, setActivePQ] = useState<string | null>(null);
  const { status } = useRealtimeSession();

  async function handleCapture(blob: Blob) {
    if (!activePQ) return;
    setScannerOpen(false);
    setLoading(true);
    try {
      // Just get the vision analysis
      const res = await scanWorkings(blob, { practiceQuestionId: activePQ });

      // Send it to the realtime session
      sendMessageToRealtime(`I've uploaded my workings: ${JSON.stringify(res.worked_example)}`);

    } catch (e) {
      console.error(e);
      alert("Upload failed – please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="bg-white rounded-xl border p-4 min-h-[80vh]">
      {!isConnected ? (
        <div className="flex flex-col items-center p-4 h-full min-h-[40vh]">
          <h1 className="text-2xl font-semibold text-gray-800 text-center mb-6">
            Session
          </h1>
          <p className="text-gray-500 text-center">
            Click "Start Session" above to begin your tutoring session.
          </p>
        </div>
      ) : (
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">
            Session Notes & Rough Workings:
          </h2>
          {Object.entries(slates).map(([id, slate]) => (
            <div key={id} className="mb-8 space-y-4">
              <TypeWriter 
                content={slate.markdown} 
                speed={25}
                className="prose prose-sm max-w-none"
              />

              {slate.purpose === "practice_question" && (
                <Button
                  onClick={() => { setActivePQ(id); setScannerOpen(true); }}
                  variant="default"            
                  className="mx-auto"
                >
                  Upload Workings
                </Button>
              )}
            </div>
          ))}
        </div>
      )}

      {loading && <p className="mt-4 text-center">Analyzing…</p>}

      {scannerOpen && (
        <CameraScanner onCapture={handleCapture} onClose={() => setScannerOpen(false)} />
      )}
    </div>
  );
}