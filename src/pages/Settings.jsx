import { useRef } from 'react'
import { useCloset } from '../hooks/useCloset'
import { useOutfits } from '../hooks/useOutfits'

function Settings() {
  const closet = useCloset()
  const outfits = useOutfits()
  const fileInputRef = useRef(null)

  const handleExport = () => {
    const data = {
      version: 1,
      exportedAt: new Date().toISOString(),
      closet: JSON.parse(closet.exportData()),
      outfits: JSON.parse(outfits.exportData()),
    }

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `colorcombo-backup-${new Date().toISOString().split('T')[0]}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const handleImport = (e) => {
    const file = e.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (event) => {
      try {
        const data = JSON.parse(event.target.result)

        if (data.closet) {
          closet.importData(JSON.stringify(data.closet))
        }
        if (data.outfits) {
          outfits.importData(JSON.stringify(data.outfits))
        }

        alert('Data imported successfully!')
      } catch (err) {
        console.error('Import failed:', err)
        alert('Failed to import data. Please check the file format.')
      }
    }
    reader.readAsText(file)

    // Reset input
    e.target.value = ''
  }

  const handleClearData = () => {
    if (confirm('Are you sure you want to delete all your data? This cannot be undone.')) {
      if (confirm('This will remove all your closet items and outfits. Continue?')) {
        localStorage.removeItem('colorcombo_closet')
        localStorage.removeItem('colorcombo_outfits')
        window.location.reload()
      }
    }
  }

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-6">Settings</h1>

      <input
        ref={fileInputRef}
        type="file"
        accept=".json"
        onChange={handleImport}
        className="hidden"
      />

      <div className="space-y-4">
        {/* Data Management */}
        <div className="card">
          <h2 className="font-semibold mb-4">Data Management</h2>

          <div className="space-y-3">
            <button onClick={handleExport} className="btn-secondary w-full flex items-center justify-center gap-2">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              Export Data
            </button>
            <p className="text-sm text-gray-500">
              Download all your closet items and outfits as a JSON file.
            </p>
          </div>

          <hr className="my-4 border-gray-100" />

          <div className="space-y-3">
            <button
              onClick={() => fileInputRef.current?.click()}
              className="btn-secondary w-full flex items-center justify-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
              </svg>
              Import Data
            </button>
            <p className="text-sm text-gray-500">
              Restore your data from a previously exported JSON file.
            </p>
          </div>

          <hr className="my-4 border-gray-100" />

          <div className="space-y-3">
            <button
              onClick={handleClearData}
              className="w-full px-4 py-3 bg-red-50 text-red-600 rounded-xl font-medium
                         active:bg-red-100 transition-colors touch-manipulation
                         flex items-center justify-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
              Clear All Data
            </button>
            <p className="text-sm text-gray-500">
              Permanently delete all your closet items and outfits.
            </p>
          </div>
        </div>

        {/* Stats */}
        <div className="card">
          <h2 className="font-semibold mb-4">Your Stats</h2>
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-warmgray rounded-xl p-4 text-center">
              <p className="text-3xl font-bold">{closet.items.length}</p>
              <p className="text-sm text-gray-500">Closet Items</p>
            </div>
            <div className="bg-warmgray rounded-xl p-4 text-center">
              <p className="text-3xl font-bold">{outfits.outfits.length}</p>
              <p className="text-sm text-gray-500">Saved Outfits</p>
            </div>
          </div>
        </div>

        {/* About */}
        <div className="card">
          <h2 className="font-semibold mb-2">About</h2>
          <p className="text-sm text-gray-600 mb-2">
            Color Combo App uses color combinations from "A Dictionary of Color
            Combinations Vol 1" by Sanzo Wada to help you create harmonious outfits.
          </p>
          <p className="text-xs text-gray-400">
            159 colors / 348 combinations
          </p>
        </div>

        {/* Install PWA hint */}
        <div className="card bg-blue-50 border border-blue-100">
          <h2 className="font-semibold mb-2 text-blue-800">Install on Your Phone</h2>
          <p className="text-sm text-blue-700">
            To install this app on your iPhone:
          </p>
          <ol className="text-sm text-blue-600 mt-2 space-y-1 list-decimal list-inside">
            <li>Open this page in Safari</li>
            <li>Tap the Share button</li>
            <li>Select "Add to Home Screen"</li>
          </ol>
        </div>
      </div>
    </div>
  )
}

export default Settings
