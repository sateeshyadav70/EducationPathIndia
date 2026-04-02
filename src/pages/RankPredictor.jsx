import { useMemo, useState } from 'react'
import CollegeCard from '../components/CollegeCard.jsx'
import { colleges } from '../data/colleges.js'

const initialForm = {
  marks: '',
  budget: '',
  location: '',
  course: '',
}

function RankPredictor() {
  const [form, setForm] = useState(initialForm)

  const recommendations = useMemo(() => {
    const marks = Number(form.marks || 0)
    const budget = Number(form.budget || 0)
    const location = form.location.trim().toLowerCase()
    const course = form.course.trim().toLowerCase()

    const scored = colleges
      .map((college) => {
        const budgetScore = budget && (college.feesValue || 0) <= budget ? 6 : budget ? -4 : 0
        const courseScore = course && college.course.toLowerCase().includes(course) ? 6 : 0
        const locationScore =
          location &&
          (college.location.toLowerCase().includes(location) ||
            college.state.toLowerCase().includes(location))
            ? 5
            : 0
        const marksScore = marks >= 90 ? 8 : marks >= 80 ? 6 : marks >= 70 ? 4 : 2
        const score =
          (college.rating || 0) * 18 +
          (college.placementValue || 0) * 1.1 -
          (college.feesValue || 0) * 1.5 +
          budgetScore +
          courseScore +
          locationScore +
          marksScore
        return { ...college, score }
      })
      .sort((a, b) => b.score - a.score)

    const top = scored.slice(0, 4)
    const maxScore = Math.max(1, ...top.map((item) => item.score))
    return top.map((item) => ({
      ...item,
      match: Math.round((item.score / maxScore) * 100),
    }))
  }, [form])

  const topPick = recommendations[0]
  const confidenceLabel = topPick
    ? topPick.match >= 85
      ? 'High confidence'
      : topPick.match >= 70
        ? 'Good confidence'
        : 'Moderate confidence'
    : 'Add details for a match score'

  const reasons = topPick
    ? [
        form.budget && (topPick.feesValue || 0) <= Number(form.budget)
          ? 'Within your budget'
          : null,
        form.location &&
        (topPick.location.toLowerCase().includes(form.location.toLowerCase()) ||
          topPick.state.toLowerCase().includes(form.location.toLowerCase()))
          ? 'Matches preferred location'
          : null,
        form.course && topPick.course.toLowerCase().includes(form.course.toLowerCase())
          ? 'Course alignment'
          : null,
        Number(form.marks || 0) >= 80 ? 'Strong academic fit' : null,
      ].filter(Boolean)
    : []

  return (
    <section className="section">
      <div className="container">
        <h2 className="section-title">Rank predictor</h2>
        <p className="section-subtitle">
          Enter marks and preferences to predict the best-matching colleges.
        </p>
        <form className="predictor-form" onSubmit={(event) => event.preventDefault()}>
          <label>
            Marks (0-100)
            <input
              type="number"
              min="0"
              max="100"
              value={form.marks}
              onChange={(event) => setForm((prev) => ({ ...prev, marks: event.target.value }))}
            />
          </label>
          <label>
            Budget (L/year)
            <input
              type="number"
              min="0"
              step="0.1"
              value={form.budget}
              onChange={(event) => setForm((prev) => ({ ...prev, budget: event.target.value }))}
            />
          </label>
          <label>
            Preferred location
            <input
              type="text"
              value={form.location}
              onChange={(event) => setForm((prev) => ({ ...prev, location: event.target.value }))}
            />
          </label>
          <label>
            Course
            <input
              type="text"
              value={form.course}
              onChange={(event) => setForm((prev) => ({ ...prev, course: event.target.value }))}
            />
          </label>
        </form>
        <div className="predictor-insights">
          <div className="insight-card">
            <h3>{topPick ? `${topPick.name} is your best match` : 'Enter details to get matches'}</h3>
            <p className="card-meta">{confidenceLabel}</p>
            {topPick && (
              <div className="confidence-bar">
                <span style={{ width: `${topPick.match}%` }} />
              </div>
            )}
            {reasons.length > 0 && (
              <ul className="insight-list">
                {reasons.map((reason) => (
                  <li key={reason}>{reason}</li>
                ))}
              </ul>
            )}
          </div>
          <div className="insight-card">
            <h3>Match confidence chart</h3>
            <div className="confidence-list">
              {recommendations.map((college) => (
                <div key={college.id} className="confidence-row">
                  <span>{college.name}</span>
                  <div className="confidence-bar small">
                    <span style={{ width: `${college.match}%` }} />
                  </div>
                  <strong>{college.match}%</strong>
                </div>
              ))}
            </div>
          </div>
        </div>
        <div className="cards-grid">
          {recommendations.map((college) => (
            <CollegeCard
              key={college.id}
              college={college}
              showSave={false}
              badge={`${college.match}% match`}
            />
          ))}
        </div>
      </div>
    </section>
  )
}

export default RankPredictor
