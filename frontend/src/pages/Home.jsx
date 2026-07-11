function Home({ onStart }) {
  return (
    <section className="home-page">
      <div className="home-content">
        <p className="eyebrow">PlacementPilot AI</p>
        <h1>Resume analysis for placement-ready candidates</h1>
        <p className="home-description">
          Upload your resume, choose a target role, and get a clear skill gap
          analysis with practical improvement areas.
        </p>
        <button className="primary-button" type="button" onClick={onStart}>
          Start Resume Analysis
        </button>
      </div>
      <div className="home-panel" aria-label="Resume analysis highlights">
        <div>
          <span className="panel-number">01</span>
          <p>PDF resume upload</p>
        </div>
        <div>
          <span className="panel-number">02</span>
          <p>Role-based skill matching</p>
        </div>
        <div>
          <span className="panel-number">03</span>
          <p>Score, strengths, and next steps</p>
        </div>
      </div>
    </section>
  )
}

export default Home
