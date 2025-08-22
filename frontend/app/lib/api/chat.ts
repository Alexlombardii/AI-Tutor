import { ChatMessage, ChatResponse } from "../types/chat";

const API_URL = "http://localhost:8000/api/v1/chat";

export const chat = async (userMessage: ChatMessage): Promise<ChatResponse> => {
    const response = await fetch(API_URL, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(userMessage),
    });
    return response.json();
};