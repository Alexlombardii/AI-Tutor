'use client';
import React from 'react';
import { useTranscript } from '../../contexts/transcriptContext';
import 'katex/dist/katex.min.css';
import MarkdownLaTeXRenderer from '../MarkdownLaTeXRenderer';

export function SessionView() {
  // global state from TranscriptContext
  const { slates } = useTranscript();

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
            <div key={id} className="mb-8">
              <MarkdownLaTeXRenderer content={slate.markdown} />
            </div>
          ))
        )}
      </div>
    </div>
  );
}