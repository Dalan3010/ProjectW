import { useId } from 'react'
import { Link } from 'react-router-dom'

interface BrandProps {
  size?: 'md' | 'lg'
  link?: boolean
}

export function Brand({ size = 'md', link = true }: BrandProps) {
  const gradientId = useId()
  const iconSize = size === 'lg' ? 44 : 30
  const content = (
    <>
      <svg
        className="logo-icon"
        width={iconSize}
        height={iconSize}
        viewBox="0 0 32 32"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
      >
        <defs>
          <linearGradient id={gradientId} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#7c3aed" />
            <stop offset="1" stopColor="#8b5cf6" />
          </linearGradient>
        </defs>
        <rect
          x="8"
          y="8"
          width="16"
          height="16"
          rx="4"
          transform="rotate(45 16 16)"
          fill={`url(#${gradientId})`}
        />
      </svg>
      <span className="logo-text">BID</span>
    </>
  )

  if (!link) {
    return <div className={size === 'lg' ? 'logo logo-lg' : 'logo'}>{content}</div>
  }

  return (
    <Link
      to="/"
      className={size === 'lg' ? 'logo logo-lg' : 'logo'}
      aria-label={size === 'lg' ? 'BID — volver al inicio' : 'BID — inicio'}
    >
      {content}
    </Link>
  )
}
