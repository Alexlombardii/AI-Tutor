from agents import function_tool, Agent
import requests
import os
from .sample_data import exampleAccountInfo, examplePolicyDocs, exampleStoreLocations


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
    {
        "type": "function",
        "name": "lookupPolicyDocument",
        "description": "Tool to look up internal documents and policies by topic or keyword.",
        "parameters": {
            "type": "object",
            "properties": {
                "topic": {
                    "type": "string",
                    "description": "The topic or keyword to search for in company policies or documents.",
                },
            },
            "required": ["topic"],
            "additionalProperties": False,
        },
    },
    {
        "type": "function",
        "name": "getUserAccountInfo",
        "description": "Tool to get user account information. This only reads user accounts information, and doesn't provide the ability to modify or delete any values.",
        "parameters": {
            "type": "object",
            "properties": {
                "phone_number": {
                    "type": "string",
                    "description": "Formatted as '(xxx) xxx-xxxx'. MUST be provided by the user, never a null or empty string.",
                },
            },
            "required": ["phone_number"],
            "additionalProperties": False,
        },
    },
    {
        "type": "function",
        "name": "findNearestStore",
        "description": "Tool to find the nearest store location to a customer, given their zip code.",
        "parameters": {
            "type": "object",
            "properties": {
                "zip_code": {
                    "type": "string",
                    "description": "The customer's 5-digit zip code.",
                },
            },
            "required": ["zip_code"],
            "additionalProperties": False,
        },
    },
    {
        "type": "function",
        "name": "update_session_state",
        "description": "Update the tutoring session state based on conversation progress",
        "parameters": {
            "type": "object",
            "properties": {
                "conversation_context": {
                    "type": "string",
                    "description": "The context of the conversation so far",
                },
                "recent_exchange": {
                    "type": "string",
                    "description": "The most recent exchange between tutor and student",
                }
            },
            "required": ["conversation_context", "recent_exchange"],
            "additionalProperties": False,
        },
    },
]

# State management (keep your existing state logic)
state = {
    "start": {
        "student explanation": False,
        "brief introduction_from_agent": False,
    },
    "middle": {
        "Showed worked example": False,
        "Student worked on question": False,
    },
    "end": {
        "Student explained their post session thought on topic": False
    },
    "current_focus": ''
}

state_manager_agent = Agent(
    name="state_manager_agent",
    model='gpt-4.1',
    instructions="""You are tasked with looking at a tutor session's backwards and forwards
    discussion between a tutor and their student. Your goal is to update the state of where the
    student is in their tutor session when they hit specific milestones. There are 3 states: 
    start, middle and end, in which each one has jobs that need to be ticked off and the session
    can't proceed until all jobs in the state are completed, obviously the flow is start->middle->end.
    
    The full state tracker that you will be updating is the following:
    
    state = {
        start: {
            "student explanation": False,
            "brief introduction_from_agent": False,
        }
        middle: {
            "Showed worked example": False,
            "Student worked on question": False,
        }
        end: {
            "Student explained their post session thought on topic": False
        }
    }    

    Simply just update from false to True if it appears the student or teacher has met the requirements
    for the given job and state. The one entry is for the current focus as you will also be guiding the
    tutor on what to focus on explaining for the next part of the session.
"""
)

@function_tool
def update_session_state(conversation_context: str, recent_exchange: str):
    """Update the tutoring session state based on conversation."""
    
    result = state_manager_agent.run(
        f"""
        Current State: {state}
        
        Conversation Context: {conversation_context}
        
        Recent Exchange: {recent_exchange}
        
        Please update the state and tell me what the tutor should focus on next.
        """
    )
    
    return result

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
    # elif f_name == "update_session_state":
    #     conversation_context = args.get("conversation_context", "") if args else ""
    #     recent_exchange = args.get("recent_exchange", "") if args else ""
    #     return update_session_state(conversation_context, recent_exchange)
    else:
        return {"result": True}


