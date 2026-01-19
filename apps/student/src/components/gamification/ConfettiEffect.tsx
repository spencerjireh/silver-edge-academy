import { useEffect, useState } from 'react'

interface Particle {
  id: number
  x: number
  y: number
  color: string
  rotation: number
  scale: number
  delay: number
}

const colors = ['#8b5cf6', '#06b6d4', '#fbbf24', '#f472b6', '#22c55e', '#fb923c']

interface ConfettiEffectProps {
  isActive: boolean
  particleCount?: number
}

export function ConfettiEffect({ isActive, particleCount = 50 }: ConfettiEffectProps) {
  const [particles, setParticles] = useState<Particle[]>([])

  useEffect(() => {
    if (isActive) {
      const newParticles: Particle[] = Array.from({ length: particleCount }, (_, i) => ({
        id: i,
        x: Math.random() * 100,
        y: Math.random() * 100,
        color: colors[Math.floor(Math.random() * colors.length)],
        rotation: Math.random() * 360,
        scale: 0.5 + Math.random() * 0.5,
        delay: Math.random() * 0.5,
      }))
      setParticles(newParticles)

      // Clear after animation
      const timer = setTimeout(() => {
        setParticles([])
      }, 2000)

      return () => clearTimeout(timer)
    }
  }, [isActive, particleCount])

  if (!isActive || particles.length === 0) return null

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {particles.map((particle) => (
        <div
          key={particle.id}
          className="absolute w-3 h-3 animate-confetti"
          style={{
            left: `${particle.x}%`,
            top: `${particle.y}%`,
            backgroundColor: particle.color,
            transform: `rotate(${particle.rotation}deg) scale(${particle.scale})`,
            animationDelay: `${particle.delay}s`,
            borderRadius: Math.random() > 0.5 ? '50%' : '0',
          }}
        />
      ))}
    </div>
  )
}
