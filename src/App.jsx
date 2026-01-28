import { Routes, Route, Link, useLocation } from 'react-router-dom'
import Navigation from './components/Navigation'
import Home from './pages/Home'
import Explore from './pages/Explore'
import Closet from './pages/Closet'
import Outfits from './pages/Outfits'
import Settings from './pages/Settings'

function App() {
  const location = useLocation()
  const isSettings = location.pathname === '/settings'

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header with settings */}
      <header className="sticky top-0 z-40 bg-cream/80 backdrop-blur-sm border-b border-gray-100">
        <div className="flex items-center justify-between px-4 h-12">
          <Link to="/" className="font-semibold text-gray-800">
            ColorCombo
          </Link>
          <Link
            to={isSettings ? '/' : '/settings'}
            className="p-2 text-gray-500 hover:text-gray-700"
          >
            {isSettings ? (
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            )}
          </Link>
        </div>
      </header>

      <main className="flex-1 pb-20">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/explore" element={<Explore />} />
          <Route path="/closet" element={<Closet />} />
          <Route path="/outfits" element={<Outfits />} />
          <Route path="/settings" element={<Settings />} />
        </Routes>
      </main>
      {!isSettings && <Navigation />}
    </div>
  )
}

export default App
