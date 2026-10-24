import type {
  AnalysisMetadata,
  BackendAnalysis,
  BackendIdea,
  ChatMessage,
  SendMessageResponse,
  StartCaseResponse,
  WireChatListResponse,
  WireChatMessage,
  WireSendMessageResponse,
} from '../types/api'
import { casesApi } from './cases'
import { request } from './client'

const TITLE_MAX_LENGTH = 60
const TITLE_FALLBACK = 'Nuevo caso'
const DESCRIPTION_MAX_LENGTH = 1000
const DESCRIPTION_MIN_LENGTH = 10
const DESCRIPTION_SUFFIX = ' — caso creado desde el chat'

function mapMetadata(raw: WireChatMessage['metadata']): AnalysisMetadata | undefined {
  if (raw === null || typeof raw !== 'object') return undefined

  return {
    type: 'analysis',
    analysis: (raw.analysis as BackendAnalysis | undefined) ?? undefined,
    ideas: (raw.ideas as BackendIdea[] | undefined) ?? undefined,
    nextSteps: (raw.nextSteps as string[] | undefined) ?? undefined,
    // El contrato envía confidence como fracción 0..1; la UI lo muestra en 0..100.
    confidence: typeof raw.confidence === 'number' ? Math.round(raw.confidence * 100) : undefined,
  }
}

function mapChatMessage(wire: WireChatMessage): ChatMessage {
  return {
    id: wire.id,
    role: wire.role,
    content: wire.content,
    timestamp: wire.created_at,
    metadata: mapMetadata(wire.metadata),
  }
}

async function getMessages(
  caseId: string,
  limit = 50,
  offset = 0,
): Promise<ChatMessage[]> {
  const wire = await request<WireChatListResponse>(`/cases/${caseId}/messages`, {
    params: { limit, offset },
  })
  return (wire.data ?? []).map(mapChatMessage)
}

async function sendMessage(payload: {
  caseId: string
  content: string
}): Promise<SendMessageResponse> {
  const wire = await request<WireSendMessageResponse>(
    `/cases/${payload.caseId}/messages`,
    { method: 'POST', body: { content: payload.content } },
  )
  return {
    userMessage: mapChatMessage(wire.user_message),
    assistantMessage: mapChatMessage(wire.assistant_message),
  }
}

function deriveTitle(message: string): string {
  const firstLine = message
    .split('\n')
    .map((line) => line.trim())
    .find((line) => line.length > 0)

  const candidate = (firstLine ?? '').slice(0, TITLE_MAX_LENGTH).trim()
  return candidate.length >= 3 ? candidate : TITLE_FALLBACK
}

function deriveDescription(message: string): string {
  const base = message.trim().slice(0, DESCRIPTION_MAX_LENGTH)
  if (base.length >= DESCRIPTION_MIN_LENGTH) return base
  return `${base}${DESCRIPTION_SUFFIX}`.trim()
}

async function startCase(initialMessage: string): Promise<StartCaseResponse> {
  // There is no /chat/start endpoint: a case is created first and the first
  // message is sent through the regular chat endpoint.
  const ideaCase = await casesApi.create({
    title: deriveTitle(initialMessage),
    description: deriveDescription(initialMessage),
  })
  const { userMessage, assistantMessage } = await sendMessage({
    caseId: ideaCase.id,
    content: initialMessage,
  })
  return { caseId: ideaCase.id, messages: [userMessage, assistantMessage] }
}

export const chatApi = {
  getMessages,
  sendMessage,
  startCase,
}
