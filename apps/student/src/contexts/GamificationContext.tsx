import {
  createContext,
  useContext,
  useState,
  useCallback,
  useRef,
  useEffect,
  type ReactNode,
} from 'react'
import type {
  XpGainEvent,
  BadgeUnlockEvent,
  LevelUpEvent,
  CoinEarnEvent,
} from '@/types/student'
import type { Badge } from '@silveredge/shared'

interface GamificationContextValue {
  // Active animations
  xpGains: XpGainEvent[]
  badgeUnlocks: BadgeUnlockEvent[]
  levelUps: LevelUpEvent[]
  coinEarns: CoinEarnEvent[]

  // Trigger animations
  triggerXpGain: (amount: number, source: XpGainEvent['source']) => void
  triggerBadgeUnlock: (badge: Badge) => void
  triggerLevelUp: (oldLevel: number, newLevel: number) => void
  triggerCoinEarn: (amount: number, source: string) => void

  // Clear animations
  clearXpGain: (id: string) => void
  clearBadgeUnlock: (id: string) => void
  clearLevelUp: (id: string) => void
  clearCoinEarn: (id: string) => void
}

const GamificationContext = createContext<GamificationContextValue | null>(null)

export function GamificationProvider({ children }: { children: ReactNode }) {
  const [xpGains, setXpGains] = useState<XpGainEvent[]>([])
  const [badgeUnlocks, setBadgeUnlocks] = useState<BadgeUnlockEvent[]>([])
  const [levelUps, setLevelUps] = useState<LevelUpEvent[]>([])
  const [coinEarns, setCoinEarns] = useState<CoinEarnEvent[]>([])

  // Refs to track timeouts for cleanup
  const xpTimeoutRefs = useRef<Map<string, ReturnType<typeof setTimeout>>>(new Map())
  const coinTimeoutRefs = useRef<Map<string, ReturnType<typeof setTimeout>>>(new Map())

  // Clean up all timeouts on unmount
  useEffect(() => {
    const xpRefs = xpTimeoutRefs.current
    const coinRefs = coinTimeoutRefs.current
    return () => {
      xpRefs.forEach((timeoutId) => clearTimeout(timeoutId))
      xpRefs.clear()
      coinRefs.forEach((timeoutId) => clearTimeout(timeoutId))
      coinRefs.clear()
    }
  }, [])

  const generateId = () => `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`

  const triggerXpGain = useCallback((amount: number, source: XpGainEvent['source']) => {
    const event: XpGainEvent = {
      id: generateId(),
      amount,
      source,
      timestamp: Date.now(),
    }
    setXpGains((prev) => [...prev, event])

    // Auto-clear after animation
    const timeoutId = setTimeout(() => {
      setXpGains((prev) => prev.filter((e) => e.id !== event.id))
      xpTimeoutRefs.current.delete(event.id)
    }, 1000)
    xpTimeoutRefs.current.set(event.id, timeoutId)
  }, [])

  const triggerBadgeUnlock = useCallback((badge: Badge) => {
    const event: BadgeUnlockEvent = {
      id: generateId(),
      badge,
      timestamp: Date.now(),
    }
    setBadgeUnlocks((prev) => [...prev, event])
  }, [])

  const triggerLevelUp = useCallback((oldLevel: number, newLevel: number) => {
    const event: LevelUpEvent = {
      id: generateId(),
      oldLevel,
      newLevel,
      timestamp: Date.now(),
    }
    setLevelUps((prev) => [...prev, event])
  }, [])

  const triggerCoinEarn = useCallback((amount: number, source: string) => {
    const event: CoinEarnEvent = {
      id: generateId(),
      amount,
      source,
      timestamp: Date.now(),
    }
    setCoinEarns((prev) => [...prev, event])

    // Auto-clear after animation
    const timeoutId = setTimeout(() => {
      setCoinEarns((prev) => prev.filter((e) => e.id !== event.id))
      coinTimeoutRefs.current.delete(event.id)
    }, 1200)
    coinTimeoutRefs.current.set(event.id, timeoutId)
  }, [])

  const clearXpGain = useCallback((id: string) => {
    const timeoutId = xpTimeoutRefs.current.get(id)
    if (timeoutId) {
      clearTimeout(timeoutId)
      xpTimeoutRefs.current.delete(id)
    }
    setXpGains((prev) => prev.filter((e) => e.id !== id))
  }, [])

  const clearBadgeUnlock = useCallback((id: string) => {
    setBadgeUnlocks((prev) => prev.filter((e) => e.id !== id))
  }, [])

  const clearLevelUp = useCallback((id: string) => {
    setLevelUps((prev) => prev.filter((e) => e.id !== id))
  }, [])

  const clearCoinEarn = useCallback((id: string) => {
    const timeoutId = coinTimeoutRefs.current.get(id)
    if (timeoutId) {
      clearTimeout(timeoutId)
      coinTimeoutRefs.current.delete(id)
    }
    setCoinEarns((prev) => prev.filter((e) => e.id !== id))
  }, [])

  return (
    <GamificationContext.Provider
      value={{
        xpGains,
        badgeUnlocks,
        levelUps,
        coinEarns,
        triggerXpGain,
        triggerBadgeUnlock,
        triggerLevelUp,
        triggerCoinEarn,
        clearXpGain,
        clearBadgeUnlock,
        clearLevelUp,
        clearCoinEarn,
      }}
    >
      {children}
    </GamificationContext.Provider>
  )
}

export function useGamification() {
  const context = useContext(GamificationContext)
  if (!context) {
    throw new Error('useGamification must be used within a GamificationProvider')
  }
  return context
}
