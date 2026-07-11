import { useEffect, useState } from 'react'
import './App.css'
import Navbar from './components/Navbar'
import Home from './pages/Home'
import ResumeAnalysis from './pages/ResumeAnalysis'

const routes = {
  home: '/',
  analysis: '/resume-analysis',
}

function getCurrentPage() {
  return window.location.pathname === routes.analysis ? 'analysis' : 'home'
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
        {page === 'analysis' ? (
          <ResumeAnalysis />
        ) : (
          <Home onStart={() => navigate('analysis')} />
        )}
      </main>
    </div>
  )
}

export default App
