import { ChatMessage, ChatResponse } from "../types/chat";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export const createSpeechSession = async () => {
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

    // Create a peer connection
    const pc = new RTCPeerConnection();

    // Set up to play remote audio from the model
    const audioEl = document.createElement("audio");
    audioEl.autoplay = true;
    pc.ontrack = e => audioEl.srcObject = e.streams[0];

    // Add local audio track for microphone input in the browser
    const ms = await navigator.mediaDevices.getUserMedia({
        audio: true
    });
    pc.addTrack(ms.getTracks()[0]);

    // Set up data channel for sending and receiving events
    const dc = pc.createDataChannel("oai-events");
    dc.addEventListener("message", (e) => {
        // Realtime server events appear here!
        console.log(e);
    });

    // Start the session using the Session Description Protocol (SDP)
    const offer = await pc.createOffer();
    await pc.setLocalDescription(offer);

    const baseUrl = "https://api.openai.com/v1/realtime";
    const model = "gpt-4o-realtime-preview-2025-06-03";
    const sdpResponse = await fetch(`${baseUrl}?model=${model}`, {
        method: "POST",
        body: offer.sdp,
        headers: {
            Authorization: `Bearer ${EPHEMERAL_KEY}`,
            "Content-Type": "application/sdp"
        },
    });

    const answer: RTCSessionDescriptionInit = {
        type: "answer" as RTCSdpType,
        sdp: await sdpResponse.text(),
    };
    await pc.setRemoteDescription(answer);
    
    return EPHEMERAL_KEY;
}


