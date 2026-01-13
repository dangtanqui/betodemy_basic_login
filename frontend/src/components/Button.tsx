interface ButtonProps {
  children: React.ReactNode
  type?: 'button' | 'submit'
  disabled?: boolean
  loading?: boolean
  onClick?: () => void
  variant?: 'primary' | 'outline'
  className?: string
}

export default function Button({
  children,
  type = 'button',
  disabled,
  loading,
  onClick,
  variant = 'primary',
  className = '',
}: ButtonProps) {
  const baseStyles =
    'w-full py-4 rounded-xl font-semibold transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-65 disabled:cursor-not-allowed leading-none'

  const variants = {
    primary:
      'relative overflow-hidden isolate bg-gradient-to-r from-purple-600 via-pink-500 to-rose-400 text-white shadow-[0_15px_45px_-12px_rgba(236,72,153,0.55)] hover:brightness-110 hover:shadow-[0_18px_55px_-14px_rgba(236,72,153,0.65)] !text-white',
    outline: 'border border-slate-300 text-slate-800 bg-slate-50/80 hover:bg-slate-100 dark:border-white/20 dark:text-white dark:bg-white/5 dark:hover:bg-white/10',
  }

  return (
    <button
      type={type}
      disabled={disabled || loading}
      onClick={onClick}
      className={`${baseStyles} ${variants[variant]} ${className} ${variant === 'primary' ? 'group' : ''}`}
    >
      {variant === 'primary' && !loading && (
        <>
          <span className="pointer-events-none absolute inset-0 overflow-hidden">
            <span className="shimmer-light" />
            <span className="shimmer-stars" />
          </span>
        </>
      )}
      {loading && (
        <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
            fill="none"
          />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          />
        </svg>
      )}
      {children}
    </button>
  )
}
