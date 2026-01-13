import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import Header from '../components/Header'
import Input from '../components/Input'
import Button from '../components/Button'
import GoogleLoginButton from '../components/GoogleLoginButton'
import FacebookLoginButton from '../components/FacebookLoginButton'
import FloatingCharacters from '../components/FloatingCharacters'
import { useTheme } from '../context/ThemeContext'

const hasGoogleClientId = !!import.meta.env.VITE_GOOGLE_CLIENT_ID

export default function Login() {
  const navigate = useNavigate()
  const { login } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { isDark } = useTheme()
  const [pullStart, setPullStart] = useState<number | null>(null)
  const [pullOffset, setPullOffset] = useState(0)
  const [isReleasing, setIsReleasing] = useState(false)
  const [rememberMe, setRememberMe] = useState(true)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailPattern.test(email)) {
      setError('Email không đúng cú pháp')
      return
    }
    setLoading(true)

    try {
      await login({ email, password }, rememberMe)
      navigate('/dashboard')
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Login failed'
      if (message.toLowerCase().includes('email must be an email')) {
        setError('Email không đúng cú pháp')
      } else {
        setError(message)
      }
    } finally {
      setLoading(false)
    }
  }

  const onTouchStart = (e: React.TouchEvent) => {
    if (window.scrollY > 0) return
    setIsReleasing(false)
    setPullStart(e.touches[0].clientY)
  }
  const onTouchMove = (e: React.TouchEvent) => {
    if (pullStart === null) return
    const delta = e.touches[0].clientY - pullStart
    if (delta > 0) {
      setPullOffset(Math.min(delta * 0.5, 80))
    }
  }
  const onTouchEnd = () => {
    setPullStart(null)
    setIsReleasing(true)
    setPullOffset(0)
    setTimeout(() => setIsReleasing(false), 250)
  }

  return (
    <div
      className={`auth-page ${isDark ? 'auth-page-dark' : 'auth-page-light'}`}
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      onTouchEnd={onTouchEnd}
    >
      <FloatingCharacters />
      <div
        className={`auth-content ${isReleasing ? 'ease-out' : 'ease-in'}`}
        style={{ transform: `translateY(${pullOffset}px)` }}
      >
        <Header />

        <div className="auth-main">
          <div className="auth-container">
            <main className="px-0">
              <div className={`auth-card ${isDark ? 'auth-card-dark' : 'auth-card-light'}`}>
                <div className="auth-header">
                  <h1 className={`auth-title ${isDark ? 'auth-title-dark' : 'auth-title-light'}`}>Log In</h1>
                  <p className={isDark ? 'auth-subtitle' : 'auth-subtitle-light'}>Welcome back to your futuristic journey.</p>
                </div>

                <form onSubmit={handleSubmit} className="auth-form">
                  {error && (
                    <div className="auth-error">
                      {error}
                    </div>
                  )}

                  <Input
                    label="Email"
                    type="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    icon={
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                        />
                      </svg>
                    }
                  />

                  <Input
                    label="Password"
                    type="password"
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    showPasswordToggle
                    icon={
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                        />
                      </svg>
                    }
                  />

                <div className="auth-checkbox-row">
                  <label className="auth-checkbox-label">
                    <div className="relative">
                      <input
                        type="checkbox"
                        checked={rememberMe}
                        onChange={(e) => setRememberMe(e.target.checked)}
                        className="peer sr-only"
                      />
                      <div className={`w-5 h-5 rounded-md border-2 transition-all duration-200 flex items-center justify-center ${
                        isDark 
                          ? 'border-pink-400/50 bg-white/5 peer-checked:bg-pink-500 peer-checked:border-transparent' 
                          : 'border-pink-300 bg-white peer-checked:bg-pink-500 peer-checked:border-transparent'
                      } group-hover:border-pink-400`}>
                        <svg 
                          className={`w-3 h-3 text-white transition-opacity duration-200 ${rememberMe ? 'opacity-100' : 'opacity-0'}`} 
                          fill="none" 
                          stroke="currentColor" 
                          viewBox="0 0 24 24"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                    </div>
                    <span className={isDark ? 'auth-checkbox-text' : 'auth-checkbox-text-light'}>Remember me</span>
                  </label>
                  <button
                    type="button"
                    className={`auth-forgot-btn ${isDark ? 'auth-forgot-btn-dark' : 'auth-forgot-btn-light'}`}
                  >
                    Forgot password?
                    <span className="absolute -bottom-0.5 left-0 right-0 h-[2px] bg-pink-300 scale-x-0 origin-left transition-transform duration-200 hover:scale-x-100" />
                  </button>
                </div>

                  <Button type="submit" loading={loading} disabled={!email || !password}>
                    Log In
                  </Button>
                </form>

                <div className="auth-divider">
                  <div className={`auth-divider-line ${isDark ? 'auth-divider-line-dark' : 'auth-divider-line-light'}`}></div>
                  <span className={`auth-divider-text ${isDark ? 'auth-divider-text-dark' : 'auth-divider-text-light'}`}>or continue with</span>
                  <div className={`auth-divider-line ${isDark ? 'auth-divider-line-dark' : 'auth-divider-line-light'}`}></div>
                </div>

                <div className="auth-social-buttons">
                  {hasGoogleClientId && (
                    <GoogleLoginButton onError={setError} rememberMe={rememberMe} />
                  )}
                  <FacebookLoginButton onError={setError} rememberMe={rememberMe} />
                </div>

                <p className={`auth-footer ${isDark ? 'auth-footer-dark' : 'auth-footer-light'}`}>
                  Don't have an account?{' '}
                  <Link to="/signup" className="auth-link">
                    Sign Up
                  </Link>
                </p>
              </div>
            </main>
          </div>
        </div>
      </div>
    </div>
  )
}
