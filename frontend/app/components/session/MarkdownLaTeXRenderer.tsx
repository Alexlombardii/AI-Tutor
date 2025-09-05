'use client';
import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';
import rehypeRaw from 'rehype-raw';
import rehypeKatex from 'rehype-katex';

interface MarkdownLaTeXRendererProps {
  content: string;
}

const MarkdownLaTeXRenderer: React.FC<MarkdownLaTeXRendererProps> = ({ content }) => {
  // Simpler replacement - just like your original
  const processedText = content 
    .replace(/\\\[/g, '$$')  // Block math
    .replace(/\\\]/g, '$$') 
    .replace(/\\\(/g, '$')   // Inline math  
    .replace(/\\\)/g, '$');

  return (
    <ReactMarkdown
      children={processedText}
      remarkPlugins={[remarkGfm, remarkMath]}
      rehypePlugins={[rehypeRaw, rehypeKatex]}
    />
  );
};

export default MarkdownLaTeXRenderer;