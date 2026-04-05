'use client'

import { Lead, LeadStatus } from '@/lib/types/lead'
import { buildWhatsAppLink } from '@/lib/whatsapp/template'

interface WhatsAppButtonProps {
  lead: Lead
  userService?: string
  onMove: (leadId: string, status: LeadStatus) => void
}

export function WhatsAppButton({ lead, userService, onMove }: WhatsAppButtonProps) {
  if (!lead.phone) return null

  function handleClick() {
    const { url } = buildWhatsAppLink({
      leadName: lead.name,
      leadPhone: lead.phone!,
      userService,
    })

    window.open(url, '_blank', 'noopener,noreferrer')

    if (lead.status === 'new') {
      onMove(lead.id, 'approached')
    }
  }

  return (
    <button
      onClick={handleClick}
      title="Abordar via WhatsApp"
      className="flex items-center gap-1.5 w-full text-xs py-1 px-2 rounded bg-green-50 text-green-700 hover:bg-green-100 transition-colors"
    >
      <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/>
        <path d="M12 0C5.373 0 0 5.373 0 12c0 2.123.554 4.116 1.524 5.84L.057 23.428a.5.5 0 0 0 .515.572l5.773-1.516A11.95 11.95 0 0 0 12 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 22c-1.87 0-3.628-.51-5.142-1.4l-.368-.214-3.818 1.004 1.022-3.726-.235-.381A9.96 9.96 0 0 1 2 12C2 6.477 6.477 2 12 2s10 4.477 10 10-4.477 10-10 10z"/>
      </svg>
      WhatsApp
    </button>
  )
}
