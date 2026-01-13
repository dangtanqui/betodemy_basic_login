import { useState } from 'react'

interface InputProps {
  label: string
  type: string
  placeholder: string
  value: string
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  icon: React.ReactNode
  error?: string
  showPasswordToggle?: boolean
  disabled?: boolean
}

export default function Input({
  label,
  type,
  placeholder,
  value,
  onChange,
  icon,
  error,
  showPasswordToggle,
  disabled = false,
}: InputProps) {
  const [showPassword, setShowPassword] = useState(false)
  const inputType = showPasswordToggle ? (showPassword ? 'text' : 'password') : type

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-slate-700 dark:text-white/80">{label}</label>
      <div className="relative">
        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 dark:text-white/40">
          {icon}
        </div>
        <input
          type={inputType}
          disabled={disabled}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          className={`w-full rounded-xl py-3.5 pl-12 pr-12 transition-all focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 ${
            error ? 'border-red-500' : 'border-slate-200 dark:border-white/10'
          } ${error ? '' : 'hover:border-purple-400/70'} ${error ? '' : 'dark:hover:border-purple-400/60'} ${
            disabled ? 'bg-slate-100 text-slate-400 cursor-not-allowed' : 'bg-slate-50 text-slate-800'
          } placeholder-slate-400 dark:bg-white/5 dark:text-white dark:placeholder-white/40`}
        />
        {showPasswordToggle && (
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 dark:text-white/40 hover:text-slate-500 dark:hover:text-white/60 transition-colors"
          >
            {showPassword ? (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                />
              </svg>
            ) : (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"
                />
              </svg>
            )}
          </button>
        )}
      </div>
      {error && <p className="text-red-400 text-sm">{error}</p>}
    </div>
  )
}
