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
import { WorkspaceView } from '../components/workspace/workspaceView';
import { VideosView } from '../components/videos/videosView';
import { SessionView } from '../components/session/sessionView'

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

// Hooks, API calls
import { useRealtimeSession } from '../hooks/useRealtimeSession';
import { TranscriptProvider, useTranscript } from '../contexts/transcriptContext';
import { createSpeechSession } from '../lib/api/speechSession';

// Create the inner component that uses the hooks
function ChatPageContent() {
  const { isSignedIn, isLoaded } = useAuth();
  const router = useRouter();

  // ✅ ALL hooks must come first, before any conditional returns
  const [currentView, setCurrentView] = useState('chat');
  const [sessionStatus, setSessionStatus] = useState<SessionStatus>("DISCONNECTED");
  
  // ✅ Add debug mode state
  const [debugMode, setDebugMode] = useState(false);

  // ✅ Fix: Add callbacks to useRealtimeSession
  const { status, connect, disconnect } = useRealtimeSession({
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

  // ✅ Fix: Update connect function to match new signature
  const handleConnect = async () => {
    if (!audioElementRef.current) {
      console.error('Audio element not available');
      return;
    }

    try {
      await connect({
        getEphemeralKey: createSpeechSession, // This returns the ephemeral key
        initialAgents: chatSupervisorScenario,
        audioElement: audioElementRef.current,
        extraContext: {
          // Add any extra context you need
        },
        outputGuardrails: [] // Add guardrails if needed
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
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem className="hidden md:block">
                  <BreadcrumbLink href="#">
                    Current Session
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator className="hidden md:block" />
                <BreadcrumbItem>
                  <BreadcrumbPage>Chat Interface</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>
        </header>
        <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
          {/* Top 3 cards */}
          <div className="grid auto-rows-min gap-4 md:grid-cols-3">
            <div 
              onClick={() => setCurrentView('chat')}
              className={`aspect-video rounded-xl p-6 flex flex-col items-center justify-center cursor-pointer transition-colors ${
                currentView === 'chat' 
                  ? 'bg-blue-50 border-2 border-blue-200' 
                  : 'bg-muted/50 hover:bg-muted/70'
              }`}
            >
              <div className="text-4xl mb-2">💬</div>
              <h3 className="text-lg font-semibold text-gray-800 mb-2">Tutor Session</h3>
              <p className="text-sm text-gray-600 text-center">Your personal tutor and session notes</p>
            </div>
            <div 
              onClick={() => setCurrentView('workspace')}
              className={`aspect-video rounded-xl p-6 flex flex-col items-center justify-center cursor-pointer transition-colors ${
                currentView === 'workspace' 
                  ? 'bg-blue-50 border-2 border-blue-200' 
                  : 'bg-muted/50 hover:bg-muted/70'
              }`}
            > 
              <div className="text-4xl mb-2">📝</div>
              <h3 className="text-lg font-semibold text-gray-800 mb-2">Workspace</h3>
              <p className="text-sm text-gray-600 text-center">Work through problems together</p>
            </div>
            <div 
              onClick={() => setCurrentView('videos')}
              className={`aspect-video rounded-xl p-6 flex flex-col items-center justify-center cursor-pointer transition-colors ${
                currentView === 'videos' 
                  ? 'bg-blue-50 border-2 border-blue-200' 
                  : 'bg-muted/50 hover:bg-muted/70'
              }`}
            >
              <div className="text-4xl mb-2">🎥</div>
              <h3 className="text-lg font-semibold text-gray-800 mb-2">Videos</h3>
              <p className="text-sm text-gray-600 text-center">Educational video content and tutorials</p>
            </div>
          </div>
          
          {/* Main Content Area */}
          {currentView === 'workspace' && <WorkspaceView />}
          {currentView === 'videos' && <VideosView />}
          
          {currentView === 'chat' && (
            <>
              {/* ✅ Always show SessionView in normal mode */}
              {!debugMode && <SessionView />}
              
              {/* ✅ Only show debug interface when debug mode is active */}
              {debugMode && (
                <div className="bg-white rounded-xl border p-6 flex-1 flex flex-col">
                  {/* Debug indicator */}
                  <div className="mb-4 p-2 bg-red-100 border border-red-300 rounded-lg">
                    <span className="text-red-700 text-sm font-mono">🐛 DEBUG MODE - Cmd+Shift+1 to toggle</span>
                  </div>
                  
                  {/* Voice connection controls */}
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
                  
                  <h1 className="text-2xl font-bold text-gray-800 text-center mb-6">Session on 'Differentiation'</h1>
                  
                  {/* Transcript */}
                  <div className="flex-1 mb-6">
                    <Transcript 
                      userText={userText}
                      setUserText={setUserText}
                      onSendMessage={handleSendMessage}
                      canSend={status === 'CONNECTED'}
                      downloadRecording={downloadRecording}
                    />
                  </div>
                  
                  {/* Hidden audio element */}
                  <audio ref={audioElementRef} autoPlay style={{ display: 'none' }} />
                </div>
              )}
            </>
          )}
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