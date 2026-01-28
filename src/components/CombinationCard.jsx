import { colors } from '../data/colors'
import ColorSwatch from './ColorSwatch'

function CombinationCard({ combination, highlightColorId = null }) {
  const getColorById = (colorId) => colors.find(c => c.id === colorId)

  return (
    <div className="card">
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm text-gray-500">#{combination.id}</span>
        <span className="text-xs text-gray-400">
          {combination.colorIds.length} colors
        </span>
      </div>

      <div className="flex gap-2">
        {combination.colorIds.map(colorId => {
          const color = getColorById(colorId)
          if (!color) return null

          const isHighlighted = colorId === highlightColorId

          return (
            <div key={colorId} className="flex-1">
              <div
                className={`aspect-square rounded-xl shadow-sm ${
                  isHighlighted ? 'ring-2 ring-gray-800 ring-offset-2' : ''
                }`}
                style={{ backgroundColor: color.hex }}
              />
              <p className="text-xs text-gray-500 text-center mt-1 truncate">
                {color.name}
              </p>
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default CombinationCard
