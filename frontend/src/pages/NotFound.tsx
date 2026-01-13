import { Link } from 'react-router-dom'
import FloatingCharacters from '../components/FloatingCharacters'
import Button from '../components/Button'
import Header from '../components/Header'

export default function NotFound() {
  return (
    <div className="not-found-page">
      <FloatingCharacters />
      <Header />
      <div className="not-found-content">
        <div className="not-found-main">
          <div className="not-found-card">
            <p className="not-found-code">404</p>
            <h1 className="not-found-title">Page not found</h1>
            <p className="not-found-description">The page you're looking for doesn't exist or has been moved.</p>
            <Link to="/" className="block">
              <Button>Back to Home</Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
