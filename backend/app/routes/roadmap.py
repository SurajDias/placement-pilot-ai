from typing import List

from fastapi import APIRouter
from pydantic import BaseModel, Field

from app.services.roadmap_service import generate_roadmap

router = APIRouter(prefix="/api/roadmap", tags=["Roadmap"])


class GenerateRoadmapRequest(BaseModel):
    target_role: str = "Software Engineer"
    overall_score: int = Field(ge=0, le=100)
    missing_skills: List[str] = Field(default_factory=list)


@router.post("/generate")
def generate_preparation_roadmap(request: GenerateRoadmapRequest):
    return generate_roadmap(
        request.target_role,
        request.overall_score,
        request.missing_skills,
    )
