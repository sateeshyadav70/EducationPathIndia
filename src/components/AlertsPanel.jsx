import { useEffect, useState } from 'react'
import { useAuth } from '../context/AuthContext.jsx'

const initialForm = {
  type: 'New College Alerts',
  state: '',
  frequency: 'Weekly',
}

function AlertsPanel() {
  const { user } = useAuth()
  const [alerts, setAlerts] = useState([])
  const [form, setForm] = useState(initialForm)
  const alertsKey = user ? `userAlerts:${user.id}` : null

  useEffect(() => {
    if (!alertsKey) {
      setAlerts([])
      return
    }
    const stored = window.localStorage.getItem(alertsKey)
    if (stored) {
      try {
        const parsed = JSON.parse(stored)
        if (Array.isArray(parsed)) setAlerts(parsed)
      } catch {
        setAlerts([])
      }
    }
  }, [alertsKey])

  useEffect(() => {
    if (!alertsKey) return
    window.localStorage.setItem(alertsKey, JSON.stringify(alerts))
  }, [alerts, alertsKey])

  const handleSubmit = (event) => {
    event.preventDefault()
    if (!form.state.trim()) return
    const next = {
      id: Date.now(),
      ...form,
      state: form.state.trim(),
    }
    setAlerts((prev) => [next, ...prev])
    setForm(initialForm)
  }

  const handleRemove = (id) => {
    setAlerts((prev) => prev.filter((item) => item.id !== id))
  }

  return (
    <section className="section">
      <div className="container">
        <h2 className="section-title">Alerts & reminders</h2>
        <p className="section-subtitle">
          Get notified about new colleges and admission deadlines in your preferred states.
        </p>
        <form className="alerts-form" onSubmit={handleSubmit}>
          <label>
            Alert type
            <select
              value={form.type}
              onChange={(event) => setForm((prev) => ({ ...prev, type: event.target.value }))}
            >
              <option>New College Alerts</option>
              <option>Admission Deadlines</option>
            </select>
          </label>
          <label>
            State
            <input
              type="text"
              placeholder="e.g. Delhi, Karnataka"
              value={form.state}
              onChange={(event) => setForm((prev) => ({ ...prev, state: event.target.value }))}
            />
          </label>
          <label>
            Frequency
            <select
              value={form.frequency}
              onChange={(event) => setForm((prev) => ({ ...prev, frequency: event.target.value }))}
            >
              <option>Weekly</option>
              <option>Monthly</option>
            </select>
          </label>
          <button className="btn primary" type="submit">
            Save alert
          </button>
        </form>
        {alerts.length > 0 && (
          <div className="alerts-list">
            {alerts.map((alert) => (
              <div key={alert.id} className="alert-card">
                <div>
                  <strong>{alert.type}</strong>
                  <p className="card-meta">
                    {alert.state} · {alert.frequency}
                  </p>
                </div>
                <button type="button" className="btn ghost" onClick={() => handleRemove(alert.id)}>
                  Remove
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  )
}

export default AlertsPanel
