import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'

function RequireAuth({ children, redirectTo = '/login' }) {
  const { user } = useAuth()
  const location = useLocation()

  if (!user) {
    return <Navigate to={redirectTo} replace state={{ from: location.pathname }} />
  }

  return children
}

export default RequireAuth
