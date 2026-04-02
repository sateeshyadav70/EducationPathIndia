import { useEffect, useState } from 'react'
import { useAuth } from '../context/AuthContext.jsx'

const STORAGE_KEY = 'userNotifications'
const SETTINGS_KEY = 'notificationSettings'

function readNotifications(key) {
  const stored = window.localStorage.getItem(key)
  if (!stored) return []
  try {
    const parsed = JSON.parse(stored)
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

function Notifications() {
  const { user } = useAuth()
  const [open, setOpen] = useState(false)
  const [items, setItems] = useState([])
  const [toast, setToast] = useState(null)
  const [settings, setSettings] = useState({ muteAll: false, muteToast: false })
  const storageKey = user ? `${STORAGE_KEY}:${user.id}` : STORAGE_KEY
  const settingsKey = user ? `${SETTINGS_KEY}:${user.id}` : SETTINGS_KEY

  useEffect(() => {
    setItems(readNotifications(storageKey))
    const storedSettings = window.localStorage.getItem(settingsKey)
    if (storedSettings) {
      try {
        const parsed = JSON.parse(storedSettings)
        if (parsed) setSettings(parsed)
      } catch {
        setSettings({ muteAll: false, muteToast: false })
      }
    }
  }, [storageKey, settingsKey])

  useEffect(() => {
    const handleUpdate = () => {
      const next = readNotifications(storageKey)
      setItems(next)
      if (settings.muteAll || settings.muteToast) return
      if (next.length) {
        const latest = next[0]
        if (!latest.read) {
          setToast(latest)
          window.setTimeout(() => setToast(null), 4000)
        }
      }
    }

    window.addEventListener('notifications:update', handleUpdate)
    window.addEventListener('storage', handleUpdate)
    return () => {
      window.removeEventListener('notifications:update', handleUpdate)
      window.removeEventListener('storage', handleUpdate)
    }
  }, [storageKey, settings.muteAll, settings.muteToast])

  const unreadCount = items.filter((item) => !item.read).length

  const handleMarkAll = () => {
    const updated = items.map((item) => ({ ...item, read: true }))
    setItems(updated)
    window.localStorage.setItem(storageKey, JSON.stringify(updated))
  }

  const handleToggle = (key) => {
    const next = { ...settings, [key]: !settings[key] }
    setSettings(next)
    window.localStorage.setItem(settingsKey, JSON.stringify(next))
  }

  return (
    <div className="notifications">
      <button className="notifications-toggle" type="button" onClick={() => setOpen((prev) => !prev)}>
        Alerts {unreadCount > 0 ? <span className="badge">{unreadCount}</span> : null}
      </button>
      {open && (
        <div className="notifications-panel">
          <div className="notifications-header">
            <strong>Notifications</strong>
            <button type="button" className="btn ghost" onClick={handleMarkAll}>
              Mark all read
            </button>
          </div>
          <div className="notifications-settings">
            <label>
              <input
                type="checkbox"
                checked={settings.muteAll}
                onChange={() => handleToggle('muteAll')}
              />
              Mute all notifications
            </label>
            <label>
              <input
                type="checkbox"
                checked={settings.muteToast}
                onChange={() => handleToggle('muteToast')}
              />
              Disable toast popups
            </label>
          </div>
          <div className="notifications-list">
            {items.length === 0 && <p className="card-meta">No notifications yet.</p>}
            {items.map((item) => (
              <div key={item.id} className={`notification-item${item.read ? '' : ' unread'}`}>
                <p>{item.message}</p>
                <span className="card-meta">{item.date}</span>
              </div>
            ))}
          </div>
        </div>
      )}
      {toast && !settings.muteAll && !settings.muteToast && (
        <div className="notifications-toast">
          <strong>New update</strong>
          <p>{toast.message}</p>
        </div>
      )}
    </div>
  )
}

export default Notifications
