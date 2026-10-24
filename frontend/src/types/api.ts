// Wire types mirror the FastAPI payloads exactly (snake_case).
// Domain types are the camelCase shapes React components consume.
// The translation between both lives only in the mappers under src/api/*.

export interface WireUser {
  id: string
  full_name: string
  email: string
  role: string
  is_active: boolean
  created_at: string
}

export interface WireTokenResponse {
  access_token: string
  token_type: string
  user: WireUser
}

export type IdeaCaseStatus = 'new' | 'in_progress' | 'validated' | 'rejected'

export interface WireIdeaCase {
  id: string
  owner_id: string
  title: string
  description: string
  category: string | null
  status: IdeaCaseStatus
  created_at: string
  updated_at: string
  metadata: Record<string, unknown> | null
}

export interface WireCaseListResponse {
  data: WireIdeaCase[]
  total: number
  limit: number
  offset: number
}

export interface WireChatMessage {
  id: string
  case_id: string
  role: 'user' | 'assistant'
  content: string
  metadata: Record<string, unknown> | null
  created_at: string
}

export interface WireChatListResponse {
  data: WireChatMessage[]
  total: number
  limit: number
  offset: number
}

export interface WireSendMessageResponse {
  user_message: WireChatMessage
  assistant_message: WireChatMessage
}

// Domain types.

export interface AuthUser {
  id?: string
  name: string
  email: string
}

export interface AuthSession {
  accessToken: string
  user: AuthUser
}

export interface Session {
  name: string
  email: string
  accessToken: string
  loginAt: string
}

export interface IdeaCase {
  id: string
  title?: string
  summary?: string
  messageCount?: number
  updatedAt?: string
  status?: IdeaCaseStatus
}

export interface CreateCaseInput {
  title: string
  description: string
  category?: string | null
  metadata?: Record<string, unknown> | null
}

export interface UpdateCaseInput {
  title?: string
  description?: string
  category?: string | null
  status?: IdeaCaseStatus
  metadata?: Record<string, unknown> | null
}

export interface CaseListResponse {
  data: IdeaCase[]
  total: number
  limit: number
  offset: number
}

export interface BackendAnalysis {
  targetSegment?: string
  urgency?: number
  frequency?: number
  severity?: number
  willingnessToPay?: number
  mainRisks?: string[]
  overallScore?: number
}

export interface BackendIdea {
  title?: string
  description?: string
  revenueModel?: string
  entryDifficulty?: 'low' | 'medium' | 'high'
  implementationSpeed?: 'weeks' | 'months' | 'quarters'
  potentialScore?: number
  tags?: string[]
}

export interface AnalysisMetadata {
  type: 'analysis'
  analysis?: BackendAnalysis
  ideas?: BackendIdea[]
  nextSteps?: string[]
  confidence?: number
}

export interface ChatMessage {
  id?: string
  role: 'user' | 'assistant' | 'bot'
  content: string
  timestamp?: string
  metadata?: AnalysisMetadata
}

export interface ChatMessageListResponse {
  data: ChatMessage[]
  total: number
  limit: number
  offset: number
}

export interface SendMessageResponse {
  userMessage: ChatMessage
  assistantMessage: ChatMessage
}

export interface StartCaseResponse {
  caseId: string
  messages: ChatMessage[]
}

export interface RequestOptions {
  method?: 'GET' | 'POST' | 'PATCH' | 'PUT' | 'DELETE'
  body?: unknown
  params?: Record<string, string | number | boolean | null | undefined>
}
