'use client';
import React from 'react';
import { useTranscript } from '../../contexts/transcriptContext';
import 'katex/dist/katex.min.css';
import MarkdownLaTeXRenderer from '../MarkdownLaTeXRenderer';
import { useState } from "react";
import CameraScanner from "../session/CameraScanner";  
import { scanWorkings } from "../../lib/api/scanWorkings";
import { useRealtimeSession } from "../../hooks/useRealtimeSession";
import { Button } from "../ui/button";          
import { useHandleSessionHistory } from "../../hooks/useHandleSessionHistory";

export function SessionView() {
  // global state from TranscriptContext
  const { slates } = useTranscript();
  const [scannerOpen, setScannerOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [activePQ, setActivePQ] = useState<string|null>(null);   // slate.id
  const { status, getSessionId } = useRealtimeSession();
  const historyHandlers = useHandleSessionHistory().current;

  async function handleCapture(blob: Blob) {
    if (!activePQ) return;
    setScannerOpen(false);
    setLoading(true);
    try {
      const realtimeId = getSessionId();           // returns string | undefined
      if (!realtimeId) {
        console.error("No realtime session id yet");
        return;
      }
      const res = await scanWorkings(blob, {
        sessionId: getSessionId()!,          // guaranteed defined now
        practiceQuestionId: activePQ,
      });

      /* 1️⃣  student upload → make it a user message */
      historyHandlers.handleWorkingsScan(
        activePQ,
        res.worked_example,   // raw OCR from vision model
        "user"
      );

      /* 2️⃣  tutor reply → assistant message */
      historyHandlers.handleHistoryAdded({
        itemId: `sup-${Date.now()}`,
        type: "message",
        role: "assistant",
        status: "completed",
        content: [{ type: "text", text: res.tutor_reply }],
        ts: Date.now(),
      });
    } catch (e) {
      console.error(e);
      alert("Upload failed – please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="bg-white rounded-xl border p-6 min-h-0">
      <h1 className="text-2xl font-bold text-gray-800 text-center mb-6">
        Session
      </h1>

      {/* High-Signal board */}
      <div className="bg-white rounded-xl border p-6">
        <h2 className="text-lg font-semibold mb-4 text-center">
          Key Content
        </h2>

        {Object.keys(slates).length === 0 ? (
          <p className="text-gray-500 text-center">
            Equations, worked-example steps, and practice questions will appear
            here.
          </p>
        ) : (
          Object.entries(slates).map(([id, slate]) => (
            <div key={id} className="mb-8 space-y-4">
              {/* original markdown render */}
              <MarkdownLaTeXRenderer content={slate.markdown} />

              {/* only for practice questions */}
              {slate.purpose === "practice_question" && (
                <Button
                  onClick={() => { setActivePQ(id); setScannerOpen(true); }}
                  disabled={status !== "CONNECTED"}        // <— this line
                  variant="default"            
                  className="mx-auto"
                >
                  Upload Workings
                </Button>
              )}
            </div>
          ))
        )}
      </div>

      {loading && <p className="mt-4 text-center">Analyzing…</p>}

      {scannerOpen && (
        <CameraScanner onCapture={handleCapture} onClose={() => setScannerOpen(false)} />
      )}
    </div>
  );
}