import { useCallback } from 'react'
import { colors } from '../data/colors'
import { combinations } from '../data/combinations'

// Convert RGB to LAB color space for perceptual color comparison
function rgbToLab(rgb) {
  // Handle both {r,g,b} objects and [r,g,b] arrays
  const r0 = Array.isArray(rgb) ? rgb[0] : rgb.r
  const g0 = Array.isArray(rgb) ? rgb[1] : rgb.g
  const b0 = Array.isArray(rgb) ? rgb[2] : rgb.b

  // First convert RGB to XYZ
  let r = r0 / 255
  let g = g0 / 255
  let b = b0 / 255

  // Apply gamma correction
  r = r > 0.04045 ? Math.pow((r + 0.055) / 1.055, 2.4) : r / 12.92
  g = g > 0.04045 ? Math.pow((g + 0.055) / 1.055, 2.4) : g / 12.92
  b = b > 0.04045 ? Math.pow((b + 0.055) / 1.055, 2.4) : b / 12.92

  r *= 100
  g *= 100
  b *= 100

  // RGB to XYZ
  const x = r * 0.4124564 + g * 0.3575761 + b * 0.1804375
  const y = r * 0.2126729 + g * 0.7151522 + b * 0.0721750
  const z = r * 0.0193339 + g * 0.1191920 + b * 0.9503041

  // XYZ to LAB (using D65 illuminant)
  const refX = 95.047
  const refY = 100.000
  const refZ = 108.883

  let xr = x / refX
  let yr = y / refY
  let zr = z / refZ

  const epsilon = 0.008856
  const kappa = 903.3

  xr = xr > epsilon ? Math.pow(xr, 1/3) : (kappa * xr + 16) / 116
  yr = yr > epsilon ? Math.pow(yr, 1/3) : (kappa * yr + 16) / 116
  zr = zr > epsilon ? Math.pow(zr, 1/3) : (kappa * zr + 16) / 116

  const L = 116 * yr - 16
  const a = 500 * (xr - yr)
  const bVal = 200 * (yr - zr)

  return [L, a, bVal]
}

// Calculate Delta E (CIE76) using LAB values
function deltaE(lab1, lab2) {
  const deltaL = lab1[0] - lab2[0]
  const deltaA = lab1[1] - lab2[1]
  const deltaB = lab1[2] - lab2[2]
  return Math.sqrt(deltaL * deltaL + deltaA * deltaA + deltaB * deltaB)
}

export function useColorMatch() {
  // Find the closest Sanzo Wada color to a given RGB color
  const findClosestColor = useCallback((rgb) => {
    let closest = null
    let minDistance = Infinity

    // Convert input RGB to LAB
    const inputLab = rgbToLab(rgb)

    for (const color of colors) {
      // Use pre-computed LAB values from the color data for accuracy
      const colorLab = color.lab || rgbToLab(color.rgb)
      const distance = deltaE(inputLab, colorLab)
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
