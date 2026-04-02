import { Link } from 'react-router-dom'
import fallbackImage from '../assets/hero.png'

function CollegeCard({
  college,
  showCompare = false,
  isCompared = false,
  onCompareToggle,
  showSave = true,
  isSaved = false,
  onSaveToggle,
  badge,
}) {
  const handleImageError = (event) => {
    event.currentTarget.src = fallbackImage
  }

  const rating = Number(college.rating || 0)
  const stars = Array.from({ length: 5 }, (_, index) => (index + 1 <= Math.round(rating) ? '★' : '☆'))

  return (
    <article className="college-card">
      <div className="card-media">
        <img src={college.image || fallbackImage} alt={college.name} onError={handleImageError} />
        {showCompare && (
          <button
            className={`compare-toggle${isCompared ? ' active' : ''}`}
            type="button"
            onClick={() => onCompareToggle?.(college.id)}
          >
            {isCompared ? 'Selected' : 'Compare'}
          </button>
        )}
        {showSave && (
          <button
            className={`save-toggle${isSaved ? ' active' : ''}`}
            type="button"
            onClick={() => onSaveToggle?.(college.id)}
          >
            {isSaved ? 'Saved' : 'Save'}
          </button>
        )}
      </div>
      <div className="card-body">
        <span className="card-tag">{college.type}</span>
        {badge && <span className="card-badge">{badge}</span>}
        <h3 className="card-title">{college.name}</h3>
        <p className="card-meta">
          {college.location}, {college.state}
        </p>
        <div className="card-rating" aria-label={`Rated ${rating} out of 5`}>
          <span className="rating-stars">{stars.join(' ')}</span>
          <span className="card-meta">{rating.toFixed(1)}</span>
        </div>
        <div className="card-info">
          <span>Fees: {college.fees}</span>
          <span>Placement: {college.placement}</span>
        </div>
        <Link className="btn primary" to={`/college/${college.id}`}>
          View Details
        </Link>
      </div>
    </article>
  )
}

export default CollegeCard
