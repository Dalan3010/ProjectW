import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { casesApi } from '../api/cases'
import { getToken } from '../api/client'
import { AppNavbar } from '../components/AppNavbar'
import { Footer } from '../components/Footer'
import { Icon } from '../components/Icon'
import { usePageMeta } from '../hooks/usePageMeta'
import { timeAgo } from '../lib/time'
import type { IdeaCase } from '../types/api'


interface NormalizedCase {
  id: string
  title: string
  summary: string
  messageCount: number
  updatedAt?: string
}

const SUMMARY_LENGTH = 150
const EMPTY_SUMMARY = 'Todavía no hay mensajes. Abrí este caso para empezar la conversación.'

const DEMO_CASES: NormalizedCase[] = [
  {
    id: 'demo-c1',
    title: 'Marketplace de artesanos locales',
    summary:
      'Conectar artesanos con compradores buscando productos únicos hechos a mano.',
    messageCount: 4,
    updatedAt: new Date(Date.now() - 3_600_000).toISOString(),
  },
  {
    id: 'demo-c2',
    title: 'App de reciclaje con recompensas',
    summary: 'Sistema de puntos por reciclar con incentivos y comercio local.',
    messageCount: 2,
    updatedAt: new Date(Date.now() - 7_200_000).toISOString(),
  },
]

function normalizeCase(item: IdeaCase): NormalizedCase {
  const rawSummary = (item.summary ?? '').trim()
  const summary =
    rawSummary.length > SUMMARY_LENGTH ? `${rawSummary.slice(0, SUMMARY_LENGTH)}…` : rawSummary

  return {
    id: item.id,
    title: item.title || 'Nueva conversación',
    summary: summary || EMPTY_SUMMARY,
    messageCount: item.messageCount ?? 0,
    updatedAt: item.updatedAt,
  }
}

function filterCases(all: NormalizedCase[], query: string): NormalizedCase[] {
  const normalizedQuery = query.trim().toLowerCase()
  if (!normalizedQuery) return all
  return all.filter(
    (item) =>
      item.title.toLowerCase().includes(normalizedQuery) ||
      item.summary.toLowerCase().includes(normalizedQuery),
  )
}

export function CasesPage() {
  usePageMeta('Mis casos — BID', 'Gestiona y revisa tus ideas de negocio en BID.')

  const [allCases, setAllCases] = useState<NormalizedCase[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [search, setSearch] = useState('')
  const [selectMode, setSelectMode] = useState(false)
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const confirmAcceptRef = useRef<HTMLButtonElement>(null)

  const load = useCallback(async () => {
    setLoading(true)
    setError('')
    if (getToken() === 'demo-token') {
      setAllCases(DEMO_CASES)
      setLoading(false)
      return DEMO_CASES
    }
    try {
      const response = await casesApi.list()
      const next = (response.data ?? []).map(normalizeCase)
      setAllCases(next)
      return next
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'No se pudieron cargar los casos.')
      return null
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    // Data fetching is the external system this effect synchronizes with.
    // oxlint-disable-next-line react/set-state-in-effect
    void load()
  }, [load])

  const visibleCases = useMemo(() => filterCases(allCases, search), [allCases, search])
  const allVisibleSelected =
    visibleCases.length > 0 && visibleCases.every((item) => selected.has(item.id))

  function updateSelectMode(next: boolean) {
    setSelectMode(next)
    if (!next) setSelected(new Set())
  }

  function toggleCard(id: string) {
    setSelected((current) => {
      const next = new Set(current)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  function toggleSelectAll() {
    setSelected((current) => {
      const next = new Set(current)
      if (allVisibleSelected) {
        visibleCases.forEach((item) => next.delete(item.id))
      } else {
        visibleCases.forEach((item) => next.add(item.id))
      }
      return next
    })
  }

  function openConfirm() {
    if (selected.size === 0) return
    setConfirmOpen(true)
    window.setTimeout(() => confirmAcceptRef.current?.focus(), 0)
  }

  function closeConfirm() {
    if (deleting) return
    setConfirmOpen(false)
  }

  useEffect(() => {
    if (!confirmOpen) return

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') closeConfirm()
    }

    document.addEventListener('keydown', onKeyDown)
    return () => document.removeEventListener('keydown', onKeyDown)
  })

  async function deleteSelected() {
    const ids = [...selected]
    if (ids.length === 0 || deleting) return

    setDeleting(true)
    try {
      await Promise.allSettled(ids.map((id) => casesApi.archive(id)))
      setSelected(new Set())
      setConfirmOpen(false)
      const next = await load()
      if (next && next.length === 0) updateSelectMode(false)
    } finally {
      setDeleting(false)
    }
  }

  const countLabel = `${visibleCases.length} caso${visibleCases.length === 1 ? '' : 's'} · Ordenados por actividad reciente`

  return (
    <>
      <AppNavbar active="casos" />

      <main>
        <div className="page">
          <div className="container">
            <div className="page-header">
              <div>
                <h1 className="page-title">Mis ideas de negocio</h1>
                <p className="page-subtitle">
                  <span>{countLabel}</span>
                </p>
              </div>
              <div className="page-actions">
                <button
                  type="button"
                  className={`btn btn-ghost${selectMode ? ' active' : ''}`}
                  aria-pressed={selectMode}
                  onClick={() => updateSelectMode(!selectMode)}
                >
                  {selectMode ? 'Cancelar' : 'Seleccionar'}
                </button>
                <Link to="/chat" className="btn btn-primary">
                  Nueva idea
                </Link>
              </div>
            </div>

            <div className="search-bar">
              <span className="search-icon">
                <Icon name="search" size={18} />
              </span>
              <input
                type="text"
                className="search-input"
                placeholder="Buscar por título o etiqueta..."
                value={search}
                onChange={(event) => setSearch(event.target.value)}
              />
              <button className="search-tune" aria-label="Filtros" type="button">
                <Icon name="tune" size={18} />
              </button>
            </div>

            {selectMode && (
              <div className="selection-bar">
                <span className="selection-count">
                  {selected.size === 1 ? '1 seleccionado' : `${selected.size} seleccionados`}
                </span>
                <div className="selection-actions">
                  <button type="button" className="btn btn-ghost btn-sm" onClick={toggleSelectAll}>
                    {allVisibleSelected ? 'Deseleccionar todo' : 'Seleccionar todo'}
                  </button>
                  <button
                    type="button"
                    className="btn btn-danger btn-sm"
                    onClick={openConfirm}
                    disabled={selected.size === 0 || deleting}
                  >
                    Eliminar
                  </button>
                </div>
              </div>
            )}

            <div className={`cases-grid${selectMode ? ' select-mode' : ''}`}>
              {loading ? (
                <div className="empty-state">
                  <p>Cargando casos…</p>
                </div>
              ) : error ? (
                <div className="empty-state">
                  <p>
                    <strong>No se pudieron cargar los casos</strong>
                  </p>
                  <p>{error}</p>
                </div>
              ) : allCases.length === 0 ? (
                <div className="empty-state">
                  <p>
                    <strong>Aún no tenés casos</strong>
                  </p>
                  <p>Creá tu primera conversación y convertí tu idea en una oportunidad.</p>
                  <Link to="/chat" className="btn btn-primary" style={{ marginTop: 16 }}>
                    Crear mi primer caso
                  </Link>
                </div>
              ) : visibleCases.length === 0 ? (
                <div className="empty-state">
                  <p>
                    <strong>No se encontraron casos</strong>
                  </p>
                  <p>Probá con otro término de búsqueda.</p>
                </div>
              ) : (
                visibleCases.map((item, index) => (
                  <Link
                    key={item.id}
                    to={`/chat?caso=${encodeURIComponent(item.id)}`}
                    className={`case-card stagger-item${selected.has(item.id) ? ' selected' : ''}`}
                    data-id={item.id}
                    style={{ animationDelay: `${index * 0.06}s` }}
                    onClick={(event) => {
                      if (!selectMode) return
                      event.preventDefault()
                      toggleCard(item.id)
                    }}
                  >
                    <span className="case-select" aria-hidden="true">
                      <Icon name="check" size={14} />
                    </span>
                    <div className="case-body">
                      <h3 className="case-title">{item.title}</h3>
                      <p className="case-summary">{item.summary}</p>
                    </div>
                    <div className="case-footer">
                      <span className="msg-count">
                        <Icon name="chat" size={14} /> {item.messageCount} mensaje
                        {item.messageCount === 1 ? '' : 's'}
                      </span>
                      <div className="footer-right">
                        <span className="time-ago">{timeAgo(item.updatedAt)}</span>
                      </div>
                    </div>
                  </Link>
                ))
              )}
            </div>
          </div>
        </div>
      </main>

      <Footer />

      {confirmOpen && (
        <div
          className="modal-overlay"
          onClick={(event) => {
            if (event.target === event.currentTarget) closeConfirm()
          }}
        >
          <div className="modal" role="dialog" aria-modal="true" aria-labelledby="confirm-title">
            <div className="modal-icon">
              <Icon name="trash" size={26} />
            </div>
            <h3 className="modal-title" id="confirm-title">
              Eliminar casos
            </h3>
            <p className="modal-text">
              {selected.size === 1
                ? '¿Seguro que querés eliminar este caso? Esta acción no se puede deshacer.'
                : `¿Seguro que querés eliminar estos ${selected.size} casos? Esta acción no se puede deshacer.`}
            </p>
            <div className="modal-actions">
              <button type="button" className="btn btn-ghost" onClick={closeConfirm}>
                Cancelar
              </button>
              <button
                type="button"
                className="btn btn-danger"
                ref={confirmAcceptRef}
                onClick={() => void deleteSelected()}
                disabled={deleting}
              >
                {deleting ? 'Eliminando…' : 'Eliminar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
