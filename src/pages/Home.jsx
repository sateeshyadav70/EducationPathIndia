import { Link } from 'react-router-dom'
import { useEffect, useMemo, useState } from 'react'
import CollegeCard from '../components/CollegeCard.jsx'
import ThreeDViewer from '../components/ThreeDViewer.jsx'
import AlertsPanel from '../components/AlertsPanel.jsx'
import { colleges } from '../data/colleges.js'
import { useAuth } from '../context/AuthContext.jsx'

function Home() {
  const { user } = useAuth()
  const featured = colleges.slice(0, 3)
  const topRated = useMemo(
    () => [...colleges].sort((a, b) => (b.rating || 0) - (a.rating || 0)).slice(0, 3),
    [],
  )
  const [savedIds, setSavedIds] = useState([])
  const savedKey = user ? `savedColleges:${user.id}` : null

  useEffect(() => {
    if (!savedKey) {
      setSavedIds([])
      return
    }
    const stored = window.localStorage.getItem(savedKey)
    if (stored) {
      try {
        const parsed = JSON.parse(stored)
        if (Array.isArray(parsed)) setSavedIds(parsed)
      } catch {
        setSavedIds([])
      }
    }
  }, [savedKey])

  useEffect(() => {
    if (!savedKey) return
    window.localStorage.setItem(savedKey, JSON.stringify(savedIds))
  }, [savedIds, savedKey])

  const handleSaveToggle = (id) => {
    setSavedIds((prev) => {
      if (prev.includes(id)) {
        return prev.filter((value) => value !== id)
      }
      return [...prev, id]
    })
  }

  const savedColleges = colleges.filter((college) => savedIds.includes(college.id))

  return (
    <>
      <section className="hero">
        <div className="container hero-grid">
          <div>
            <p className="eyebrow">Future-ready campus search</p>
            <h1 className="hero-title">Explore India's top colleges in 3D</h1>
            <p className="hero-text">
              Discover standout programs, compare fees, and tour campuses through immersive 3D views.
              Build your shortlist with confidence.
            </p>
            <div className="hero-actions">
              <Link to="/explore" className="btn primary">
                Explore Now
              </Link>
              <button className="btn ghost" type="button">
                Watch Demo
              </button>
            </div>
            <div className="stats">
              <div className="stat-card">
                <h3>1000+</h3>
                <p>Colleges mapped</p>
              </div>
              <div className="stat-card">
                <h3>120+</h3>
                <p>Courses & specializations</p>
              </div>
              <div className="stat-card">
                <h3>4.7/5</h3>
                <p>Average student rating</p>
              </div>
            </div>
          </div>
          <div className="hero-visual">
            <div className="hero-3d">
              <ThreeDViewer />
            </div>
            <div className="floating-stack">
              {featured.map((college) => (
                <div key={college.id} className="floating-card">
                  <strong>{college.name}</strong>
                  <p className="card-meta">{college.location}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <h2 className="section-title">Featured colleges</h2>
          <p className="section-subtitle">
            Curated picks for high placements, standout faculty, and campus life.
          </p>
          <div className="cards-grid">
            {featured.map((college) => (
              <CollegeCard
                key={college.id}
                college={college}
                isSaved={savedIds.includes(college.id)}
                onSaveToggle={handleSaveToggle}
              />
            ))}
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <h2 className="section-title">Top rated colleges</h2>
          <p className="section-subtitle">
            Loved by students for placements, campus life, and academic support.
          </p>
          <div className="cards-grid">
            {topRated.map((college) => (
              <CollegeCard
                key={college.id}
                college={college}
                isSaved={savedIds.includes(college.id)}
                onSaveToggle={handleSaveToggle}
              />
            ))}
          </div>
        </div>
      </section>

      {savedColleges.length > 0 && (
        <section className="section">
          <div className="container">
            <h2 className="section-title">Saved for later</h2>
            <p className="section-subtitle">Pick up where you left off.</p>
            <div className="cards-grid">
              {savedColleges.map((college) => (
                <CollegeCard
                  key={college.id}
                  college={college}
                  isSaved={savedIds.includes(college.id)}
                  onSaveToggle={handleSaveToggle}
                />
              ))}
            </div>
          </div>
        </section>
      )}
      <AlertsPanel />
    </>
  )
}

export default Home
