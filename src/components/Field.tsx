import { useGameStore } from '../store/gameStore'
import { FIELD } from '../engine/constants'
import { Player, Team } from '../types/game'

const COLORS: Record<Team, string> = { A: '#ef4444', B: '#3b82f6' }

// Stable per-player phase offset so players don't all stride in sync
function idPhase(id: string): number {
  return id.split('').reduce((n, c) => n + c.charCodeAt(0), 0) * 0.7
}

// ── Stick figure ─────────────────────────────────────────────────────────────
// (cx, cy) is the torso centre.  dir = +1 faces right, -1 faces left.
function StickFigure({ p, tick }: { p: Player; tick: number }) {
  const { x: cx, y: cy, team, role } = p
  const dir   = team === 'A' ? 1 : -1
  const color = COLORS[team]

  const phase = tick * 0.28 + idPhase(p.id)
  const swing = Math.sin(phase) * 5   // leg oscillation ±5 px

  // Anatomical anchor points
  const headY   = cy - 14
  const neckY   = cy - 9
  const shldrY  = cy - 6
  const hipY    = cy + 3
  const footY   = hipY + 11

  // Legs: front leg leads in movement direction, back leg trails
  const legFx = cx + dir * swing
  const legBx = cx - dir * swing * 0.7

  // Arms swing opposite to legs (natural running gait)
  const armFx = cx - dir * swing * 0.65 + dir * 4
  const armBx = cx + dir * swing * 0.65 - dir * 4
  const armY  = shldrY + 7

  const ln = { strokeLinecap: 'round' as const, fill: 'none' }

  return (
    <g>
      {/* Head — GK gets a gold ring */}
      {role === 'goalkeeper' && (
        <circle cx={cx} cy={headY} r={7} fill="none" stroke="#fbbf24" strokeWidth={1.5} />
      )}
      <circle cx={cx} cy={headY} r={5} fill={color} />

      {/* Body */}
      <line x1={cx} y1={neckY} x2={cx} y2={hipY}
        stroke={color} strokeWidth={2} {...ln} />

      {/* Arms */}
      <line x1={cx} y1={shldrY} x2={armFx} y2={armY}
        stroke={color} strokeWidth={1.8} {...ln} />
      <line x1={cx} y1={shldrY} x2={armBx} y2={armY}
        stroke={color} strokeWidth={1.8} {...ln} />

      {/* Legs */}
      <line x1={cx} y1={hipY} x2={legFx} y2={footY}
        stroke={color} strokeWidth={2.2} {...ln} />
      <line x1={cx} y1={hipY} x2={legBx} y2={footY}
        stroke={color} strokeWidth={2.2} {...ln} />
    </g>
  )
}

// Front foot position — used to place the ball during dribbling
function frontFootPos(p: Player, tick: number): { x: number; y: number } {
  const dir   = p.team === 'A' ? 1 : -1
  const phase = tick * 0.28 + idPhase(p.id)
  const swing = Math.sin(phase) * 5
  // "Front" foot is always the one ahead in the movement direction
  const frontX = p.x + dir * Math.abs(swing)
  return {
    x: frontX + dir * 6,   // a touch further forward from the foot
    y: p.y + 3 + 11,        // foot level  (hipY + footOffset)
  }
}

// ── Field ─────────────────────────────────────────────────────────────────────
export function Field() {
  const players   = useGameStore(s => s.players)
  const ball      = useGameStore(s => s.ball)
  const tickCount = useGameStore(s => s.tickCount)

  const { W, H, LEFT: fl, RIGHT: fr, TOP: ft, BOTTOM: fb, GOAL_Y1: gy1, GOAL_Y2: gy2 } = FIELD
  const pw = fr - fl
  const ph = fb - ft
  const cx = fl + pw / 2
  const cy = ft + ph / 2

  // Visual ball position: at front foot when dribbling, in-flight otherwise
  const ballPos = (() => {
    if (ball.inFlight || !ball.ownerId) return { x: ball.x, y: ball.y }
    const owner = players.find(p => p.id === ball.ownerId)
    if (!owner) return { x: ball.x, y: ball.y }
    return frontFootPos(owner, tickCount)
  })()

  return (
    <div style={{ flex: 1, overflow: 'hidden', minHeight: 0 }}>
      <svg
        viewBox={`0 0 ${W} ${H}`}
        style={{ width: '100%', height: '100%' }}
        preserveAspectRatio="xMidYMid meet"
      >
        {/* Dark surround */}
        <rect width={W} height={H} fill="#111827" />

        {/* Pitch */}
        <rect x={fl} y={ft} width={pw} height={ph} fill="#166534" />
        {Array.from({ length: 9 }).map((_, i) => (
          <rect key={i}
            x={fl + i * (pw / 9)} y={ft} width={pw / 9} height={ph}
            fill={i % 2 === 0 ? '#166534' : '#15803d'}
          />
        ))}
        <rect x={fl} y={ft} width={pw} height={ph}
          fill="none" stroke="rgba(255,255,255,0.55)" strokeWidth={2.5} />

        {/* Center line + circle */}
        <line x1={cx} y1={ft} x2={cx} y2={fb}
          stroke="rgba(255,255,255,0.45)" strokeWidth={1.5} />
        <circle cx={cx} cy={cy} r={72}
          fill="none" stroke="rgba(255,255,255,0.45)" strokeWidth={1.5} />
        <circle cx={cx} cy={cy} r={4} fill="rgba(255,255,255,0.6)" />

        {/* Penalty areas */}
        <rect x={fl}       y={cy - 115} width={125} height={230}
          fill="none" stroke="rgba(255,255,255,0.35)" strokeWidth={1.5} />
        <rect x={fl}       y={cy - 52}  width={50}  height={104}
          fill="none" stroke="rgba(255,255,255,0.3)"  strokeWidth={1} />
        <circle cx={fl + 82} cy={cy} r={3} fill="rgba(255,255,255,0.4)" />

        <rect x={fr - 125} y={cy - 115} width={125} height={230}
          fill="none" stroke="rgba(255,255,255,0.35)" strokeWidth={1.5} />
        <rect x={fr - 50}  y={cy - 52}  width={50}  height={104}
          fill="none" stroke="rgba(255,255,255,0.3)"  strokeWidth={1} />
        <circle cx={fr - 82} cy={cy} r={3} fill="rgba(255,255,255,0.4)" />

        {/* Left goal (Team A defends) */}
        <rect x={fl - 28} y={gy1} width={28} height={gy2 - gy1}
          fill="rgba(239,68,68,0.12)" />
        <line x1={fl - 28} y1={gy1} x2={fl - 28} y2={gy2} stroke="#fff" strokeWidth={2} />
        <line x1={fl - 28} y1={gy1} x2={fl}      y2={gy1} stroke="#fff" strokeWidth={3} />
        <line x1={fl - 28} y1={gy2} x2={fl}      y2={gy2} stroke="#fff" strokeWidth={3} />
        <line x1={fl}      y1={gy1} x2={fl}      y2={gy2} stroke="#fff" strokeWidth={3} />

        {/* Right goal (Team B defends) */}
        <rect x={fr}      y={gy1} width={28} height={gy2 - gy1}
          fill="rgba(59,130,246,0.12)" />
        <line x1={fr + 28} y1={gy1} x2={fr + 28} y2={gy2} stroke="#fff" strokeWidth={2} />
        <line x1={fr}      y1={gy1} x2={fr + 28} y2={gy1} stroke="#fff" strokeWidth={3} />
        <line x1={fr}      y1={gy2} x2={fr + 28} y2={gy2} stroke="#fff" strokeWidth={3} />
        <line x1={fr}      y1={gy1} x2={fr}      y2={gy2} stroke="#fff" strokeWidth={3} />

        {/* Team labels */}
        <text x={fl + 14} y={ft + 18}
          fill="rgba(239,68,68,0.45)" fontSize="11" fontWeight="bold">A</text>
        <text x={fr - 14} y={ft + 18}
          fill="rgba(59,130,246,0.45)" fontSize="11" fontWeight="bold" textAnchor="end">B</text>

        {/* Players — drawn before ball so ball appears on top */}
        {players.map(p => <StickFigure key={p.id} p={p} tick={tickCount} />)}

        {/* Ball glow when in flight */}
        {ball.inFlight && (
          <circle cx={ballPos.x} cy={ballPos.y} r={13}
            fill="none" stroke="rgba(251,191,36,0.35)" strokeWidth={2} />
        )}

        {/* Ball */}
        <circle cx={ballPos.x} cy={ballPos.y} r={6} fill="#fff" />
      </svg>
    </div>
  )
}
