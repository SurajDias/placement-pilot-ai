import re


DIFFICULTIES = ("Easy", "Medium", "Hard")

ROLE_TOPICS = {
    "Software Engineer": ["system design", "data structures", "testing"],
    "Java Developer": ["object oriented programming", "Spring Boot", "JVM"],
    "Data Analyst": ["SQL", "data cleaning", "visualization"],
    "Cloud Engineer": ["cloud architecture", "networking", "monitoring"],
}

KEYWORD_BANK = {
    "api": ["request", "response", "status", "endpoint"],
    "cloud": ["scaling", "availability", "monitoring", "security"],
    "data": ["query", "cleaning", "insight", "validation"],
    "database": ["schema", "index", "query", "transaction"],
    "docker": ["container", "image", "volume", "network"],
    "java": ["class", "interface", "exception", "collection"],
    "python": ["function", "module", "exception", "package"],
    "react": ["component", "state", "props", "render"],
    "sql": ["join", "filter", "aggregate", "index"],
    "testing": ["case", "assertion", "coverage", "edge"],
}


def _clean_values(values):
    if not values:
        return []

    cleaned = []
    for value in values:
        text = str(value).strip()
        if text and text.lower() not in {item.lower() for item in cleaned}:
            cleaned.append(text)
    return cleaned


def generate_questions(detected_skills, target_role):
    skills = _clean_values(detected_skills)
    role = str(target_role or "Software Engineer").strip() or "Software Engineer"
    role_topics = ROLE_TOPICS.get(role, ["problem solving", "debugging", "team delivery"])
    primary_skills = skills[:5] or role_topics

    templates = [
        ("Easy", "How have you used {skill} in a project for a {role} role?"),
        ("Easy", "What are the most important fundamentals of {skill} you rely on?"),
        ("Medium", "Describe a technical challenge you solved using {skill}."),
        ("Medium", "How would you debug a production issue related to {skill}?"),
        ("Medium", "How does {skill} support the responsibilities of a {role}?"),
        ("Hard", "Design a reliable solution for a {role} use case involving {skill}."),
        ("Hard", "What trade-offs would you consider when scaling {skill}?"),
        ("Hard", "How would you measure and improve quality for work involving {skill}?"),
    ]

    questions = []
    for index, (difficulty, template) in enumerate(templates, start=1):
        skill = primary_skills[(index - 1) % len(primary_skills)]
        questions.append(
            {
                "id": index,
                "difficulty": difficulty,
                "question": template.format(skill=skill, role=role),
            }
        )

    return {"questions": questions}


def _keywords_for_question(question):
    words = set(re.findall(r"[a-zA-Z][a-zA-Z+#.]{1,}", question.lower()))
    expected = []

    for trigger, keywords in KEYWORD_BANK.items():
        if trigger in words or trigger in question.lower():
            expected.extend(keywords)

    if "debug" in question.lower():
        expected.extend(["root cause", "logs", "reproduce", "fix"])
    if "design" in question.lower() or "scaling" in question.lower():
        expected.extend(["trade-off", "reliability", "performance", "security"])

    return list(dict.fromkeys(expected or ["example", "approach", "trade-off", "result"]))


def evaluate_answer(question, answer):
    question_text = str(question or "").strip()
    answer_text = str(answer or "").strip()
    answer_lower = answer_text.lower()
    expected_points = _keywords_for_question(question_text)

    word_count = len(re.findall(r"\w+", answer_text))
    sentence_count = len(re.findall(r"[.!?]+", answer_text))
    matched_keywords = [
        point for point in expected_points if point.lower() in answer_lower
    ]

    completeness = min(40, int((word_count / 70) * 40))
    technical = int((len(matched_keywords) / len(expected_points)) * 35)
    clarity = 0
    if word_count >= 20:
        clarity += 10
    if sentence_count >= 2:
        clarity += 8
    if answer_text and len(answer_text) <= 900:
        clarity += 7

    score = min(100, completeness + technical + clarity)

    if score >= 80:
        feedback = "Strong answer with clear structure and relevant technical detail."
    elif score >= 60:
        feedback = "Good answer, but add more specific examples and technical depth."
    else:
        feedback = "Answer needs more detail, clearer structure, and relevant technical points."

    return {
        "score": score,
        "feedback": feedback,
        "expected_points": expected_points,
    }
