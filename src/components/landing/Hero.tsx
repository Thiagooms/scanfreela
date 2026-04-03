'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { CONTAINER } from './tokens'

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] as const, delay },
})

export function Hero() {
  return (
    <section className="w-full">
      <div className={`${CONTAINER} pt-[clamp(3rem,6vw,5rem)] pb-[clamp(2rem,4vw,3.5rem)]`}>

        <div className="flex flex-col md:flex-row md:items-start gap-10 md:gap-8">

          <div className="md:w-1/2">
            <motion.p {...fadeUp(0.1)} className="text-[clamp(2.25rem,5vw,3.5rem)] font-medium leading-none text-black">
              Encontrar os teus Leads
            </motion.p>
            <motion.p {...fadeUp(0.2)} className="text-[clamp(2.25rem,5vw,3.5rem)] font-medium text-black" style={{ lineHeight: '90.8%' }}>
              Nunca foi tão fácil!
            </motion.p>
          </div>

          <motion.div {...fadeUp(0.35)} className="md:w-1/2 flex flex-col md:items-end items-start gap-6 mt-[10px]">
            <div className="flex flex-col gap-0">
              <p className="text-[0.9rem] font-light text-black md:text-right text-left md:ml-[30px]" style={{ lineHeight: '115%' }}>
                Busque negócios no <strong className="font-bold">Google Maps</strong>, identifique os melhores <strong className="font-bold">leads</strong><br className="hidden md:block" />
                {' '}com <strong className="font-bold">score automático</strong> e organize tudo no seu <strong className="font-bold">pipeline</strong>.
              </p>
              <p className="text-[0.9rem] mt-[8px] font-light text-black md:text-right text-left leading-relaxed">
                Sem planilhas, sem desperdício de tempo.
              </p>
            </div>

            <motion.div
              whileHover={{ scale: 1.04, boxShadow: '0 8px 24px rgba(0,129,246,0.35)' }}
              whileTap={{ scale: 0.97 }}
              transition={{ duration: 0.18, ease: [0.25, 0.1, 0.25, 1] }}
              className="rounded-full"
            >
              <Link
                href="/register"
                className="inline-flex items-center justify-center bg-[#0081F6] text-white font-medium text-[1rem] px-8 h-12 rounded-full select-none"
              >
                Comece Agora
              </Link>
            </motion.div>
          </motion.div>

        </div>

      </div>
    </section>
  )
}
