'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { Check, X } from 'lucide-react'
import { CONTAINER, PILL_STYLE, fadeUpInView } from './tokens'
import { PLAN_CONFIGS, type PlanConfig, type PlanFeature } from '@/lib/config/plans'

type Plan = PlanConfig
const PLANS = PLAN_CONFIGS

function FeatureRow({ feature, highlighted }: { feature: PlanFeature; highlighted: boolean }) {
  return (
    <motion.li
      className="flex items-center gap-3"
      initial={{ opacity: 0, x: -8 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.35, ease: EASE }}
    >
      {feature.included ? (
        <Check size={15} className={`shrink-0 ${highlighted ? 'text-white' : 'text-black'}`} strokeWidth={2.5} />
      ) : (
        <X size={15} className="text-black/20 shrink-0" strokeWidth={2} />
      )}
      <span className={`text-[13.5px] ${feature.included ? (highlighted ? 'text-white/85' : 'text-black/70') : 'text-black/30'}`}>
        {feature.label}
      </span>
    </motion.li>
  )
}

function PlanCard({ plan, delay }: { plan: Plan; delay: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 36, scale: 0.97 }}
      whileInView={{ opacity: 1, y: 0, scale: 1 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6, ease: EASE, delay }}
      whileHover={{
        y: -6,
        boxShadow: plan.highlighted
          ? '0 32px 64px rgba(0,0,0,0.35), 0 8px 24px rgba(0,0,0,0.2)'
          : '0 32px 64px rgba(0,0,0,0.10), 0 8px 24px rgba(0,0,0,0.06)',
        transition: { duration: 0.35, ease: EASE },
      }}
      className={`rounded-3xl p-10 flex flex-col min-h-[520px] cursor-default ${
        plan.highlighted
          ? 'bg-[#0A0A0A]'
          : 'bg-white border border-black/[0.08]'
      }`}
    >
      <div>
        <span
          className="inline-flex items-center px-3 py-1 rounded-full text-[11px] font-semibold tracking-widest uppercase"
          style={
            plan.highlighted
              ? {
                  background: 'linear-gradient(135deg, #0081F6 0%, #6366f1 100%)',
                  color: '#fff',
                  boxShadow: '0 2px 12px rgba(0,129,246,0.35)',
                }
              : {
                  background: 'rgba(0,0,0,0.06)',
                  color: 'rgba(0,0,0,0.55)',
                }
          }
        >
          {plan.name}
        </span>
        <p className={`mt-3 text-[13px] leading-relaxed ${plan.highlighted ? 'text-white/35' : 'text-black/35'}`}>
          {plan.description}
        </p>
      </div>

      <div className="my-10 flex flex-col items-center justify-center text-center">
        {plan.price ? (
          <>
            <motion.span
              className={`text-[3.5rem] font-semibold leading-none tracking-tight ${plan.highlighted ? 'text-white' : 'text-black'}`}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, ease: EASE, delay: delay + 0.1 }}
            >
              {plan.price}
            </motion.span>
            <span className={`text-[13px] mt-1.5 ${plan.highlighted ? 'text-white/40' : 'text-black/35'}`}>
              por mês
            </span>
          </>
        ) : (
          <>
            <motion.span
              className={`text-[3.5rem] font-semibold leading-none tracking-tight ${plan.highlighted ? 'text-white' : 'text-black'}`}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, ease: EASE, delay: delay + 0.1 }}
            >
              Grátis
            </motion.span>
            <span className={`text-[13px] mt-1.5 ${plan.highlighted ? 'text-white/40' : 'text-black/35'}`}>
              para sempre
            </span>
          </>
        )}
      </div>

      <motion.div
        whileHover={{ scale: 1.03 }}
        whileTap={{ scale: 0.97 }}
        transition={{ duration: 0.18, ease: EASE }}
        className="mt-8"
      >
        <Link
          href={plan.ctaHref}
          className="w-full h-12 rounded-xl flex items-center justify-center text-[13.5px] font-semibold cursor-pointer relative overflow-hidden"
          style={
            plan.highlighted
              ? {
                  background: 'linear-gradient(135deg, #0081F6 0%, #6366f1 100%)',
                  color: '#fff',
                  boxShadow: '0 4px 24px rgba(0,129,246,0.45), 0 1px 0 rgba(255,255,255,0.15) inset',
                }
              : {
                  background: 'linear-gradient(135deg, #f5f5f5 0%, #e8e8e8 100%)',
                  color: '#0A0A0A',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                }
          }
        >
          <motion.span
            className="absolute inset-0 opacity-0"
            whileHover={{ opacity: 1 }}
            transition={{ duration: 0.2 }}
            style={
              plan.highlighted
                ? { background: 'linear-gradient(135deg, #0070d8 0%, #4f46e5 100%)' }
                : { background: 'linear-gradient(135deg, #ececec 0%, #dcdcdc 100%)' }
            }
          />
          <span className="relative z-10">{plan.cta}</span>
        </Link>
      </motion.div>

      <div className={`my-8 h-px ${plan.highlighted ? 'bg-white/10' : 'bg-black/[0.06]'}`} />

      <ul className="space-y-4 flex-1">
        {plan.features.map((feature) => (
          <FeatureRow key={feature.label} feature={feature} highlighted={plan.highlighted} />
        ))}
      </ul>
    </motion.div>
  )
}

export function Pricing() {
  return (
    <section id="planos" className="pt-[clamp(2rem,4vw,3.5rem)] pb-[clamp(4rem,8vw,7rem)] bg-white">
      <div className={CONTAINER}>

        <motion.div {...fadeUpInView(0)} className="text-center mb-[clamp(2.5rem,5vw,4rem)]">
          <span
            className="inline-flex items-center px-4 py-1.5 text-[12px] font-medium text-black/45 mb-5"
            style={PILL_STYLE}
          >
            Planos
          </span>
          <h2 className="text-[clamp(1.75rem,3.5vw,2.75rem)] font-semibold text-black leading-[1.15]">
            Comece grátis.<br className="hidden sm:block" /> Escale quando precisar.
          </h2>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-3xl mx-auto">
          {PLANS.map((plan, i) => (
            <PlanCard key={plan.name} plan={plan} delay={0.08 + i * 0.1} />
          ))}
        </div>

      </div>
    </section>
  )
}
