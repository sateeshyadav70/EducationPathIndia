import { useEffect, useMemo, useState } from 'react'
import { scholarships } from '../data/scholarships.js'
import { useAuth } from '../context/AuthContext.jsx'

const initialFilters = {
  course: '',
  state: '',
  marks: '',
  income: '',
}

const pushNotification = (key, message) => {
  const stored = window.localStorage.getItem(key)
  let items = []
  if (stored) {
    try {
      items = JSON.parse(stored) || []
    } catch {
      items = []
    }
  }
  const next = {
    id: Date.now(),
    message,
    date: new Date().toLocaleString(),
    read: false,
  }
  const updated = [next, ...items].slice(0, 20)
  window.localStorage.setItem(key, JSON.stringify(updated))
  window.dispatchEvent(new Event('notifications:update'))
}

function Scholarships() {
  const { user } = useAuth()
  const [filters, setFilters] = useState(initialFilters)
  const [appliedIds, setAppliedIds] = useState([])
  const [showModal, setShowModal] = useState(false)
  const [selectedScholarship, setSelectedScholarship] = useState(null)
  const [form, setForm] = useState({
    name: '',
    email: '',
    marks: '',
    income: '',
    document: null,
  })
  const notificationKey = user ? `userNotifications:${user.id}` : 'userNotifications'
  const applicationsKey = user ? `scholarshipApplications:${user.id}` : 'scholarshipApplications'
  const detailedKey = user
    ? `scholarshipApplicationsDetailed:${user.id}`
    : 'scholarshipApplicationsDetailed'

  useEffect(() => {
    const stored = window.localStorage.getItem(applicationsKey)
    if (stored) {
      try {
        const parsed = JSON.parse(stored)
        if (Array.isArray(parsed)) setAppliedIds(parsed)
      } catch {
        setAppliedIds([])
      }
    }
  }, [applicationsKey])

  const filtered = useMemo(() => {
    const marks = Number(filters.marks || 0)
    const income = Number(filters.income || 0)
    return scholarships.filter((item) => {
      const matchesCourse =
        !filters.course || item.course.toLowerCase().includes(filters.course.toLowerCase())
      const matchesState =
        !filters.state ||
        item.state.toLowerCase().includes(filters.state.toLowerCase()) ||
        item.state === 'All India'
      const matchesMarks = !filters.marks || marks >= item.minMarks
      const matchesIncome = !filters.income || income <= item.maxIncome
      return matchesCourse && matchesState && matchesMarks && matchesIncome
    })
  }, [filters])

  const handleApply = (id) => {
    if (appliedIds.includes(id)) return
    const scholarship = scholarships.find((item) => item.id === id)
    setSelectedScholarship(scholarship)
    setShowModal(true)
  }

  const handleSubmit = (event) => {
    event.preventDefault()
    if (!selectedScholarship) return
    if (!form.name.trim() || !form.email.trim()) return
    const updated = [...appliedIds, selectedScholarship.id]
    setAppliedIds(updated)
    window.localStorage.setItem(applicationsKey, JSON.stringify(updated))

    const stored = window.localStorage.getItem(detailedKey)
    let detailed = []
    if (stored) {
      try {
        detailed = JSON.parse(stored) || []
      } catch {
        detailed = []
      }
    }
    detailed = [
      {
        id: Date.now(),
        scholarshipId: selectedScholarship.id,
        name: form.name.trim(),
        email: form.email.trim(),
        marks: form.marks,
        income: form.income,
        document: form.document?.name || '',
        date: new Date().toLocaleDateString(),
      },
      ...detailed,
    ]
    window.localStorage.setItem(detailedKey, JSON.stringify(detailed))
    pushNotification(notificationKey, `Scholarship applied: ${selectedScholarship.name}`)
    setShowModal(false)
    setForm({ name: '', email: '', marks: '', income: '', document: null })
  }

  return (
    <section className="section">
      <div className="container">
        <h2 className="section-title">Scholarships</h2>
        <p className="section-subtitle">Filter scholarships by eligibility and deadlines.</p>
        <form className="scholarship-filters" onSubmit={(event) => event.preventDefault()}>
          <label>
            Course
            <input
              type="text"
              placeholder="Engineering, Medical..."
              value={filters.course}
              onChange={(event) => setFilters((prev) => ({ ...prev, course: event.target.value }))}
            />
          </label>
          <label>
            State
            <input
              type="text"
              placeholder="Delhi, Maharashtra..."
              value={filters.state}
              onChange={(event) => setFilters((prev) => ({ ...prev, state: event.target.value }))}
            />
          </label>
          <label>
            Marks
            <input
              type="number"
              min="0"
              max="100"
              placeholder="80"
              value={filters.marks}
              onChange={(event) => setFilters((prev) => ({ ...prev, marks: event.target.value }))}
            />
          </label>
          <label>
            Family income (L)
            <input
              type="number"
              min="0"
              step="0.5"
              placeholder="8"
              value={filters.income}
              onChange={(event) => setFilters((prev) => ({ ...prev, income: event.target.value }))}
            />
          </label>
        </form>
        <div className="scholarship-grid">
          {filtered.map((item) => (
            <div key={item.id} className="scholarship-card">
              <div>
                <h3>{item.name}</h3>
                <p className="card-meta">{item.amount}</p>
                <p className="card-meta">
                  {item.course} · {item.state}
                </p>
              </div>
              <div className="scholarship-meta">
                <span>Min marks: {item.minMarks}</span>
                <span>Max income: {item.maxIncome}L</span>
                <span>Deadline: {item.deadline}</span>
              </div>
              <button
                className="btn ghost"
                type="button"
                onClick={() => handleApply(item.id)}
                disabled={appliedIds.includes(item.id)}
              >
                {appliedIds.includes(item.id) ? 'Applied' : 'Apply now'}
              </button>
            </div>
          ))}
        </div>
        {filtered.length === 0 && (
          <p className="card-meta">No scholarships match those filters right now.</p>
        )}
      </div>
      {showModal && selectedScholarship && (
        <div className="modal-backdrop" role="dialog" aria-modal="true">
          <div className="modal-card">
            <div className="modal-header">
              <h3>Apply for {selectedScholarship.name}</h3>
              <button type="button" className="btn ghost" onClick={() => setShowModal(false)}>
                Close
              </button>
            </div>
            <form className="modal-form" onSubmit={handleSubmit}>
              <label>
                Full name
                <input
                  type="text"
                  value={form.name}
                  onChange={(event) => setForm((prev) => ({ ...prev, name: event.target.value }))}
                />
              </label>
              <label>
                Email
                <input
                  type="email"
                  value={form.email}
                  onChange={(event) => setForm((prev) => ({ ...prev, email: event.target.value }))}
                />
              </label>
              <label>
                Marks
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={form.marks}
                  onChange={(event) => setForm((prev) => ({ ...prev, marks: event.target.value }))}
                />
              </label>
              <label>
                Family income (L)
                <input
                  type="number"
                  min="0"
                  step="0.5"
                  value={form.income}
                  onChange={(event) => setForm((prev) => ({ ...prev, income: event.target.value }))}
                />
              </label>
              <label>
                Upload documents
                <input
                  type="file"
                  onChange={(event) => setForm((prev) => ({ ...prev, document: event.target.files?.[0] }))}
                />
              </label>
              <button className="btn primary" type="submit">
                Submit application
              </button>
            </form>
          </div>
        </div>
      )}
    </section>
  )
}

export default Scholarships
