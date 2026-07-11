ROLE_FOUNDATIONS = {
    "Software Engineer": ["data structures", "APIs", "testing", "system design"],
    "Java Developer": ["Java fundamentals", "Spring Boot", "REST APIs", "testing"],
    "Data Analyst": ["SQL", "data cleaning", "dashboards", "business metrics"],
    "Cloud Engineer": ["cloud networking", "deployments", "monitoring", "security"],
}


def _clean_list(values):
    if not values:
        return []

    cleaned = []
    seen = set()
    for value in values:
        text = str(value).strip()
        key = text.lower()
        if text and key not in seen:
            cleaned.append(text)
            seen.add(key)
    return cleaned


def _score_band(score):
    if score < 50:
        return "foundation"
    if score < 70:
        return "readiness"
    if score < 85:
        return "polish"
    return "advanced"


def generate_roadmap(target_role, overall_score, missing_skills):
    role = str(target_role or "Software Engineer").strip() or "Software Engineer"

    try:
        score = int(overall_score)
    except (TypeError, ValueError):
        score = 0

    score = max(0, min(100, score))
    missing = _clean_list(missing_skills)
    focus_skills = missing or ROLE_FOUNDATIONS.get(
        role, ["core fundamentals", "projects", "communication"]
    )
    band = _score_band(score)
    include_readiness_work = score < 70

    days = []

    for index in range(7):
        skill = focus_skills[index % len(focus_skills)]

        if index < min(len(focus_skills), 4):
            title = f"Strengthen {skill}"
            tasks = [
                f"Review the fundamentals of {skill} for a {role} role.",
                f"Build or revise one small example that demonstrates {skill}.",
                f"Write three interview talking points about your {skill} experience.",
            ]
        elif index == 4:
            title = f"Apply {focus_skills[0]} in a role project"
            tasks = [
                f"Connect {focus_skills[0]} to a practical {role} project scenario.",
                "Document the problem, approach, trade-offs, and measurable result.",
                "Prepare a concise project explanation for interviews.",
            ]
        elif index == 5:
            title = "Mock interview and gap review"
            tasks = [
                f"Answer five {role} interview questions covering the missing skills.",
                "Compare each answer against expected fundamentals and examples.",
                "Revise weak answers into a clear situation, action, result structure.",
            ]
        else:
            title = "Final readiness check"
            tasks = [
                f"Review all missing-skill notes for the {role} target.",
                "Create a final checklist of concepts, examples, and questions to revisit.",
                "Practice a two-minute summary of your role fit and improvement work.",
            ]

        if include_readiness_work:
            if index in (0, 3):
                tasks.append(
                    "Improve one resume bullet so it shows impact, tools, and outcome."
                )
            elif index in (1, 5):
                tasks.append(
                    "Practice one behavioral and one technical interview answer aloud."
                )

        if band == "foundation" and index in (0, 1, 2):
            tasks[0] = f"Study beginner-to-intermediate fundamentals of {skill}."
        elif band == "advanced" and index in (4, 6):
            tasks[0] = f"Add advanced trade-offs and edge cases to your {role} examples."

        days.append(
            {
                "day": index + 1,
                "title": title,
                "tasks": tasks[:4],
            }
        )

    return {"days": days}
