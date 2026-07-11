from typing import List

from fastapi import APIRouter
from pydantic import BaseModel, Field

from app.services.interview_service import evaluate_answer, generate_questions

router = APIRouter(prefix="/api/interview", tags=["Interview"])


class GenerateInterviewRequest(BaseModel):
    detected_skills: List[str] = Field(default_factory=list)
    target_role: str = ""


class EvaluateInterviewRequest(BaseModel):
    question: str
    answer: str


@router.post("/generate")
def generate_interview(request: GenerateInterviewRequest):
    return generate_questions(request.detected_skills, request.target_role)


@router.post("/evaluate")
def evaluate_interview(request: EvaluateInterviewRequest):
    return evaluate_answer(request.question, request.answer)
