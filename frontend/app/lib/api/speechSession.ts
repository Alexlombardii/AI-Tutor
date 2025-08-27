const API_URL = process.env.BACKEND_API_URL || "http://localhost:8000";

export const createSpeechSession = async (): Promise<string> => {
    const tokenResponse = await fetch(`${API_URL}/api/v1/speech_session`, {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
        },
    });
    console.log(' Response status:', tokenResponse.status);
    
    const data = await tokenResponse.json();
    console.log('📋 Response data:', data);
    
    const EPHEMERAL_KEY = data.client_secret.value;
    console.log('🔑 Ephemeral key:', EPHEMERAL_KEY);
    
    return EPHEMERAL_KEY;
}


