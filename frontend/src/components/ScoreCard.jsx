function getScoreClass(score) {
  if (score >= 80) return 'score-card green'
  if (score >= 60) return 'score-card orange'
  return 'score-card red'
}

function ScoreCard({ score }) {
  const normalizedScore = Number.isFinite(Number(score)) ? Number(score) : 0

  return (
    <section className={getScoreClass(normalizedScore)}>
      <span>Overall Score</span>
      <strong>{normalizedScore}</strong>
      <p>{normalizedScore >= 80 ? 'Strong match' : 'Needs improvement'}</p>
    </section>
  )
}

export default ScoreCard
