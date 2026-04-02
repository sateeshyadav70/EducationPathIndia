import { Routes, Route, Navigate } from 'react-router-dom'
import Navbar from './components/Navbar.jsx'
import Footer from './components/Footer.jsx'
import Chatbot from './components/Chatbot.jsx'
import Notifications from './components/Notifications.jsx'
import Home from './pages/Home.jsx'
import Explore from './pages/Explore.jsx'
import CollegeDetails from './pages/CollegeDetails.jsx'
import Compare from './pages/Compare.jsx'
import RankPredictor from './pages/RankPredictor.jsx'
import Dashboard from './pages/Dashboard.jsx'
import Applications from './pages/Applications.jsx'
import Scholarships from './pages/Scholarships.jsx'
import Login from './pages/Login.jsx'
import Signup from './pages/Signup.jsx'
import Profile from './pages/Profile.jsx'
import RequireAuth from './components/RequireAuth.jsx'
import { useAuth } from './context/AuthContext.jsx'

function App() {
  const { user } = useAuth()
  return (
    <div className="app min-h-screen transition-colors duration-300">
      <Navbar />
      <main className="app-main">
        <Routes>
          <Route path="/" element={user ? <Home /> : <Navigate to="/explore" replace />} />
          <Route path="/explore" element={<Explore />} />
          <Route
            path="/college/:id"
            element={
              <RequireAuth>
                <CollegeDetails />
              </RequireAuth>
            }
          />
          <Route
            path="/compare"
            element={
              <RequireAuth>
                <Compare />
              </RequireAuth>
            }
          />
          <Route
            path="/predictor"
            element={
              <RequireAuth>
                <RankPredictor />
              </RequireAuth>
            }
          />
          <Route
            path="/dashboard"
            element={
              <RequireAuth>
                <Dashboard />
              </RequireAuth>
            }
          />
          <Route
            path="/applications"
            element={
              <RequireAuth>
                <Applications />
              </RequireAuth>
            }
          />
          <Route
            path="/profile"
            element={
              <RequireAuth>
                <Profile />
              </RequireAuth>
            }
          />
          <Route
            path="/scholarships"
            element={
              <RequireAuth>
                <Scholarships />
              </RequireAuth>
            }
          />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
      {user && <Notifications />}
      {user && <Chatbot />}
      <Footer />
    </div>
  )
}

export default App
