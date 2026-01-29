import { useState } from 'react'
import { useCloset } from '../hooks/useCloset'
import { useColorMatch } from '../hooks/useColorMatch'
import { colors } from '../data/colors'
import ColorSwatch from '../components/ColorSwatch'
import CombinationCard from '../components/CombinationCard'
import AddItemModal from '../components/AddItemModal'

const CATEGORIES = [
  { id: 'all', label: 'All' },
  { id: 'tops', label: 'Tops' },
  { id: 'bottoms', label: 'Bottoms' },
  { id: 'dresses', label: 'Dresses' },
  { id: 'shoes', label: 'Shoes' },
  { id: 'outerwear', label: 'Outerwear' },
  { id: 'accessories', label: 'Accessories' },
  { id: 'bags', label: 'Bags' },
  { id: 'jewelry', label: 'Jewelry' },
  { id: 'hats', label: 'Hats' },
  { id: 'scarves', label: 'Scarves' },
  { id: 'suits', label: 'Suits' },
]

function Closet() {
  const { items, addItem, removeItem, updateItem } = useCloset()
  const { getCombinationsForColor } = useColorMatch()
  const [showAddModal, setShowAddModal] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [editingItem, setEditingItem] = useState(null)
  const [selectedItem, setSelectedItem] = useState(null)

  const filteredItems = selectedCategory === 'all'
    ? items
    : items.filter(item => item.category === selectedCategory)

  const getColorById = (colorId) => colors.find(c => c.id === colorId)

  const handleAddItem = (item) => {
    if (editingItem) {
      updateItem(editingItem.id, item)
      setEditingItem(null)
    } else {
      addItem(item)
    }
    setShowAddModal(false)
  }

  const handleEdit = (e, item) => {
    e.stopPropagation()
    setEditingItem(item)
    setShowAddModal(true)
  }

  const handleDelete = (e, id) => {
    e.stopPropagation()
    if (confirm('Remove this item from your closet?')) {
      removeItem(id)
      if (selectedItem?.id === id) {
        setSelectedItem(null)
      }
    }
  }

  const handleItemClick = (item) => {
    setSelectedItem(item)
  }

  const selectedItemColor = selectedItem ? getColorById(selectedItem.colorId) : null
  const selectedItemCombinations = selectedItem
    ? getCombinationsForColor(selectedItem.colorId)
    : []

  // Get the thumbnail image (first image or legacy imageData)
  const getThumbnail = (item) => {
    if (item.images && item.images.length > 0) {
      const thumbIndex = item.thumbnailIndex || 0
      return item.images[thumbIndex]
    }
    return item.imageData
  }

  return (
    <div className="p-4">
      {/* Item Detail View */}
      {selectedItem ? (
        <div className="space-y-4">
          <button
            onClick={() => setSelectedItem(null)}
            className="flex items-center gap-2 text-gray-600 mb-2"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Closet
          </button>

          <div className="card">
            {/* Image Gallery */}
            {(selectedItem.images?.length > 0 || selectedItem.imageData) && (
              <div className="mb-4">
                <img
                  src={getThumbnail(selectedItem)}
                  alt={selectedItem.name}
                  className="w-full aspect-square object-cover rounded-xl"
                />
                {selectedItem.images?.length > 1 && (
                  <div className="flex gap-2 mt-2 overflow-x-auto pb-2">
                    {selectedItem.images.map((img, idx) => (
                      <button
                        key={idx}
                        onClick={() => updateItem(selectedItem.id, { thumbnailIndex: idx })}
                        className={`flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 ${
                          (selectedItem.thumbnailIndex || 0) === idx
                            ? 'border-gray-800'
                            : 'border-transparent'
                        }`}
                      >
                        <img
                          src={img}
                          alt={`${selectedItem.name} ${idx + 1}`}
                          className="w-full h-full object-cover"
                        />
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}

            <h1 className="text-xl font-bold text-slate-800 mb-2">
              {selectedItem.name}
            </h1>

            <div className="flex items-center gap-2 mb-4">
              <span className="px-3 py-1 bg-warmgray rounded-full text-sm text-gray-600 capitalize">
                {selectedItem.category}
              </span>
              {selectedItemColor && (
                <div className="flex items-center gap-2">
                  <ColorSwatch color={selectedItemColor} size="sm" />
                  <span className="text-sm text-gray-600">{selectedItemColor.name}</span>
                </div>
              )}
            </div>

            <div className="flex gap-2">
              <button
                onClick={(e) => handleEdit(e, selectedItem)}
                className="btn-secondary flex-1"
              >
                Edit Item
              </button>
              <button
                onClick={(e) => handleDelete(e, selectedItem.id)}
                className="px-4 py-2 text-red-600 bg-red-50 rounded-xl font-medium"
              >
                Delete
              </button>
            </div>
          </div>

          {/* Color Combinations */}
          {selectedItemCombinations.length > 0 && (
            <div>
              <h2 className="text-lg font-semibold mb-3">
                Color Combinations ({selectedItemCombinations.length})
              </h2>
              <p className="text-sm text-gray-600 mb-3">
                These combinations from Sanzo Wada's book include {selectedItemColor?.name}.
              </p>
              <div className="space-y-3">
                {selectedItemCombinations.map(combo => (
                  <CombinationCard
                    key={combo.id}
                    combination={combo}
                    highlightColorId={selectedItem.colorId}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      ) : (
        <>
          {/* Closet List View */}
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-2xl font-bold">My Closet</h1>
            <button
              onClick={() => {
                setEditingItem(null)
                setShowAddModal(true)
              }}
              className="btn-primary"
            >
              + Add Item
            </button>
          </div>

          <div className="flex gap-2 overflow-x-auto pb-2 mb-4 -mx-4 px-4">
            {CATEGORIES.map(cat => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-4 py-2 rounded-full whitespace-nowrap text-sm font-medium
                           transition-colors touch-manipulation ${
                  selectedCategory === cat.id
                    ? 'bg-gray-800 text-white'
                    : 'bg-warmgray text-gray-600'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          {filteredItems.length === 0 ? (
            <div className="card text-center py-12">
              <p className="text-gray-500 mb-4">
                {selectedCategory === 'all'
                  ? 'Your closet is empty'
                  : `No ${selectedCategory} yet`}
              </p>
              <button
                onClick={() => setShowAddModal(true)}
                className="btn-secondary"
              >
                Add your first item
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3">
              {filteredItems.map(item => {
                const color = getColorById(item.colorId)
                const thumbnail = getThumbnail(item)
                return (
                  <div
                    key={item.id}
                    onClick={() => handleItemClick(item)}
                    className="card cursor-pointer hover:shadow-md transition-shadow active:scale-[0.98]"
                  >
                    {thumbnail && (
                      <img
                        src={thumbnail}
                        alt={item.name}
                        className="w-full aspect-square object-cover rounded-xl mb-2"
                      />
                    )}
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-slate-800 leading-tight mb-1">
                          {item.name}
                        </p>
                        {color && (
                          <div className="flex items-center gap-1">
                            <ColorSwatch color={color} size="sm" />
                            <span className="text-xs text-gray-500">
                              {color.name}
                            </span>
                          </div>
                        )}
                      </div>
                      <div className="flex gap-1 ml-2">
                        <button
                          onClick={(e) => handleEdit(e, item)}
                          className="p-1.5 text-gray-400 hover:text-gray-600"
                        >
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                          </svg>
                        </button>
                        <button
                          onClick={(e) => handleDelete(e, item.id)}
                          className="p-1.5 text-gray-400 hover:text-red-500"
                        >
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </>
      )}

      {showAddModal && (
        <AddItemModal
          onClose={() => {
            setShowAddModal(false)
            setEditingItem(null)
          }}
          onSave={handleAddItem}
          editItem={editingItem}
        />
      )}
    </div>
  )
}

export default Closet
