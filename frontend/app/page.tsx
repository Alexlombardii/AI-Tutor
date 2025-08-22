'use client';

import { useState } from 'react';
import { chat } from './lib/api/chat';
import Message from './components/Message';
import ChatInput from './components/Chatbox';

export default function ChatPage() {
  const [inputMessage, setInputMessage] = useState('');
  const [messages, setMessages] = useState<Array<{content: string, isUser: boolean}>>([]);
  const [isLoading, setIsLoading] = useState(false);

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
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <div className="bg-white border-b px-4 py-6">
        <h1 className="text-2xl font-bold text-gray-800 text-center">AI Chat Assistant</h1>
      </div>
  
      {/* Messages - centered container */}
      <div className="flex-1 flex justify-center">
        <div className="w-full max-w-2xl px-4 pb-32 pt-6 overflow-y-auto">
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
  
      {/* Input - centered */}
      <div className="flex justify-center">
        <div className="w-full max-w-2xl px-4">
          <ChatInput
            value={inputMessage}
            onChange={setInputMessage}
            onSend={handleSendMessage}
            disabled={isLoading}
          />
        </div>
      </div>
    </div>
  );
}  