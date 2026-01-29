// Sanzo Wada - A Dictionary of Color Combinations Vol 1
// 348 color combinations from the original book
// Data sourced from mattdesl/dictionary-of-colour-combinations (MIT License)
// Generated from color data - each combination references colors by their IDs

import { colors } from './colors'

// Build combinations from color data
// Each color has a 'combinations' array listing which combinations it belongs to
function buildCombinations() {
  const combinationMap = new Map()

  // Initialize all 348 combinations
  for (let i = 1; i <= 348; i++) {
    combinationMap.set(i, [])
  }

  // Add each color to its combinations
  colors.forEach(color => {
    if (color.combinations) {
      color.combinations.forEach(comboId => {
        if (combinationMap.has(comboId)) {
          combinationMap.get(comboId).push(color.id)
        }
      })
    }
  })

  // Convert to array format
  const combinations = []
  for (let i = 1; i <= 348; i++) {
    const colorIds = combinationMap.get(i)
    if (colorIds && colorIds.length > 0) {
      combinations.push({
        id: i,
        colorIds: colorIds
      })
    }
  }

  return combinations
}

export const combinations = buildCombinations()
