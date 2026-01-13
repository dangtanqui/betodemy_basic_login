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
  return (
    <button
      type={type}
      disabled={disabled || loading}
      onClick={onClick}
      className={`btn-base ${variant === 'primary' ? 'btn-primary' : 'btn-outline'} group ${className}`}
    >
      {!loading && (
        <span className="btn-shimmer-container">
          <span className="shimmer-light" />
          <span className="shimmer-stars" />
        </span>
      )}
      {loading && (
        <svg className="btn-spinner" viewBox="0 0 24 24">
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
