function ColorSwatch({ color, size = 'md', className = '' }) {
  const sizeClasses = {
    sm: 'w-6 h-6',
    md: 'w-10 h-10',
    lg: 'w-14 h-14',
  }

  return (
    <div
      className={`rounded-lg shadow-sm flex-shrink-0 ${sizeClasses[size]} ${className}`}
      style={{ backgroundColor: color.hex }}
      title={color.name}
    />
  )
}

export default ColorSwatch
