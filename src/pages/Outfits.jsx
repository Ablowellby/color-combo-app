import { useState } from 'react'
import { useOutfits } from '../hooks/useOutfits'
import { useCloset } from '../hooks/useCloset'
import { colors } from '../data/colors'
import { combinations } from '../data/combinations'
import ColorSwatch from '../components/ColorSwatch'
import CreateOutfitModal from '../components/CreateOutfitModal'

function Outfits() {
  const { outfits, addOutfit, removeOutfit } = useOutfits()
  const { items } = useCloset()
  const [showCreateModal, setShowCreateModal] = useState(false)

  const getColorById = (colorId) => colors.find(c => c.id === colorId)
  const getCombinationById = (id) => combinations.find(c => c.id === id)
  const getItemById = (id) => items.find(i => i.id === id)

  const handleDelete = (id) => {
    if (confirm('Delete this outfit?')) {
      removeOutfit(id)
    }
  }

  return (
    <div className="p-4">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold">My Outfits</h1>
        <button
          onClick={() => setShowCreateModal(true)}
          className="btn-primary"
          disabled={items.length === 0}
        >
          + Create
        </button>
      </div>

      {items.length === 0 ? (
        <div className="card text-center py-12">
          <p className="text-gray-500 mb-2">Add items to your closet first</p>
          <p className="text-sm text-gray-400">
            Then you can combine them into outfits
          </p>
        </div>
      ) : outfits.length === 0 ? (
        <div className="card text-center py-12">
          <p className="text-gray-500 mb-4">No outfits yet</p>
          <button
            onClick={() => setShowCreateModal(true)}
            className="btn-secondary"
          >
            Create your first outfit
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {outfits.map(outfit => {
            const combo = outfit.combinationId
              ? getCombinationById(outfit.combinationId)
              : null
            const outfitItems = outfit.itemIds
              .map(id => getItemById(id))
              .filter(Boolean)

            return (
              <div key={outfit.id} className="card">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="font-semibold">{outfit.name}</h3>
                    {combo && (
                      <p className="text-sm text-gray-500">
                        Combination #{combo.id}
                      </p>
                    )}
                  </div>
                  <button
                    onClick={() => handleDelete(outfit.id)}
                    className="p-1.5 text-gray-400 hover:text-red-500"
                  >
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>

                {combo && (
                  <div className="flex gap-1 mb-3">
                    {combo.colorIds.map(colorId => {
                      const color = getColorById(colorId)
                      return color ? (
                        <ColorSwatch key={colorId} color={color} size="sm" />
                      ) : null
                    })}
                  </div>
                )}

                <div className="flex gap-2 overflow-x-auto">
                  {outfitItems.map(item => (
                    <div key={item.id} className="flex-shrink-0 w-20">
                      {item.imageData ? (
                        <img
                          src={item.imageData}
                          alt={item.name}
                          className="w-full aspect-square object-cover rounded-lg"
                        />
                      ) : (
                        <div
                          className="w-full aspect-square rounded-lg"
                          style={{
                            backgroundColor: getColorById(item.colorId)?.hex || '#ccc'
                          }}
                        />
                      )}
                      <p className="text-xs text-gray-500 truncate mt-1">
                        {item.name}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )
          })}
        </div>
      )}

      {showCreateModal && (
        <CreateOutfitModal
          onClose={() => setShowCreateModal(false)}
          onSave={(outfit) => {
            addOutfit(outfit)
            setShowCreateModal(false)
          }}
        />
      )}
    </div>
  )
}

export default Outfits
