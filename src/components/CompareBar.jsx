function CompareBar({ selected, onRemove, onCompare }) {
  const isReady = selected.length >= 2

  return (
    <div className="compare-bar">
      <div className="compare-list">
        {selected.length === 0 ? (
          <span className="card-meta">Select up to 3 colleges to compare.</span>
        ) : (
          selected.map((college) => (
            <span key={college.id} className="compare-chip">
              {college.name}
              <button type="button" onClick={() => onRemove(college.id)} aria-label={`Remove ${college.name}`}>
                x
              </button>
            </span>
          ))
        )}
      </div>
      <button className="btn primary" type="button" onClick={onCompare} disabled={!isReady}>
        Compare
      </button>
    </div>
  )
}

export default CompareBar
