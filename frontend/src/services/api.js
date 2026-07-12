const BASE_URL = 'https://placement-pilot-ai.onrender.com'

const RESUME_API_URL = `${BASE_URL}/api/resume/analyze`
const INTERVIEW_API_URL = `${BASE_URL}/api/interview`
const ROADMAP_API_URL = `${BASE_URL}/api/roadmap`

export async function analyzeResume({ file, targetRole }) {
  const formData = new FormData()
  formData.append('file', file)
  formData.append('target_role', targetRole)

  const response = await fetch(RESUME_API_URL, {
    method: 'POST',
    body: formData,
  })

  if (!response.ok) {
    let message = 'Unable to analyze the resume. Please try again.'

    try {
      const errorData = await response.json()
      message = errorData.detail || errorData.message || message
    } catch {
      // Keep the default message when the backend does not return JSON.
    }

    throw new Error(message)
  }

  return response.json()
}

async function postJson(url, payload, fallbackMessage) {
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  })

  if (!response.ok) {
    let message = fallbackMessage

    try {
      const errorData = await response.json()
      message = errorData.detail || errorData.message || message
    } catch {
      // Keep the default message when the backend does not return JSON.
    }

    throw new Error(message)
  }

  return response.json()
}

export async function generateInterviewQuestions({ detectedSkills, targetRole }) {
  return postJson(
    `${INTERVIEW_API_URL}/generate`,
    {
      detected_skills: detectedSkills,
      target_role: targetRole,
    },
    'Unable to generate interview questions. Please try again.',
  )
}

export async function evaluateInterviewAnswer({ question, answer }) {
  return postJson(
    `${INTERVIEW_API_URL}/evaluate`,
    {
      question,
      answer,
    },
    'Unable to evaluate the answer. Please try again.',
  )
}

export async function generateRoadmap({
  targetRole,
  overallScore,
  missingSkills,
}) {
  return postJson(
    `${ROADMAP_API_URL}/generate`,
    {
      target_role: targetRole,
      overall_score: overallScore,
      missing_skills: missingSkills,
    },
    'Unable to generate the roadmap. Please try again.',
  )
}