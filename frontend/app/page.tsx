'use client';

import { useState } from 'react';
import { chat } from './lib/api/chat';
import Message from './components/Message';
import ChatInput from './components/Chatbox';
import SpeechButton from './components/SpeechButton';
import { AppSidebar } from './components/app-sidebar';
import {
  SidebarInset,
  SidebarProvider,
} from './components/ui/sidebar';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from './components/ui/breadcrumb';
import { Separator } from './components/ui/separator';
import {
  SidebarTrigger,
} from './components/ui/sidebar';
import { WorkspaceView } from './components/workspace/workspaceView';
import { VideosView } from './components/videos/videosView';

export default function ChatPage() {
  const [inputMessage, setInputMessage] = useState('');
  const [messages, setMessages] = useState<Array<{content: string, isUser: boolean}>>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [currentView, setCurrentView] = useState('chat');

  const handleSendMessage = async () => {
    if (!inputMessage.trim()) return;
    
    // Add user message
    const userMessage = { content: inputMessage, isUser: true };
    setMessages(prev => [...prev, userMessage]);
    
    setIsLoading(true);
    try {
      const response = await chat({ message: inputMessage });
      
      // Add AI response
      const aiMessage = { content: response.response, isUser: false };
      setMessages(prev => [...prev, aiMessage]);
      setInputMessage('');
    } catch (error) {
      console.error('Failed to send message:', error);
    } finally {
      setIsLoading(false);
    }
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
          {/* Top 3 cards - keeping them free for future use */}
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
          
          {/* Main Content Area - Dynamic based on currentView */}
          {currentView === 'workspace' && <WorkspaceView />}
          {currentView === 'videos' && <VideosView />}
          
          {currentView === 'chat' && (
            <div className="bg-white rounded-xl border p-6 flex-1 flex flex-col">
              <h1 className="text-2xl font-bold text-gray-800 text-center mb-6">Session on 'Differentiation'</h1>
              
              {/* Messages */}
              <div className="flex-1 flex justify-center mb-6 overflow-y-auto max-h-96">
                <div className="w-full max-w-2xl">
                  {messages.map((message, index) => (
                    <Message 
                      key={index}
                      content={message.content}
                      isUser={message.isUser}
                    />
                  ))}
                  
                  {isLoading && (
                    <div className="flex justify-start mb-4">
                      <div className="bg-gray-200 text-gray-800 px-4 py-2 rounded-lg rounded-bl-none">
                        <div className="flex space-x-1">
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
              
              {/* Input - moved to bottom */}
              <div className="mt-auto">
                <div className="flex justify-center">
                  <div className="w-full max-w-4xl">
                    <div className="flex items-center gap-4">
                      <SpeechButton />
                      <ChatInput
                        value={inputMessage}
                        onChange={setInputMessage}
                        onSend={handleSendMessage}
                        disabled={isLoading}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}  