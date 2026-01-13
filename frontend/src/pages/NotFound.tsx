import { Link } from 'react-router-dom'
import FloatingCharacters from '../components/FloatingCharacters'
import Button from '../components/Button'
import Header from '../components/Header'

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-violet-800 to-purple-900 relative overflow-hidden">
      <FloatingCharacters />
      <div className="relative z-10 min-h-screen flex flex-col">
        <div className="w-full max-w-4xl mx-auto px-4 pt-6">
          <Header />
        </div>
        <div className="flex-1 flex items-center justify-center px-4 pb-12">
          <div className="bg-white/10 backdrop-blur-xl rounded-3xl p-8 border border-white/10 max-w-md w-full text-center shadow-[0_18px_55px_-28px_rgba(0,0,0,0.35)]">
            <p className="text-pink-300 font-semibold mb-2">404</p>
            <h1 className="text-3xl font-bold text-white mb-3">Page not found</h1>
            <p className="text-white/70 mb-8">The page you’re looking for doesn’t exist or has been moved.</p>
            <Link to="/" className="block">
              <Button>Back to Home</Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
