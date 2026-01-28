import { useState, useEffect, useCallback } from 'react'

const STORAGE_KEY = 'colorcombo_outfits'

function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).substr(2)
}

export function useOutfits() {
  const [outfits, setOutfits] = useState([])

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (stored) {
        setOutfits(JSON.parse(stored))
      }
    } catch (err) {
      console.error('Failed to load outfits:', err)
    }
  }, [])

  // Save to localStorage when outfits change
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(outfits))
    } catch (err) {
      console.error('Failed to save outfits:', err)
    }
  }, [outfits])

  const addOutfit = useCallback((outfit) => {
    const newOutfit = {
      ...outfit,
      id: generateId(),
      createdAt: new Date().toISOString(),
    }
    setOutfits(prev => [...prev, newOutfit])
    return newOutfit
  }, [])

  const updateOutfit = useCallback((id, updates) => {
    setOutfits(prev => prev.map(outfit =>
      outfit.id === id ? { ...outfit, ...updates } : outfit
    ))
  }, [])

  const removeOutfit = useCallback((id) => {
    setOutfits(prev => prev.filter(outfit => outfit.id !== id))
  }, [])

  const getOutfitById = useCallback((id) => {
    return outfits.find(outfit => outfit.id === id)
  }, [outfits])

  // Export data as JSON
  const exportData = useCallback(() => {
    return JSON.stringify(outfits, null, 2)
  }, [outfits])

  // Import data from JSON
  const importData = useCallback((jsonString) => {
    try {
      const imported = JSON.parse(jsonString)
      if (!Array.isArray(imported)) {
        throw new Error('Invalid data format')
      }
      setOutfits(imported)
      return true
    } catch (err) {
      console.error('Failed to import:', err)
      return false
    }
  }, [])

  return {
    outfits,
    addOutfit,
    updateOutfit,
    removeOutfit,
    getOutfitById,
    exportData,
    importData,
  }
}
