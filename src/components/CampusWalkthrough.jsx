import { useMemo, useState } from 'react'
import ThreeDViewer from './ThreeDViewer.jsx'

function CampusWalkthrough({ college }) {
  const buildings = useMemo(() => college.buildings || [], [college.buildings])
  const [activeIndex, setActiveIndex] = useState(0)
  const active = buildings[activeIndex]

  const hotspotPositions = useMemo(
    () => [
      { left: '18%', top: '22%' },
      { left: '72%', top: '26%' },
      { left: '50%', top: '64%' },
      { left: '28%', top: '58%' },
      { left: '78%', top: '70%' },
    ],
    [],
  )

  const handlePrev = () => {
    setActiveIndex((prev) => (prev === 0 ? buildings.length - 1 : prev - 1))
  }

  const handleNext = () => {
    setActiveIndex((prev) => (prev === buildings.length - 1 ? 0 : prev + 1))
  }

  return (
    <div className="walkthrough">
      <div className="walkthrough-visual">
        <div className="walkthrough-header">
          <p className="eyebrow">3D campus walkthrough (beta)</p>
          <p className="card-meta">Rotate, zoom, and explore key buildings.</p>
        </div>
        <div className="walkthrough-canvas">
          <ThreeDViewer />
          <div className="hotspot-layer">
            {buildings.map((building, index) => {
              const pos = hotspotPositions[index % hotspotPositions.length]
              return (
                <button
                  key={building.name}
                  type="button"
                  className={`hotspot${active?.name === building.name ? ' active' : ''}`}
                  style={{ left: pos.left, top: pos.top }}
                  onClick={() => setActiveIndex(index)}
                >
                  <span />
                  <strong>{building.name}</strong>
                </button>
              )
            })}
          </div>
        </div>
        {buildings.length > 1 && (
          <div className="walkthrough-actions">
            <button className="btn ghost" type="button" onClick={handlePrev}>
              Previous
            </button>
            <button className="btn ghost" type="button" onClick={handleNext}>
              Next
            </button>
          </div>
        )}
      </div>
      <div className="walkthrough-panel">
        <h3>Clickable buildings</h3>
        <div className="building-list">
          {buildings.map((building, index) => (
            <button
              key={building.name}
              type="button"
              className={`building-chip${active?.name === building.name ? ' active' : ''}`}
              onClick={() => setActiveIndex(index)}
            >
              {building.name}
            </button>
          ))}
        </div>
        {active && (
          <div className="building-info">
            <strong>{active.name}</strong>
            <p className="card-meta">{active.info}</p>
          </div>
        )}
      </div>
    </div>
  )
}

export default CampusWalkthrough
