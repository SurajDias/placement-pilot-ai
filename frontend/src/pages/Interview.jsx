import { useEffect, useMemo, useState } from 'react'
import {
  evaluateInterviewAnswer,
  generateInterviewQuestions,
} from '../services/api'

function getStoredResumeContext() {
  try {
    const stored = sessionStorage.getItem('placementPilotResumeAnalysis')
    return stored ? JSON.parse(stored) : null
  } catch {
    return null
  }
}

function Interview() {
  const [resumeContext, setResumeContext] = useState(null)
  const [questions, setQuestions] = useState([])
  const [answers, setAnswers] = useState({})
  const [evaluations, setEvaluations] = useState({})
  const [isGenerating, setIsGenerating] = useState(false)
  const [evaluatingId, setEvaluatingId] = useState(null)
  const [error, setError] = useState('')

  useEffect(() => {
    setResumeContext(getStoredResumeContext())
  }, [])

  const detectedSkills = useMemo(() => {
    return Array.isArray(resumeContext?.detected_skills)
      ? resumeContext.detected_skills
      : []
  }, [resumeContext])

  const targetRole = resumeContext?.target_role || 'Software Engineer'

  const handleGenerate = async () => {
    setError('')
    setQuestions([])
    setEvaluations({})
    setIsGenerating(true)

    try {
      const data = await generateInterviewQuestions({
        detectedSkills,
        targetRole,
      })
      setQuestions(Array.isArray(data.questions) ? data.questions : [])
    } catch (requestError) {
      setError(requestError.message)
    } finally {
      setIsGenerating(false)
    }
  }

  const handleAnswerChange = (questionId, value) => {
    setAnswers((currentAnswers) => ({
      ...currentAnswers,
      [questionId]: value,
    }))
  }

  const handleEvaluate = async (question) => {
    const answer = answers[question.id]?.trim()

    if (!answer) {
      setError('Please type an answer before evaluating.')
      return
    }

    setError('')
    setEvaluatingId(question.id)

    try {
      const data = await evaluateInterviewAnswer({
        question: question.question,
        answer,
      })
      setEvaluations((currentEvaluations) => ({
        ...currentEvaluations,
        [question.id]: data,
      }))
    } catch (requestError) {
      setError(requestError.message)
    } finally {
      setEvaluatingId(null)
    }
  }

  return (
    <section className="interview-page">
      <div className="page-heading">
        <p className="eyebrow">Interview</p>
        <h1>Practice questions based on your resume</h1>
        <p>
          Generate role-aware interview questions from detected resume skills,
          answer them, and get deterministic feedback.
        </p>
      </div>

      <section className="interview-context">
        <div>
          <span>Target Role</span>
          <strong>{targetRole}</strong>
        </div>
        <div>
          <span>Detected Skills</span>
          <p>
            {detectedSkills.length > 0
              ? detectedSkills.join(', ')
              : 'No resume skills found yet. Questions will use role defaults.'}
          </p>
        </div>
        <button
          className="primary-button"
          type="button"
          onClick={handleGenerate}
          disabled={isGenerating}
        >
          {isGenerating ? 'Generating...' : 'Generate Questions'}
        </button>
      </section>

      {error && <p className="error-message">{error}</p>}

      {isGenerating && (
        <div className="loading-state interview-loading">
          <span className="spinner" aria-hidden="true" />
          <p>Generating interview questions...</p>
        </div>
      )}

      {!isGenerating && questions.length === 0 && (
        <section className="empty-state interview-empty">
          <h2>Question cards</h2>
          <p>Generate questions to start your interview practice.</p>
        </section>
      )}

      <div className="question-list">
        {questions.map((question) => {
          const evaluation = evaluations[question.id]

          return (
            <article className="question-card" key={question.id}>
              <div className="question-header">
                <span className="difficulty">{question.difficulty}</span>
                <span>Question {question.id}</span>
              </div>
              <h2>{question.question}</h2>

              <label className="answer-label">
                Your answer
                <textarea
                  value={answers[question.id] || ''}
                  onChange={(event) =>
                    handleAnswerChange(question.id, event.target.value)
                  }
                  placeholder="Type your answer here..."
                  rows="5"
                />
              </label>

              <button
                className="primary-button evaluate-button"
                type="button"
                onClick={() => handleEvaluate(question)}
                disabled={evaluatingId === question.id}
              >
                {evaluatingId === question.id ? 'Evaluating...' : 'Evaluate'}
              </button>

              {evaluation && (
                <section className="evaluation-panel">
                  <div className="evaluation-score">
                    <span>Score</span>
                    <strong>{evaluation.score}</strong>
                  </div>
                  <div>
                    <h3>Feedback</h3>
                    <p>{evaluation.feedback}</p>
                  </div>
                  <div>
                    <h3>Expected Points</h3>
                    <ul>
                      {(evaluation.expected_points || []).map((point) => (
                        <li key={point}>{point}</li>
                      ))}
                    </ul>
                  </div>
                </section>
              )}
            </article>
          )
        })}
      </div>
    </section>
  )
}

export default Interview
