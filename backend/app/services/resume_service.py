from __future__ import annotations

import re
from dataclasses import dataclass
from io import BytesIO
from typing import Any

from pypdf import PdfReader
from pypdf.errors import PdfReadError


class ResumeAnalysisError(ValueError):
    """Raised when a resume cannot be parsed or analyzed."""


@dataclass(frozen=True)
class SkillDefinition:
    name: str
    aliases: tuple[str, ...]


ROLE_SKILLS: dict[str, tuple[SkillDefinition, ...]] = {
    "Software Engineer": (
        SkillDefinition("Python", ("python",)),
        SkillDefinition("JavaScript", ("javascript", "js", "typescript", "ts")),
        SkillDefinition("Data Structures", ("data structures", "dsa", "algorithms")),
        SkillDefinition("APIs", ("api", "apis", "rest", "graphql")),
        SkillDefinition("Databases", ("sql", "database", "postgres", "mysql", "mongodb")),
        SkillDefinition("Git", ("git", "github", "gitlab")),
        SkillDefinition("Testing", ("unit test", "testing", "pytest", "jest")),
        SkillDefinition("System Design", ("system design", "architecture", "scalability")),
    ),
    "Java Developer": (
        SkillDefinition("Java", ("java", "core java")),
        SkillDefinition("Spring Boot", ("spring boot", "spring framework", "spring")),
        SkillDefinition("REST APIs", ("rest api", "restful", "api")),
        SkillDefinition("SQL", ("sql", "mysql", "postgres", "oracle")),
        SkillDefinition("Hibernate/JPA", ("hibernate", "jpa")),
        SkillDefinition("Maven/Gradle", ("maven", "gradle")),
        SkillDefinition("JUnit", ("junit", "mockito", "unit testing")),
        SkillDefinition("Microservices", ("microservices", "microservice")),
    ),
    "Data Analyst": (
        SkillDefinition("SQL", ("sql", "mysql", "postgres", "database")),
        SkillDefinition("Excel", ("excel", "spreadsheet", "pivot table")),
        SkillDefinition("Python", ("python", "pandas", "numpy")),
        SkillDefinition("Data Visualization", ("tableau", "power bi", "matplotlib", "seaborn")),
        SkillDefinition("Statistics", ("statistics", "statistical", "hypothesis testing")),
        SkillDefinition("Dashboards", ("dashboard", "dashboards", "reporting")),
        SkillDefinition("Data Cleaning", ("data cleaning", "etl", "data wrangling")),
        SkillDefinition("Business Analysis", ("business analysis", "kpi", "metrics")),
    ),
    "Cloud Engineer": (
        SkillDefinition("AWS/Azure/GCP", ("aws", "azure", "gcp", "google cloud")),
        SkillDefinition("Linux", ("linux", "unix", "shell")),
        SkillDefinition("Docker", ("docker", "container", "containers")),
        SkillDefinition("Kubernetes", ("kubernetes", "k8s")),
        SkillDefinition("Terraform", ("terraform", "infrastructure as code", "iac")),
        SkillDefinition("CI/CD", ("ci/cd", "cicd", "jenkins", "github actions")),
        SkillDefinition("Networking", ("networking", "vpc", "dns", "load balancer")),
        SkillDefinition("Monitoring", ("monitoring", "cloudwatch", "prometheus", "grafana")),
    ),
}


SECTION_SIGNALS = {
    "experience": ("experience", "employment", "work history", "internship"),
    "projects": ("projects", "project"),
    "education": ("education", "degree", "university", "college"),
    "achievements": ("achievement", "award", "certification", "certifications"),
}


def get_supported_roles() -> list[str]:
    return list(ROLE_SKILLS.keys())


def analyze_resume(pdf_content: bytes, target_role: str) -> dict[str, Any]:
    role = _normalize_target_role(target_role)
    text = _extract_pdf_text(pdf_content)
    normalized_text = _normalize_text(text)

    if not normalized_text:
        raise ResumeAnalysisError("No readable text was found in the uploaded PDF.")

    skills = ROLE_SKILLS[role]
    detected_skills = _detect_skills(normalized_text, skills)
    missing_skills = [skill.name for skill in skills if skill.name not in detected_skills]
    strengths = _build_strengths(normalized_text, detected_skills)
    improvement_areas = _build_improvement_areas(normalized_text, missing_skills)
    overall_score = _calculate_score(normalized_text, detected_skills, skills)

    return {
        "candidate_name": _detect_candidate_name(text),
        "target_role": role,
        "overall_score": overall_score,
        "detected_skills": detected_skills,
        "missing_skills": missing_skills,
        "strengths": strengths,
        "improvement_areas": improvement_areas,
        "resume_summary": _build_summary(role, normalized_text, detected_skills, missing_skills),
    }


def _normalize_target_role(target_role: str) -> str:
    cleaned = " ".join((target_role or "").split()).lower()
    for role in ROLE_SKILLS:
        if cleaned == role.lower():
            return role

    supported = ", ".join(get_supported_roles())
    raise ResumeAnalysisError(f"Unsupported target role. Supported roles: {supported}.")


def _extract_pdf_text(pdf_content: bytes) -> str:
    try:
        reader = PdfReader(BytesIO(pdf_content))
    except (PdfReadError, ValueError, OSError) as exc:
        raise ResumeAnalysisError("The uploaded PDF is malformed or unreadable.") from exc

    if reader.is_encrypted:
        try:
            reader.decrypt("")
        except Exception as exc:
            raise ResumeAnalysisError("Encrypted PDFs are not supported.") from exc

        if reader.is_encrypted:
            raise ResumeAnalysisError("Encrypted PDFs are not supported.")

    page_text: list[str] = []
    try:
        for page in reader.pages:
            try:
                extracted = page.extract_text() or ""
            except Exception:
                extracted = ""
            if extracted.strip():
                page_text.append(extracted)
    except Exception as exc:
        raise ResumeAnalysisError("The uploaded PDF could not be read.") from exc

    return "\n".join(page_text)


def _normalize_text(text: str) -> str:
    text = text.replace("\x00", " ")
    text = re.sub(r"[ \t\r\f\v]+", " ", text)
    text = re.sub(r"\n{3,}", "\n\n", text)
    return text.strip()


def _detect_skills(text: str, skills: tuple[SkillDefinition, ...]) -> list[str]:
    detected: list[str] = []
    lowered = text.lower()
    for skill in skills:
        if any(_contains_phrase(lowered, alias) for alias in skill.aliases):
            detected.append(skill.name)
    return detected


def _contains_phrase(text: str, phrase: str) -> bool:
    escaped = re.escape(phrase.lower())
    pattern = rf"(?<![a-z0-9+.#]){escaped}(?![a-z0-9+.#])"
    return re.search(pattern, text) is not None


def _detect_candidate_name(raw_text: str) -> str | None:
    lines = [line.strip() for line in raw_text.splitlines() if line.strip()]
    blocked_terms = {
        "resume",
        "curriculum vitae",
        "cv",
        "profile",
        "summary",
        "contact",
    }

    for line in lines[:12]:
        cleaned = re.sub(r"[^A-Za-z .'-]", "", line).strip()
        cleaned = re.sub(r"\s+", " ", cleaned)
        words = cleaned.split()
        lowered = cleaned.lower()

        if not cleaned or lowered in blocked_terms:
            continue
        if "@" in line or re.search(r"\d", line):
            continue
        if not 2 <= len(words) <= 4:
            continue
        if all(word[:1].isupper() for word in words if word):
            return cleaned

    return None


def _calculate_score(
    text: str,
    detected_skills: list[str],
    role_skills: tuple[SkillDefinition, ...],
) -> int:
    skill_score = (len(detected_skills) / len(role_skills)) * 70
    section_score = sum(
        5
        for signals in SECTION_SIGNALS.values()
        if any(_contains_phrase(text.lower(), signal) for signal in signals)
    )
    detail_score = 0
    if re.search(r"\b\d+(\.\d+)?\s*(%|percent|x|k|m|million|users|requests)\b", text.lower()):
        detail_score += 5
    if len(text.split()) >= 300:
        detail_score += 5

    return max(0, min(100, round(skill_score + section_score + detail_score)))


def _build_strengths(text: str, detected_skills: list[str]) -> list[str]:
    strengths: list[str] = []
    lowered = text.lower()

    if detected_skills:
        strengths.append(f"Shows relevant skills: {', '.join(detected_skills[:5])}.")
    if any(_contains_phrase(lowered, signal) for signal in SECTION_SIGNALS["experience"]):
        strengths.append("Includes professional or internship experience.")
    if any(_contains_phrase(lowered, signal) for signal in SECTION_SIGNALS["projects"]):
        strengths.append("Includes project work that can demonstrate practical ability.")
    if re.search(r"\b\d+(\.\d+)?\s*(%|percent|x|k|m|million|users|requests)\b", lowered):
        strengths.append("Uses measurable impact or scale in at least one section.")

    return strengths or ["Provides a readable resume foundation for role matching."]


def _build_improvement_areas(text: str, missing_skills: list[str]) -> list[str]:
    improvement_areas: list[str] = []
    lowered = text.lower()

    if missing_skills:
        improvement_areas.append(
            f"Add evidence for role-critical skills: {', '.join(missing_skills[:5])}."
        )
    if not any(_contains_phrase(lowered, signal) for signal in SECTION_SIGNALS["projects"]):
        improvement_areas.append("Add a projects section with concrete technical outcomes.")
    if not re.search(r"\b\d+(\.\d+)?\s*(%|percent|x|k|m|million|users|requests)\b", lowered):
        improvement_areas.append("Quantify achievements with metrics, scale, or business impact.")
    if len(text.split()) < 300:
        improvement_areas.append("Expand concise sections with responsibilities, tools, and outcomes.")

    return improvement_areas or ["Resume is well aligned; refine wording for clarity and measurable impact."]


def _build_summary(
    role: str,
    text: str,
    detected_skills: list[str],
    missing_skills: list[str],
) -> str:
    word_count = len(text.split())
    detected_count = len(detected_skills)
    missing_count = len(missing_skills)
    return (
        f"Resume analyzed for {role}. It contains approximately {word_count} words, "
        f"matches {detected_count} role skills, and is missing {missing_count} mapped skills."
    )
