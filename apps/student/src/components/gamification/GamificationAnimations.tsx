import { XpGainAnimation } from './XpGainAnimation'
import { BadgeUnlockToast } from './BadgeUnlockToast'
import { LevelUpToast } from './LevelUpToast'
import { CoinEarnAnimation } from './CoinEarnAnimation'

export function GamificationAnimations() {
  return (
    <>
      <XpGainAnimation />
      <CoinEarnAnimation />
      <BadgeUnlockToast />
      <LevelUpToast />
    </>
  )
}
