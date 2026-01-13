import { useState } from 'react'
import { useGoogleLogin } from '@react-oauth/google'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { authService } from '../services/auth'
import SocialButton from './SocialButton'

interface GoogleLoginButtonProps {
  onError?: (error: string) => void
  rememberMe?: boolean
}

export default function GoogleLoginButton({ onError, rememberMe = true }: GoogleLoginButtonProps) {
  const navigate = useNavigate()
  const { updateUser } = useAuth()
  const [googleLoading, setGoogleLoading] = useState(false)

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
        const errorMessage = err instanceof Error ? err.message : 'Google login failed'
        if (onError) {
          onError(errorMessage)
        }
      } finally {
        setGoogleLoading(false)
      }
    },
    onError: () => {
      if (onError) {
        onError('Google login failed')
      }
    },
  })

  return <SocialButton provider="google" onClick={() => googleLogin()} loading={googleLoading} />
}

