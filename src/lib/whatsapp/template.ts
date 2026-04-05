import { WhatsAppLink, WhatsAppTemplateContext } from './types'

const WHATSAPP_BASE_URL = 'https://wa.me'

function sanitizePhone(phone: string): string {
  const digits = phone.replace(/\D/g, '')
  return digits.startsWith('55') ? digits : `55${digits}`
}

function buildMessage(ctx: WhatsAppTemplateContext): string {
  const service = ctx.userService ?? 'meus serviços'
  return (
    `Oi, tudo bem? Vi o ${ctx.leadName} no Google Maps ` +
    `e notei que vocês têm ótimas avaliações. ` +
    `Trabalho com ${service} e acredito que posso ajudar vocês. ` +
    `Posso enviar mais detalhes?`
  )
}

export function buildWhatsAppLink(ctx: WhatsAppTemplateContext): WhatsAppLink {
  const message = buildMessage(ctx)
  const phone = sanitizePhone(ctx.leadPhone)
  const url = `${WHATSAPP_BASE_URL}/${phone}?text=${encodeURIComponent(message)}`
  return { url, message }
}
