from typing import Annotated

from fastapi import APIRouter, File, Form, HTTPException, UploadFile, status

from app.services.resume_service import (
    ResumeAnalysisError,
    analyze_resume,
    get_supported_roles,
)
from app.utils.validators import FileValidationError, validate_pdf_upload


router = APIRouter(prefix="/api/resume", tags=["resume"])


@router.post("/analyze")
async def analyze_uploaded_resume(
    file: Annotated[UploadFile, File(description="PDF resume upload")],
    target_role: Annotated[str, Form(description="Target role for deterministic analysis")],
):
    if not target_role or not target_role.strip():
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="target_role is required.",
        )

    try:
        pdf_content = await validate_pdf_upload(file)
        return analyze_resume(pdf_content=pdf_content, target_role=target_role)
    except FileValidationError as exc:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(exc),
        ) from exc
    except ResumeAnalysisError as exc:
        status_code = (
            status.HTTP_400_BAD_REQUEST
            if str(exc).startswith("Unsupported target role")
            else status.HTTP_422_UNPROCESSABLE_ENTITY
        )
        raise HTTPException(
            status_code=status_code,
            detail=str(exc),
            headers={"X-Supported-Roles": ", ".join(get_supported_roles())}
            if status_code == status.HTTP_400_BAD_REQUEST
            else None,
        ) from exc
