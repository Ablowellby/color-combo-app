import { useState, useRef, useCallback, useEffect } from 'react'
import { useColorMatch } from '../hooks/useColorMatch'
import ColorSwatch from '../components/ColorSwatch'
import CombinationCard from '../components/CombinationCard'

function Home() {
  const [capturedImage, setCapturedImage] = useState(null)
  const [matchedColor, setMatchedColor] = useState(null)
  const [combinations, setCombinations] = useState([])
  const [isCapturing, setIsCapturing] = useState(false)
  const [cameraReady, setCameraReady] = useState(false)
  const [cameraError, setCameraError] = useState(null)
  const videoRef = useRef(null)
  const canvasRef = useRef(null)
  const streamRef = useRef(null)
  const fileInputRef = useRef(null)

  const { findClosestColor, getCombinationsForColor } = useColorMatch()

  const startCamera = useCallback(async () => {
    setCameraError(null)
    setCameraReady(false)
    setIsCapturing(true)

    try {
      // Try back camera first, fall back to any camera
      let stream
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: { ideal: 'environment' },
            width: { ideal: 1280 },
            height: { ideal: 720 }
          },
          audio: false
        })
      } catch (e) {
        // Fall back to any available camera
        stream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: false
        })
      }

      streamRef.current = stream

      if (videoRef.current) {
        videoRef.current.srcObject = stream

        // Wait for video to be ready
        videoRef.current.onloadedmetadata = () => {
          videoRef.current.play()
            .then(() => {
              setCameraReady(true)
            })
            .catch(err => {
              console.error('Video play failed:', err)
              setCameraError('Could not start video playback')
            })
        }
      }
    } catch (err) {
      console.error('Camera access error:', err)
      setIsCapturing(false)
      if (err.name === 'NotAllowedError') {
        setCameraError('Camera permission denied. Please allow camera access in your browser settings.')
      } else if (err.name === 'NotFoundError') {
        setCameraError('No camera found on this device.')
      } else {
        setCameraError('Could not access camera. Try using "Upload Photo" instead.')
      }
    }
  }, [])

  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop())
      streamRef.current = null
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null
    }
    setIsCapturing(false)
    setCameraReady(false)
  }, [])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop())
      }
    }
  }, [])

  const capturePhoto = useCallback(() => {
    if (!videoRef.current || !canvasRef.current || !cameraReady) return

    const video = videoRef.current
    const canvas = canvasRef.current
    canvas.width = video.videoWidth
    canvas.height = video.videoHeight

    const ctx = canvas.getContext('2d')
    ctx.drawImage(video, 0, 0)

    const imageData = canvas.toDataURL('image/jpeg', 0.8)
    processImage(imageData, ctx, canvas.width, canvas.height)
    stopCamera()
  }, [stopCamera, cameraReady])

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
    setCameraError(null)
    stopCamera()
  }

  return (
    <div className="p-4">
      <canvas ref={canvasRef} className="hidden" />
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        onChange={handleFileUpload}
        className="hidden"
      />

      {!isCapturing && !capturedImage && (
        <div className="space-y-6">
          {/* Hero Section */}
          <div className="card bg-gradient-to-br from-amber-50 to-rose-50 border border-amber-100">
            {/* Book visualization */}
            <div className="flex justify-center mb-4">
              <div className="relative">
                <div className="w-32 h-44 bg-gradient-to-br from-slate-800 to-slate-900 rounded-sm shadow-lg transform -rotate-3">
                  <div className="absolute inset-2 border border-amber-400/30 rounded-sm flex flex-col items-center justify-center p-2">
                    <div className="flex gap-1 mb-2">
                      <div className="w-4 h-4 rounded-full bg-red-500"></div>
                      <div className="w-4 h-4 rounded-full bg-blue-500"></div>
                      <div className="w-4 h-4 rounded-full bg-yellow-500"></div>
                    </div>
                    <div className="text-amber-400/80 text-[6px] text-center font-serif leading-tight">
                      A DICTIONARY<br/>OF COLOR<br/>COMBINATIONS
                    </div>
                    <div className="text-amber-400/60 text-[5px] mt-1">SANZO WADA</div>
                  </div>
                </div>
                <div className="w-32 h-44 bg-gradient-to-br from-slate-700 to-slate-800 rounded-sm shadow-lg absolute top-1 left-1 -z-10 transform rotate-3"></div>
              </div>
            </div>

            <h2 className="text-lg font-bold text-slate-800 text-center mb-2">
              A Dictionary of Color Combinations
            </h2>
            <p className="text-sm text-slate-600 text-center mb-3">
              by Sanzo Wada (1883-1967)
            </p>
            <p className="text-sm text-slate-600 leading-relaxed">
              Sanzo Wada was a pioneering Japanese artist, teacher, and designer who dedicated his career to studying color and its applications. In the 1930s, he published this remarkable guide containing 348 color combinations, originally created to help kimono designers, artists, and craftspeople select harmonious palettes.
            </p>
            <p className="text-sm text-slate-600 leading-relaxed mt-2">
              Nearly a century later, his timeless combinations remain a treasured resource for designers worldwide. This app brings Wada's work into your wardrobe, helping you discover unexpected and beautiful color pairings for your everyday outfits.
            </p>
          </div>

          {/* Color Match Section */}
          <div className="card">
            <h2 className="text-lg font-semibold mb-2">Match a Color</h2>
            <p className="text-gray-600 text-sm mb-4">
              Capture or upload a photo of a clothing item to find its closest Sanzo Wada color and discover harmonious combinations.
            </p>

            {cameraError && (
              <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-xl text-sm">
                {cameraError}
              </div>
            )}

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

          {/* Quick Stats */}
          <div className="grid grid-cols-2 gap-3">
            <div className="card text-center py-4">
              <p className="text-2xl font-bold text-slate-800">159</p>
              <p className="text-xs text-gray-500">Curated Colors</p>
            </div>
            <div className="card text-center py-4">
              <p className="text-2xl font-bold text-slate-800">348</p>
              <p className="text-xs text-gray-500">Combinations</p>
            </div>
          </div>
        </div>
      )}

      {isCapturing && (
        <div className="space-y-4">
          <div className="relative rounded-2xl overflow-hidden bg-black aspect-[4/3]">
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="w-full h-full object-cover"
            />
            {!cameraReady && (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-white text-sm">Starting camera...</div>
              </div>
            )}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="w-24 h-24 border-2 border-white/50 rounded-lg" />
            </div>
            <p className="absolute bottom-3 left-0 right-0 text-center text-white/70 text-xs">
              Position the color in the center square
            </p>
          </div>

          <div className="flex gap-3">
            <button
              onClick={capturePhoto}
              className="btn-primary flex-1"
              disabled={!cameraReady}
            >
              {cameraReady ? 'Capture' : 'Loading...'}
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
                  <p className="text-xs text-gray-400">{matchedColor.hex}</p>
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
                  <CombinationCard key={combo.id} combination={combo} highlightColorId={matchedColor?.id} />
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
