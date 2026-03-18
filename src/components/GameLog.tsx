import { useRef, useEffect } from 'react'
import { useGameStore } from '../store/gameStore'

export function GameLog() {
  const log = useGameStore(s => s.log)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (ref.current) ref.current.scrollTop = 0
  }, [log.length])

  return (
    <div
      ref={ref}
      style={{
        height: '140px',
        overflowY: 'auto',
        background: '#0f172a',
        borderTop: '1px solid #1e293b',
        padding: '6px 16px',
        fontSize: '13px',
        lineHeight: '1.8',
        flexShrink: 0,
      }}
    >
      {log.map(entry => (
        <div key={entry.id} style={{ display: 'flex', gap: '10px', color: '#cbd5e1' }}>
          <span style={{ color: '#475569', minWidth: '30px', flexShrink: 0 }}>{entry.time}</span>
          <span>{entry.text}</span>
        </div>
      ))}
    </div>
  )
}
