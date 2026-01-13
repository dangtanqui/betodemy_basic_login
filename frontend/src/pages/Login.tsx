import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useGoogleLogin } from '@react-oauth/google'
import { authService } from '../services/auth'
import Header from '../components/Header'
import Input from '../components/Input'
import Button from '../components/Button'
import SocialButton from '../components/SocialButton'
import FloatingCharacters from '../components/FloatingCharacters'
import { useTheme } from '../context/ThemeContext'

export default function Login() {
  const navigate = useNavigate()
  const { login, updateUser } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [googleLoading, setGoogleLoading] = useState(false)
  const { isDark } = useTheme()
  const [pullStart, setPullStart] = useState<number | null>(null)
  const [pullOffset, setPullOffset] = useState(0)
  const [isReleasing, setIsReleasing] = useState(false)
  const [rememberMe, setRememberMe] = useState(true)

  const googleLogin = useGoogleLogin({
    flow: 'implicit',
    scope: 'openid email profile',
    onSuccess: async (tokenResponse) => {
      try {
        setGoogleLoading(true)
        const accessToken = tokenResponse.access_token
        if (!accessToken) throw new Error('Missing Google access token')
        const res = await authService.loginWithGoogle(accessToken)
        if (rememberMe) {
          localStorage.setItem('token', res.accessToken)
          sessionStorage.removeItem('token')
        } else {
          sessionStorage.setItem('token', res.accessToken)
          localStorage.removeItem('token')
        }
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
                <div className="text-center mb-8">
                  <h1 className={`text-3xl font-bold mb-2 ${isDark ? 'text-white' : 'text-slate-900'}`}>Log In</h1>
                  <p className={isDark ? 'text-white/60' : 'text-slate-600'}>Welcome back to your futuristic journey.</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-5">
                  {error && (
                    <div className="bg-red-500/20 border border-red-500/50 rounded-xl p-3 text-red-300 text-sm text-center">
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

                <div className="flex items-center justify-between gap-3">
                  <label className="flex items-center gap-2 text-sm select-none">
                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      className="w-5 h-5 rounded-md border border-white bg-white text-pink-500 focus:ring-pink-400 focus:ring-offset-0 dark:border-white/20 dark:bg-white/5"
                    />
                    <span className={isDark ? 'text-white/80' : 'text-slate-700'}>Remember me</span>
                  </label>
                  <button
                    type="button"
                    className={`text-sm font-semibold relative inline-flex items-center gap-1 transition-colors ${
                      isDark ? 'text-pink-300 hover:text-pink-200' : 'text-pink-500 hover:text-pink-400'
                    }`}
                  >
                    Forgot password?
                    <span className="absolute -bottom-0.5 left-0 right-0 h-[2px] bg-pink-300 scale-x-0 origin-left transition-transform duration-200 hover:scale-x-100" />
                  </button>
                </div>

                  <Button type="submit" loading={loading} disabled={!email || !password}>
                    Log In
                  </Button>
                </form>

                <div className="my-6 flex items-center">
                  <div className={`flex-1 border-t ${isDark ? 'border-white/20' : 'border-slate-200'}`}></div>
                  <span className={`px-4 text-sm ${isDark ? 'text-white/40' : 'text-slate-500'}`}>or continue with</span>
                  <div className={`flex-1 border-t ${isDark ? 'border-white/20' : 'border-slate-200'}`}></div>
                </div>

                <div className="space-y-3">
                  <SocialButton provider="google" onClick={() => googleLogin()} loading={googleLoading} />
                  <SocialButton provider="facebook" />
                </div>

                <p className={`text-center mt-6 ${isDark ? 'text-white/60' : 'text-slate-600'}`}>
                  Don't have an account?{' '}
                  <Link to="/signup" className="text-pink-500 font-semibold hover:text-pink-400 transition-colors">
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
