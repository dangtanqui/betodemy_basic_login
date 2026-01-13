export default function FloatingCharacters() {
  const characters = ['あ', '習', '学', 'べ', '日']

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden">
      {characters.map((char, index) => (
        <div
          key={index}
          className="absolute text-slate-500/25 dark:text-white/15 text-7xl font-bold select-none drop-shadow-[0_0_10px_rgba(255,255,255,0.08)]"
          style={{
            top: `${10 + index * 18}%`,
            left: index % 2 === 0 ? '8%' : '82%',
            animation: `floatY ${14 + index * 4}s ease-in-out infinite`,
            animationDelay: `${index * 1.2}s`,
            opacity: 0.2,
          }}
        >
          {char}
        </div>
      ))}
      <style>{`
        @keyframes floatY {
          0% { transform: translateY(40px) rotate(0deg); opacity: 0.1; }
          25% { transform: translateY(-10px) rotate(3deg); opacity: 0.16; }
          50% { transform: translateY(-30px) rotate(5deg); opacity: 0.2; }
          75% { transform: translateY(-10px) rotate(3deg); opacity: 0.16; }
          100% { transform: translateY(40px) rotate(0deg); opacity: 0.1; }
        }
      `}</style>
    </div>
  )
}
