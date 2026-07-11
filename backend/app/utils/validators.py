from fastapi import UploadFile


MAX_RESUME_SIZE_BYTES = 5 * 1024 * 1024
PDF_CONTENT_TYPES = {"application/pdf", "application/x-pdf"}


class FileValidationError(ValueError):
    """Raised when an uploaded resume file is invalid."""


async def validate_pdf_upload(file: UploadFile) -> bytes:
    if file is None:
        raise FileValidationError("A PDF resume file is required.")

    filename = (file.filename or "").strip()
    if not filename:
        raise FileValidationError("Uploaded file must have a filename.")

    if not filename.lower().endswith(".pdf"):
        raise FileValidationError("Only PDF files are supported.")

    if file.content_type and file.content_type.lower() not in PDF_CONTENT_TYPES:
        raise FileValidationError("Uploaded file must be a PDF.")

    content = await file.read()
    await file.seek(0)

    if not content:
        raise FileValidationError("Uploaded PDF is empty.")

    if len(content) > MAX_RESUME_SIZE_BYTES:
        raise FileValidationError("Uploaded PDF must be 5 MB or smaller.")

    if not content.startswith(b"%PDF"):
        raise FileValidationError("Uploaded file is not a valid PDF.")

    return content
