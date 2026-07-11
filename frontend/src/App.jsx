import { useEffect, useState } from 'react'
import './App.css'
import Navbar from './components/Navbar'
import Home from './pages/Home'
import Interview from './pages/Interview'
import ResumeAnalysis from './pages/ResumeAnalysis'

const routes = {
  home: '/',
  analysis: '/resume-analysis',
  interview: '/interview',
}

function getCurrentPage() {
  if (window.location.pathname === routes.analysis) return 'analysis'
  if (window.location.pathname === routes.interview) return 'interview'
  return 'home'
}

function App() {
  const [page, setPage] = useState(getCurrentPage)

  useEffect(() => {
    const handlePopState = () => setPage(getCurrentPage())
    window.addEventListener('popstate', handlePopState)
    return () => window.removeEventListener('popstate', handlePopState)
  }, [])

  const navigate = (nextPage) => {
    const nextPath = routes[nextPage] ?? routes.home

    if (window.location.pathname !== nextPath) {
      window.history.pushState({}, '', nextPath)
    }

    setPage(nextPage)
  }

  return (
    <div className="app-shell">
      <Navbar currentPage={page} onNavigate={navigate} />
      <main>
        {page === 'interview' ? (
          <Interview />
        ) : page === 'analysis' ? (
          <ResumeAnalysis onContinue={() => navigate('interview')} />
        ) : (
          <Home onStart={() => navigate('analysis')} />
        )}
      </main>
    </div>
  )
}

export default App
