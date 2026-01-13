import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import SocialButton from './SocialButton'

interface FacebookLoginButtonProps {
  onError?: (error: string) => void
  rememberMe?: boolean
}

const hasFacebookAppId = !!import.meta.env.VITE_FACEBOOK_APP_ID

export default function FacebookLoginButton({ onError, rememberMe = true }: FacebookLoginButtonProps) {
  const navigate = useNavigate()
  const { updateUser } = useAuth()
  const [facebookLoading, setFacebookLoading] = useState(false)

  useEffect(() => {
    // Listen for message from popup window
    const handleMessage = (event: MessageEvent) => {
      try {
        // Verify origin for security
        if (event.origin !== window.location.origin) {
          return
        }

        // Verify message structure
        if (!event.data || typeof event.data !== 'object' || !event.data.type) {
          return
        }

        if (event.data.type === 'FACEBOOK_LOGIN_SUCCESS') {
          try {
            const { accessToken, user } = event.data

            if (!accessToken || !user) {
              throw new Error('Missing access token or user data')
            }

            if (rememberMe) {
              localStorage.setItem('token', accessToken)
              sessionStorage.removeItem('token')
            } else {
              sessionStorage.setItem('token', accessToken)
              localStorage.removeItem('token')
            }
            updateUser(user)
            navigate('/dashboard')
          } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Facebook login failed'
            if (onError) {
              onError(errorMessage)
            }
          } finally {
            setFacebookLoading(false)
          }
        } else if (event.data.type === 'FACEBOOK_LOGIN_ERROR') {
          if (onError) {
            onError(event.data.error || 'Facebook login failed')
          }
          setFacebookLoading(false)
        }
      } catch (err) {
        console.error('Error handling Facebook login message:', err)
        if (onError) {
          onError('Failed to process Facebook login response')
        }
        setFacebookLoading(false)
      }
    }

    window.addEventListener('message', handleMessage)

    return () => {
      window.removeEventListener('message', handleMessage)
    }
  }, [navigate, updateUser, rememberMe, onError])

  const handleFacebookLogin = () => {
    if (!hasFacebookAppId) {
      if (onError) {
        onError('Facebook App ID not configured')
      }
      return
    }

    setFacebookLoading(true)

    // Build Facebook OAuth URL with backend as redirect_uri
    const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000'
    const redirectUri = `${apiUrl}/auth/facebook/callback`
    const scope = 'email,public_profile'
    const responseType = 'code' // Use code flow instead of token
    const clientId = import.meta.env.VITE_FACEBOOK_APP_ID

    const facebookAuthUrl = `https://www.facebook.com/v18.0/dialog/oauth?client_id=${clientId}&redirect_uri=${encodeURIComponent(
      redirectUri,
    )}&scope=${scope}&response_type=${responseType}`

    // Open popup window
    const width = 600
    const height = 700
    const left = window.screen.width / 2 - width / 2
    const top = window.screen.height / 2 - height / 2

    const popup = window.open(
      facebookAuthUrl,
      'Facebook Login',
      `width=${width},height=${height},left=${left},top=${top},toolbar=no,menubar=no,scrollbars=yes,resizable=yes`,
    )

    // Check if popup was blocked
    if (!popup) {
      if (onError) {
        onError('Popup was blocked. Please allow popups for this site.')
      }
      setFacebookLoading(false)
      return
    }

    // Poll for popup to close or receive message
    const checkPopup = setInterval(() => {
      if (popup.closed) {
        clearInterval(checkPopup)
        setFacebookLoading(false)
      }
    }, 500)
  }

  if (!hasFacebookAppId) {
    return null
  }

  return <SocialButton provider="facebook" onClick={handleFacebookLogin} loading={facebookLoading} />
}

