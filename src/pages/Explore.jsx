import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import CollegeCard from '../components/CollegeCard.jsx'
import FilterPanel from '../components/FilterPanel.jsx'
import CompareBar from '../components/CompareBar.jsx'
import RecommendationPanel from '../components/RecommendationPanel.jsx'
import { colleges } from '../data/colleges.js'
import { useAuth } from '../context/AuthContext.jsx'

const defaultFilters = {
  query: '',
  state: '',
  course: '',
  type: '',
  feesRange: '',
  ranking: '',
  sortBy: 'relevance',
}

function Explore() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [filters, setFilters] = useState(defaultFilters)
  const [selectedIds, setSelectedIds] = useState([])
  const [savedIds, setSavedIds] = useState([])
  const savedKey = user ? `savedColleges:${user.id}` : null

  useEffect(() => {
    const stored = window.localStorage.getItem('compareIds')
    if (stored) {
      try {
        const parsed = JSON.parse(stored)
        if (Array.isArray(parsed)) setSelectedIds(parsed)
      } catch {
        setSelectedIds([])
      }
    }
  }, [])

  useEffect(() => {
    window.localStorage.setItem('compareIds', JSON.stringify(selectedIds))
  }, [selectedIds])

  useEffect(() => {
    if (!savedKey) {
      setSavedIds([])
      return
    }
    const stored = window.localStorage.getItem(savedKey)
    if (stored) {
      try {
        const parsed = JSON.parse(stored)
        if (Array.isArray(parsed)) setSavedIds(parsed)
      } catch {
        setSavedIds([])
      }
    }
  }, [savedKey])

  useEffect(() => {
    if (!savedKey) return
    window.localStorage.setItem(savedKey, JSON.stringify(savedIds))
  }, [savedIds, savedKey])

  const options = useMemo(() => {
    const states = [...new Set(colleges.map((college) => college.state))]
    const courses = [...new Set(colleges.map((college) => college.course))]
    const types = [...new Set(colleges.map((college) => college.type))]
    const feesRanges = [
      { value: 'under-2', label: 'Under 2L/year' },
      { value: '2-4', label: '2L - 4L/year' },
      { value: '4-6', label: '4L - 6L/year' },
      { value: '6-plus', label: '6L+ /year' },
    ]
    const rankings = [
      { value: 'top-5', label: 'Top 5' },
      { value: 'top-10', label: 'Top 10' },
      { value: 'top-20', label: 'Top 20' },
      { value: 'top-50', label: 'Top 50' },
    ]
    const sorts = [
      { value: 'relevance', label: 'Relevance' },
      { value: 'fees-asc', label: 'Fees: Low to High' },
      { value: 'placement-desc', label: 'Placement: High to Low' },
    ]
    return { states, courses, types, feesRanges, rankings, sorts }
  }, [])

  const filtered = useMemo(() => {
    const query = filters.query.trim().toLowerCase()
    let results = colleges.filter((college) => {
      const matchesQuery =
        !query ||
        college.name.toLowerCase().includes(query) ||
        college.location.toLowerCase().includes(query) ||
        college.course.toLowerCase().includes(query) ||
        college.state.toLowerCase().includes(query)
      const matchesState = !filters.state || college.state === filters.state
      const matchesCourse = !filters.course || college.course === filters.course
      const matchesType = !filters.type || college.type === filters.type
      const matchesFees = (() => {
        if (!filters.feesRange) return true
        const value = Number(college.feesValue || 0)
        if (filters.feesRange === 'under-2') return value < 2
        if (filters.feesRange === '2-4') return value >= 2 && value <= 4
        if (filters.feesRange === '4-6') return value > 4 && value <= 6
        if (filters.feesRange === '6-plus') return value > 6
        return true
      })()
      const matchesRanking = (() => {
        if (!filters.ranking) return true
        const rank = Number(college.rankingValue || 999)
        if (filters.ranking === 'top-5') return rank <= 5
        if (filters.ranking === 'top-10') return rank <= 10
        if (filters.ranking === 'top-20') return rank <= 20
        if (filters.ranking === 'top-50') return rank <= 50
        return true
      })()
      return matchesQuery && matchesState && matchesCourse && matchesType && matchesFees && matchesRanking
    })

    if (filters.sortBy === 'fees-asc') {
      results = [...results].sort((a, b) => (a.feesValue || 0) - (b.feesValue || 0))
    }
    if (filters.sortBy === 'placement-desc') {
      results = [...results].sort((a, b) => (b.placementValue || 0) - (a.placementValue || 0))
    }

    return results
  }, [filters])

  const selectedColleges = colleges.filter((college) => selectedIds.includes(college.id))
  const savedColleges = colleges.filter((college) => savedIds.includes(college.id))

  const suggestions = useMemo(() => {
    const query = filters.query.trim().toLowerCase()
    if (!query || query.length < 2) return []
    return colleges
      .filter((college) => college.name.toLowerCase().includes(query))
      .map((college) => college.name)
      .slice(0, 5)
  }, [filters.query])

  const handleToggleCompare = (id) => {
    setSelectedIds((prev) => {
      if (prev.includes(id)) {
        return prev.filter((value) => value !== id)
      }
      if (prev.length >= 3) {
        return prev
      }
      return [...prev, id]
    })
  }

  const handleRemoveCompare = (id) => {
    setSelectedIds((prev) => prev.filter((value) => value !== id))
  }

  const handleCompare = () => {
    window.localStorage.setItem('compareIds', JSON.stringify(selectedIds))
    navigate('/compare', { state: { ids: selectedIds } })
  }

  const handleSaveToggle = (id) => {
    if (!user) {
      navigate('/login', { state: { from: '/explore' } })
      return
    }
    setSavedIds((prev) => {
      if (prev.includes(id)) {
        return prev.filter((value) => value !== id)
      }
      return [...prev, id]
    })
  }

  return (
    <>
      <section className="section">
        <div className="container">
          <h2 className="section-title">Explore colleges</h2>
          <p className="section-subtitle">
            Search by state, course, or type. Select up to three colleges to compare side by side.
          </p>
          <FilterPanel
            filters={filters}
            options={options}
            suggestions={suggestions}
            onSuggestionSelect={(value) => setFilters((prev) => ({ ...prev, query: value }))}
            onChange={setFilters}
            onReset={() => setFilters(defaultFilters)}
          />
          <div style={{ height: '24px' }} />
          {filtered.length === 0 ? (
            <p className="card-meta">No colleges match those filters. Try adjusting your search.</p>
          ) : (
            <div className="cards-grid">
              {filtered.map((college) => (
                <CollegeCard
                  key={college.id}
                  college={college}
                  showCompare
                  isCompared={selectedIds.includes(college.id)}
                  onCompareToggle={handleToggleCompare}
                  showSave
                  isSaved={savedIds.includes(college.id)}
                  onSaveToggle={handleSaveToggle}
                />
              ))}
            </div>
          )}
          <CompareBar selected={selectedColleges} onRemove={handleRemoveCompare} onCompare={handleCompare} />
          {savedColleges.length > 0 && (
            <div className="section">
              <h2 className="section-title">Saved colleges</h2>
              <p className="section-subtitle">Quick access to your bookmarked colleges.</p>
              <div className="cards-grid">
                {savedColleges.map((college) => (
                  <CollegeCard
                    key={college.id}
                    college={college}
                    showCompare={false}
                    isSaved
                    onSaveToggle={handleSaveToggle}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      </section>
      <RecommendationPanel colleges={colleges} />
    </>
  )
}

export default Explore
