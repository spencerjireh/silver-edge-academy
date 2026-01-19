import {
  Footprints,
  Bug,
  Flame,
  Repeat,
  Trophy,
  Compass,
  Hand,
  Star,
} from 'lucide-react'

export const badgeIconMap: Record<string, typeof Star> = {
  footprints: Footprints,
  bug: Bug,
  flame: Flame,
  repeat: Repeat,
  trophy: Trophy,
  compass: Compass,
  'hand-helping': Hand,
  star: Star,
}

export function getBadgeIcon(iconName: string) {
  return badgeIconMap[iconName] || Star
}
