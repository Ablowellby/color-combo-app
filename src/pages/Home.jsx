import { useState, useRef, useCallback } from 'react'
import { useColorMatch } from '../hooks/useColorMatch'
import ColorSwatch from '../components/ColorSwatch'
import CombinationCard from '../components/CombinationCard'

function Home() {
  const [capturedImage, setCapturedImage] = useState(null)
  const [matchedColor, setMatchedColor] = useState(null)
  const [combinations, setCombinations] = useState([])
  const [isCapturing, setIsCapturing] = useState(false)
  const videoRef = useRef(null)
  const canvasRef = useRef(null)
  const streamRef = useRef(null)
  const fileInputRef = useRef(null)

  const { findClosestColor, getCombinationsForColor } = useColorMatch()

  const startCamera = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' }
      })
      streamRef.current = stream
      if (videoRef.current) {
        videoRef.current.srcObject = stream
      }
      setIsCapturing(true)
    } catch (err) {
      console.error('Camera access denied:', err)
      alert('Camera access is required. Please allow camera permissions.')
    }
  }, [])

  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop())
      streamRef.current = null
    }
    setIsCapturing(false)
  }, [])

  const capturePhoto = useCallback(() => {
    if (!videoRef.current || !canvasRef.current) return

    const video = videoRef.current
    const canvas = canvasRef.current
    canvas.width = video.videoWidth
    canvas.height = video.videoHeight

    const ctx = canvas.getContext('2d')
    ctx.drawImage(video, 0, 0)

    const imageData = canvas.toDataURL('image/jpeg', 0.8)
    processImage(imageData, ctx, canvas.width, canvas.height)
    stopCamera()
  }, [stopCamera])

  const handleFileUpload = (e) => {
    const file = e.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (event) => {
      const img = new Image()
      img.onload = () => {
        const canvas = canvasRef.current
        canvas.width = img.width
        canvas.height = img.height
        const ctx = canvas.getContext('2d')
        ctx.drawImage(img, 0, 0)
        processImage(event.target.result, ctx, img.width, img.height)
      }
      img.src = event.target.result
    }
    reader.readAsDataURL(file)
  }

  const processImage = (imageData, ctx, width, height) => {
    setCapturedImage(imageData)

    // Extract dominant color from center region
    const centerX = Math.floor(width / 2)
    const centerY = Math.floor(height / 2)
    const sampleSize = Math.min(100, width / 4, height / 4)

    const pixelData = ctx.getImageData(
      centerX - sampleSize / 2,
      centerY - sampleSize / 2,
      sampleSize,
      sampleSize
    )

    const avgColor = getAverageColor(pixelData.data)
    const closest = findClosestColor(avgColor)

    if (closest) {
      setMatchedColor(closest)
      const combos = getCombinationsForColor(closest.id)
      setCombinations(combos)
    }
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

  const reset = () => {
    setCapturedImage(null)
    setMatchedColor(null)
    setCombinations([])
    stopCamera()
  }

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Color Match</h1>

      <canvas ref={canvasRef} className="hidden" />
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileUpload}
        className="hidden"
      />

      {!isCapturing && !capturedImage && (
        <div className="space-y-4">
          <p className="text-gray-600">
            Take a photo of a clothing item to find matching color combinations.
          </p>

          <div className="flex gap-3">
            <button onClick={startCamera} className="btn-primary flex-1">
              Open Camera
            </button>
            <button
              onClick={() => fileInputRef.current?.click()}
              className="btn-secondary flex-1"
            >
              Upload Photo
            </button>
          </div>
        </div>
      )}

      {isCapturing && (
        <div className="space-y-4">
          <div className="relative rounded-2xl overflow-hidden bg-black">
            <video
              ref={videoRef}
              autoPlay
              playsInline
              className="w-full"
            />
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="w-24 h-24 border-2 border-white/50 rounded-lg" />
            </div>
          </div>

          <div className="flex gap-3">
            <button onClick={capturePhoto} className="btn-primary flex-1">
              Capture
            </button>
            <button onClick={stopCamera} className="btn-secondary">
              Cancel
            </button>
          </div>
        </div>
      )}

      {capturedImage && (
        <div className="space-y-4">
          <div className="card">
            <img
              src={capturedImage}
              alt="Captured"
              className="w-full rounded-xl mb-4"
            />

            {matchedColor && (
              <div className="flex items-center gap-3">
                <ColorSwatch color={matchedColor} size="lg" />
                <div>
                  <p className="text-sm text-gray-500">Closest match</p>
                  <p className="font-semibold">{matchedColor.name}</p>
                </div>
              </div>
            )}
          </div>

          <button onClick={reset} className="btn-secondary w-full">
            Try Another
          </button>

          {combinations.length > 0 && (
            <div>
              <h2 className="text-lg font-semibold mb-3">
                Color Combinations ({combinations.length})
              </h2>
              <div className="space-y-3">
                {combinations.map(combo => (
                  <CombinationCard key={combo.id} combination={combo} />
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default Home
