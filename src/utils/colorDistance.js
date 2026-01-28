// Convert RGB to LAB color space for perceptual color comparison
function rgbToLab(rgb) {
  // First convert RGB to XYZ
  let r = rgb.r / 255
  let g = rgb.g / 255
  let b = rgb.b / 255

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

  return { L, a, b: bVal }
}

// Calculate Delta E (CIE76) - simpler but good enough for our purposes
export function deltaE(rgb1, rgb2) {
  // Handle both {r,g,b} objects and [r,g,b] arrays
  const color1 = Array.isArray(rgb1)
    ? { r: rgb1[0], g: rgb1[1], b: rgb1[2] }
    : rgb1
  const color2 = Array.isArray(rgb2)
    ? { r: rgb2[0], g: rgb2[1], b: rgb2[2] }
    : rgb2

  const lab1 = rgbToLab(color1)
  const lab2 = rgbToLab(color2)

  const deltaL = lab1.L - lab2.L
  const deltaA = lab1.a - lab2.a
  const deltaB = lab1.b - lab2.b

  return Math.sqrt(deltaL * deltaL + deltaA * deltaA + deltaB * deltaB)
}

// Simple RGB Euclidean distance (faster but less accurate)
export function rgbDistance(rgb1, rgb2) {
  const color1 = Array.isArray(rgb1)
    ? { r: rgb1[0], g: rgb1[1], b: rgb1[2] }
    : rgb1
  const color2 = Array.isArray(rgb2)
    ? { r: rgb2[0], g: rgb2[1], b: rgb2[2] }
    : rgb2

  const dr = color1.r - color2.r
  const dg = color1.g - color2.g
  const db = color1.b - color2.b

  return Math.sqrt(dr * dr + dg * dg + db * db)
}
