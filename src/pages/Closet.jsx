import { useState } from 'react'
import { useCloset } from '../hooks/useCloset'
import { colors } from '../data/colors'
import ColorSwatch from '../components/ColorSwatch'
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
  const [showAddModal, setShowAddModal] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [editingItem, setEditingItem] = useState(null)

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

  const handleEdit = (item) => {
    setEditingItem(item)
    setShowAddModal(true)
  }

  const handleDelete = (id) => {
    if (confirm('Remove this item from your closet?')) {
      removeItem(id)
    }
  }

  return (
    <div className="p-4">
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
            return (
              <div key={item.id} className="card">
                {item.imageData && (
                  <img
                    src={item.imageData}
                    alt={item.name}
                    className="w-full aspect-square object-cover rounded-xl mb-2"
                  />
                )}
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{item.name}</p>
                    {color && (
                      <div className="flex items-center gap-1 mt-1">
                        <ColorSwatch color={color} size="sm" />
                        <span className="text-xs text-gray-500 truncate">
                          {color.name}
                        </span>
                      </div>
                    )}
                  </div>
                  <div className="flex gap-1 ml-2">
                    <button
                      onClick={() => handleEdit(item)}
                      className="p-1.5 text-gray-400 hover:text-gray-600"
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                      </svg>
                    </button>
                    <button
                      onClick={() => handleDelete(item.id)}
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
