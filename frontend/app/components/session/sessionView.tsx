'use client';
import React, { useState, useEffect } from 'react';
import { useTranscript } from '../../contexts/transcriptContext';
import 'katex/dist/katex.min.css';
import MarkdownLaTeXRenderer from '../MarkdownLaTeXRenderer';

export function SessionView() {
  const { transcriptItems } = useTranscript();
  
  // Find the latest high-signal content from breadcrumbs
  const latestHighSignalContent = transcriptItems
    .filter(item => item.type === 'BREADCRUMB' && item.title === '[High Signal Content]')
    .sort((a, b) => b.createdAtMs - a.createdAtMs)[0];
  
  const highSignalData = latestHighSignalContent?.data;
  
  const [accumulatedContent, setAccumulatedContent] = useState<string>('');

  // When new content arrives
  useEffect(() => {
    if (highSignalData && typeof highSignalData === 'string') {
      setAccumulatedContent(prev => 
        prev ? `${prev}\n\n---\n\n${highSignalData}` : highSignalData
      );
    }
  }, [highSignalData]);

  return (
    <div className="bg-white rounded-xl border p-6 flex-1 flex flex-col">
      <h1 className="text-2xl font-bold text-gray-800 text-center mb-6">
        Session
      </h1>
      
      {highSignalData ? (
        <div className="flex-1 space-y-6">
          <div className="bg-blue-50 rounded-lg p-6 border border-blue-200">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">📚 Key Content</h2>
            <div className="bg-white rounded-lg p-4 border">
              <MarkdownLaTeXRenderer content={accumulatedContent} />
            </div>
          </div>
        </div>
      ) : (
        <div className="flex-1 flex flex-col items-center justify-center">
          <div className="text-6xl mb-4">🎓</div>
          <h2 className="text-xl font-semibold text-gray-700 mb-2">
            Ready to learn!
          </h2>
          <p className="text-gray-500 text-center max-w-md">
            Start your tutoring session to see equations, worked examples, and key concepts appear here
          </p>
        </div>
      )}
    </div>
  );
}