'use client';
import React, { useEffect, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import { v4 as uuidv4 } from "uuid";
import { useRouter } from 'next/navigation'

// Clerk imports
import { useAuth } from '@clerk/nextjs'
import { SignedIn, SignedOut, UserButton, SignInButton, SignUpButton } from '@clerk/nextjs';

// UI Components
import Message from '../components/Message';
import Transcript from '../components/transcript';
import { AppSidebar } from '../components/app-sidebar';
import {SidebarInset, SidebarProvider} from '../components/ui/sidebar';
import { Separator } from '../components/ui/separator';
import {SidebarTrigger} from '../components/ui/sidebar';
import { SessionView } from '../components/session/sessionView'
import { TopicSelectionView } from '../components/topic-selection/topicSelectionView'

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '../components/ui/breadcrumb';

// Agent Configs
import { chatSupervisorScenario } from '../lib/agents';

// Types
import { SessionStatus } from '../lib/types';
import { Subtopic } from '../lib/types';

// Hooks, API calls
import { useRealtimeSession } from '../hooks/useRealtimeSession';
import { TranscriptProvider, useTranscript } from '../contexts/transcriptContext';
import { createSpeechSession } from '../lib/api/speechSession';

// Create the inner component that uses the hooks
function ChatPageContent() {
  const { isSignedIn, isLoaded } = useAuth();
  const router = useRouter();

  // Navigation state
  const [currentView, setCurrentView] = useState<'topic-selection' | 'session'>('topic-selection');
  const [selectedSubtopics, setSelectedSubtopics] = useState<Subtopic[]>([]);
  
  // Session state
  const [sessionStatus, setSessionStatus] = useState<SessionStatus>("DISCONNECTED");
  const [debugMode, setDebugMode] = useState(false);

  // ✅ Fix: Add callbacks to useRealtimeSession
  const { status, connect, disconnect, sendMessageToRealtime } = useRealtimeSession({
    onConnectionChange: (newStatus) => {
      setSessionStatus(newStatus);
      console.log('🔗 Connection status changed:', newStatus);
    }
  });

  const audioElementRef = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Check for Cmd+Shift+1 (Mac) or Ctrl+Shift+1 (Windows)
      if ((event.metaKey || event.ctrlKey) && event.shiftKey && event.key === '1') {
        event.preventDefault();
        setDebugMode(prev => !prev);
        console.log('Debug mode:', !debugMode ? 'ON' : 'OFF');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [debugMode]);

  useEffect(() => {
    if (isLoaded && !isSignedIn) {
      router.push('/');
    }
  }, [isLoaded, isSignedIn, router]);

  // Handle starting a session with selected topics
  const handleStartSession = (subtopics: Subtopic[]) => {
    setSelectedSubtopics(subtopics);
    setCurrentView('session');
  };

  // Handle going back to topic selection
  const handleBackToTopicSelection = () => {
    setCurrentView('topic-selection');
    setSelectedSubtopics([]);
  };

  // ✅ Fix: Update connect function to match new signature
  const handleConnect = async () => {
    if (!audioElementRef.current) {
      console.error('Audio element not available');
      return;
    }

    try {
      await connect({
        getEphemeralKey: createSpeechSession,
        initialAgents: chatSupervisorScenario,
        audioElement: audioElementRef.current,
        extraContext: {
          selectedSubtopics: selectedSubtopics.map(s => ({
            topicName: s.topicName,
            subtopicName: s.subtopicName,
            status: s.subtopicStatus,
            estimatedGrade: s.subtopicEstimatedGrade
          }))
        },
        outputGuardrails: []
      });
    } catch (error) {
      console.error('Failed to connect:', error);
    }
  };

  // Add these state variables at the top with your other state
  const [userText, setUserText] = useState<string>("");

  // Add this function for sending messages
  const handleSendMessage = () => {
    if (!userText.trim()) return;
    console.log('Sending message:', userText);
    setUserText("");
  };

  // Add this function for downloading
  const downloadRecording = () => {
    console.log('Download recording');
  };

  if (!isLoaded) {
    return <div>Loading...</div>;
  }

  if (!isSignedIn) {
    return null;
  }

  const renderBreadcrumbs = () => {
    return (
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem className="hidden md:block">
            <BreadcrumbLink href="#" onClick={handleBackToTopicSelection}>
              A-Level Maths
            </BreadcrumbLink>
          </BreadcrumbItem>
          {currentView === 'session' && (
            <>
              <BreadcrumbSeparator className="hidden md:block" />
              <BreadcrumbItem>
                <BreadcrumbPage>
                  Session ({selectedSubtopics.length} topics)
                </BreadcrumbPage>
              </BreadcrumbItem>
            </>
          )}
        </BreadcrumbList>
      </Breadcrumb>
    );
  };

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2">
          <div className="flex items-center gap-2 px-4">
            <SidebarTrigger className="-ml-1" />
            <Separator
              orientation="vertical"
              className="mr-2 data-[orientation=vertical]:h-4"
            />
            {renderBreadcrumbs()}
          </div>
        </header>
        <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
          
          {/* Topic Selection View */}
          {currentView === 'topic-selection' && (
            <TopicSelectionView onStartSession={handleStartSession} />
          )}

          {/* Session View */}
          {currentView === 'session' && (
            <>
              {/* Session Header with Selected Topics */}
              <div className="bg-white rounded-xl border p-4 mb-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-xl font-semibold text-gray-800 mb-2">
                      Tutoring Session
                    </h2>
                    <div className="flex flex-wrap gap-2">
                      {selectedSubtopics.map((subtopic, index) => (
                        <span 
                          key={index}
                          className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm"
                        >
                          {subtopic.topicName} - {subtopic.subtopicName}
                        </span>
                      ))}
                    </div>
                  </div>
                  <button
                    onClick={handleBackToTopicSelection}
                    className="px-4 py-2 text-sm bg-gray-100 text-gray-700 rounded hover:bg-gray-200"
                  >
                    Change Topics
                  </button>
                </div>
              </div>

              {!debugMode && (
                <SessionView 
                  sendMessageToRealtime={sendMessageToRealtime} 
                  onStartSession={handleConnect}
                  isConnected={status === 'CONNECTED'}
                />
              )}
              
              {/* Debug Mode */}
              {debugMode && (
                <div className="bg-white rounded-xl border p-6 flex-1 flex flex-col">
                  <div className="mb-4 p-2 bg-red-100 border border-red-300 rounded-lg">
                    <span className="text-red-700 text-sm font-mono">🐛 DEBUG MODE - Cmd+Shift+1 to toggle</span>
                  </div>
                  
                  <div className="mb-6 p-4 bg-blue-50 rounded-lg border">
                    <h3 className="font-bold mb-2">Voice Connection Test</h3>
                    <div className="flex gap-2 mb-2">
                      <button 
                        onClick={handleConnect}
                        disabled={status === 'CONNECTING' || status === 'CONNECTED'}
                        className="px-4 py-2 bg-green-500 text-white rounded disabled:bg-gray-300"
                      >
                        Connect Voice
                      </button>
                      <button 
                        onClick={() => disconnect()}
                        disabled={status === 'DISCONNECTED'}
                        className="px-4 py-2 bg-red-500 text-white rounded disabled:bg-gray-300"
                      >
                        Disconnect Voice
                      </button>
                    </div>
                    <div className="text-sm">
                      Status: <span className="font-mono">{status}</span>
                    </div>
                  </div>
                  
                  <h1 className="text-2xl font-bold text-gray-800 text-center mb-6">
                    Session on Selected Topics
                  </h1>
                  
                  <div className="flex-1 mb-6">
                    <Transcript 
                      userText={userText}
                      setUserText={setUserText}
                      onSendMessage={handleSendMessage}
                      canSend={status === 'CONNECTED'}
                      downloadRecording={downloadRecording}
                    />
                  </div>
                </div>
              )}
            </>
          )}
          
          {/* Audio element - always present */}
          <audio ref={audioElementRef} autoPlay style={{ display: 'none' }} />
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}

// Wrap the entire component with TranscriptProvider
export default function ChatPage() {
  return (
    <TranscriptProvider>
      <ChatPageContent />
    </TranscriptProvider>
  );
}