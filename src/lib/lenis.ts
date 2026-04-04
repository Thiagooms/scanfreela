import type Lenis from 'lenis'

export type WindowWithLenis = typeof window & { __lenis?: Lenis }

export function getLenis(): Lenis | undefined {
  if (typeof window === 'undefined') return undefined
  return (window as WindowWithLenis).__lenis
}

export function scrollToSection(id: string, offset = -96): void {
  const el = document.getElementById(id)
  if (!el) return
  const lenis = getLenis()
  if (lenis) {
    lenis.scrollTo(el, { offset })
  } else {
    const top = el.getBoundingClientRect().top + window.scrollY + offset
    window.scrollTo({ top, behavior: 'smooth' })
  }
}

export function scrollToTop(): void {
  const lenis = getLenis()
  if (lenis) {
    lenis.scrollTo(0)
  } else {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }
}
