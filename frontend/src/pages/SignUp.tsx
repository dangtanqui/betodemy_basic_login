import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useGoogleLogin } from '@react-oauth/google'
import { authService } from '../services/auth'
import Header from '../components/Header'
import Input from '../components/Input'
import Button from '../components/Button'
import SocialButton from '../components/SocialButton'
import PasswordStrength from '../components/PasswordStrength'
import FloatingCharacters from '../components/FloatingCharacters'
import { useTheme } from '../context/ThemeContext'

export default function SignUp() {
  const navigate = useNavigate()
  const { register, updateUser } = useAuth()
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [agreeTerms, setAgreeTerms] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [googleLoading, setGoogleLoading] = useState(false)
  const { isDark } = useTheme()
  const [pullStart, setPullStart] = useState<number | null>(null)
  const [pullOffset, setPullOffset] = useState(0)
  const [isReleasing, setIsReleasing] = useState(false)

  const googleLogin = useGoogleLogin({
    flow: 'implicit',
    scope: 'openid email profile',
    onSuccess: async (tokenResponse) => {
      try {
        setGoogleLoading(true)
        const accessToken = tokenResponse.access_token
        if (!accessToken) throw new Error('Missing Google access token')
        const res = await authService.loginWithGoogle(accessToken)
        localStorage.setItem('token', res.accessToken)
        updateUser(res.user)
        navigate('/dashboard')
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Google login failed')
      } finally {
        setGoogleLoading(false)
      }
    },
    onError: () => setError('Google login failed'),
  })

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
      className={`min-h-screen bg-gradient-to-br relative overflow-hidden ${
        isDark ? 'from-purple-900 via-violet-800 to-purple-900' : 'from-[#dfe6ff] via-[#e8e2ff] to-[#f6dff2]'
      }`}
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      onTouchEnd={onTouchEnd}
    >
      <FloatingCharacters />
      <div
        className={`relative z-10 min-h-screen flex flex-col transition-transform duration-200 ${
          isReleasing ? 'ease-out' : 'ease-in'
        }`}
        style={{ transform: `translateY(${pullOffset}px)` }}
      >
        <div className="w-full max-w-4xl mx-auto px-4 pt-6">
          <Header />
        </div>

        <div className="flex-1 flex items-center justify-center px-4 pb-10">
          <div className="w-full max-w-md space-y-6">

          <main className="px-0">
            <div
              className={`rounded-3xl p-6 animate-fade-in shadow-[0_18px_55px_-28px_rgba(0,0,0,0.25)] ${
                isDark ? 'bg-white/10 backdrop-blur-xl border border-white/10 text-white' : 'bg-white border border-white/50 text-slate-800'
              }`}
            >
              <div className="text-center mb-6">
                <h1 className={`text-3xl font-bold mb-2 ${isDark ? 'text-white' : 'text-slate-900'}`}>Create Account</h1>
                <p className={isDark ? 'text-white/60' : 'text-slate-600'}>Join us and start your futuristic journey.</p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                {error && (
                  <div className="bg-red-500/20 border border-red-500/50 rounded-xl p-3 text-red-300 text-sm text-center">
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

                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={agreeTerms}
                    onChange={(e) => setAgreeTerms(e.target.checked)}
                    className="w-5 h-5 rounded-md border border-white bg-white text-pink-500 focus:ring-pink-400 focus:ring-offset-0 dark:border-pink-300 dark:bg-white/10"
                  />
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

                <div className="my-5 flex items-center">
                  <div className={`flex-1 border-t ${isDark ? 'border-white/20' : 'border-slate-200'}`}></div>
                  <span className={`px-4 text-sm ${isDark ? 'text-white/40' : 'text-slate-500'}`}>or continue with</span>
                  <div className={`flex-1 border-t ${isDark ? 'border-white/20' : 'border-slate-200'}`}></div>
                </div>

              <div className="space-y-3">
                <SocialButton provider="google" onClick={() => googleLogin()} loading={googleLoading} />
                <SocialButton provider="facebook" />
              </div>

              <p className={`text-center mt-5 ${isDark ? 'text-white/60' : 'text-slate-600'}`}>
                Already have an account?{' '}
                <Link to="/login" className="text-pink-500 font-semibold hover:text-pink-400 transition-colors">
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
