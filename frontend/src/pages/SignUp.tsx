import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import Header from '../components/Header'
import Input from '../components/Input'
import Button from '../components/Button'
import GoogleLoginButton from '../components/GoogleLoginButton'
import FacebookLoginButton from '../components/FacebookLoginButton'
import PasswordStrength from '../components/PasswordStrength'
import FloatingCharacters from '../components/FloatingCharacters'
import { useTheme } from '../context/ThemeContext'

const hasGoogleClientId = !!import.meta.env.VITE_GOOGLE_CLIENT_ID

export default function SignUp() {
  const navigate = useNavigate()
  const { register } = useAuth()
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [agreeTerms, setAgreeTerms] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { isDark } = useTheme()
  const [pullStart, setPullStart] = useState<number | null>(null)
  const [pullOffset, setPullOffset] = useState(0)
  const [isReleasing, setIsReleasing] = useState(false)

  const passwordsMatch = password === confirmPassword
  const isFormValid = fullName && email && password && confirmPassword && passwordsMatch && agreeTerms

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!passwordsMatch) {
      setError('Passwords do not match')
      return
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters')
      return
    }

    setLoading(true)

    try {
      await register({ fullName, email, password })
      navigate('/dashboard')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Registration failed')
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
    if (delta > 0) setPullOffset(Math.min(delta * 0.5, 80))
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
              <div className="text-center mb-6">
                <h1 className={`auth-title ${isDark ? 'auth-title-dark' : 'auth-title-light'}`}>Create Account</h1>
                <p className={isDark ? 'auth-subtitle' : 'auth-subtitle-light'}>Join us and start your futuristic journey.</p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                {error && (
                  <div className="auth-error">
                    {error}
                  </div>
                )}

                <Input
                  label="Full Name"
                  type="text"
                  placeholder="Your full name"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  icon={
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                      />
                    </svg>
                  }
                />

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

                <div className="space-y-2">
                  <Input
                    label="Password"
                    type="password"
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    showPasswordToggle
                    error={password && password.length < 6 ? 'Password must be at least 6 characters' : undefined}
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
                  <PasswordStrength password={password} />
                </div>

                <Input
                  label="Confirm Password"
                  type="password"
                  placeholder="Confirm your password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  showPasswordToggle
                  error={confirmPassword && !passwordsMatch ? 'Passwords do not match' : undefined}
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

                <label className="auth-checkbox-label flex items-center gap-3 cursor-pointer">
                  <div className="relative">
                    <input
                      type="checkbox"
                      checked={agreeTerms}
                      onChange={(e) => setAgreeTerms(e.target.checked)}
                      className="peer sr-only"
                    />
                    <div className={`w-5 h-5 rounded-md border-2 transition-all duration-200 flex items-center justify-center ${
                      isDark 
                        ? 'border-pink-400/50 bg-white/5 peer-checked:bg-pink-500 peer-checked:border-transparent' 
                        : 'border-pink-300 bg-white peer-checked:bg-pink-500 peer-checked:border-transparent'
                    } group-hover:border-pink-400`}>
                      <svg 
                        className={`w-3 h-3 text-white transition-opacity duration-200 ${agreeTerms ? 'opacity-100' : 'opacity-0'}`} 
                        fill="none" 
                        stroke="currentColor" 
                        viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                  </div>
                  <span className={`text-sm ${isDark ? 'text-white/70' : 'text-slate-700'}`}>
                    I agree to the{' '}
                    <button type="button" className="text-pink-500 font-semibold hover:text-pink-400">
                      Terms & Conditions
                    </button>
                  </span>
                </label>

                <Button type="submit" loading={loading} disabled={!isFormValid}>
                  Sign Up
                </Button>
              </form>

                <div className="auth-divider my-5">
                  <div className={`auth-divider-line ${isDark ? 'auth-divider-line-dark' : 'auth-divider-line-light'}`}></div>
                  <span className={`auth-divider-text ${isDark ? 'auth-divider-text-dark' : 'auth-divider-text-light'}`}>or continue with</span>
                  <div className={`auth-divider-line ${isDark ? 'auth-divider-line-dark' : 'auth-divider-line-light'}`}></div>
                </div>

              <div className="auth-social-buttons">
                {hasGoogleClientId && (
                  <GoogleLoginButton onError={setError} rememberMe={true} />
                )}
                <FacebookLoginButton onError={setError} rememberMe={true} />
              </div>

              <p className={`auth-footer mt-5 ${isDark ? 'auth-footer-dark' : 'auth-footer-light'}`}>
                Already have an account?{' '}
                <Link to="/login" className="auth-link">
                  Log In
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
