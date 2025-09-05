from .prompt import state_agent_instructions
from pydantic import BaseModel
from typing import Literal
from openai import OpenAI
from dotenv import load_dotenv
import os

load_dotenv()


# Initialize OpenAI client
openai = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

state_tool_json =   {
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
}

class StartPhase(BaseModel):
    student_baseline_explanation: bool
    agent_first_intuitive_introduction: bool
    equation_for_relevant_topic: bool
    important_tricks_and_things_to_look_out_for_in_topic: bool
    agent_intuitive_introduction_related_back_to_equation_and_tricks: bool

class MiddlePhase(BaseModel):
    worked_example_explained: bool
    student_attempted_practice: bool
    workings_scanned_and_reviewed: bool
    difficulty_progression_managed: bool
    step_by_step_feedback_given: bool

class EndPhase(BaseModel):
    student_explained_final_understanding: bool
    grade_assessment_provided: bool
    homework_suggestions_given: bool

class SessionState(BaseModel):
    start: StartPhase
    middle: MiddlePhase
    end: EndPhase

class StateAnalysis(BaseModel):
    updated_state: SessionState
    current_phase: Literal["start", "middle", "end"]
    guidance: str  # Strategic guidance for supervisor
    next_focus: str  # What tutor should focus on next
    milestone_completed: bool  # Whether a job was just completed
    current_difficulty_level: Literal["easy", "medium", "hard"]
    student_confidence_level: Literal["struggling", "developing", "confident"]

def analyze_session_state(conversation_history, current_state):
    """Direct call to ChatGPT with structured output."""

    response = openai.beta.chat.completions.parse(
        model="o4-mini-2025-04-16",
        messages=[
            {"role": "system", "content": state_agent_instructions},
            {"role": "user", "content": f"Current State: {current_state}\nConversation: {conversation_history}"}
        ],
        response_format=StateAnalysis
    )

    return response.choices[0].message.parsed


# State management tracker
state = {
    "start": {
        "student_baseline_explanation": False,
        "agent_first_intuitive_introduction": False,
        "equation_for_relevant_topic": False,
        "important_tricks_and_things_to_look_out_for_in_topic": False,
        "agent_intuitive_introduction_related_back_to_equation_and_tricks": False,
    },
    "middle": {
        "worked_example_explained": False,
        "student_attempted_practice": False,
        "workings_scanned_and_reviewed": False,
        "difficulty_progression_managed": False,
        "step_by_step_feedback_given": False,
    },
    "end": {
        "student_explained_final_understanding": False,
        "grade_assessment_provided": False,
        "homework_suggestions_given": False,
    },
    "current_focus": '',
    "current_difficulty_level": "easy",
    "student_confidence_level": "developing"
}