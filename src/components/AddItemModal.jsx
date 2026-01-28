import { useState, useRef, useEffect } from 'react'
import { colors } from '../data/colors'
import { useColorMatch } from '../hooks/useColorMatch'
import ColorSwatch from './ColorSwatch'

const CATEGORIES = [
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

function AddItemModal({ onClose, onSave, editItem = null }) {
  const [name, setName] = useState(editItem?.name || '')
  const [category, setCategory] = useState(editItem?.category || 'tops')
  const [colorId, setColorId] = useState(editItem?.colorId || '')
  const [imageData, setImageData] = useState(editItem?.imageData || '')
  const [showColorPicker, setShowColorPicker] = useState(false)
  const [colorSearch, setColorSearch] = useState('')

  const fileInputRef = useRef(null)
  const canvasRef = useRef(null)
  const { findClosestColor } = useColorMatch()

  const filteredColors = colorSearch
    ? colors.filter(c => c.name.toLowerCase().includes(colorSearch.toLowerCase()))
    : colors

  const handleImageUpload = (e) => {
    const file = e.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (event) => {
      const img = new Image()
      img.onload = () => {
        // Resize image if too large
        const maxSize = 800
        let width = img.width
        let height = img.height

        if (width > maxSize || height > maxSize) {
          if (width > height) {
            height = (height / width) * maxSize
            width = maxSize
          } else {
            width = (width / height) * maxSize
            height = maxSize
          }
        }

        const canvas = canvasRef.current
        canvas.width = width
        canvas.height = height
        const ctx = canvas.getContext('2d')
        ctx.drawImage(img, 0, 0, width, height)

        const resizedData = canvas.toDataURL('image/jpeg', 0.7)
        setImageData(resizedData)

        // Auto-detect color from center
        const centerX = Math.floor(width / 2)
        const centerY = Math.floor(height / 2)
        const sampleSize = Math.min(50, width / 4, height / 4)

        const pixelData = ctx.getImageData(
          centerX - sampleSize / 2,
          centerY - sampleSize / 2,
          sampleSize,
          sampleSize
        )

        const avgColor = getAverageColor(pixelData.data)
        const closest = findClosestColor(avgColor)
        if (closest && !colorId) {
          setColorId(closest.id)
        }
      }
      img.src = event.target.result
    }
    reader.readAsDataURL(file)
  }

  const getAverageColor = (data) => {
    let r = 0, g = 0, b = 0
    const pixels = data.length / 4

    for (let i = 0; i < data.length; i += 4) {
      r += data[i]
      g += data[i + 1]
      b += data[i + 2]
    }

    return {
      r: Math.round(r / pixels),
      g: Math.round(g / pixels),
      b: Math.round(b / pixels)
    }
  }

  const handleSave = () => {
    if (!name.trim()) {
      alert('Please enter a name')
      return
    }
    if (!colorId) {
      alert('Please select a color')
      return
    }

    onSave({
      name: name.trim(),
      category,
      colorId,
      imageData,
    })
  }

  const selectedColor = colors.find(c => c.id === colorId)

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-end sm:items-center justify-center">
      <div className="bg-white w-full max-w-lg rounded-t-3xl sm:rounded-3xl max-h-[90vh] overflow-y-auto safe-bottom">
        <div className="sticky top-0 bg-white border-b border-gray-100 px-4 py-3 flex items-center justify-between">
          <h2 className="text-lg font-semibold">
            {editItem ? 'Edit Item' : 'Add Item'}
          </h2>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <canvas ref={canvasRef} className="hidden" />
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleImageUpload}
          className="hidden"
        />

        <div className="p-4 space-y-4">
          {/* Image */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Photo (optional)
            </label>
            {imageData ? (
              <div className="relative">
                <img
                  src={imageData}
                  alt="Item"
                  className="w-full aspect-square object-cover rounded-xl"
                />
                <button
                  onClick={() => setImageData('')}
                  className="absolute top-2 right-2 p-2 bg-black/50 rounded-full text-white"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            ) : (
              <button
                onClick={() => fileInputRef.current?.click()}
                className="w-full aspect-video bg-warmgray rounded-xl flex flex-col items-center justify-center text-gray-500"
              >
                <svg className="w-8 h-8 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <span className="text-sm">Add photo</span>
              </button>
            )}
          </div>

          {/* Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., Blue wool sweater"
              className="w-full px-4 py-3 bg-warmgray rounded-xl border-0
                         focus:outline-none focus:ring-2 focus:ring-gray-300"
            />
          </div>

          {/* Category */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Category
            </label>
            <div className="flex flex-wrap gap-2">
              {CATEGORIES.map(cat => (
                <button
                  key={cat.id}
                  onClick={() => setCategory(cat.id)}
                  className={`px-3 py-1.5 rounded-full text-sm font-medium
                             transition-colors touch-manipulation ${
                    category === cat.id
                      ? 'bg-gray-800 text-white'
                      : 'bg-warmgray text-gray-600'
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>
          </div>

          {/* Color */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Color
            </label>
            <button
              onClick={() => setShowColorPicker(!showColorPicker)}
              className="w-full px-4 py-3 bg-warmgray rounded-xl flex items-center gap-3"
            >
              {selectedColor ? (
                <>
                  <ColorSwatch color={selectedColor} size="sm" />
                  <span>{selectedColor.name}</span>
                </>
              ) : (
                <span className="text-gray-500">Select a color</span>
              )}
              <svg className="w-5 h-5 ml-auto text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            {showColorPicker && (
              <div className="mt-2 p-3 bg-warmgray rounded-xl">
                <input
                  type="text"
                  value={colorSearch}
                  onChange={(e) => setColorSearch(e.target.value)}
                  placeholder="Search colors..."
                  className="w-full px-3 py-2 bg-white rounded-lg text-sm mb-2
                             focus:outline-none focus:ring-2 focus:ring-gray-300"
                />
                <div className="grid grid-cols-6 gap-1 max-h-48 overflow-y-auto">
                  {filteredColors.map(color => (
                    <button
                      key={color.id}
                      onClick={() => {
                        setColorId(color.id)
                        setShowColorPicker(false)
                        setColorSearch('')
                      }}
                      className={`aspect-square rounded-lg transition-transform
                                 active:scale-90 ${
                        colorId === color.id ? 'ring-2 ring-gray-800 ring-offset-1' : ''
                      }`}
                      style={{ backgroundColor: color.hex }}
                      title={color.name}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="sticky bottom-0 bg-white border-t border-gray-100 p-4 safe-bottom">
          <button onClick={handleSave} className="btn-primary w-full">
            {editItem ? 'Save Changes' : 'Add to Closet'}
          </button>
        </div>
      </div>
    </div>
  )
}

export default AddItemModal
