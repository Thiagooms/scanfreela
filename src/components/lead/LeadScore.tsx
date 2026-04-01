'use client'

interface LeadScoreProps {
  score: number
  isHotLead: boolean
}

const SCORE_LABELS: Record<number, string> = {
  0: 'Frio',
  1: 'Baixo',
  2: 'Médio',
  3: 'Alto',
}

const SCORE_COLORS: Record<number, string> = {
  0: 'bg-gray-100 text-gray-500',
  1: 'bg-yellow-100 text-yellow-700',
  2: 'bg-orange-100 text-orange-700',
  3: 'bg-green-100 text-green-700',
}

export function LeadScore({ score, isHotLead }: LeadScoreProps) {
  return (
    <div className="flex items-center gap-2">
      <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${SCORE_COLORS[score]}`}>
        {SCORE_LABELS[score]}
      </span>
      {isHotLead && (
        <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-red-100 text-red-700">
          Lead quente
        </span>
      )}
    </div>
  )
}
