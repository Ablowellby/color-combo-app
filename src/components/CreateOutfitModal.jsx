import { useState, useMemo } from 'react'
import { useCloset } from '../hooks/useCloset'
import { useColorMatch } from '../hooks/useColorMatch'
import { colors } from '../data/colors'
import ColorSwatch from './ColorSwatch'

function CreateOutfitModal({ onClose, onSave }) {
  const { items } = useCloset()
  const { getCombinationsForColors } = useColorMatch()
  const [name, setName] = useState('')
  const [selectedItemIds, setSelectedItemIds] = useState([])
  const [selectedCombinationId, setSelectedCombinationId] = useState(null)

  const getColorById = (colorId) => colors.find(c => c.id === colorId)

  const selectedItems = selectedItemIds
    .map(id => items.find(i => i.id === id))
    .filter(Boolean)

  const selectedColorIds = [...new Set(selectedItems.map(i => i.colorId))]

  const suggestedCombinations = useMemo(() => {
    if (selectedColorIds.length === 0) return []
    return getCombinationsForColors(selectedColorIds)
  }, [selectedColorIds, getCombinationsForColors])

  const toggleItem = (itemId) => {
    setSelectedItemIds(prev =>
      prev.includes(itemId)
        ? prev.filter(id => id !== itemId)
        : [...prev, itemId]
    )
  }

  const handleSave = () => {
    if (!name.trim()) {
      alert('Please enter a name for the outfit')
      return
    }
    if (selectedItemIds.length === 0) {
      alert('Please select at least one item')
      return
    }

    onSave({
      name: name.trim(),
      itemIds: selectedItemIds,
      combinationId: selectedCombinationId,
    })
  }

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-end sm:items-center justify-center">
      <div className="bg-white w-full max-w-lg rounded-t-3xl sm:rounded-3xl max-h-[90vh] overflow-y-auto safe-bottom">
        <div className="sticky top-0 bg-white border-b border-gray-100 px-4 py-3 flex items-center justify-between z-10">
          <h2 className="text-lg font-semibold">Create Outfit</h2>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="p-4 space-y-4">
          {/* Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Outfit Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., Casual Friday"
              className="w-full px-4 py-3 bg-warmgray rounded-xl border-0
                         focus:outline-none focus:ring-2 focus:ring-gray-300"
            />
          </div>

          {/* Selected Items Preview */}
          {selectedItems.length > 0 && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Selected Items ({selectedItems.length})
              </label>
              <div className="flex gap-2 overflow-x-auto pb-2">
                {selectedItems.map(item => (
                  <div key={item.id} className="flex-shrink-0 w-16 relative">
                    {item.imageData ? (
                      <img
                        src={item.imageData}
                        alt={item.name}
                        className="w-full aspect-square object-cover rounded-lg"
                      />
                    ) : (
                      <div
                        className="w-full aspect-square rounded-lg"
                        style={{ backgroundColor: getColorById(item.colorId)?.hex || '#ccc' }}
                      />
                    )}
                    <button
                      onClick={() => toggleItem(item.id)}
                      className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full
                                 flex items-center justify-center text-white"
                    >
                      <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                ))}
              </div>

              {/* Color palette of selected items */}
              <div className="flex gap-1 mt-2">
                {selectedColorIds.map(colorId => {
                  const color = getColorById(colorId)
                  return color ? (
                    <ColorSwatch key={colorId} color={color} size="sm" />
                  ) : null
                })}
              </div>
            </div>
          )}

          {/* Suggested Combinations */}
          {suggestedCombinations.length > 0 && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Matching Combinations ({suggestedCombinations.length})
              </label>
              <div className="space-y-2 max-h-40 overflow-y-auto">
                {suggestedCombinations.slice(0, 5).map(combo => (
                  <button
                    key={combo.id}
                    onClick={() => setSelectedCombinationId(
                      selectedCombinationId === combo.id ? null : combo.id
                    )}
                    className={`w-full p-2 rounded-xl flex items-center gap-2 transition-colors ${
                      selectedCombinationId === combo.id
                        ? 'bg-gray-800 text-white'
                        : 'bg-warmgray'
                    }`}
                  >
                    <span className="text-sm">#{combo.id}</span>
                    <div className="flex gap-1 flex-1">
                      {combo.colorIds.map(colorId => {
                        const color = getColorById(colorId)
                        return color ? (
                          <div
                            key={colorId}
                            className="w-6 h-6 rounded"
                            style={{ backgroundColor: color.hex }}
                          />
                        ) : null
                      })}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Select Items */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select Items from Closet
            </label>
            <div className="grid grid-cols-3 gap-2 max-h-64 overflow-y-auto">
              {items.map(item => {
                const isSelected = selectedItemIds.includes(item.id)
                const color = getColorById(item.colorId)

                return (
                  <button
                    key={item.id}
                    onClick={() => toggleItem(item.id)}
                    className={`relative rounded-xl overflow-hidden transition-transform
                               active:scale-95 ${isSelected ? 'ring-2 ring-gray-800' : ''}`}
                  >
                    {item.imageData ? (
                      <img
                        src={item.imageData}
                        alt={item.name}
                        className="w-full aspect-square object-cover"
                      />
                    ) : (
                      <div
                        className="w-full aspect-square"
                        style={{ backgroundColor: color?.hex || '#ccc' }}
                      />
                    )}
                    {isSelected && (
                      <div className="absolute inset-0 bg-gray-800/30 flex items-center justify-center">
                        <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                    )}
                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-1">
                      <p className="text-xs text-white truncate">{item.name}</p>
                    </div>
                  </button>
                )
              })}
            </div>
          </div>
        </div>

        <div className="sticky bottom-0 bg-white border-t border-gray-100 p-4 safe-bottom">
          <button
            onClick={handleSave}
            disabled={selectedItemIds.length === 0}
            className="btn-primary w-full disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Save Outfit
          </button>
        </div>
      </div>
    </div>
  )
}

export default CreateOutfitModal
