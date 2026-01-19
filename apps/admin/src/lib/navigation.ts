import { useCallback } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'

// Section config - single source of truth
export const SECTIONS = {
  teachers: { label: 'Teachers', singular: 'Teacher', path: '/admin/teachers' },
  parents: { label: 'Parents', singular: 'Parent', path: '/admin/parents' },
  students: { label: 'Students', singular: 'Student', path: '/admin/students' },
  classes: { label: 'Classes', singular: 'Class', path: '/admin/classes' },
  courses: { label: 'Courses', singular: 'Course', path: '/admin/courses' },
  badges: { label: 'Badges', singular: 'Badge', path: '/admin/badges' },
  shop: { label: 'Shop', singular: 'Item', path: '/admin/shop' },
} as const

export type SectionKey = keyof typeof SECTIONS

export interface BreadcrumbItem {
  label: string
  path?: string
}

type PageType = 'list' | 'detail' | 'edit' | 'create' | 'dashboard' | 'other'

interface ParsedRoute {
  section: SectionKey | null
  pageType: PageType
  id: string | null
}

export function parseRoute(pathname: string): ParsedRoute {
  const segments = pathname.split('/').filter(Boolean)
  // segments: ['admin', 'teachers', '123', 'edit'] or ['admin', 'teachers', 'create']

  if (segments.length <= 1) {
    return { section: null, pageType: 'dashboard', id: null }
  }

  const section = segments[1] as SectionKey
  if (!(section in SECTIONS)) {
    return { section: null, pageType: 'other', id: null }
  }

  if (segments.length === 2) {
    return { section, pageType: 'list', id: null }
  }

  if (segments[2] === 'create') {
    return { section, pageType: 'create', id: null }
  }

  const id = segments[2]
  if (segments[3] === 'edit') {
    return { section, pageType: 'edit', id }
  }

  return { section, pageType: 'detail', id }
}

export function useBreadcrumbs(entityLabel?: string): BreadcrumbItem[] {
  const { pathname } = useLocation()
  const { section, pageType } = parseRoute(pathname)

  const crumbs: BreadcrumbItem[] = [{ label: 'Dashboard', path: '/admin' }]

  if (!section || pageType === 'dashboard') {
    return crumbs
  }

  const config = SECTIONS[section]

  // Add section breadcrumb
  crumbs.push({ label: config.label, path: config.path })

  // Add page-specific breadcrumb
  switch (pageType) {
    case 'list':
      // On list page, don't add another crumb
      break
    case 'create':
      crumbs.push({ label: `Create ${config.singular}` })
      break
    case 'detail':
      crumbs.push({ label: entityLabel || `${config.singular} Details` })
      break
    case 'edit':
      crumbs.push({ label: entityLabel ? `Edit ${entityLabel}` : `Edit ${config.singular}` })
      break
  }

  return crumbs
}

export function usePageTitle(): { title: string; subtitle?: string } {
  const { pathname } = useLocation()
  const { section, pageType } = parseRoute(pathname)

  if (!section || pageType === 'dashboard') {
    return { title: 'Dashboard', subtitle: 'School overview and system health' }
  }

  const config = SECTIONS[section]

  switch (pageType) {
    case 'list':
      return { title: config.label, subtitle: `Manage ${config.label.toLowerCase()}` }
    case 'create':
      return { title: `Create ${config.singular}` }
    case 'detail':
      return { title: `${config.singular} Details` }
    case 'edit':
      return { title: `Edit ${config.singular}` }
    default:
      return { title: config.label }
  }
}

interface LocationState {
  from?: string
}

export function useBackNavigation(fallback: string): () => void {
  const navigate = useNavigate()
  const location = useLocation()
  const state = location.state as LocationState | null

  return useCallback(() => {
    // Priority 1: Use explicit origin from location state (cross-entity navigation)
    if (state?.from) {
      navigate(state.from)
      return
    }

    // Priority 2: Use browser history if available
    // window.history.state.idx tracks position in history stack (React Router sets this)
    const historyIdx = (window.history.state as { idx?: number } | null)?.idx ?? 0
    if (historyIdx > 0) {
      navigate(-1)
      return
    }

    // Priority 3: Fall back to provided path
    navigate(fallback)
  }, [navigate, state?.from, fallback])
}

export function getBackFallback(pathname: string): string {
  const { section, pageType, id } = parseRoute(pathname)

  if (!section) return '/admin'

  // Edit pages fall back to detail page
  if (pageType === 'edit' && id) {
    return `${SECTIONS[section].path}/${id}`
  }

  // Detail/create pages fall back to list page
  if (pageType === 'detail' || pageType === 'create') {
    return SECTIONS[section].path
  }

  // List pages fall back to dashboard
  return '/admin'
}

// Role-based navigation helpers
export type UserRole = 'teacher' | 'parent' | 'student'

const ROLE_SECTION_MAP: Record<UserRole, SectionKey> = {
  teacher: 'teachers',
  parent: 'parents',
  student: 'students',
}

export function getRolePath(role: UserRole): string {
  return SECTIONS[ROLE_SECTION_MAP[role]].path
}

export function getRoleLabel(role: UserRole, plural = false): string {
  const section = SECTIONS[ROLE_SECTION_MAP[role]]
  return plural ? section.label : section.singular
}

export function getRoleDetailPath(role: UserRole, id: string): string {
  return `${getRolePath(role)}/${id}`
}

export function getRoleEditPath(role: UserRole, id: string): string {
  return `${getRolePath(role)}/${id}/edit`
}

export function getRoleCreatePath(role: UserRole): string {
  return `/admin/users/create?type=${role}`
}

export function useUserNavigation() {
  const navigate = useNavigate()

  return {
    toList: (role: UserRole) => navigate(getRolePath(role)),
    toDetail: (role: UserRole, id: string) => navigate(getRoleDetailPath(role, id)),
    toEdit: (role: UserRole, id: string) => navigate(getRoleEditPath(role, id)),
    toCreate: (role: UserRole) => navigate(getRoleCreatePath(role)),
  }
}
