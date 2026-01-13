import { useEffect, useMemo, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { useTheme } from '../context/ThemeContext'
import type { User } from '../types'

interface HeaderProps {
  showAvatar?: boolean
  avatarUrl?: string | null
  user?: Pick<User, 'fullName' | 'email' | 'joinedAt'>
  onUploadAvatar?: (file: File) => Promise<void>
  onLogout?: () => void
}

const languages = [
  { code: 'vi', label: 'Vietnamese (VN)', flag: '🇻🇳' },
  { code: 'en', label: 'English (EN)', flag: '🇺🇸' },
  { code: 'jp', label: 'Japanese (JP)', flag: '🇯🇵' },
]

export default function Header({ showAvatar, avatarUrl, user, onUploadAvatar, onLogout }: HeaderProps) {
  const { isDark, toggleTheme } = useTheme()
  const [langOpen, setLangOpen] = useState(false)
  const [currentLang, setCurrentLang] = useState<'vi' | 'en' | 'jp'>('en')
  const [avatarOpen, setAvatarOpen] = useState(false)
  const [uploading, setUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const langRef = useRef<HTMLDivElement | null>(null)
  const avatarRef = useRef<HTMLDivElement | null>(null)
  const langHighlightOffset = useMemo(() => {
    const optionHeight = 48
    const gap = 6
    return languages.findIndex((l) => l.code === currentLang) * (optionHeight + gap)
  }, [currentLang])

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (!langOpen) return
      if (langRef.current && !langRef.current.contains(e.target as Node)) {
        setLangOpen(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [langOpen])

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (!avatarOpen) return
      if (avatarRef.current && !avatarRef.current.contains(e.target as Node)) {
        setAvatarOpen(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [avatarOpen])

  const initials = user?.fullName
    ? user.fullName
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2)
    : '?'

  const handleAvatarUpload = async (file?: File) => {
    if (!file || !onUploadAvatar) return
    setUploading(true)
    try {
      await onUploadAvatar(file)
      setAvatarOpen(false)
    } finally {
      setUploading(false)
    }
  }

  return (
    <header className="flex items-center justify-between px-4 py-4">
      <Link to="/" className="flex items-center gap-2 focus:outline-none focus:ring-2 focus:ring-pink-400/60 rounded-lg">
        <div className="w-10 h-10 bg-gradient-to-br from-pink-500 to-purple-600 rounded-lg flex items-center justify-center">
          <svg
            className="w-6 h-6 text-white"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
            />
          </svg>
        </div>
        <span className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white">Betodemy</span>
      </Link>

      <div className="flex items-center gap-2">
        <div className="relative" ref={langRef}>
          <button
            onClick={() => {
              setAvatarOpen(false)
              setLangOpen((v) => !v)
            }}
            className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors focus:outline-none focus:ring-2 focus:ring-pink-400/60 ${
              isDark ? 'bg-white/10 hover:bg-white/20' : 'bg-white/70 hover:bg-white'
            }`}
            aria-haspopup="true"
            aria-expanded={langOpen}
          >
            <svg
              className={`w-5 h-5 ${isDark ? 'text-white' : 'text-pink-500'}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9"
              />
            </svg>
          </button>

          {langOpen && (
            <div
              className={`absolute right-0 md:left-0 md:right-auto top-full translate-y-2 w-56 rounded-2xl overflow-hidden border ${
                isDark
                  ? 'border-white/10 bg-gradient-to-br from-purple-950/95 to-purple-800/95'
                  : 'border-slate-200 bg-white shadow-[0_20px_60px_-30px_rgba(0,0,0,0.35)]'
              } backdrop-blur-xl shadow-2xl shadow-purple-900/50 p-3 space-y-1.5 z-20 max-w-[calc(100vw-32px)]`}
            >
              <div
              className={`pointer-events-none absolute left-3 right-3 h-12 rounded-xl transition-transform duration-300 ${
                  isDark ? 'bg-white/10 border border-pink-400/50' : 'bg-purple-100 border border-pink-300'
                }`}
                style={{ transform: `translateY(${langHighlightOffset}px)` }}
              />
              {languages.map((lang) => {
                const active = lang.code === currentLang
                return (
                  <button
                    key={lang.code}
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => {
                      setCurrentLang(lang.code as 'vi' | 'en' | 'jp')
                      setTimeout(() => setLangOpen(false), 320)
                    }}
                    className={`relative w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left transition-colors ${
                      active
                        ? isDark
                          ? 'text-white'
                          : 'text-slate-900'
                        : isDark
                        ? 'hover:bg-white/5 text-white/80'
                        : 'hover:bg-slate-100 text-slate-700'
                    }`}
                  >
                    <span className="text-lg">{lang.flag}</span>
                    <span className="text-sm font-semibold">{lang.label}</span>
                  </button>
                )
              })}
            </div>
          )}
        </div>

        <button
          onClick={toggleTheme}
          className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${
            isDark ? 'bg-white/10 hover:bg-white/20' : 'bg-white/70 hover:bg-white text-slate-700'
          }`}
        >
          {isDark ? (
            <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
              <path d="M21.752 15.002A9.718 9.718 0 0118 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 003 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 009.002-5.998z" />
            </svg>
          ) : (
            <svg className="w-5 h-5 text-yellow-500 transition-transform duration-200 hover:rotate-12" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2.25a.75.75 0 01.75.75v2.25a.75.75 0 01-1.5 0V3a.75.75 0 01.75-.75zM7.5 12a4.5 4.5 0 119 0 4.5 4.5 0 01-9 0zM18.894 6.166a.75.75 0 00-1.06-1.06l-1.591 1.59a.75.75 0 101.06 1.061l1.591-1.59zM21.75 12a.75.75 0 01-.75.75h-2.25a.75.75 0 010-1.5H21a.75.75 0 01.75.75zM17.834 18.894a.75.75 0 001.06-1.06l-1.59-1.591a.75.75 0 10-1.061 1.06l1.59 1.591zM12 18a.75.75 0 01.75.75V21a.75.75 0 01-1.5 0v-2.25A.75.75 0 0112 18zM7.758 17.303a.75.75 0 00-1.061-1.06l-1.591 1.59a.75.75 0 001.06 1.061l1.591-1.59zM6 12a.75.75 0 01-.75.75H3a.75.75 0 010-1.5h2.25A.75.75 0 016 12zM6.697 7.757a.75.75 0 001.06-1.06l-1.59-1.591a.75.75 0 00-1.061 1.06l1.59 1.591z" />
            </svg>
          )}
        </button>

        {showAvatar && (
          <div className="relative" ref={avatarRef}>
            <button
              onClick={() => {
                setLangOpen(false)
                setAvatarOpen((v) => !v)
              }}
              className={`w-10 h-10 rounded-full overflow-hidden border focus:outline-none focus:ring-2 focus:ring-pink-400/60 ${
                isDark ? 'bg-gradient-to-br from-amber-400 to-orange-500 border-white/20' : 'bg-white border-slate-200'
              }`}
            >
                {avatarUrl ? (
                  <img src={avatarUrl} alt="Avatar" className="w-full h-full object-cover rounded-full" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-white font-semibold">{initials}</div>
                )}
            </button>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => handleAvatarUpload(e.target.files?.[0])}
            />

            {avatarOpen && (
              <div
                className={`absolute right-0 mt-3 w-64 rounded-2xl border p-4 z-30 shadow-2xl shadow-purple-900/50 ${
                  isDark
                    ? 'border-white/10 bg-gradient-to-br from-purple-950/95 to-purple-800/95 backdrop-blur-xl'
                    : 'border-slate-200 bg-white shadow-[0_20px_60px_-30px_rgba(0,0,0,0.35)]'
                }`}
              >
                <div className="flex items-center gap-3 mb-4">
                  <button
                    type="button"
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => fileInputRef.current?.click()}
                    className={`relative w-12 h-12 rounded-full overflow-hidden border group focus:outline-none focus:ring-2 focus:ring-pink-400/60 ${
                      isDark ? 'bg-gradient-to-br from-amber-400 to-orange-500 border-white/20' : 'bg-white border-slate-200'
                    }`}
                  >
                    {avatarUrl ? (
                      <img src={avatarUrl} alt="Avatar" className="w-full h-full object-cover rounded-full" />
                    ) : (
                      <div className={`w-full h-full flex items-center justify-center font-semibold ${isDark ? 'text-white' : 'text-slate-800'}`}>
                        {initials}
                      </div>
                    )}
                    <div className="absolute inset-0 bg-black/45 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      {uploading ? (
                        <svg className="h-5 w-5 animate-spin text-white" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                        </svg>
                      ) : (
                        <svg className="h-5 w-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-6-9l6 6m-6-6v4a2 2 0 002 2h4" />
                        </svg>
                      )}
                    </div>
                  </button>
                  <div>
                    <p className={`${isDark ? 'text-white' : 'text-slate-900'} font-semibold leading-tight`}>{user?.fullName || 'Guest'}</p>
                    <p className={`${isDark ? 'text-white/60' : 'text-slate-600'} text-sm`}>{user?.email || 'No email'}</p>
                  </div>
                </div>

                <div className="space-y-2">
                  <button
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={onLogout}
                    className="w-full px-4 py-2 rounded-xl bg-gradient-to-r from-purple-600 via-pink-500 to-pink-400 text-white text-sm font-semibold hover:opacity-90 transition-opacity relative overflow-hidden group"
                  >
                    <span className="pointer-events-none absolute inset-0 overflow-hidden">
                      <span className="shimmer-light" />
                      <span className="shimmer-stars" />
                    </span>
                    Logout
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </header>
  )
}
