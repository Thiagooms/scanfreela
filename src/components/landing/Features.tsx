'use client'

import { motion } from 'framer-motion'
import { Search } from 'lucide-react'
import { CONTAINER, PILL_STYLE, fadeUpInView } from './tokens'

const CARD_STYLE = {
  background: 'linear-gradient(rgb(255, 255, 255) 0%, rgb(244, 244, 244) 69.71%, rgb(250, 250, 250) 100%)',
  border: '1px solid rgb(238, 238, 238)',
  borderRadius: '24px',
}

const CHAT_MESSAGES = [
  { text: 'Olá, vi seu negócio no Maps...', mine: false },
  { text: 'Tenho uma proposta pra vocês', mine: true },
  { text: 'Podemos conversar?', mine: true },
] as const

const KANBAN_COLUMNS = [
  { label: 'Novo', color: '#1a1a1a' },
  { label: 'Abordado', color: '#333333' },
  { label: 'Negociando', color: '#4d4d4d' },
  { label: 'Fechado', color: '#666666' },
] as const

const SCORE_CRITERIA = [
  { label: 'Telefone', active: true },
  { label: 'Website', active: true },
  { label: 'Avaliações', active: false },
] as const

export function Features() {
  return (
    <section id="funcionalidades" className="pt-[clamp(2rem,4vw,3.5rem)] pb-[clamp(4rem,8vw,7rem)] bg-white">
      <div className={CONTAINER}>

        <motion.div {...fadeUpInView(0)} className="text-center mb-[clamp(2.5rem,5vw,4rem)]">
          <span
            className="inline-flex items-center px-4 py-1.5 text-[12px] font-medium text-black/45 mb-5"
            style={PILL_STYLE}
          >
            Funcionalidades
          </span>
          <h2
            className="text-[clamp(1.75rem,3.5vw,2.75rem)] font-semibold leading-[1.15]"
            style={{ textAlign: 'center', color: '#0A0A0A' }}
          >
            Encontre, qualifique e feche<br className="hidden sm:block" /> mais negócios
          </h2>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">

          <div className="flex flex-col gap-3">

            <motion.div {...fadeUpInView(0.08)} className="overflow-hidden p-5 md:p-8" style={CARD_STYLE}>
              <h3 className="text-[clamp(1.35rem,4vw,2rem)] font-semibold text-black leading-tight">
                Buscar por Leads
              </h3>
              <p className="mt-2 text-[14px] text-black/60 leading-relaxed">
                Faça uma busca personalizada para encontrar leads que você tem interesse.
              </p>
              <div className="mt-8 space-y-3">
                <div className="flex items-center gap-3 bg-white rounded-2xl px-4 py-3.5 border border-black/[0.06] shadow-[0_1px_4px_rgba(0,0,0,0.04)] max-w-[260px]">
                  <Search size={15} className="text-black/35 shrink-0" />
                  <span className="text-[13px] text-black/35">barbearia · São Paulo, SP</span>
                </div>
                <div className="flex items-center gap-2 px-1">
                  <div className="w-2 h-2 rounded-full bg-[#0081F6]" />
                  <span className="text-[13px] text-black/70">+33 resultados foram encontrados</span>
                </div>
              </div>
            </motion.div>

            <motion.div {...fadeUpInView(0.14)} className="overflow-hidden p-5 md:p-8 flex-1" style={CARD_STYLE}>
              <h3 className="text-[clamp(1.35rem,4vw,2rem)] font-semibold text-black leading-tight">
                Automação via WhatsApp
              </h3>
              <p className="mt-2 text-[14px] text-black/60 leading-relaxed">
                Envie mensagens para leads diretamente pela plataforma, sem sair.
              </p>
              <div className="mt-8 space-y-2.5">
                {CHAT_MESSAGES.map((msg, i) => (
                  <div key={i} className={`flex ${msg.mine ? 'justify-end' : 'justify-start'}`}>
                    <div className={`px-3.5 py-2 rounded-2xl text-[12px] leading-snug max-w-[70%] ${msg.mine ? 'bg-[#25D366]/20 text-[#166534]' : 'bg-white border border-black/[0.10] text-black/70'}`}>
                      {msg.text}
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>

          </div>

          <div className="flex flex-col gap-3">

            <motion.div {...fadeUpInView(0.08)} className="overflow-hidden p-5 md:p-8 flex-1" style={CARD_STYLE}>
              <h3 className="text-[clamp(1.35rem,4vw,2rem)] font-semibold text-black leading-tight">
                Organize seus Leads
              </h3>
              <p className="mt-2 text-[14px] text-black/60 leading-relaxed">
                Temos uma ferramenta kanban para que você possa organizar os seus leads da forma como você progredir na conversa com eles.
              </p>
              <div className="mt-8 grid grid-cols-2 sm:grid-cols-4 gap-2">
                {KANBAN_COLUMNS.map((col) => (
                  <div key={col.label} className="flex flex-col gap-1.5">
                    <span className="text-[10px] text-black/55 font-medium truncate">{col.label}</span>
                    <div className="h-[100px] rounded-xl" style={{ backgroundColor: col.color }} />
                  </div>
                ))}
              </div>
            </motion.div>

            <motion.div {...fadeUpInView(0.14)} className="overflow-hidden p-5 md:p-8" style={CARD_STYLE}>
              <h3 className="text-[clamp(1.35rem,4vw,2rem)] font-semibold text-black leading-tight">
                Score automático
              </h3>
              <p className="mt-2 text-[14px] text-black/60 leading-relaxed">
                Cada lead recebe uma pontuação baseada nos dados disponíveis.
              </p>
              <div className="mt-8 flex items-center gap-6">
                <div className="relative flex items-center justify-center w-16 h-16 shrink-0">
                  <svg viewBox="0 0 64 64" className="absolute inset-0 w-full h-full -rotate-90">
                    <circle cx="32" cy="32" r="26" fill="none" stroke="rgba(0,0,0,0.07)" strokeWidth="6" />
                    <circle
                      cx="32" cy="32" r="26"
                      fill="none"
                      stroke="#0081F6"
                      strokeWidth="6"
                      strokeDasharray={`${2 * Math.PI * 26 * 0.8} ${2 * Math.PI * 26}`}
                      strokeLinecap="round"
                    />
                  </svg>
                  <span className="text-xl font-bold text-black/80">8</span>
                </div>
                <div className="space-y-2 flex-1">
                  {SCORE_CRITERIA.map((criterion) => (
                    <div key={criterion.label} className="flex items-center gap-2">
                      <div className={`w-1.5 h-1.5 rounded-full ${criterion.active ? 'bg-[#0081F6]' : 'bg-black/15'}`} />
                      <span className={`text-[13px] ${criterion.active ? 'text-black/70' : 'text-black/30'}`}>
                        {criterion.label}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>

          </div>

        </div>
      </div>
    </section>
  )
}
