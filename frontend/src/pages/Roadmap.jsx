import { useMemo, useState } from 'react'
import { generateRoadmap } from '../services/api'

const ROLE_OPTIONS = [
  'Software Engineer',
  'Java Developer',
  'Data Analyst',
  'Cloud Engineer',
]

const ROLE_DEFAULT_SKILLS = {
  'Software Engineer': ['APIs', 'Testing', 'System Design'],
  'Java Developer': ['Spring Boot', 'REST APIs', 'Testing'],
  'Data Analyst': ['SQL', 'Data Cleaning', 'Visualization'],
  'Cloud Engineer': ['Cloud Networking', 'Monitoring', 'Security'],
}

function getResumeContext() {
  try {
    const stored = sessionStorage.getItem('placementPilotResumeAnalysis')
    return stored ? JSON.parse(stored) : null
  } catch {
    return null
  }
}

function Roadmap() {
  const resumeContext = useMemo(() => getResumeContext(), [])
  const initialRole = resumeContext?.target_role || 'Software Engineer'
  const [targetRole, setTargetRole] = useState(initialRole)
  const [roadmap, setRoadmap] = useState([])
  const [error, setError] = useState('')
  const [isGenerating, setIsGenerating] = useState(false)

  const overallScore =
    typeof resumeContext?.overall_score === 'number'
      ? resumeContext.overall_score
      : 69

  const missingSkills =
    Array.isArray(resumeContext?.missing_skills) &&
    resumeContext.missing_skills.length > 0
      ? resumeContext.missing_skills
      : ROLE_DEFAULT_SKILLS[targetRole] || ROLE_DEFAULT_SKILLS['Software Engineer']

  const handleGenerate = async () => {
    setError('')
    setRoadmap([])
    setIsGenerating(true)

    try {
      const data = await generateRoadmap({
        targetRole,
        overallScore,
        missingSkills,
      })
      setRoadmap(Array.isArray(data.days) ? data.days : [])
    } catch (requestError) {
      setError(requestError.message)
    } finally {
      setIsGenerating(false)
    }
  }

  return (
    <section className="roadmap-page">
      <div className="page-heading">
        <p className="eyebrow">7-Day Roadmap</p>
        <h1>Prepare with a focused one-week plan</h1>
        <p>
          Choose a target role and generate a deterministic roadmap that
          prioritizes missing skills, resume polish, and interview practice.
        </p>
      </div>

      <section className="roadmap-controls">
        <label className="field-label">
          Target role
          <select
            value={targetRole}
            onChange={(event) => setTargetRole(event.target.value)}
          >
            {ROLE_OPTIONS.map((role) => (
              <option key={role} value={role}>
                {role}
              </option>
            ))}
          </select>
        </label>

        <div>
          <span>Overall Score</span>
          <strong>{overallScore}</strong>
        </div>

        <div>
          <span>Missing Skills</span>
          <p>{missingSkills.join(', ')}</p>
        </div>

        <button
          className="primary-button"
          type="button"
          onClick={handleGenerate}
          disabled={isGenerating}
        >
          {isGenerating ? 'Generating...' : 'Generate Roadmap'}
        </button>
      </section>

      {error && <p className="error-message">{error}</p>}

      {isGenerating && (
        <div className="loading-state roadmap-loading">
          <span className="spinner" aria-hidden="true" />
          <p>Generating roadmap...</p>
        </div>
      )}

      {!isGenerating && roadmap.length === 0 && !error && (
        <section className="empty-state roadmap-empty">
          <h2>Roadmap days</h2>
          <p>Your 7-day preparation plan will appear here.</p>
        </section>
      )}

      <div className="roadmap-list">
        {roadmap.map((day) => (
          <article className="roadmap-card" key={day.day}>
            <div className="roadmap-day">Day {day.day}</div>
            <h2>{day.title}</h2>
            <ul>
              {(day.tasks || []).map((task) => (
                <li key={task}>{task}</li>
              ))}
            </ul>
          </article>
        ))}
      </div>
    </section>
  )
}

export default Roadmap
