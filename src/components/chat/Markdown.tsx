import type { ReactNode } from 'react'

function inlineBold(text: string): ReactNode[] {
  const parts = text.split(/\*\*(.+?)\*\*/g)
  return parts.map((part, index) =>
    index % 2 === 1 ? <strong key={index}>{part}</strong> : part,
  )
}

// Renders the small markdown subset used by assistant messages without
// dangerouslySetInnerHTML, so backend content can never inject markup.
export function Markdown({ text }: { text: string }) {
  return (
    <>
      {text.split('\n').map((line, index) => {
        if (line.trim() === '') {
          return <div className="md-spacer" key={index} />
        }
        if (line.startsWith('# ')) {
          return (
            <p className="md-h" key={index}>
              {inlineBold(line.slice(2))}
            </p>
          )
        }
        if (line.startsWith('## ')) {
          return (
            <p className="md-sub" key={index}>
              {inlineBold(line.slice(3))}
            </p>
          )
        }
        if (line.startsWith('- ')) {
          return (
            <div className="md-bullet" key={index}>
              <span className="dot">•</span>
              <p>{inlineBold(line.slice(2))}</p>
            </div>
          )
        }
        if (/^\*\*[^*]+\*\*$/.test(line.trim())) {
          return (
            <p className="md-bold" key={index}>
              {inlineBold(line.trim())}
            </p>
          )
        }
        return (
          <p className="md-line" key={index}>
            {inlineBold(line)}
          </p>
        )
      })}
    </>
  )
}
