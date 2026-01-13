export default function FloatingCharacters() {
  const characters = ['あ', '習', '学', 'べ', '日']

  return (
    <div className="floating-container">
      {characters.map((char, index) => (
        <div
          key={index}
          className="floating-char"
          style={{
            top: `${10 + index * 18}%`,
            left: index % 2 === 0 ? '8%' : '82%',
            animation: `floatY ${14 + index * 4}s ease-in-out infinite`,
            animationDelay: `${index * 1.2}s`,
            opacity: 0.5,
          }}
        >
          {char}
        </div>
      ))}
    </div>
  )
}
