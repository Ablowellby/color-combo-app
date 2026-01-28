import { useCallback } from 'react'
import { colors } from '../data/colors'
import { combinations } from '../data/combinations'
import { deltaE } from '../utils/colorDistance'

export function useColorMatch() {
  // Find the closest Sanzo Wada color to a given RGB color
  const findClosestColor = useCallback((rgb) => {
    let closest = null
    let minDistance = Infinity

    for (const color of colors) {
      const distance = deltaE(rgb, color.rgb)
      if (distance < minDistance) {
        minDistance = distance
        closest = color
      }
    }

    return closest
  }, [])

  // Get all combinations containing a specific color
  const getCombinationsForColor = useCallback((colorId) => {
    return combinations.filter(combo =>
      combo.colorIds.includes(colorId)
    )
  }, [])

  // Get combinations that contain any of the given colors
  const getCombinationsForColors = useCallback((colorIds) => {
    if (colorIds.length === 0) return []

    // Score combinations by how many of the given colors they contain
    const scored = combinations
      .map(combo => {
        const matches = combo.colorIds.filter(id => colorIds.includes(id)).length
        return { combo, matches }
      })
      .filter(({ matches }) => matches > 0)
      .sort((a, b) => b.matches - a.matches)

    return scored.map(({ combo }) => combo)
  }, [])

  return {
    findClosestColor,
    getCombinationsForColor,
    getCombinationsForColors,
  }
}
