import { useMemo, useState } from 'react'
import CollegeCard from './CollegeCard.jsx'

const initialForm = {
  marks: '',
  budget: '',
  location: '',
}

function RecommendationPanel({ colleges }) {
  const [form, setForm] = useState(initialForm)

  const recommendations = useMemo(() => {
    const marks = Number(form.marks || 0)
    const budget = Number(form.budget || 0)
    const location = form.location.trim().toLowerCase()

    const scored = colleges
      .filter((college) => {
        if (budget && (college.feesValue || 0) > budget) return false
        if (!location) return true
        return (
          college.location.toLowerCase().includes(location) ||
          college.state.toLowerCase().includes(location)
        )
      })
      .map((college) => {
        const locationBonus =
          location &&
          (college.location.toLowerCase().includes(location) ||
            college.state.toLowerCase().includes(location))
            ? 8
            : 0
        const marksScore = marks ? (marks / 100) * 10 : 5
        const score =
          (college.rating || 0) * 20 +
          (college.placementValue || 0) * 1.2 -
          (college.feesValue || 0) * 2 +
          marksScore +
          locationBonus
        return { ...college, score }
      })
      .sort((a, b) => b.score - a.score)

    return scored.slice(0, 4)
  }, [colleges, form])

  return (
    <section className="section">
      <div className="container">
        <div className="ai-panel">
          <div>
            <p className="eyebrow">AI recommendation</p>
            <h2 className="section-title">Find your best-fit colleges</h2>
            <p className="section-subtitle">
              Enter marks, budget, and preferred location. We will shortlist the most relevant
              colleges instantly.
            </p>
          </div>
          <form className="ai-form" onSubmit={(event) => event.preventDefault()}>
            <label>
              Marks (0-100)
              <input
                type="number"
                min="0"
                max="100"
                placeholder="e.g. 92"
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
                placeholder="e.g. 4"
                value={form.budget}
                onChange={(event) => setForm((prev) => ({ ...prev, budget: event.target.value }))}
              />
            </label>
            <label>
              Location
              <input
                type="text"
                placeholder="Delhi, Mumbai, Karnataka..."
                value={form.location}
                onChange={(event) => setForm((prev) => ({ ...prev, location: event.target.value }))}
              />
            </label>
          </form>
        </div>
        <div className="cards-grid">
          {recommendations.map((college) => (
            <CollegeCard key={college.id} college={college} showSave={false} />
          ))}
        </div>
      </div>
    </section>
  )
}

export default RecommendationPanel
