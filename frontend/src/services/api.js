const RESUME_API_URL = 'http://127.0.0.1:8000/api/resume/analyze'
const INTERVIEW_API_URL = 'http://127.0.0.1:8000/api/interview'

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
