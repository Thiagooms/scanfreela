'use client'

import Image from 'next/image'
import { motion } from 'framer-motion'
import { LeadCards } from './LeadCards'
import { CONTAINER } from './tokens'

function MobileShowcase() {
  return (
    <div className="w-full pb-[clamp(2rem,6vw,4rem)] px-4">
      <div
        className="w-full rounded-2xl flex items-center justify-center"
        style={{ background: 'linear-gradient(to bottom, #E6E6E6, #FFFFFF)' }}
      >
        <Image
          src="/assets/product-show-case.png"
          alt="SpotLead dashboard"
          width={3200}
          height={770}
          className="w-full h-auto object-contain"
          priority
        />
      </div>
    </div>
  )
}

function DesktopShowcase() {
  return (
    <div className={`${CONTAINER} pb-[clamp(3rem,6vw,5rem)]`}>
      <motion.div
        className="w-full rounded-2xl overflow-hidden relative flex items-center min-h-[clamp(18rem,40vw,32rem)]"
        style={{ background: 'linear-gradient(to bottom, #E6E6E6, #FFFFFF)' }}
        initial={{ opacity: 0, y: 32 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-80px' }}
        transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1], delay: 0.1 }}
      >
        <motion.div
          initial={{ opacity: 0, x: -24 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1], delay: 0.25 }}
        >
          <Image
            src="/assets/product-show-case.png"
            alt="SpotLead dashboard"
            width={3200}
            height={770}
            className="w-[65%] h-auto object-contain"
            priority
          />
        </motion.div>

        <motion.div
          className="absolute right-35 top-1/2 -translate-y-1/2"
          initial={{ opacity: 0, x: 32 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1], delay: 0.4 }}
        >
          <LeadCards />
        </motion.div>
      </motion.div>
    </div>
  )
}

export function ProductShowcase() {
  return (
    <section className="w-full">
      <div className="md:hidden">
        <MobileShowcase />
      </div>
      <div className="hidden md:block">
        <DesktopShowcase />
      </div>
    </section>
  )
}
