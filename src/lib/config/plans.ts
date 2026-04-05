export interface PlanFeature {
  label: string
  included: boolean
}

export interface PlanConfig {
  name: string
  description: string
  price: string | null
  period: string | null
  cta: string
  ctaHref: string
  highlighted: boolean
  features: PlanFeature[]
}

export const PLAN_CONFIGS: PlanConfig[] = [
  {
    name: 'Free',
    description: 'Para quem está começando',
    price: null,
    period: null,
    cta: 'Começar grátis',
    ctaHref: '/login',
    highlighted: false,
    features: [
      { label: 'Até 30 leads salvos', included: true },
      { label: 'Busca no Google Maps', included: true },
      { label: 'Score automático', included: true },
      { label: 'Pipeline Kanban', included: true },
      { label: 'Abordagem via WhatsApp', included: false },
      { label: 'Suporte prioritário', included: false },
    ],
  },
  {
    name: 'Pro',
    description: 'Para freelancers que prospectam de verdade',
    price: 'R$49',
    period: '/mês',
    cta: 'Assinar agora',
    ctaHref: '/login?plan=pro',
    highlighted: true,
    features: [
      { label: 'Leads ilimitados', included: true },
      { label: 'Busca no Google Maps', included: true },
      { label: 'Score automático', included: true },
      { label: 'Pipeline Kanban completo', included: true },
      { label: 'Automação via WhatsApp', included: true },
      { label: 'Suporte prioritário', included: true },
    ],
  },
]

export const PRO_PLAN_CONFIG = PLAN_CONFIGS.find(plan => plan.highlighted)!
