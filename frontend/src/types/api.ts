export interface AuthUser {
  id?: string
  name: string
  email: string
}

export interface AuthTokens {
  accessToken: string
  refreshToken?: string
}

export interface AuthResponse {
  user: AuthUser
  tokens: AuthTokens
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
  status?: string
}

export interface CaseListResponse {
  data?: IdeaCase[]
  pagination?: {
    page?: number
    pageSize?: number
    total?: number
  }
}

export interface BackendAnalysis {
  targetSegment?: string
  urgency?: number
  frequency?: number
  severity?: number
  willingnessToPlay?: number
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

export interface StartCaseResponse {
  caseId: string
  message: ChatMessage
}

export interface SendMessageResponse {
  message: ChatMessage
}

export interface RequestOptions {
  method?: 'GET' | 'POST' | 'PATCH' | 'PUT' | 'DELETE'
  body?: unknown
  params?: Record<string, string | number | boolean | null | undefined>
}
