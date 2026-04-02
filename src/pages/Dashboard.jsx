import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import CollegeCard from '../components/CollegeCard.jsx'
import { colleges } from '../data/colleges.js'
import { useAuth } from '../context/AuthContext.jsx'

function Dashboard() {
  const { user } = useAuth()
  const [savedIds, setSavedIds] = useState([])
  const [recentIds, setRecentIds] = useState([])
  const [applications, setApplications] = useState([])
  const [savedComparisons, setSavedComparisons] = useState([])
  const [views, setViews] = useState({})
  const [applyCounts, setApplyCounts] = useState({})
  const [scholarshipApps, setScholarshipApps] = useState([])
  const [alerts, setAlerts] = useState([])
  const [usageHistory, setUsageHistory] = useState([])
  const savedKey = user ? `savedColleges:${user.id}` : null
  const alertsKey = user ? `userAlerts:${user.id}` : null
  const scholarshipKey = user ? `scholarshipApplications:${user.id}` : null
  const recentKey = user ? `recentColleges:${user.id}` : null
  const comparisonsKey = user ? `savedComparisons:${user.id}` : 'savedComparisons'

  useEffect(() => {
    const loadArray = (key, setter) => {
      const stored = window.localStorage.getItem(key)
      if (!stored) return
      try {
        const parsed = JSON.parse(stored)
        if (Array.isArray(parsed)) setter(parsed)
      } catch {
        setter([])
      }
    }

    if (savedKey) loadArray(savedKey, setSavedIds)
    if (recentKey) loadArray(recentKey, setRecentIds)
    if (user) {
      loadArray(`collegeApplications:${user.id}`, setApplications)
    }
    loadArray(comparisonsKey, setSavedComparisons)
    if (scholarshipKey) loadArray(scholarshipKey, setScholarshipApps)
    if (alertsKey) loadArray(alertsKey, setAlerts)
    loadArray('usageHistory', setUsageHistory)

    const loadMap = (key, setter) => {
      const stored = window.localStorage.getItem(key)
      if (!stored) return
      try {
        const parsed = JSON.parse(stored)
        if (parsed && typeof parsed === 'object') setter(parsed)
      } catch {
        setter({})
      }
    }

    loadMap('collegeViews', setViews)
    loadMap('collegeApplyCounts', setApplyCounts)
  }, [savedKey, recentKey, comparisonsKey, scholarshipKey, alertsKey, user])

  useEffect(() => {
    if (!savedKey) return
    window.localStorage.setItem(savedKey, JSON.stringify(savedIds))
  }, [savedIds, savedKey])

  const savedColleges = colleges.filter((college) => savedIds.includes(college.id))
  const recentColleges = recentIds
    .map((id) => colleges.find((college) => college.id === id))
    .filter(Boolean)

  const trending = useMemo(() => {
    const scored = colleges.map((college) => {
      const viewScore = views[college.id] || 0
      const applyScore = applyCounts[college.id] || 0
      const score = viewScore + applyScore * 3
      return { ...college, score }
    })
    return scored.sort((a, b) => b.score - a.score).slice(0, 3)
  }, [views, applyCounts])

  const handleSaveToggle = (id) => {
    setSavedIds((prev) => (prev.includes(id) ? prev.filter((value) => value !== id) : [...prev, id]))
  }

  const totalViews = Object.values(views).reduce((sum, value) => sum + value, 0)
  const totalApplies = Object.values(applyCounts).reduce((sum, value) => sum + value, 0)
  const chartData = usageHistory.slice(-7)
  const maxViews = Math.max(1, ...chartData.map((item) => item.views || 0))
  const maxApplies = Math.max(1, ...chartData.map((item) => item.applies || 0))

  return (
    <section className="section">
      <div className="container">
        <h2 className="section-title">Your dashboard</h2>
        <p className="section-subtitle">Quick stats and personalized highlights.</p>

        <div className="dashboard-stats">
          <div className="stat-card">
            <h3>{savedColleges.length}</h3>
            <p>Saved colleges</p>
          </div>
          {user && (
            <div className="stat-card">
              <h3>{applications.length}</h3>
              <p>Applications</p>
            </div>
          )}
          <div className="stat-card">
            <h3>{savedComparisons.length}</h3>
            <p>Saved comparisons</p>
          </div>
        </div>

        <div className="analytics-grid">
          <div className="analytics-card">
            <span className="card-meta">Total views</span>
            <strong>{totalViews}</strong>
          </div>
          <div className="analytics-card">
            <span className="card-meta">Total applies</span>
            <strong>{totalApplies}</strong>
          </div>
          <div className="analytics-card">
            <span className="card-meta">Scholarship applications</span>
            <strong>{scholarshipApps.length}</strong>
          </div>
          <div className="analytics-card">
            <span className="card-meta">Active alerts</span>
            <strong>{alerts.length}</strong>
          </div>
        </div>

        <div className="section">
          <h2 className="section-title">Activity trends</h2>
          <p className="section-subtitle">Views vs applies over the last few days.</p>
          <div className="trend-chart">
            {chartData.map((item) => (
              <div key={item.date} className="trend-row">
                <span>{item.date.slice(5)}</span>
                <div className="trend-bars">
                  <div className="trend-bar views">
                    <span style={{ width: `${(item.views / maxViews) * 100}%` }} />
                  </div>
                  <div className="trend-bar applies">
                    <span style={{ width: `${(item.applies / maxApplies) * 100}%` }} />
                  </div>
                </div>
                <strong>
                  {item.views} / {item.applies}
                </strong>
              </div>
            ))}
            {chartData.length === 0 && <p className="card-meta">No activity data yet.</p>}
          </div>
        </div>

        <div className="section">
          <h2 className="section-title">Trending colleges</h2>
          <p className="section-subtitle">Most viewed and most applied this week.</p>
          <div className="cards-grid">
            {trending.map((college) => (
              <CollegeCard
                key={college.id}
                college={college}
                badge="Trending"
                isSaved={savedIds.includes(college.id)}
                onSaveToggle={handleSaveToggle}
              />
            ))}
          </div>
        </div>

        {recentColleges.length > 0 && (
          <div className="section">
            <h2 className="section-title">Recently viewed</h2>
            <div className="cards-grid">
              {recentColleges.map((college) => (
                <CollegeCard
                  key={college.id}
                  college={college}
                  isSaved={savedIds.includes(college.id)}
                  onSaveToggle={handleSaveToggle}
                />
              ))}
            </div>
          </div>
        )}

        {savedColleges.length > 0 && (
          <div className="section">
            <h2 className="section-title">Saved list</h2>
            <div className="cards-grid">
              {savedColleges.map((college) => (
                <CollegeCard
                  key={college.id}
                  college={college}
                  isSaved
                  onSaveToggle={handleSaveToggle}
                />
              ))}
            </div>
          </div>
        )}

        {user && (
          <div className="section">
            <h2 className="section-title">Applications</h2>
            <p className="section-subtitle">Track the status of your applications.</p>
            <div className="application-preview">
              {applications.slice(0, 3).map((application) => {
                const college = colleges.find((item) => item.id === application.collegeId)
                return (
                  <div key={application.id} className="application-card">
                    <div>
                      <strong>{college?.name || 'College'}</strong>
                      <p className="card-meta">
                        Status: {application.status} · {application.date}
                      </p>
                    </div>
                    <Link className="btn ghost" to="/applications">
                      View
                    </Link>
                  </div>
                )
              })}
              {applications.length === 0 && (
                <p className="card-meta">No applications yet. Apply from any college page.</p>
              )}
            </div>
          </div>
        )}
      </div>
    </section>
  )
}

export default Dashboard
