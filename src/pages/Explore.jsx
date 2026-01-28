import { useState, useMemo } from 'react'
import { colors } from '../data/colors'
import { useColorMatch } from '../hooks/useColorMatch'
import ColorSwatch from '../components/ColorSwatch'
import CombinationCard from '../components/CombinationCard'

function Explore() {
  const [selectedColor, setSelectedColor] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')
  const { getCombinationsForColor } = useColorMatch()

  const filteredColors = useMemo(() => {
    if (!searchTerm) return colors
    const term = searchTerm.toLowerCase()
    return colors.filter(c =>
      c.name.toLowerCase().includes(term)
    )
  }, [searchTerm])

  const combinations = useMemo(() => {
    if (!selectedColor) return []
    return getCombinationsForColor(selectedColor.id)
  }, [selectedColor, getCombinationsForColor])

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Explore Colors</h1>

      <div className="mb-4">
        <input
          type="text"
          placeholder="Search colors..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full px-4 py-3 bg-white rounded-xl border-0 shadow-sm
                     focus:outline-none focus:ring-2 focus:ring-gray-200"
        />
      </div>

      {!selectedColor ? (
        <div className="grid grid-cols-4 gap-2">
          {filteredColors.map(color => (
            <button
              key={color.id}
              onClick={() => setSelectedColor(color)}
              className="aspect-square rounded-xl shadow-sm transition-transform
                         active:scale-95 touch-manipulation"
              style={{ backgroundColor: color.hex }}
              title={color.name}
            />
          ))}
        </div>
      ) : (
        <div className="space-y-4">
          <div className="card">
            <div className="flex items-center gap-3">
              <ColorSwatch color={selectedColor} size="lg" />
              <div className="flex-1">
                <p className="font-semibold">{selectedColor.name}</p>
                <p className="text-sm text-gray-500">{selectedColor.hex}</p>
              </div>
              <button
                onClick={() => setSelectedColor(null)}
                className="p-2 text-gray-400 hover:text-gray-600"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>

          <h2 className="text-lg font-semibold">
            Combinations with {selectedColor.name} ({combinations.length})
          </h2>

          <div className="space-y-3">
            {combinations.map(combo => (
              <CombinationCard
                key={combo.id}
                combination={combo}
                highlightColorId={selectedColor.id}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export default Explore
