import { useMemo } from 'react'
import { useAuth } from '../context/AuthContext.jsx'
import ThemeToggle from '../components/ThemeToggle.jsx'

function Profile() {
  const { user, logout } = useAuth()

  const profile = useMemo(() => {
    const name = user?.name || ''
    const email = user?.email || ''
    const initials = name
      .split(' ')
      .filter(Boolean)
      .slice(0, 2)
      .map((word) => word[0])
      .join('')
      .toUpperCase()
    const avatar = user?.avatar ||
      `https://ui-avatars.com/api/?name=${encodeURIComponent(name || 'EP')}&background=0D8ABC&color=ffffff&size=128`
    return { name, email, initials: initials || 'EP', avatar }
  }, [user])

  return (
    <section className="section profile-page">
      <div className="container profile-layout">
        <div className="profile-header">
          <p className="eyebrow">Profile</p>
          <h1 className="section-title">Your account profile</h1>
          <p className="section-subtitle">Logged-in user details will appear here after login.</p>
        </div>
        <div className="profile-shell">
          <div className="profile-top" style={{display:'flex', justifyContent:'space-between', alignItems:'center', gap:'12px'}}>
            <span className="profile-top-title">Profile</span>
            <div style={{display:'flex', alignItems:'center', gap:'8px'}}>
              <ThemeToggle />
              <button className="profile-logout" type="button" onClick={logout}>
                Logout
              </button>
            </div>
          </div>
          <div className="profile-card">
            <div className="profile-avatar" aria-hidden="true">
              <img src={profile.avatar} alt={`${profile.name || 'User'} avatar`} />
            </div>
            <h2 className="profile-name">{profile.name || 'Guest'}</h2>
            <p className="profile-email">{profile.email || 'No email available'}</p>
          </div>
        </div>
      </div>
    </section>
  )
}

export default Profile
