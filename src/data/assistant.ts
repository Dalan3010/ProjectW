import type { IconName } from '../components/Icon'

export interface PromptCard {
  icon: IconName
  title: string
  desc: string
}

// Welcome prompt cards for the chat empty state.
export const PROMPTS: PromptCard[] = [
  {
    icon: 'search',
    title: 'Explorar un problema',
    desc: 'Tengo una molestia o ineficiencia que quiero convertir en oportunidad',
  },
  {
    icon: 'lightbulb',
    title: 'Validar una idea',
    desc: 'Tengo una idea de negocio y quiero saber si realmente tiene mercado',
  },
  {
    icon: 'trending_up',
    title: 'Analizar una tendencia',
    desc: 'Vi una tendencia emergente y quiero saber cómo monetizarla',
  },
  {
    icon: 'group',
    title: 'Entender un segmento',
    desc: 'Conozco un grupo de personas con un dolor específico y no sé cómo servirles',
  },
]
