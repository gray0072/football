import { useGameStore } from '../store/gameStore'
import { TOTAL_TICKS } from '../engine/constants'

export function ScoreBoard() {
  const { scoreA, scoreB, tickCount, isRunning, goalFlashTimer, matchOver, toggleRunning, reset } = useGameStore()
  const min = Math.min(90, Math.floor(tickCount * 90 / TOTAL_TICKS))
  const timeStr = matchOver ? 'Full Time' : `${String(min).padStart(2, '0')}'`
  const flash = goalFlashTimer > 0

  const btnStyle = (active?: boolean): React.CSSProperties => ({
    background: active ? '#15803d' : '#374151',
    color: '#fff',
    border: 'none',
    borderRadius: '6px',
    padding: '6px 14px',
    cursor: 'pointer',
    fontSize: '13px',
  })

  return (
    <div style={{
      background: '#111827',
      padding: '10px 24px',
      display: 'flex',
      alignItems: 'center',
      borderBottom: '1px solid #1e293b',
      userSelect: 'none',
      flexShrink: 0,
      position: 'relative',
    }}>
      {/* Centered score block */}
      <div style={{
        position: 'absolute',
        left: '50%',
        transform: 'translateX(-50%)',
        display: 'flex',
        alignItems: 'center',
        gap: '16px',
      }}>
        <div style={{ fontSize: '13px', color: '#ef4444', fontWeight: 700, letterSpacing: 1 }}>
          TEAM A
        </div>

        <div style={{
          fontSize: '34px',
          fontWeight: 'bold',
          color: flash ? '#fbbf24' : '#f9fafb',
          minWidth: '130px',
          textAlign: 'center',
          letterSpacing: '10px',
          transition: 'color 0.15s',
        }}>
          {scoreA} : {scoreB}
        </div>

        <div style={{ fontSize: '13px', color: '#3b82f6', fontWeight: 700, letterSpacing: 1 }}>
          TEAM B
        </div>

        <div style={{ fontSize: '14px', color: '#6b7280', minWidth: '60px', textAlign: 'center' }}>
          {timeStr}
        </div>
      </div>

      {/* Right-side controls */}
      <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '8px' }}>
        <button
          onClick={toggleRunning}
          disabled={matchOver}
          style={{ ...btnStyle(!isRunning), opacity: matchOver ? 0.5 : 1, cursor: matchOver ? 'default' : 'pointer' }}
        >
          {isRunning ? '⏸ Pause' : '▶ Play'}
        </button>

        <button onClick={reset} style={btnStyle()}>
          ↺ Reset
        </button>

        <a
          href="https://github.com/gray0072/football"
          target="_blank"
          rel="noopener noreferrer"
          style={{ color: '#6b7280', display: 'flex', alignItems: 'center' }}
          title="View on GitHub"
        >
          <svg height="22" viewBox="0 0 16 16" width="22" fill="currentColor" aria-hidden="true">
            <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38
              0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13
              -.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66
              .07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15
              -.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27
              .68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12
              .51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48
              0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z"/>
          </svg>
        </a>
      </div>
    </div>
  )
}
