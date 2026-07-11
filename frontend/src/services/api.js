const API_URL = 'http://127.0.0.1:8000/api/resume/analyze'

export async function analyzeResume({ file, targetRole }) {
  const formData = new FormData()
  formData.append('file', file)
  formData.append('target_role', targetRole)

  const response = await fetch(API_URL, {
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
