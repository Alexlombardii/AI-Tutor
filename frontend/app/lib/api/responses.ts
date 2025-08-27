// import { ChatMessage, ChatResponse } from "../types/chat";

// const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

// export const chat = async (userMessage: ChatMessage): Promise<ChatResponse> => {
//     const response = await fetch(`${API_URL}/api/v1/responses`, {
//         method: "POST",
//         headers: {
//             "Content-Type": "application/json",
//         },
//         body: JSON.stringify(userMessage),
//     });
//     return response.json();
// };