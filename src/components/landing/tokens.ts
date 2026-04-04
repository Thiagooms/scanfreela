export const colors = {
  text: {
    primary: '#0A0A0A',
    secondary: 'rgba(0,0,0,0.60)',
    muted: 'rgba(0,0,0,0.45)',
    timestamp: 'rgba(0,0,0,0.32)',
  },
  border: 'rgba(0,0,0,0.08)',
  brand: '#0081F6',
  brandAlt: '#238CF3',
} as const

export const EASE = [0.22, 1, 0.36, 1] as const

export const PILL_STYLE: React.CSSProperties = {
  backgroundColor: 'rgb(255, 255, 255)',
  border: '1px solid rgb(230, 230, 230)',
  borderRadius: '40px',
  boxShadow: 'rgba(0, 0, 0, 0.1) 0px 4px 12px 0px',
}

export const CONTAINER = 'max-w-[1400px] w-full mx-auto px-[clamp(1rem,4vw,2rem)]'
export const CONTAINER_NAV = 'max-w-[1150px] w-full mx-auto px-[clamp(1rem,4vw,2rem)]'
