import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it, vi } from 'vitest'
import { AuthProvider } from '../context/AuthProvider'
import { LandingPage } from './LandingPage'

vi.mock('animejs', () => ({
  animate: vi.fn(() => ({ revert: vi.fn() })),
}))

function renderLanding() {
  return render(
    <MemoryRouter>
      <AuthProvider>
        <LandingPage />
      </AuthProvider>
    </MemoryRouter>,
  )
}

describe('LandingPage', () => {
  it('renders the hero and sections', () => {
    renderLanding()

    expect(screen.getByRole('heading', { name: /De la idea al negocio/ })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: '¿Cómo funciona?' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: '¿Por qué BID?' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: '¿Tienes una idea?' })).toBeInTheDocument()
  })

  it('renders the zodiac background with constellations and lone stars', () => {
    const { container } = renderLanding()

    expect(container.querySelector('.zodiac-background')).toBeInTheDocument()
    expect(container.querySelectorAll('.constellation')).toHaveLength(12)
    expect(container.querySelectorAll('.lone-star')).toHaveLength(6)
  })

  it('writes pointer parallax CSS variables on pointer move', () => {
    vi.spyOn(window, 'requestAnimationFrame').mockImplementation((cb) => {
      cb(0)
      return 1
    })

    const { container } = renderLanding()
    const background = container.querySelector('.zodiac-background') as HTMLElement

    window.dispatchEvent(new MouseEvent('pointermove', { clientX: 1000, clientY: 600 }))

    expect(background.style.getPropertyValue('--pointer-x')).not.toBe('')
    expect(background.style.getPropertyValue('--pointer-y')).not.toBe('')
  })
})
