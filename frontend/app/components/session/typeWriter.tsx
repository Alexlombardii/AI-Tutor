'use client';
import React, { useState, useEffect, useRef } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';
import rehypeRaw from 'rehype-raw';
import rehypeKatex from 'rehype-katex';

interface TypeWriterProps {
  content: string;
  speed?: number; // milliseconds per character
  onComplete?: () => void;
  className?: string;
}

interface TextSegment {
  type: 'text' | 'latex';
  content: string;
  isComplete: boolean;
}

const TypeWriter: React.FC<TypeWriterProps> = ({ 
  content, 
  speed = 75, 
  onComplete,
  className = ""
}) => {
  const [displayedContent, setDisplayedContent] = useState('');
  const [segments, setSegments] = useState<TextSegment[]>([]);
  const [currentSegmentIndex, setCurrentSegmentIndex] = useState(0);
  const [isTyping, setIsTyping] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Parse content into segments (text and LaTeX)
  const parseContent = (text: string): TextSegment[] => {
    const segments: TextSegment[] = [];
    let currentText = '';
    let i = 0;

    while (i < text.length) {
      // Check for LaTeX block math \[...\]
      if (text.slice(i, i + 2) === '\\[') {
        if (currentText) {
          segments.push({ type: 'text', content: currentText, isComplete: false });
          currentText = '';
        }
        
        const endIndex = text.indexOf('\\]', i);
        if (endIndex !== -1) {
          const latexContent = text.slice(i, endIndex + 2);
          segments.push({ type: 'latex', content: latexContent, isComplete: true });
          i = endIndex + 2;
        } else {
          currentText += text[i];
          i++;
        }
      }
      // Check for LaTeX inline math \(...\)
      else if (text.slice(i, i + 2) === '\\(') {
        if (currentText) {
          segments.push({ type: 'text', content: currentText, isComplete: false });
          currentText = '';
        }
        
        const endIndex = text.indexOf('\\)', i);
        if (endIndex !== -1) {
          const latexContent = text.slice(i, endIndex + 2);
          segments.push({ type: 'latex', content: latexContent, isComplete: true });
          i = endIndex + 2;
        } else {
          currentText += text[i];
          i++;
        }
      }
      // Check for markdown math $$...$$
      else if (text.slice(i, i + 2) === '$$') {
        if (currentText) {
          segments.push({ type: 'text', content: currentText, isComplete: false });
          currentText = '';
        }
        
        const endIndex = text.indexOf('$$', i + 2);
        if (endIndex !== -1) {
          const latexContent = text.slice(i, endIndex + 2);
          segments.push({ type: 'latex', content: latexContent, isComplete: true });
          i = endIndex + 2;
        } else {
          currentText += text[i];
          i++;
        }
      }
      // Check for markdown inline math $...$
      else if (text[i] === '$' && i > 0 && text[i-1] !== '\\') {
        if (currentText) {
          segments.push({ type: 'text', content: currentText, isComplete: false });
          currentText = '';
        }
        
        const endIndex = text.indexOf('$', i + 1);
        if (endIndex !== -1) {
          const latexContent = text.slice(i, endIndex + 1);
          segments.push({ type: 'latex', content: latexContent, isComplete: true });
          i = endIndex + 1;
        } else {
          currentText += text[i];
          i++;
        }
      }
      else {
        currentText += text[i];
        i++;
      }
    }

    if (currentText) {
      segments.push({ type: 'text', content: currentText, isComplete: false });
    }

    return segments;
  };

  // Start typing effect
  const startTyping = () => {
    if (isTyping) return;
    
    setIsTyping(true);
    setCurrentSegmentIndex(0);
    setDisplayedContent('');
    
    const parsedSegments = parseContent(content);
    setSegments(parsedSegments);
    
    if (parsedSegments.length === 0) {
      setIsTyping(false);
      onComplete?.();
      return;
    }

    typeNextSegment(parsedSegments, 0);
  };

  // Type the next segment
  const typeNextSegment = (segments: TextSegment[], segmentIndex: number) => {
    if (segmentIndex >= segments.length) {
      setIsTyping(false);
      onComplete?.();
      return;
    }

    const segment = segments[segmentIndex];
    
    if (segment.type === 'latex') {
      // For LaTeX, add it immediately and move to next segment
      setDisplayedContent(prev => prev + segment.content);
      setCurrentSegmentIndex(segmentIndex + 1);
      
      timeoutRef.current = setTimeout(() => {
        typeNextSegment(segments, segmentIndex + 1);
      }, speed * 2); // Slightly longer pause for LaTeX
    } else {
      // For text, type character by character
      typeTextSegment(segments, segmentIndex, 0);
    }
  };

  // Type a text segment character by character
  const typeTextSegment = (segments: TextSegment[], segmentIndex: number, charIndex: number) => {
    const segment = segments[segmentIndex];
    
    if (charIndex >= segment.content.length) {
      // Move to next segment
      setCurrentSegmentIndex(segmentIndex + 1);
      timeoutRef.current = setTimeout(() => {
        typeNextSegment(segments, segmentIndex + 1);
      }, speed * 3); // Pause between segments
      return;
    }

    setDisplayedContent(prev => prev + segment.content[charIndex]);
    
    timeoutRef.current = setTimeout(() => {
      typeTextSegment(segments, segmentIndex, charIndex + 1);
    }, speed);
  };

  // Process content for rendering (convert LaTeX syntax)
  const processContent = (text: string) => {
    return text
      .replace(/\\\[/g, '$$')  // Block math
      .replace(/\\\]/g, '$$') 
      .replace(/\\\(/g, '$')   // Inline math  
      .replace(/\\\)/g, '$');
  };

  // Start typing when content changes
  useEffect(() => {
    if (content) {
      startTyping();
    }
    
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [content]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return (
    <div className={className}>
      <ReactMarkdown
        children={processContent(displayedContent)}
        remarkPlugins={[remarkGfm, remarkMath]}
        rehypePlugins={[rehypeRaw, rehypeKatex]}
      />
      {isTyping && (
        <span className="animate-pulse text-blue-500">|</span>
      )}
    </div>
  );
};

export default TypeWriter;