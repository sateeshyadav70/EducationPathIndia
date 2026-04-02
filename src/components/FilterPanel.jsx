function FilterPanel({ filters, options, suggestions = [], onSuggestionSelect, onChange, onReset }) {
  return (
    <div className="filter-panel">
      <div className="filter-row">
        <div className="autocomplete">
          <input
            type="search"
            placeholder="Search colleges, locations, or keywords"
            value={filters.query}
            onChange={(event) => onChange({ ...filters, query: event.target.value })}
          />
          {suggestions.length > 0 && (
            <div className="autocomplete-list" role="listbox">
              {suggestions.map((item) => (
                <button
                  key={item}
                  type="button"
                  className="autocomplete-item"
                  onClick={() => onSuggestionSelect?.(item)}
                >
                  {item}
                </button>
              ))}
            </div>
          )}
        </div>
        <button className="btn ghost" type="button" onClick={onReset}>
          Reset
        </button>
      </div>
      <div className="filter-grid">
        <div className="filter-field">
          <label htmlFor="filter-state">State</label>
          <select
            id="filter-state"
            value={filters.state}
            onChange={(event) => onChange({ ...filters, state: event.target.value })}
          >
            <option value="">All States</option>
            {options.states.map((state) => (
              <option key={state} value={state}>
                {state}
              </option>
            ))}
          </select>
        </div>
        <div className="filter-field">
          <label htmlFor="filter-course">Course</label>
          <select
            id="filter-course"
            value={filters.course}
            onChange={(event) => onChange({ ...filters, course: event.target.value })}
          >
            <option value="">All Courses</option>
            {options.courses.map((course) => (
              <option key={course} value={course}>
                {course}
              </option>
            ))}
          </select>
        </div>
        <div className="filter-field">
          <label htmlFor="filter-type">Type</label>
          <select
            id="filter-type"
            value={filters.type}
            onChange={(event) => onChange({ ...filters, type: event.target.value })}
          >
            <option value="">All Types</option>
            {options.types.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>
        </div>
        <div className="filter-field">
          <label htmlFor="filter-fees">Fees Range</label>
          <select
            id="filter-fees"
            value={filters.feesRange}
            onChange={(event) => onChange({ ...filters, feesRange: event.target.value })}
          >
            <option value="">All Fees</option>
            {options.feesRanges.map((range) => (
              <option key={range.value} value={range.value}>
                {range.label}
              </option>
            ))}
          </select>
        </div>
        <div className="filter-field">
          <label htmlFor="filter-ranking">Ranking</label>
          <select
            id="filter-ranking"
            value={filters.ranking}
            onChange={(event) => onChange({ ...filters, ranking: event.target.value })}
          >
            <option value="">All Rankings</option>
            {options.rankings.map((rank) => (
              <option key={rank.value} value={rank.value}>
                {rank.label}
              </option>
            ))}
          </select>
        </div>
        <div className="filter-field">
          <label htmlFor="filter-sort">Sort By</label>
          <select
            id="filter-sort"
            value={filters.sortBy}
            onChange={(event) => onChange({ ...filters, sortBy: event.target.value })}
          >
            {options.sorts.map((sort) => (
              <option key={sort.value} value={sort.value}>
                {sort.label}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  )
}

export default FilterPanel
