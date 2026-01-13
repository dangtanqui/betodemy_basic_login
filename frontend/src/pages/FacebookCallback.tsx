import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function FacebookCallback() {
  const navigate = useNavigate()
  const { updateUser } = useAuth()

  useEffect(() => {
    try {
      // Extract token and user from URL query params (from backend redirect)
      const params = new URLSearchParams(window.location.search)
      const token = params.get('token')
      const userParam = params.get('user')
      const error = params.get('error')

      const sendMessage = (type: string, data: any) => {
        try {
          if (window.opener && !window.opener.closed) {
            window.opener.postMessage(
              {
                type,
                ...data,
              },
              window.location.origin,
            )
          }
        } catch (err) {
          console.error('Failed to send message to opener:', err)
        }
      }

      if (error) {
        // If opened in popup, send error to parent
        const errorMessage = error ? decodeURIComponent(error) : 'Facebook login failed'
        sendMessage('FACEBOOK_LOGIN_ERROR', { error: errorMessage })
        setTimeout(() => window.close(), 100)
      } else if (token && userParam) {
        try {
          // Decode base64 user data with proper UTF-8 handling
          // atob() doesn't handle UTF-8 correctly, so we need to decode properly
          const binaryString = atob(userParam)
          const bytes = new Uint8Array(binaryString.length)
          for (let i = 0; i < binaryString.length; i++) {
            bytes[i] = binaryString.charCodeAt(i)
          }
          const decodedUser = new TextDecoder('utf-8').decode(bytes)
          const user = JSON.parse(decodedUser)
          
          // If opened in popup, send success to parent
          sendMessage('FACEBOOK_LOGIN_SUCCESS', {
            accessToken: decodeURIComponent(token),
            user,
          })
          
          setTimeout(() => {
            if (window.opener) {
              window.close()
            } else {
              // If opened in same window, save token and redirect
              localStorage.setItem('token', decodeURIComponent(token))
              updateUser(user)
              navigate('/dashboard')
            }
          }, 100)
        } catch (err) {
          console.error('Failed to parse user data:', err)
          const errorMessage = 'Failed to parse user data'
          sendMessage('FACEBOOK_LOGIN_ERROR', { error: errorMessage })
          setTimeout(() => {
            if (window.opener) {
              window.close()
            } else {
              navigate(`/login?error=${encodeURIComponent(errorMessage)}`)
            }
          }, 100)
        }
      } else {
        // No token and no error - something went wrong
        const errorMessage = 'No token received'
        sendMessage('FACEBOOK_LOGIN_ERROR', { error: errorMessage })
        setTimeout(() => {
          if (window.opener) {
            window.close()
          } else {
            navigate(`/login?error=${encodeURIComponent(errorMessage)}`)
          }
        }, 100)
      }
    } catch (err) {
      console.error('Facebook callback error:', err)
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred'
      try {
        if (window.opener && !window.opener.closed) {
          window.opener.postMessage(
            {
              type: 'FACEBOOK_LOGIN_ERROR',
              error: errorMessage,
            },
            window.location.origin,
          )
        }
        setTimeout(() => window.close(), 100)
      } catch {
        navigate(`/login?error=${encodeURIComponent(errorMessage)}`)
      }
    }
  }, [navigate, updateUser])

  return (
    <div className="fb-callback-page">
      <div className="fb-callback-content">
        <div className="fb-callback-spinner"></div>
        <p className="fb-callback-text">Completing Facebook login...</p>
      </div>
    </div>
  )
}
