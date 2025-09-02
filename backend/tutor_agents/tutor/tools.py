from agents import function_tool, Agent
import requests
import os


# Tool definitions (JSON schemas) - ESSENTIAL for OpenAI API
tutorAgentTools = [
    {
        "type": "function",
        "name": "lookup_topic_RAG", 
        "description": "Search the A-level mathematics textbook for content. Provide detailed context about what specific information is needed to be found fromt the textbook like equations relating to the topic and then some examples of worked questions",
        "parameters": {
            "type": "object",
            "properties": {
                "context": {
                    "type": "string",
                    "description": "Search context for textbook lookup",
                },
            },
            "required": ["context"],
            "additionalProperties": False,
        },
    },
]

# Simple RAG function
def rag_tool(context):
    """Simple RAG tool - search Ragie and return results"""
    
    url = "https://api.ragie.ai/retrievals"
    
    headers = {
        "accept": "application/json",
        "content-type": "application/json",
        "Authorization": f"Bearer {os.environ.get('RAGIE_API_KEY')}"
    }
    
    body = {
        "query": context,
        "top_k": 3
    }
    
    response = requests.post(url, headers=headers, json=body)
    
    if response.status_code == 200:
        return response.json()
    else:
        return {"error": f"Failed to fetch: {response.status_code}"}

# Tool execution mapping - ADD BACK ALL THE OLD ONES
def get_tool_response(f_name: str, args: dict = None):
    if f_name == "getUserAccountInfo":
        return exampleAccountInfo
    elif f_name == "lookupPolicyDocument":
        return examplePolicyDocs
    elif f_name == "findNearestStore":
        return exampleStoreLocations
    elif f_name == "lookup_topic_RAG":  
        context = args.get("context", "") if args else ""
        return rag_tool(context)
    else:
        return {"result": True}


