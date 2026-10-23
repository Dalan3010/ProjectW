import { useEffect, useRef, useState, type KeyboardEvent } from 'react'
import { useSearchParams } from 'react-router-dom'
import { chatApi } from '../api/chat'
import { AppNavbar } from '../components/AppNavbar'
import { Icon } from '../components/Icon'
import { AssistantContent } from '../components/chat/AssistantContent'
import { PROMPTS } from '../data/assistant'
import { usePageMeta } from '../hooks/usePageMeta'
import { formatTime } from '../lib/time'
import type { ChatMessage } from '../types/api'

function WelcomeLogo() {
  return (
    <svg
      width="44"
      height="44"
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <defs>
        <linearGradient id="welcome-logo-grad" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#8b5cf6" />
          <stop offset="1" stopColor="#a78bfa" />
        </linearGradient>
      </defs>
      <rect
        x="8"
        y="8"
        width="16"
        height="16"
        rx="4"
        transform="rotate(45 16 16)"
        fill="url(#welcome-logo-grad)"
      />
    </svg>
  )
}

function TypingIndicator() {
  return (
    <div className="msg-row bot typing-row">
      <div className="bot-avatar">
        <Icon name="smart_toy" size={18} />
      </div>
      <div className="msg-body">
        <div className="typing-bubble">
          <span className="dot" />
          <span className="dot" />
          <span className="dot" />
        </div>
      </div>
    </div>
  )
}

function UserMessage({ message }: { message: ChatMessage }) {
  return (
    <div className="msg-row user msg-appear">
      <div className="msg-body">
        <div className="msg-bubble">
          <p className="md-line">{message.content}</p>
        </div>
        <div className="msg-time">{formatTime(message.timestamp)}</div>
      </div>
    </div>
  )
}

function BotMessage({ message }: { message: ChatMessage }) {
  return (
    <div className="msg-row bot msg-appear">
      <div className="bot-avatar">
        <Icon name="smart_toy" size={18} />
      </div>
      <div className="msg-body">
        <div className="msg-bubble">
          <AssistantContent message={message} />
        </div>
        {message.timestamp && <div className="msg-time">{formatTime(message.timestamp)}</div>}
      </div>
    </div>
  )
}

export function ChatPage() {
  usePageMeta('Chat — BID', 'Conversa con BID para validar tu idea de negocio.')

  const [searchParams] = useSearchParams()
  const casoId = searchParams.get('caso')

  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [activeCaseId, setActiveCaseId] = useState<string | null>(null)
  const [input, setInput] = useState('')
  const [processing, setProcessing] = useState(false)
  const [loadingCase, setLoadingCase] = useState(false)

  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const bottomRef = useRef<HTMLDivElement>(null)

  // Load history when the ?caso= query changes (or reset for a new chat).
  useEffect(() => {
    let cancelled = false
    // Reset local state when the route query changes to another conversation.
    // oxlint-disable-next-line react/set-state-in-effect
    setMessages([])

    if (!casoId) {
      setActiveCaseId(null)
      setLoadingCase(false)
      return
    }

    setActiveCaseId(casoId)
    setLoadingCase(true)

    chatApi
      .getMessages(casoId)
      .then((history) => {
        if (!cancelled) setMessages(history ?? [])
      })
      .catch((cause: unknown) => {
        if (cancelled) return
        const detail = cause instanceof Error ? cause.message : 'Error desconocido'
        setMessages([{ role: 'assistant', content: `No se pudo cargar el caso: ${detail}` }])
      })
      .finally(() => {
        if (!cancelled) setLoadingCase(false)
      })

    return () => {
      cancelled = true
    }
  }, [casoId])

  // Auto-grow the textarea up to 200px.
  useEffect(() => {
    const textarea = textareaRef.current
    if (!textarea) return
    textarea.style.height = 'auto'
    textarea.style.height = `${Math.min(textarea.scrollHeight, 200)}px`
  }, [input])

  // Keep the latest message in view.
  useEffect(() => {
    const timer = window.setTimeout(() => {
      bottomRef.current?.scrollIntoView?.({ behavior: 'smooth', block: 'end' })
    }, 50)
    return () => window.clearTimeout(timer)
  }, [messages, processing, loadingCase])

  async function processMessage(text: string) {
    const content = text.trim()
    if (!content || processing) return

    setProcessing(true)
    setMessages((current) => [
      ...current,
      { role: 'user', content, timestamp: new Date().toISOString() },
    ])

    try {
      if (!activeCaseId) {
        const response = await chatApi.startCase(content)
        setActiveCaseId(response.caseId)
        setMessages((current) => [...current, response.message])
      } else {
        const response = await chatApi.sendMessage({ caseId: activeCaseId, content })
        setMessages((current) => [...current, response.message])
      }
    } catch (cause) {
      const detail = cause instanceof Error ? cause.message : 'Error desconocido'
      setMessages((current) => [
        ...current,
        { role: 'assistant', content: `No se pudo enviar el mensaje: ${detail}` },
      ])
    } finally {
      setProcessing(false)
    }
  }

  function handleSend() {
    if (processing) return
    const text = input
    setInput('')
    void processMessage(text)
  }

  function handleKeyDown(event: KeyboardEvent<HTMLTextAreaElement>) {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault()
      handleSend()
    }
  }

  function sendPrompt(title: string) {
    if (processing) return
    void processMessage(title)
  }

  const showWelcome = !casoId && messages.length === 0 && !processing
  const canSend = input.trim().length > 0 && !processing

  return (
    <>
      <AppNavbar active="chat" />

      <main className="chat-screen">
        <div className="chat-messages">
          {showWelcome && (
            <div className="welcome-screen">
              <div className="welcome-logo">
                <WelcomeLogo />
              </div>
              <h2 className="welcome-title">¿Qué problema quieres resolver hoy?</h2>
              <p className="welcome-sub">
                Describe tu idea o elige un punto de partida para comenzar a validar tu
                oportunidad de negocio.
              </p>
              <div className="prompt-grid">
                {PROMPTS.map((prompt) => (
                  <button
                    type="button"
                    className="prompt-card"
                    key={prompt.title}
                    onClick={() => sendPrompt(prompt.title)}
                  >
                    <div className="prompt-icon">
                      <Icon name={prompt.icon} size={22} />
                    </div>
                    <p className="prompt-title">{prompt.title}</p>
                    <p className="prompt-desc">{prompt.desc}</p>
                  </button>
                ))}
              </div>
              <p className="welcome-hint">
                O escribe directamente tu idea en el campo de texto de abajo
              </p>
            </div>
          )}

          <div className="chat-column">
            {messages.map((message, index) =>
              message.role === 'user' ? (
                <UserMessage key={message.id ?? `user-${index}`} message={message} />
              ) : (
                <BotMessage key={message.id ?? `bot-${index}`} message={message} />
              ),
            )}
            {(processing || loadingCase) && <TypingIndicator />}
          </div>

          <div ref={bottomRef} />
        </div>

        <div className="chat-input-wrap">
          <div className="chat-input-inner">
            <div className={`chat-input-box${input.trim() ? ' filled' : ''}`}>
              <textarea
                ref={textareaRef}
                className="chat-textarea"
                placeholder="Describe tu idea de negocio..."
                rows={1}
                value={input}
                onChange={(event) => setInput(event.target.value)}
                onKeyDown={handleKeyDown}
              />
              <button
                type="button"
                className={`send-btn${canSend ? ' active' : ''}`}
                aria-label="Enviar"
                disabled={!canSend}
                onClick={handleSend}
              >
                <Icon name={processing ? 'autorenew' : 'send'} size={16} />
              </button>
            </div>
            <p className="chat-legal">
              BID puede cometer errores. Verifica las recomendaciones antes de tomar decisiones
              importantes.
            </p>
          </div>
        </div>
      </main>
    </>
  )
}
