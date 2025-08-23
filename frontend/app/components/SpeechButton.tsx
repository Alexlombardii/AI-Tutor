'use client';

import { useState } from 'react';
import { createSpeechSession } from '../lib/api/speechSession';

export default function SpeechButton() {
    const [isActive, setIsActive] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const handleSpeechStart = async () => {
        if (isActive || isLoading) return; // Prevent multiple clicks
        
        try {
            setIsLoading(true);
            console.log('🎤 Starting speech session...');
            const token = await createSpeechSession();
            console.log('✅ Speech session active with token:', token);
            setIsActive(true);
        } catch (error) {
            console.error('❌ Speech session failed:', error);
            // Reset on error so user can try again
            setIsActive(false);
        } finally {
            setIsLoading(false);
        }
    };

    const handleStopSession = () => {
        setIsActive(false);
        console.log('🛑 Speech session stopped');
        // Here you could also call an API to properly end the session
    };

    if (isActive) {
        return (
            <button 
                onClick={handleStopSession}
                className="bg-red-500 hover:bg-red-600 text-white px-4 py-2.5 rounded-lg font-medium shadow-lg hover:shadow-xl transition-all duration-200 flex items-center gap-2 min-w-[120px] justify-center"
            >
                🛑 Stop
            </button>
        );
    }

    return (
        <button 
            onClick={handleSpeechStart}
            disabled={isLoading}
            className={`${
                isLoading 
                    ? 'bg-gray-400 cursor-not-allowed' 
                    : 'bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700'
            } text-white px-4 py-2.5 rounded-lg font-medium shadow-lg hover:shadow-xl transition-all duration-200 flex items-center gap-2 min-w-[120px] justify-center`}
        >
            {isLoading ? '⏳ Starting...' : '🎤 Speech'}
        </button>
    );
}