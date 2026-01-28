import { useState, useEffect, useCallback } from 'react'

const STORAGE_KEY = 'colorcombo_closet'

function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).substr(2)
}

export function useCloset() {
  const [items, setItems] = useState([])

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (stored) {
        setItems(JSON.parse(stored))
      }
    } catch (err) {
      console.error('Failed to load closet:', err)
    }
  }, [])

  // Save to localStorage when items change
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items))
    } catch (err) {
      console.error('Failed to save closet:', err)
    }
  }, [items])

  const addItem = useCallback((item) => {
    const newItem = {
      ...item,
      id: generateId(),
      createdAt: new Date().toISOString(),
    }
    setItems(prev => [...prev, newItem])
    return newItem
  }, [])

  const updateItem = useCallback((id, updates) => {
    setItems(prev => prev.map(item =>
      item.id === id ? { ...item, ...updates } : item
    ))
  }, [])

  const removeItem = useCallback((id) => {
    setItems(prev => prev.filter(item => item.id !== id))
  }, [])

  const getItemById = useCallback((id) => {
    return items.find(item => item.id === id)
  }, [items])

  const getItemsByColor = useCallback((colorId) => {
    return items.filter(item => item.colorId === colorId)
  }, [items])

  const getItemsByCategory = useCallback((category) => {
    return items.filter(item => item.category === category)
  }, [items])

  // Export data as JSON
  const exportData = useCallback(() => {
    return JSON.stringify(items, null, 2)
  }, [items])

  // Import data from JSON
  const importData = useCallback((jsonString) => {
    try {
      const imported = JSON.parse(jsonString)
      if (!Array.isArray(imported)) {
        throw new Error('Invalid data format')
      }
      setItems(imported)
      return true
    } catch (err) {
      console.error('Failed to import:', err)
      return false
    }
  }, [])

  return {
    items,
    addItem,
    updateItem,
    removeItem,
    getItemById,
    getItemsByColor,
    getItemsByCategory,
    exportData,
    importData,
  }
}
