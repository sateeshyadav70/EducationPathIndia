import { NavLink, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'

function Navbar() {
  const { user } = useAuth()
  return (
    <header className="navbar">
      <div className="container navbar-inner">
        <Link to="/" className="logo">
          <span className="logo-mark" aria-hidden="true" />
          <span>
            EducationPath
            <strong>India</strong>
          </span>
        </Link>
        <nav className="nav-links" aria-label="Primary">
          {user && (
            <NavLink to="/" end className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}>
              Home
            </NavLink>
          )}
          <NavLink to="/explore" className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}>
            Explore
          </NavLink>
          {user && (
            <>
              <NavLink to="/compare" className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}>
                Compare
              </NavLink>
              <NavLink to="/predictor" className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}>
                Predictor
              </NavLink>
              <NavLink to="/dashboard" className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}>
                Dashboard
              </NavLink>
              <NavLink to="/scholarships" className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}>
                Scholarships
              </NavLink>
              <NavLink to="/applications" className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}>
                Applications
              </NavLink>
              <NavLink to="/profile" className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}>
                Profile
              </NavLink>
            </>
          )}
        </nav>
        <div className="flex items-center gap-4">
          {user ? null : (
            <Link className="btn ghost border-2 border-amber-300" to="/login">
              Login
            </Link>
          )}
        </div>
      </div>
    </header>
  )
}

export default Navbar
