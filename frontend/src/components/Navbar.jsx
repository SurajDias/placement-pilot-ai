function Navbar({ currentPage, onNavigate }) {
  return (
    <header className="navbar">
      <button
        className="brand-button"
        type="button"
        onClick={() => onNavigate('home')}
      >
        PlacementPilot AI
      </button>
      <nav aria-label="Primary navigation">
        <button
          className={currentPage === 'home' ? 'nav-link active' : 'nav-link'}
          type="button"
          onClick={() => onNavigate('home')}
        >
          Home
        </button>
        <button
          className={
            currentPage === 'analysis' ? 'nav-link active' : 'nav-link'
          }
          type="button"
          onClick={() => onNavigate('analysis')}
        >
          Resume Analysis
        </button>
        <button
          className={
            currentPage === 'interview' ? 'nav-link active' : 'nav-link'
          }
          type="button"
          onClick={() => onNavigate('interview')}
        >
          Interview
        </button>
      </nav>
    </header>
  )
}

export default Navbar
