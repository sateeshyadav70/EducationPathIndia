import { Link, useNavigate, useParams } from 'react-router-dom'
import { useEffect, useMemo, useState } from 'react'
import ThreeDViewer from '../components/ThreeDViewer.jsx'
import CampusWalkthrough from '../components/CampusWalkthrough.jsx'
import { colleges } from '../data/colleges.js'
import { useAuth } from '../context/AuthContext.jsx'

function CollegeDetails() {
  const { id } = useParams()
  const college = colleges.find((item) => item.id === Number(id))
  const [reviews, setReviews] = useState([])
  const [form, setForm] = useState({ name: '', rating: 5, comment: '' })
  const [applyStatus, setApplyStatus] = useState('')
  const { user } = useAuth()
  const navigate = useNavigate()

  const mapsKey = import.meta.env.VITE_GOOGLE_MAPS_KEY

  useEffect(() => {
    if (!college) return
    const stored = window.localStorage.getItem('collegeViews')
    let views = {}
    if (stored) {
      try {
        views = JSON.parse(stored) || {}
      } catch {
        views = {}
      }
    }
    views[college.id] = (views[college.id] || 0) + 1
    window.localStorage.setItem('collegeViews', JSON.stringify(views))

    const historyKey = 'usageHistory'
    const today = new Date().toISOString().slice(0, 10)
    let history = []
    const historyStored = window.localStorage.getItem(historyKey)
    if (historyStored) {
      try {
        history = JSON.parse(historyStored) || []
      } catch {
        history = []
      }
    }
    const last = history[history.length - 1]
    if (last && last.date === today) {
      last.views = (last.views || 0) + 1
    } else {
      history.push({ date: today, views: 1, applies: 0 })
    }
    window.localStorage.setItem(historyKey, JSON.stringify(history.slice(-14)))

    if (!user) return
    const recentKey = `recentColleges:${user.id}`
    const recentStored = window.localStorage.getItem(recentKey)
    let recent = []
    if (recentStored) {
      try {
        recent = JSON.parse(recentStored) || []
      } catch {
        recent = []
      }
    }
    const updated = [college.id, ...recent.filter((value) => value !== college.id)].slice(0, 6)
    window.localStorage.setItem(recentKey, JSON.stringify(updated))
  }, [college, user])

  useEffect(() => {
    if (!college) return
    const stored = window.localStorage.getItem('collegeReviews')
    if (stored) {
      try {
        const parsed = JSON.parse(stored)
        if (Array.isArray(parsed[college.id])) {
          setReviews(parsed[college.id])
        }
      } catch {
        setReviews([])
      }
    }
  }, [college])

  useEffect(() => {
    if (!college) return
    const stored = window.localStorage.getItem('collegeReviews')
    let parsed = {}
    if (stored) {
      try {
        parsed = JSON.parse(stored)
      } catch {
        parsed = {}
      }
    }
    const updated = { ...parsed, [college.id]: reviews }
    window.localStorage.setItem('collegeReviews', JSON.stringify(updated))
  }, [reviews, college])

  const averageReview = useMemo(() => {
    if (reviews.length === 0) return null
    const total = reviews.reduce((sum, review) => sum + Number(review.rating || 0), 0)
    return (total / reviews.length).toFixed(1)
  }, [reviews])

  const handleSubmit = (event) => {
    event.preventDefault()
    if (!form.name.trim() || !form.comment.trim()) return
    const next = {
      id: Date.now(),
      name: form.name.trim(),
      rating: Number(form.rating),
      comment: form.comment.trim(),
      date: new Date().toLocaleDateString(),
    }
    setReviews((prev) => [next, ...prev])
    setForm({ name: '', rating: 5, comment: '' })
  }

  const renderStars = (value) =>
    Array.from({ length: 5 }, (_, index) => (index + 1 <= value ? '★' : '☆')).join(' ')

  const handleApply = () => {
    if (!college) return
    if (!user) {
      navigate('/login', { state: { from: `/college/${college.id}` } })
      return
    }
    const storageKey = `collegeApplications:${user.id}`
    const stored = window.localStorage.getItem(storageKey)
    let applications = []
    if (stored) {
      try {
        applications = JSON.parse(stored) || []
      } catch {
        applications = []
      }
    }
    const next = {
      id: Date.now(),
      collegeId: college.id,
      status: 'Pending',
      date: new Date().toLocaleDateString(),
    }
    applications = [next, ...applications]
    window.localStorage.setItem(storageKey, JSON.stringify(applications))

    const applyStored = window.localStorage.getItem('collegeApplyCounts')
    let counts = {}
    if (applyStored) {
      try {
        counts = JSON.parse(applyStored) || {}
      } catch {
        counts = {}
      }
    }
    counts[college.id] = (counts[college.id] || 0) + 1
    window.localStorage.setItem('collegeApplyCounts', JSON.stringify(counts))

    const historyKey = 'usageHistory'
    const today = new Date().toISOString().slice(0, 10)
    let history = []
    const historyStored = window.localStorage.getItem(historyKey)
    if (historyStored) {
      try {
        history = JSON.parse(historyStored) || []
      } catch {
        history = []
      }
    }
    const last = history[history.length - 1]
    if (last && last.date === today) {
      last.applies = (last.applies || 0) + 1
    } else {
      history.push({ date: today, views: 0, applies: 1 })
    }
    window.localStorage.setItem(historyKey, JSON.stringify(history.slice(-14)))
    setApplyStatus('Applied (pending)')
  }

  const mapQuery = college ? encodeURIComponent(`${college.name}, ${college.location}, ${college.state}`) : ''
  const mapSrc = mapsKey
    ? `https://www.google.com/maps/embed/v1/place?key=${mapsKey}&q=${mapQuery}`
    : `https://www.google.com/maps?q=${mapQuery}&output=embed`

  if (!college) {
    return (
      <section className="section">
        <div className="container">
          <h2 className="section-title">College not found</h2>
          <p className="section-subtitle">Try exploring again from the directory.</p>
          <Link to="/explore" className="btn primary">
            Back to Explore
          </Link>
        </div>
      </section>
    )
  }

  return (
    <section className="section">
      <div className="container">
        <div className="detail-hero">
          <ThreeDViewer />
          <div className="detail-panel">
            <p className="eyebrow">{college.type}</p>
            <h2 className="section-title">{college.name}</h2>
            <p className="section-subtitle">
              {college.location}, {college.state}
            </p>
            <div className="detail-list">
              <div className="detail-item">
                <span>Fees</span>
                <strong>{college.fees}</strong>
              </div>
              <div className="detail-item">
                <span>Placement</span>
                <strong>{college.placement}</strong>
              </div>
              <div className="detail-item">
                <span>Ranking</span>
                <strong>{college.ranking}</strong>
              </div>
              <div className="detail-item">
                <span>Rating</span>
                <strong>
                  {college.rating} {averageReview ? `(${averageReview} avg reviews)` : ''}
                </strong>
              </div>
            </div>
            <div className="hero-actions">
              <button className="btn primary" type="button" onClick={handleApply}>
                Apply Now
              </button>
              {applyStatus && <span className="card-meta">{applyStatus}</span>}
              <Link to="/explore" className="btn ghost">
                Back to Explore
              </Link>
            </div>
          </div>
        </div>
        <div className="section">
          <h2 className="section-title">Placement insights</h2>
          <p className="section-subtitle">Average package and top recruiters for this campus.</p>
          <div className="placement-panel">
            <div className="placement-metrics">
              <div className="metric-card">
                <span className="card-meta">Average package</span>
                <strong>{college.avgPackage} LPA</strong>
              </div>
              <div className="metric-card">
                <span className="card-meta">Highest package</span>
                <strong>{college.maxPackage} LPA</strong>
              </div>
            </div>
            <div className="placement-bars">
              <div className="graph-row">
                <span>Avg package</span>
                <div className="graph-bar">
                  <span style={{ width: `${(college.avgPackage / college.maxPackage) * 100}%` }} />
                </div>
                <strong>{college.avgPackage} LPA</strong>
              </div>
              <div className="graph-row">
                <span>Max package</span>
                <div className="graph-bar accent">
                  <span style={{ width: '100%' }} />
                </div>
                <strong>{college.maxPackage} LPA</strong>
              </div>
            </div>
            <div className="recruiter-list">
              {college.recruiters.map((recruiter) => (
                <span key={recruiter} className="recruiter-chip">
                  {recruiter}
                </span>
              ))}
            </div>
          </div>
        </div>
        <div className="section">
          <h2 className="section-title">Campus media</h2>
          <p className="section-subtitle">Watch campus highlights and explore the gallery.</p>
          <div className="media-grid">
            {college.media?.videos?.map((video) => (
              <div key={video} className="media-card">
                <iframe
                  src={video}
                  title="Campus video"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              </div>
            ))}
            <div className="media-card gallery">
              {college.media?.gallery?.map((item, index) => (
                <img key={`${item}-${index}`} src={item} alt={`${college.name} campus ${index + 1}`} />
              ))}
            </div>
          </div>
          {college.media?.virtualTour && (
            <a className="btn ghost" href={college.media.virtualTour} target="_blank" rel="noreferrer">
              Virtual Tour
            </a>
          )}
        </div>
        <div className="section">
          <h2 className="section-title">Campus walkthrough</h2>
          <p className="section-subtitle">
            Move inside the campus and explore clickable buildings in 3D.
          </p>
          <CampusWalkthrough college={college} />
        </div>
        <div className="section">
          <h2 className="section-title">Campus location</h2>
          <p className="section-subtitle">Find nearby colleges and explore the neighborhood.</p>
          <div className="map-card">
            <iframe title="College location map" loading="lazy" src={mapSrc} />
            {!mapsKey && (
              <p className="card-meta">
                Add `VITE_GOOGLE_MAPS_KEY` in `.env` for full Google Maps experience.
              </p>
            )}
          </div>
        </div>
        <div className="section">
          <h2 className="section-title">Student reviews</h2>
          <p className="section-subtitle">
            Share your experience to help others make informed choices.
          </p>
          <form className="review-form" onSubmit={handleSubmit}>
            <input
              type="text"
              placeholder="Your name"
              value={form.name}
              onChange={(event) => setForm((prev) => ({ ...prev, name: event.target.value }))}
            />
            <div className="review-rating">
              <span className="card-meta">Your rating</span>
              <div className="rating-input">
                {Array.from({ length: 5 }, (_, index) => (
                  <button
                    key={index + 1}
                    type="button"
                    className={form.rating >= index + 1 ? 'active' : ''}
                    onClick={() => setForm((prev) => ({ ...prev, rating: index + 1 }))}
                  >
                    ★
                  </button>
                ))}
              </div>
            </div>
            <textarea
              rows="3"
              placeholder="Write your review"
              value={form.comment}
              onChange={(event) => setForm((prev) => ({ ...prev, comment: event.target.value }))}
            />
            <button className="btn primary" type="submit">
              Submit review
            </button>
          </form>
          <div className="review-list">
            {reviews.length === 0 ? (
              <p className="card-meta">No reviews yet. Be the first to add one.</p>
            ) : (
              reviews.map((review) => (
                <div key={review.id} className="review-card">
                  <div className="review-header">
                    <strong>{review.name}</strong>
                    <span className="rating-stars">{renderStars(review.rating)}</span>
                  </div>
                  <p className="card-meta">{review.date}</p>
                  <p>{review.comment}</p>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </section>
  )
}

export default CollegeDetails
