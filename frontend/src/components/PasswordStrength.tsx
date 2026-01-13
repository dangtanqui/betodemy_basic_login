interface PasswordStrengthProps {
  password: string
}

export default function PasswordStrength({ password }: PasswordStrengthProps) {
  const getStrength = (pwd: string): { level: number; label: string; color: string } => {
    let score = 0

    if (pwd.length >= 6) score++
    if (pwd.length >= 10) score++
    if (/[a-z]/.test(pwd) && /[A-Z]/.test(pwd)) score++
    if (/\d/.test(pwd)) score++
    if (/[^a-zA-Z0-9]/.test(pwd)) score++

    if (score <= 1) return { level: 1, label: 'Weak', color: 'bg-red-500' }
    if (score <= 2) return { level: 2, label: 'Fair', color: 'bg-orange-500' }
    if (score <= 3) return { level: 3, label: 'Medium', color: 'bg-yellow-500' }
    if (score <= 4) return { level: 4, label: 'Strong', color: 'bg-green-500' }
    return { level: 5, label: 'Very Strong', color: 'bg-emerald-500' }
  }

  const strength = getStrength(password)

  if (!password) return null

  return (
    <div className="space-y-1">
      <div className="flex justify-between text-sm">
        <span className="text-white/60">Password strength</span>
        <span
          className={`font-medium ${
            strength.level <= 2
              ? 'text-red-400'
              : strength.level <= 3
              ? 'text-yellow-400'
              : 'text-green-400'
          }`}
        >
          {strength.label}
        </span>
      </div>
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((segment) => (
          <div
            key={segment}
            className={`h-1 flex-1 rounded-full transition-colors ${
              segment <= strength.level ? strength.color : 'bg-white/10'
            }`}
          />
        ))}
      </div>
    </div>
  )
}
