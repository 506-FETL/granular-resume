import { useLocation } from 'react-router-dom'

export interface Breadcrumb {
  href: string
  label: string
}

export function useBreadcrumbs(): Breadcrumb[] {
  const { pathname } = useLocation()
  const segments = pathname.split('/').filter(Boolean)
  const result = [{ href: '/', label: 'home' }]

  result.push(...segments.map((seg, i) => {
    const href = `/${segments.slice(0, i + 1).join('/')}`
    return { href, label: decodeURIComponent(seg) }
  }))

  return result
}
