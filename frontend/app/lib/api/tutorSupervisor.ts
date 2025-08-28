const API_URL = process.env.BACKEND_API_URL || "http://localhost:8000";

export async function callSupervisor(relevantContextFromLastUserMessage: string, conversationHistory: any[]){
    const response = await fetch(`${API_URL}/api/v1/tutor-supervisor`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            relevantContextFromLastUserMessage,
            conversationHistory
        })
    });

    if (!response.ok) {
        console.warn('Tutor supervisor returned an error:', response);
        return { error: 'Something went wrong.' };
    }
    return await response.json()
}
