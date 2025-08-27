'use client';

import { useState } from 'react';
import { Button } from './ui/button';
import { createSpeechSession } from '../lib/api/speechSession';

export default function SpeechButton() {
    const [isActive, setIsActive] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const handleSpeechStart = async () => {
        if (isActive || isLoading) return;
        
        try {
            setIsLoading(true);
            console.log('🎤 Starting speech session...');
            const token = await createSpeechSession();
            console.log('✅ Speech session active with token:', token);
            setIsActive(true);
        } catch (error) {
            console.error('❌ Speech session failed:', error);
            setIsActive(false);
        } finally {
            setIsLoading(false);
        }
    };

    const handleStopSession = () => {
        setIsActive(false);
            console.log('🛑 Speech session stopped');
    };

    if (isActive) {
        return (
            <Button 
                onClick={handleStopSession}
                variant="destructive"
                size="lg"
                className="min-w-[120px]"
            >
                Stop
            </Button>
        );
    }

    return (
        <Button 
            onClick={handleSpeechStart}
            disabled={isLoading}
            size="lg"
            className="min-w-[120px]"
        >
            {isLoading ? 'Starting...' : 'Speech'}
        </Button>
    );
}