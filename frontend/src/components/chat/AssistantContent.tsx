import { Icon } from '../Icon'
import { Markdown } from './Markdown'
import type { BackendAnalysis, BackendIdea, ChatMessage } from '../../types/api'

interface AssessmentData {
  urgency?: number
  frequency?: number
  severity?: number
  willingnessToPay?: number
  targetSegment?: string
  risks: string[]
  overallScore?: number
}

interface IdeaData {
  title: string
  desc: string
  revenue: string
  difficulty: 'low' | 'medium' | 'high'
  time: 'weeks' | 'months' | 'quarters'
  score: number
  tags: string[]
}

function assessmentFromMeta(analysis: BackendAnalysis): AssessmentData {
  return {
    urgency: analysis.urgency,
    frequency: analysis.frequency,
    severity: analysis.severity,
    willingnessToPay: analysis.willingnessToPay,
    targetSegment: analysis.targetSegment,
    risks: analysis.mainRisks ?? [],
    overallScore: analysis.overallScore,
  }
}

function ideaFromMeta(idea: BackendIdea, index: number): IdeaData {
  return {
    title: idea.title || `Idea ${index + 1}`,
    desc: idea.description ?? '',
    revenue: idea.revenueModel ?? '',
    difficulty: idea.entryDifficulty ?? 'medium',
    time: idea.implementationSpeed ?? 'months',
    score: idea.potentialScore ?? 0,
    tags: idea.tags ?? [],
  }
}

function AssessmentCard({ data }: { data: AssessmentData }) {
  const scoreBars = [
    { label: 'Urgencia', value: data.urgency ?? 0 },
    { label: 'Frecuencia', value: data.frequency ?? 0 },
    { label: 'Severidad', value: data.severity ?? 0 },
    { label: 'Disposición a pagar', value: data.willingnessToPay ?? 0 },
  ]

  return (
    <div className="rich-card">
      <div className="assess-head">
        <h4>Evaluación de Oportunidad</h4>
        <span className="chip-viab chip-high">Viabilidad: Alta</span>
      </div>
      <p className="seg-label">Segmento objetivo</p>
      <p className="seg-value">{data.targetSegment}</p>
      {scoreBars.map((bar) => (
        <div className="score-bar" key={bar.label}>
          <div className="score-top">
            <span>{bar.label}</span>
            <b>{bar.value}/5</b>
          </div>
          <div className="score-track">
            <div className="score-fill" style={{ width: `${(bar.value / 5) * 100}%` }} />
          </div>
        </div>
      ))}
      <p className="risks-label">Principales riesgos</p>
      <div className="risks-row">
        {data.risks.map((risk) => (
          <span className="risk-chip" key={risk}>
            {risk}
          </span>
        ))}
      </div>
      <div className="score-footer">
        <Icon name="insights" size={16} /> Score general: <strong>{data.overallScore}/100</strong>
      </div>
    </div>
  )
}

const DIFFICULTY_COLORS = {
  low: 'chip-low',
  medium: 'chip-medium',
  high: 'chip-high',
} as const

const DIFFICULTY_LABELS = {
  low: 'Baja',
  medium: 'Media',
  high: 'Alta',
} as const

const TIME_LABELS = {
  weeks: 'semanas',
  months: 'meses',
  quarters: 'trimestres',
} as const

function IdeaCard({ idea, index }: { idea: IdeaData; index: number }) {
  const isTop = index === 0

  return (
    <div className={`idea-card${isTop ? ' top' : ''}`}>
      {isTop && <span className="top-badge">Mayor potencial</span>}
      <div className="idea-head" style={isTop ? { paddingRight: 90 } : undefined}>
        <div className="idea-rank">{index + 1}</div>
        <h5>{idea.title}</h5>
      </div>
      <p className="idea-desc">{idea.desc}</p>
      <div className="rev-row">
        <Icon name="payments" size={14} className="icon-success" /> <span>{idea.revenue}</span>
      </div>
      <div className="idea-chips">
        <span className={`chip-viab ${DIFFICULTY_COLORS[idea.difficulty]}`}>
          Dificultad: {DIFFICULTY_LABELS[idea.difficulty]}
        </span>
        <span className="chip chip-outline">Tiempo: {TIME_LABELS[idea.time]}</span>
        <span className="chip chip-accent">Score: {idea.score}</span>
      </div>
      <div className="idea-tags">
        {idea.tags.map((tag) => (
          <span key={tag}>#{tag}</span>
        ))}
      </div>
    </div>
  )
}

function NextSteps({ steps }: { steps: string[] }) {
  return (
    <div className="next-card">
      <div className="next-head">
        <Icon name="flag" size={18} className="icon-warning" />{' '}
        <h4>Próximos pasos recomendados</h4>
      </div>
      {steps.map((step, index) => (
        <div className="next-step" key={`${index}-${step}`}>
          <div className="step-num">{index + 1}</div>
          <p>{step}</p>
        </div>
      ))}
    </div>
  )
}

export function AssistantContent({ message }: { message: ChatMessage }) {
  const meta = message.metadata

  return (
    <>
      <Markdown text={message.content} />
      {meta?.type === 'analysis' && (
        <>
          {meta.analysis && <AssessmentCard data={assessmentFromMeta(meta.analysis)} />}
          {meta.ideas && meta.ideas.length > 0 && (
            <>
              <p className="ideas-label">Ideas de negocio propuestas</p>
              {meta.ideas.map((rawIdea, index) => (
                <IdeaCard
                  key={`${index}-${rawIdea.title ?? 'idea'}`}
                  idea={ideaFromMeta(rawIdea, index)}
                  index={index}
                />
              ))}
            </>
          )}
          {meta.nextSteps && meta.nextSteps.length > 0 && <NextSteps steps={meta.nextSteps} />}
          {meta.confidence !== undefined && (
            <div className="conf-foot">
              <Icon name="verified" size={14} /> Confianza del análisis:{' '}
              <strong>{meta.confidence}%</strong>
            </div>
          )}
        </>
      )}
    </>
  )
}
