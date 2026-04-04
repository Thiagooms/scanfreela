'use client'

import Image from 'next/image'
import { MapPin, Phone, Mail, Globe } from 'lucide-react'
import { motion } from 'framer-motion'
import { colors } from './tokens'
import type { LucideIcon } from 'lucide-react'

const cardStyle: React.CSSProperties = {
  backdropFilter: 'blur(40px) saturate(200%) brightness(1.04)',
  WebkitBackdropFilter: 'blur(40px) saturate(200%) brightness(1.04)',
  background: 'rgba(255, 255, 255, 0.10)',
  border: '1px solid rgba(255, 255, 255, 0.45)',
  boxShadow: '0 1px 0 rgba(255,255,255,0.7) inset, 0 8px 24px rgba(0,0,0,0.07)',
  transition: 'box-shadow 0.2s ease, transform 0.2s ease',
}

const transition = { duration: 0.2, ease: [0.25, 0.1, 0.25, 1] as const }

const cardHover = {
  scale: 1.012,
  transition,
}

interface ContactRow {
  icon: LucideIcon
  value: string
  muted?: boolean
}

interface LeadData {
  category: string
  location: string
  name: string
  timestamp: string
  contacts: ContactRow[]
}

const leads: LeadData[] = [
  {
    category: 'Barbearia',
    location: 'Pinheiros, SP',
    name: 'Barbearia Studio 47',
    timestamp: 'há 2 min',
    contacts: [
      { icon: Phone, value: '(11) 94521-3870' },
      { icon: Mail, value: 'contato@studio47.com.br' },
      { icon: MapPin, value: 'Rua Teodoro Sampaio, 847 — Pinheiros' },
    ],
  },
  {
    category: 'Pet Shop',
    location: 'Vila Madalena, SP',
    name: 'Pet Shop Vila Madalena',
    timestamp: 'há 5 min',
    contacts: [
      { icon: Phone, value: '(11) 97834-2291' },
      { icon: Globe, value: 'petshopvilamadalena.com.br', muted: true },
    ],
  },
]

function CardPill() {
  return (
    <motion.div
      className="flex items-center gap-1.5 px-4 py-3 rounded-full cursor-default"
      style={{ background: '#0A0A0A', boxShadow: '0 4px 20px rgba(0,0,0,0.18), 0 1px 4px rgba(0,0,0,0.10)' }}
      initial="rest"
      whileHover="hover"
      variants={{ rest: { scale: 1 }, hover: { scale: 1.025 } }}
      transition={transition}
    >
      <Image
        src="/assets/logo-nova.svg"
        alt="Spotlead"
        width={18}
        height={18}
        className="shrink-0"
        style={{ filter: 'brightness(0) invert(1)' }}
      />
      <p className="text-[0.6875rem] text-white whitespace-nowrap">
        <strong className="font-bold">Spotlead</strong> encontrou os seguintes resultados
      </p>
    </motion.div>
  )
}

function LeadCard({ lead }: { lead: LeadData }) {
  return (
    <motion.div
      className="w-[26rem] rounded-[1.25rem] cursor-default"
      style={cardStyle}
      whileHover={cardHover}
    >
      <div className="px-5 py-4 flex flex-col gap-3.5">
        <div className="flex items-start justify-between gap-2">
          <div>
            <p className="text-[0.6875rem] font-medium mb-1" style={{ color: colors.text.muted }}>
              {lead.category} · {lead.location}
            </p>
            <p className="text-[1rem] font-semibold leading-tight" style={{ color: colors.text.primary }}>
              {lead.name}
            </p>
          </div>
          <p className="text-[0.6rem] shrink-0 mt-1" style={{ color: colors.text.timestamp }}>
            {lead.timestamp}
          </p>
        </div>

        <div className="flex flex-col gap-1.5 pt-3 border-t" style={{ borderColor: colors.border }}>
          {lead.contacts.map(({ icon: Icon, value, muted }) => (
            <div key={value} className="flex items-start gap-2 text-[0.75rem]"
              style={{ color: muted ? colors.text.muted : colors.text.secondary }}>
              <Icon size={12} strokeWidth={1.75} className="shrink-0 mt-[2px]" />
              {value}
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  )
}

function CardMini() {
  return (
    <motion.div
      className="w-[26rem] rounded-[1rem] cursor-default"
      style={cardStyle}
      whileHover={cardHover}
    >
      <div className="px-5 py-3.5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
            style={{ background: 'rgba(0,129,246,0.07)' }}>
            <MapPin size={14} strokeWidth={2} style={{ color: colors.brand }} />
          </div>
          <div>
            <p className="text-[0.8125rem] font-semibold" style={{ color: colors.text.primary }}>
              12 resultados · Moema, SP
            </p>
            <p className="text-[0.6875rem] mt-0.5" style={{ color: colors.text.muted }}>
              Academia · busca realizada agora
            </p>
          </div>
        </div>
        <p className="text-[0.75rem] font-semibold shrink-0" style={{ color: colors.brand }}>ver todos →</p>
      </div>
    </motion.div>
  )
}

export function LeadCards() {
  return (
    <div className="flex flex-col items-start gap-2.5 select-none pointer-events-auto">
      <CardPill />
      {leads.map((lead) => (
        <LeadCard key={lead.name} lead={lead} />
      ))}
      <CardMini />
    </div>
  )
}
