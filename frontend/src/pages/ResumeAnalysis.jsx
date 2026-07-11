import { useState } from 'react'
import ResumeUploader from '../components/ResumeUploader'
import ScoreCard from '../components/ScoreCard'
import { analyzeResume } from '../services/api'

function ListSection({ title, items }) {
  const values = Array.isArray(items) ? items : []

  return (
    <section className="result-section">
      <h3>{title}</h3>
      {values.length > 0 ? (
        <ul>
          {values.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      ) : (
        <p className="muted">No items returned.</p>
      )}
    </section>
  )
}

function ResumeAnalysis() {
  const [file, setFile] = useState(null)
  const [targetRole, setTargetRole] = useState('Software Engineer')
  const [result, setResult] = useState(null)
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const handleFileChange = (selectedFile) => {
    setError('')

    if (selectedFile.type !== 'application/pdf' && !selectedFile.name.endsWith('.pdf')) {
      setFile(null)
      setError('Please upload a PDF resume.')
      return
    }

    setFile(selectedFile)
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    setError('')
    setResult(null)

    if (!file) {
      setError('Please choose a PDF resume before uploading.')
      return
    }

    setIsLoading(true)

    try {
      const data = await analyzeResume({ file, targetRole })
      setResult(data)
    } catch (requestError) {
      setError(requestError.message)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <section className="analysis-page">
      <div className="page-heading">
        <p className="eyebrow">Resume Analysis</p>
        <h1>Analyze your resume against a target role</h1>
        <p>
          Upload a PDF resume and receive a concise role-fit report from the
          backend analyzer.
        </p>
      </div>

      <div className="analysis-layout">
        <ResumeUploader
          file={file}
          targetRole={targetRole}
          isLoading={isLoading}
          onFileChange={handleFileChange}
          onRoleChange={setTargetRole}
          onSubmit={handleSubmit}
        />

        <section className="results-panel" aria-live="polite">
          {isLoading && (
            <div className="loading-state">
              <span className="spinner" aria-hidden="true" />
              <p>Analyzing resume...</p>
            </div>
          )}

          {error && <p className="error-message">{error}</p>}

          {!isLoading && !error && !result && (
            <div className="empty-state">
              <h2>Analysis results</h2>
              <p>Your score, skills, strengths, and summary will appear here.</p>
            </div>
          )}

          {result && !isLoading && (
            <div className="result-content">
              <ScoreCard score={result.overall_score} />

              <div className="candidate-grid">
                <div>
                  <span>Candidate Name</span>
                  <strong>{result.candidate_name || 'Not provided'}</strong>
                </div>
                <div>
                  <span>Target Role</span>
                  <strong>{result.target_role || targetRole}</strong>
                </div>
              </div>

              <ListSection title="Detected Skills" items={result.detected_skills} />
              <ListSection title="Missing Skills" items={result.missing_skills} />
              <ListSection title="Strengths" items={result.strengths} />
              <ListSection
                title="Improvement Areas"
                items={result.improvement_areas}
              />

              <section className="result-section">
                <h3>Resume Summary</h3>
                <p>{result.resume_summary || 'No summary returned.'}</p>
              </section>
            </div>
          )}
        </section>
      </div>
    </section>
  )
}

export default ResumeAnalysis
