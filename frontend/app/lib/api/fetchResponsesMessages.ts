const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export async function fetchResponsesMessage(body: any) {
    const response = await fetch(`${API_URL}/api/v1/responses`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      // Preserve the previous behaviour of forcing sequential tool calls.
      body: JSON.stringify({ ...body, parallel_tool_calls: false }),
    });
  
    if (!response.ok) {
      console.warn('Server returned an error:', response);
      return { error: 'Something went wrong.' };
    }
  
    const completion = await response.json();
    return completion;
  }