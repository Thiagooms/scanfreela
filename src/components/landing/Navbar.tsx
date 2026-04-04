'use client'

import Link from 'next/link'
import { Search } from 'lucide-react'
import { useState, useEffect } from 'react'
import { motion, useScroll } from 'framer-motion'
import { CONTAINER_NAV, colors, EASE } from './tokens'
import { scrollToSection, scrollToTop } from '@/lib/lenis'

export function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const { scrollY } = useScroll()

  useEffect(() => {
    return scrollY.on('change', (y) => setScrolled(y > 20))
  }, [scrollY])

  return (
    <motion.header
      className="fixed top-0 left-0 right-0 z-50 w-full"
      initial={false}
      animate={scrolled ? 'scrolled' : 'top'}
      variants={{
        top: {
          backgroundColor: 'rgba(255,255,255,1)',
          borderBottomColor: 'rgba(0,0,0,0)',
          boxShadow: 'none',
        },
        scrolled: {
          backgroundColor: 'rgba(255,255,255,0.80)',
          borderBottomColor: 'rgba(0,0,0,0.07)',
          boxShadow: '0 2px 20px rgba(0,0,0,0.06)',
        },
      }}
      transition={{ duration: 0.45, ease: EASE, delay: 0.06 }}
      style={{
        backdropFilter: scrolled ? 'blur(16px) saturate(180%)' : 'none',
        WebkitBackdropFilter: scrolled ? 'blur(16px) saturate(180%)' : 'none',
        borderBottom: '1px solid transparent',
      }}
    >
      <div className={`${CONTAINER_NAV} flex items-center justify-between h-[clamp(3.5rem,6.25vw,5rem)]`}>

        <button
          onClick={scrollToTop}
          className="flex items-center gap-[10px] shrink-0 cursor-pointer overflow-visible"
        >
          <img
            src="/assets/logo-nova.svg"
            alt="SpotLead logo"
            style={{ height: 'clamp(2.5rem, 4vw, 3.25rem)', width: 'auto' }}
          />
          <span style={{ color: colors.brandAlt }} className="text-[clamp(0.9rem,1.2vw,1.05rem)] font-semibold tracking-tight">
            Spotlead
          </span>
        </button>

        <div className="hidden md:flex items-center rounded-full border border-black/15 bg-white/60 px-3 gap-2 h-8 w-64 overflow-hidden">
          <Search className="text-black/40 shrink-0" size={14} strokeWidth={1.75} />
          <input
            type="text"
            placeholder="buscar no site..."
            className="min-w-0 flex-1 text-[0.8125rem] text-black/60 placeholder:text-black/40 bg-transparent outline-none"
          />
        </div>

        <nav className="hidden md:flex items-center">
          <button
            onClick={() => scrollToSection('funcionalidades')}
            className="text-[clamp(0.875rem,1.1vw,1rem)] font-medium text-black/55 hover:text-black/80 transition-colors duration-200 cursor-pointer"
          >
            Funcionalidades
          </button>
          <button
            onClick={() => scrollToSection('planos')}
            className="text-[clamp(0.875rem,1.1vw,1rem)] font-medium text-black/55 hover:text-black/80 transition-colors duration-200 ml-[clamp(0.75rem,1.1vw,1rem)] cursor-pointer"
          >
            Planos
          </button>
          <Link href="/register" className="text-[clamp(0.875rem,1.1vw,1rem)] font-medium text-black hover:text-black/70 transition-colors duration-200 ml-[clamp(1.25rem,1.75vw,1.5625rem)]">
            Criar Conta
          </Link>
          <Link href="/login" className="text-[clamp(0.875rem,1.1vw,1rem)] font-medium text-black hover:text-black/70 transition-colors duration-200 ml-[clamp(0.75rem,1.1vw,1rem)]">
            Login
          </Link>
        </nav>

        <button
          className="md:hidden flex flex-col gap-1.5 p-1 cursor-pointer"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Abrir menu"
        >
          <motion.span animate={{ rotate: menuOpen ? 45 : 0, y: menuOpen ? 7 : 0 }} className="block w-5 h-px bg-black origin-center" transition={{ duration: 0.2 }} />
          <motion.span animate={{ opacity: menuOpen ? 0 : 1 }} className="block w-5 h-px bg-black" transition={{ duration: 0.2 }} />
          <motion.span animate={{ rotate: menuOpen ? -45 : 0, y: menuOpen ? -7 : 0 }} className="block w-5 h-px bg-black origin-center" transition={{ duration: 0.2 }} />
        </button>

      </div>

      <motion.div
        className="md:hidden overflow-hidden border-t border-black/5 bg-white/90"
        initial={false}
        animate={{ height: menuOpen ? 'auto' : 0, opacity: menuOpen ? 1 : 0 }}
        transition={{ duration: 0.25, ease: [0.25, 0.1, 0.25, 1] }}
        style={{ backdropFilter: 'blur(16px)' }}
      >
        <div className="px-6 py-4 flex flex-col gap-4">
          <div className="flex items-center rounded-full border border-black/15 px-3 gap-2 h-8 w-full">
            <Search className="text-black/40 shrink-0" size={14} strokeWidth={1.75} />
            <input type="text" placeholder="buscar no site..." className="flex-1 text-sm text-black/60 placeholder:text-black/40 bg-transparent outline-none" />
          </div>
          {[
            { id: 'funcionalidades', label: 'Funcionalidades', muted: true },
            { id: 'planos', label: 'Planos', muted: true },
          ].map(({ id, label, muted }) => (
            <button
              key={id}
              onClick={() => {
                scrollToSection(id)
                setMenuOpen(false)
              }}
              className={`text-sm font-medium text-left cursor-pointer ${muted ? 'text-black/55' : 'text-black'}`}
            >
              {label}
            </button>
          ))}
          {[
            { href: '/register', label: 'Criar Conta' },
            { href: '/login', label: 'Login' },
          ].map(({ href, label }) => (
            <Link key={href} href={href} className="text-sm font-medium text-black" onClick={() => setMenuOpen(false)}>
              {label}
            </Link>
          ))}
        </div>
      </motion.div>

    </motion.header>
  )
}
