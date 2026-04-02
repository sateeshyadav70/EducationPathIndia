import { useEffect, useMemo, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import CompareBar from '../components/CompareBar.jsx'
import { colleges } from '../data/colleges.js'
import { useAuth } from '../context/AuthContext.jsx'

const features = [
  { key: 'fees', label: 'Fees' },
  { key: 'placement', label: 'Placement' },
  { key: 'ranking', label: 'Ranking' },
  { key: 'course', label: 'Course' },
  { key: 'type', label: 'Type' },
  { key: 'rating', label: 'Rating' },
]

function Compare() {
  const navigate = useNavigate()
  const location = useLocation()
  const { user } = useAuth()
  const [selectedIds, setSelectedIds] = useState([])
  const [savedComparisons, setSavedComparisons] = useState([])
  const comparisonsKey = user ? `savedComparisons:${user.id}` : 'savedComparisons'

  useEffect(() => {
    const stateIds = location.state?.ids
    if (Array.isArray(stateIds)) {
      setSelectedIds(stateIds.map((value) => Number(value)))
      return
    }
    const stored = window.localStorage.getItem('compareIds')
    if (stored) {
      try {
        const parsed = JSON.parse(stored)
        if (Array.isArray(parsed)) setSelectedIds(parsed.map((value) => Number(value)))
      } catch {
        setSelectedIds([])
      }
    }
  }, [location.state])

  useEffect(() => {
    const stored = window.localStorage.getItem(comparisonsKey)
    if (stored) {
      try {
        const parsed = JSON.parse(stored)
        if (Array.isArray(parsed)) {
          const normalized = parsed.map((item) => ({
            ...item,
            ids: Array.isArray(item.ids) ? item.ids.map((value) => Number(value)) : [],
          }))
          setSavedComparisons(normalized)
        }
      } catch {
        setSavedComparisons([])
      }
    }
  }, [comparisonsKey])

  const selectedColleges = useMemo(() => {
    const normalized = selectedIds.map((value) => Number(value))
    return colleges.filter((college) => normalized.includes(college.id))
  }, [selectedIds])

  useEffect(() => {
    window.localStorage.setItem('compareIds', JSON.stringify(selectedIds))
  }, [selectedIds])

  useEffect(() => {
    window.localStorage.setItem(comparisonsKey, JSON.stringify(savedComparisons))
  }, [savedComparisons, comparisonsKey])

  const handleRemoveCompare = (id) => {
    setSelectedIds((prev) => prev.filter((value) => value !== id))
  }

  const handleCompare = () => {
    if (selectedIds.length < 2) return
    navigate('/compare')
  }

  const handleSaveComparison = () => {
    if (selectedIds.length < 2) return
    const key = selectedIds.slice().sort().join('-')
    const exists = savedComparisons.some((item) => item.key === key)
    if (exists) return
    setSavedComparisons((prev) => [
      { key, ids: selectedIds.slice(), date: new Date().toLocaleDateString() },
      ...prev,
    ])
  }

  const bestValues = useMemo(() => {
    const best = {
      fees: Math.min(...selectedColleges.map((college) => college.feesValue || 999)),
      placement: Math.max(...selectedColleges.map((college) => college.placementValue || 0)),
      ranking: Math.min(...selectedColleges.map((college) => college.rankingValue || 999)),
      rating: Math.max(...selectedColleges.map((college) => college.rating || 0)),
    }
    return best
  }, [selectedColleges])

  const feesMax = Math.max(1, ...selectedColleges.map((college) => college.feesValue || 0))
  const placementMax = Math.max(1, ...selectedColleges.map((college) => college.placementValue || 0))

  if (selectedColleges.length < 2) {
    return (
      <section className="section">
        <div className="container">
          <h2 className="section-title">Compare colleges</h2>
          <p className="section-subtitle">
            Pick at least two colleges from Explore to view a side-by-side comparison.
          </p>
          <Link className="btn primary" to="/explore">
            Add Colleges
          </Link>
        </div>
      </section>
    )
  }

  return (
    <section className="section">
      <div className="container">
        <h2 className="section-title">College comparison</h2>
        <p className="section-subtitle">Review fees, placements, and rankings in one view.</p>
        <div className="compare-graphs">
          <div className="graph-card">
            <h3>Fees comparison (lower is better)</h3>
            {selectedColleges.map((college) => (
              <div key={college.id} className="graph-row">
                <span>{college.name}</span>
                <div className="graph-bar">
                  <span
                    style={{ width: `${feesMax ? (college.feesValue / feesMax) * 100 : 0}%` }}
                  />
                </div>
                <strong>{college.fees}</strong>
              </div>
            ))}
          </div>
          <div className="graph-card">
            <h3>Placement comparison (higher is better)</h3>
            {selectedColleges.map((college) => (
              <div key={college.id} className="graph-row">
                <span>{college.name}</span>
                <div className="graph-bar accent">
                  <span
                    style={{
                      width: `${placementMax ? (college.placementValue / placementMax) * 100 : 0}%`,
                    }}
                  />
                </div>
                <strong>{college.placement}</strong>
              </div>
            ))}
          </div>
        </div>
        <div style={{ overflowX: 'auto' }}>
          <table className="compare-table">
            <thead>
              <tr>
                <th>Feature</th>
                {selectedColleges.map((college) => (
                  <th key={college.id}>{college.name}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {features.map((feature) => (
                <tr key={feature.key}>
                  <td>{feature.label}</td>
                  {selectedColleges.map((college) => (
                    <td
                      key={college.id}
                      className={
                        (feature.key === 'fees' && college.feesValue === bestValues.fees) ||
                        (feature.key === 'placement' && college.placementValue === bestValues.placement) ||
                        (feature.key === 'ranking' && college.rankingValue === bestValues.ranking) ||
                        (feature.key === 'rating' && college.rating === bestValues.rating)
                          ? 'best'
                          : ''
                      }
                    >
                      {college[feature.key]}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="compare-actions">
          <button className="btn ghost" type="button" onClick={handleSaveComparison}>
            Save comparison
          </button>
        </div>
        <CompareBar selected={selectedColleges} onRemove={handleRemoveCompare} onCompare={handleCompare} />
        {savedComparisons.length > 0 && (
          <div className="section">
            <h2 className="section-title">Saved comparisons</h2>
            <div className="saved-comparisons">
              {savedComparisons.map((item) => (
                <button
                  key={item.key}
                  className="saved-comparison"
                  type="button"
                  onClick={() => setSelectedIds(item.ids.map((value) => Number(value)))}
                >
                  <strong>
                    {item.ids
                      .map((idValue) => colleges.find((c) => c.id === idValue)?.name || 'Unknown')
                      .join(' vs ')}
                  </strong>
                  <span className="card-meta">Saved on {item.date}</span>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  )
}

export default Compare
