import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { colleges } from '../data/colleges.js'
import { useAuth } from '../context/AuthContext.jsx'

const statusOptions = ['Pending', 'Approved', 'Rejected']
const demoApplications = [
  { id: 101, collegeId: 1, status: 'Pending', date: '18 Mar 2026' },
  { id: 102, collegeId: 2, status: 'Approved', date: '05 Feb 2026' },
  { id: 103, collegeId: 3, status: 'Rejected', date: '28 Jan 2026' },
]
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

function Applications() {
  const { user } = useAuth()
  const [applications, setApplications] = useState([])
  const notificationKey = user ? `userNotifications:${user.id}` : 'userNotifications'

  useEffect(() => {
    if (!user) return
    const storageKey = `collegeApplications:${user.id}`
    const stored = window.localStorage.getItem(storageKey)
    if (stored) {
      try {
        const parsed = JSON.parse(stored)
        if (Array.isArray(parsed) && parsed.length > 0) {
          setApplications(parsed)
          return
        }
      } catch {
        setApplications([])
      }
    }
    setApplications(demoApplications)
    window.localStorage.setItem(storageKey, JSON.stringify(demoApplications))
  }, [user])

  useEffect(() => {
    if (!user) return
    const storageKey = `collegeApplications:${user.id}`
    window.localStorage.setItem(storageKey, JSON.stringify(applications))
  }, [applications, user])

  const handleStatusChange = (id, status) => {
    setApplications((prev) =>
      prev.map((app) => (app.id === id ? { ...app, status } : app)),
    )
    const target = applications.find((app) => app.id === id)
    if (target) {
      const college = colleges.find((item) => item.id === target.collegeId)
      pushNotification(notificationKey, `Application status updated: ${college?.name || 'College'} → ${status}`)
    }
  }

  return (
    <section className="section">
      <div className="container">
        <h2 className="section-title">Application tracking</h2>
        <p className="section-subtitle">Monitor your applied colleges and update statuses.</p>
        {applications.length === 0 ? (
          <div className="empty-panel">
            <p className="card-meta">You have no applications yet.</p>
            <Link className="btn primary" to="/explore">
              Explore colleges
            </Link>
          </div>
        ) : null}
        {applications.length > 0 ? (
          <div className="application-list">
            {applications.map((application) => {
              const college = colleges.find((item) => item.id === application.collegeId)
              return (
                <div key={application.id} className="application-card">
                  <div>
                    <strong>{college?.name || 'College'}</strong>
                    <p className="card-meta">{college?.location}</p>
                    <p className="card-meta">Applied on {application.date}</p>
                  </div>
                  <div className="application-status">
                    <label>
                      Status
                      <select
                        value={application.status}
                        onChange={(event) => handleStatusChange(application.id, event.target.value)}
                      >
                        {statusOptions.map((status) => (
                          <option key={status} value={status}>
                            {status}
                          </option>
                        ))}
                      </select>
                    </label>
                  </div>
                </div>
              )
            })}
          </div>
        ) : null}
      </div>
    </section>
  )
}

export default Applications
