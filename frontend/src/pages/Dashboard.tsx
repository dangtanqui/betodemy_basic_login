import { useEffect, useMemo, useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { authService } from '../services/auth'
import Header from '../components/Header'
import Button from '../components/Button'
import FloatingCharacters from '../components/FloatingCharacters'
import { useTheme } from '../context/ThemeContext'

export default function Dashboard() {
  const { user, logout, updateUser, isLoading } = useAuth()
  const { isDark } = useTheme()
  const [pullStart, setPullStart] = useState<number | null>(null)
  const [pullOffset, setPullOffset] = useState(0)
  const [isReleasing, setIsReleasing] = useState(false)
  const fullName = useMemo(() => user?.fullName || 'Friend', [user?.fullName])

  // Typewriter states
  const [phase, setPhase] = useState<'name' | 'subtitle'>('name')
  const [nameIndex, setNameIndex] = useState(0)
  const [msgIndex, setMsgIndex] = useState(0)
  const [msgCharIndex, setMsgCharIndex] = useState(0)
  const [msgFadeOut, setMsgFadeOut] = useState(false)

  const subtitleMessages = useMemo(
    () => [
      'Your lessons are waiting 📚',
      'Your study streak is alive 🔥',
      'Your brain wants new knowledge 🧠',
      'Continue learning ✨',
    ],
    [],
  )

  // Typing for name in the main heading
  useEffect(() => {
    if (phase !== 'name') return
    if (nameIndex < fullName.length) {
      const t = setTimeout(() => setNameIndex((c) => c + 1), 55)
      return () => clearTimeout(t)
    }
    // name finished, start subtitles after short pause
    const pause = setTimeout(() => {
      setPhase('subtitle')
      setMsgIndex(0)
      setMsgCharIndex(0)
      setMsgFadeOut(false)
    }, 600)
    return () => clearTimeout(pause)
  }, [phase, nameIndex, fullName.length])

  // Typing for subtitles
  useEffect(() => {
    if (phase !== 'subtitle') return
    const current = subtitleMessages[msgIndex] || ''
    if (msgFadeOut) return
    if (msgCharIndex < current.length) {
      const t = setTimeout(() => setMsgCharIndex((c) => c + 1), 50)
      return () => clearTimeout(t)
    }
    const pause = setTimeout(() => setMsgFadeOut(true), 1000)
    return () => clearTimeout(pause)
  }, [phase, msgIndex, msgCharIndex, msgFadeOut, subtitleMessages])

  useEffect(() => {
    if (phase !== 'subtitle' || !msgFadeOut) return
    const t = setTimeout(() => {
      const nextIndex = msgIndex + 1
      if (nextIndex >= subtitleMessages.length) {
        // restart cycle
        setPhase('name')
        setNameIndex(0)
        setMsgIndex(0)
        setMsgCharIndex(0)
        setMsgFadeOut(false)
      } else {
        setMsgIndex(nextIndex)
        setMsgCharIndex(0)
        setMsgFadeOut(false)
      }
    }, 320)
    return () => clearTimeout(t)
  }, [phase, msgFadeOut, msgIndex, subtitleMessages.length])

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
  }

  const getAvatarUrl = () => {
    if (!user?.avatarUrl) return null
    if (user.avatarUrl.startsWith('http')) return user.avatarUrl
    const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000'
    return `${baseUrl}${user.avatarUrl}`
  }

  const handleUploadAvatar = async (file: File) => {
    const updatedUser = await authService.uploadAvatar(file)
    updateUser(updatedUser)
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

  if (isLoading || !user) {
    return (
      <div
        className={`min-h-screen bg-gradient-to-br relative overflow-hidden ${
          isDark ? 'from-purple-900 via-violet-900 to-purple-950' : 'from-[#e5e8ff] via-[#ede7ff] to-[#f7e9f6]'
        }`}
      >
        <FloatingCharacters />
        <div className="relative z-10 min-h-screen flex flex-col max-w-4xl mx-auto">
          <Header showAvatar user={user || undefined} />
          <div className="flex-1 px-4 pb-10 flex flex-col gap-6 justify-center">
            <div className="bg-white/10 dark:bg-white/10 backdrop-blur-xl rounded-3xl p-6 border border-white/20 shadow-[0_18px_55px_-28px_rgba(0,0,0,0.25)] animate-pulse">
              <div className="h-6 w-40 bg-white/30 rounded-full mb-3"></div>
              <div className="h-10 bg-white/20 rounded-xl mb-4"></div>
              <div className="h-10 bg-white/15 rounded-xl mb-2"></div>
              <div className="h-10 bg-white/15 rounded-xl"></div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div
      className={`min-h-screen bg-gradient-to-br relative overflow-hidden ${
        isDark ? 'from-purple-900 via-violet-900 to-purple-950' : 'from-[#e5e8ff] via-[#ede7ff] to-[#f7e9f6]'
      }`}
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      onTouchEnd={onTouchEnd}
    >
      <FloatingCharacters />
      <div
        className={`relative z-10 min-h-screen flex flex-col max-w-4xl mx-auto transition-transform duration-200 ${
          isReleasing ? 'ease-out' : 'ease-in'
        }`}
        style={{ transform: `translateY(${pullOffset}px)` }}
      >
        <Header
          showAvatar
          avatarUrl={getAvatarUrl()}
          user={user}
          onUploadAvatar={handleUploadAvatar}
          onLogout={logout}
        />

        <main className="flex-1 px-4 pb-10 animate-fade-in flex flex-col items-center justify-center text-center">
          <div className="max-w-2xl space-y-4">
            <p className={`text-sm ${isDark ? 'text-white/60' : 'text-slate-600'}`}>Joined {formatDate(user.joinedAt)}</p>
            <h1 className={`text-4xl font-bold leading-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>
              Welcome back,{' '}
              <span className="text-pink-500">
                {fullName.slice(0, nameIndex)}
                {phase === 'name' && <span className="inline-block animate-blink ml-0.5">|</span>}
              </span>
              !
            </h1>
            <div className={`text-lg md:text-xl font-semibold min-h-[1.8rem] ${isDark ? 'text-white/90' : 'text-slate-800'}`}>
              {phase === 'subtitle' && (
                <span className={`transition-opacity duration-300 ${msgFadeOut ? 'opacity-0' : 'opacity-100'}`}>
                  {(subtitleMessages[msgIndex] || '').slice(0, msgCharIndex)}
                  <span className="ml-1 text-pink-300 inline-block animate-blink">▍</span>
                </span>
              )}
              {phase === 'name' && <span className="opacity-0">placeholder</span>}
            </div>
            <p className={isDark ? 'text-white/70' : 'text-slate-700'}>
              Manage your profile from the top-right avatar menu. Upload a new photo or sign out anytime.
            </p>
            <div className="flex items-center justify-center gap-3 pt-4">
              <Button
                variant="outline"
                onClick={logout}
                className={`max-w-xs ${
                  phase === 'subtitle' &&
                  subtitleMessages[msgIndex] === 'Continue learning ✨' &&
                  msgCharIndex === (subtitleMessages[msgIndex] || '').length
                    ? 'animate-pulse'
                    : ''
                }`}
              >
                Logout
              </Button>
            </div>
          </div>
        </main>
      </div>
      <style>{`
        @keyframes blink {
          0%, 50% { opacity: 1; }
          50.01%, 100% { opacity: 0; }
        }
        .animate-blink {
          animation: blink 1s step-start infinite;
        }
      `}</style>
    </div>
  )
}
