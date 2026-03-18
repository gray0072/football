import { useGameStore } from '../store/gameStore'
import { TOTAL_TICKS } from '../engine/constants'

export function ScoreBoard() {
  const { scoreA, scoreB, tickCount, isRunning, goalFlashTimer, matchOver, toggleRunning, reset } = useGameStore()
  const min = Math.min(90, Math.floor(tickCount * 90 / TOTAL_TICKS))
  const timeStr = matchOver ? 'Full Time' : `${String(min).padStart(2, '0')}'`
  const flash = goalFlashTimer > 0

  return (
    <div style={{
      background: '#111827',
      padding: '10px 24px',
      display: 'flex',
      alignItems: 'center',
      gap: '12px',
      borderBottom: '1px solid #1e293b',
      userSelect: 'none',
      flexShrink: 0,
    }}>
      <div style={{ flex: 1, textAlign: 'right', fontSize: '13px', color: '#ef4444', fontWeight: 700, letterSpacing: 1 }}>
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

      <div style={{ flex: 1, textAlign: 'left', fontSize: '13px', color: '#3b82f6', fontWeight: 700, letterSpacing: 1 }}>
        TEAM B
      </div>

      <div style={{ fontSize: '14px', color: '#6b7280', minWidth: '72px', textAlign: 'center' }}>
        {timeStr}
      </div>

      <button
        onClick={toggleRunning}
        disabled={matchOver}
        style={{
          background: isRunning ? '#374151' : '#15803d',
          color: '#fff',
          border: 'none',
          borderRadius: '6px',
          padding: '6px 14px',
          cursor: matchOver ? 'default' : 'pointer',
          fontSize: '13px',
          opacity: matchOver ? 0.5 : 1,
        }}
      >
        {isRunning ? '⏸ Pause' : '▶ Play'}
      </button>

      <button
        onClick={reset}
        style={{
          background: '#374151',
          color: '#fff',
          border: 'none',
          borderRadius: '6px',
          padding: '6px 14px',
          cursor: 'pointer',
          fontSize: '13px',
        }}
      >
        ↺ Reset
      </button>
    </div>
  )
}
