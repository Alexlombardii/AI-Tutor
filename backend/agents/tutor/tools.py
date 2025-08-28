tutorAgentTools = [
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
]