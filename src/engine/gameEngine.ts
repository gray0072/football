import { Ball, GameData, Player } from '../types/game'
import { chance, dist, pick, rand, velocityToward } from './physics'
import {
  FIELD, TOTAL_TICKS,
  SPEED, RADIUS, CHANCE, NOISE,
  GK_X, GK_CATCH_ZONE,
  DEF_LANE, DEF_Y,
  STR_LANES, STR_PATROL, DRIBBLE_TARGET_X, SHOOT_DIST, SHOT_AIM_SPREAD, SUPPORT_BIAS_X,
} from './constants'

// ─── Message templates ────────────────────────────────────────────────────────
const GOAL_MSGS = [
  (n: string, a: number, b: number) => `⚽ ${n} blasts it into the net! GOOOOAL! ${a}:${b}`,
  (n: string, a: number, b: number) => `🔥 ${n} — unstoppable strike! GOOOAL! ${a}:${b}`,
  (n: string, a: number, b: number) => `💥 ${n} makes no mistake! GOAL! ${a}:${b}`,
  (n: string, a: number, b: number) => `🎉 ${n} scores a beauty! ${a}:${b}`,
]
const PASS_MSGS = [
  (f: string, t: string) => `⚡ ${f} threads a brilliant pass to ${t}!`,
  (f: string, t: string) => `👟 ${f} finds ${t} with a pinpoint ball.`,
  (f: string, t: string) => `🎯 ${f} plays it to ${t}.`,
  (f: string, t: string) => `✨ ${f} switches play to ${t}!`,
]
const STEAL_MSGS = [
  (d: string, a: string) => `🛡️ ${d} snatches the ball from ${a}!`,
  (d: string, a: string) => `💪 ${d} wins the tackle against ${a}!`,
  (d: string, a: string) => `😤 ${a} loses possession to ${d}!`,
  (d: string, a: string) => `🔴 Hard challenge! ${d} takes it from ${a}.`,
]
const SAVE_MSGS = [
  (g: string) => `🧤 ${g} dives! What a magnificent save!`,
  (g: string) => `🙌 ${g} tips it wide! Incredible reflexes!`,
  (g: string) => `🧱 ${g} stands tall! Great block!`,
  (g: string) => `😱 ${g} denies the goal! Sensational!`,
]
const SHOT_MSGS = [
  (n: string) => `🎯 ${n} unleashes a rocket!`,
  (n: string) => `💫 ${n} shoots! Will it go in?`,
  (n: string) => `⚡ ${n} fires at goal!`,
  (n: string) => `🔥 ${n} goes for glory!`,
]
const THROW_MSGS = [
  (g: string, t: string) => `🏃 ${g} launches upfield to ${t}.`,
  (g: string, t: string) => `👋 ${g} throws to ${t}.`,
]

// ─── Player factory helpers ───────────────────────────────────────────────────
function def(id: string, team: 'A' | 'B', name: string,
             x: number, y: number, yMin: number, yMax: number): Player {
  return { id, team, role: 'defender', name, x, y, lane: x,
           yMin, yMax, xMin: FIELD.LEFT, xMax: FIELD.RIGHT, hasBall: false }
}
function str(id: string, team: 'A' | 'B', name: string,
             x: number, laneY: number,
             xMin: number, xMax: number, hasBall = false): Player {
  return { id, team, role: 'striker', name, x, y: laneY, lane: laneY,
           yMin: FIELD.TOP, yMax: FIELD.BOTTOM, xMin, xMax, hasBall }
}

// ─── Initial state ────────────────────────────────────────────────────────────
export function createInitialPlayers(): Player[] {
  const DA = DEF_LANE.A
  const DB = DEF_LANE.B
  const Y  = DEF_Y
  const SP = STR_PATROL
  const L  = STR_LANES

  return [
    // ── Team A ──────────────────────────────────────────────────────────────
    { id: 'gkA', team: 'A', role: 'goalkeeper', name: 'Casillas',
      x: GK_X.A, y: FIELD.GOAL_Y1 + (FIELD.GOAL_Y2 - FIELD.GOAL_Y1) / 2,
      lane: 0, yMin: FIELD.GOAL_Y1, yMax: FIELD.GOAL_Y2,
      xMin: FIELD.LEFT, xMax: FIELD.RIGHT, hasBall: false },

    def('defA1', 'A', 'Ramos',   DA.x1,  Y.p50, Y.p30, Y.p70),
    def('defA2', 'A', 'Puyol',   DA.x23, Y.p30, Y.p10, Y.p50),
    def('defA3', 'A', 'Piqué',   DA.x23, Y.p70, Y.p50, Y.p90),
    def('defA4', 'A', 'Alba',    DA.x45, Y.p30, Y.p10, Y.p50),
    def('defA5', 'A', 'Alves',   DA.x45, Y.p70, Y.p50, Y.p90),

    str('strA1', 'A', 'Messi',   SP.A_far.xMin, L[0], SP.A_far.xMin, SP.A_far.xMax),
    str('strA2', 'A', 'Torres',  SP.A_far.xMin, L[1], SP.A_far.xMin, SP.A_far.xMax),
    str('strA3', 'A', 'Iniesta', SP.A_ctr.xMin, L[2], SP.A_ctr.xMin, SP.A_ctr.xMax, true),
    str('strA4', 'A', 'Xavi',    SP.A_far.xMin, L[3], SP.A_far.xMin, SP.A_far.xMax),
    str('strA5', 'A', 'Villa',   SP.A_far.xMin, L[4], SP.A_far.xMin, SP.A_far.xMax),

    // ── Team B ──────────────────────────────────────────────────────────────
    { id: 'gkB', team: 'B', role: 'goalkeeper', name: 'Neuer',
      x: GK_X.B, y: FIELD.GOAL_Y1 + (FIELD.GOAL_Y2 - FIELD.GOAL_Y1) / 2,
      lane: 0, yMin: FIELD.GOAL_Y1, yMax: FIELD.GOAL_Y2,
      xMin: FIELD.LEFT, xMax: FIELD.RIGHT, hasBall: false },

    def('defB1', 'B', 'Terry',    DB.x1,  Y.p50, Y.p30, Y.p70),
    def('defB2', 'B', 'Vidic',    DB.x23, Y.p30, Y.p10, Y.p50),
    def('defB3', 'B', 'Ferdinand',DB.x23, Y.p70, Y.p50, Y.p90),
    def('defB4', 'B', 'Lahm',     DB.x45, Y.p30, Y.p10, Y.p50),
    def('defB5', 'B', 'Boateng',  DB.x45, Y.p70, Y.p50, Y.p90),

    str('strB1', 'B', 'Rooney', SP.B_far.xMax, L[0], SP.B_far.xMin, SP.B_far.xMax),
    str('strB2', 'B', 'Müller', SP.B_far.xMax, L[1], SP.B_far.xMin, SP.B_far.xMax),
    str('strB3', 'B', 'Klose',  SP.B_ctr.xMax, L[2], SP.B_ctr.xMin, SP.B_ctr.xMax),
    str('strB4', 'B', 'Ribéry', SP.B_far.xMax, L[3], SP.B_far.xMin, SP.B_far.xMax),
    str('strB5', 'B', 'Özil',   SP.B_far.xMax, L[4], SP.B_far.xMin, SP.B_far.xMax),
  ]
}

export function createInitialBall(): Ball {
  return {
    x: STR_PATROL.A_ctr.xMin, y: STR_LANES[2],
    vx: 0, vy: 0,
    inFlight: false,
    ownerId: 'strA3',
    lastOwnerId: null,
    targetId: null,
  }
}

// ─── Helpers ─────────────────────────────────────────────────────────────────
function gp(players: Player[], id: string): Player | undefined {
  return players.find(p => p.id === id)
}

function clearBall(players: Player[], ball: Ball, ownerId: string): void {
  players.forEach(p => { p.hasBall = false })
  const owner = gp(players, ownerId)
  if (!owner) return
  owner.hasBall = true
  ball.inFlight = false
  ball.vx = 0; ball.vy = 0
  ball.ownerId = ownerId
  ball.targetId = null
  ball.x = owner.x
  ball.y = owner.y
}

function formatTime(tickCount: number): string {
  const min = Math.min(90, Math.floor(tickCount * 90 / TOTAL_TICKS))
  return `${min}'`
}

function kickOff(players: Player[], ball: Ball, kickerId: string): void {
  players.forEach(p => { p.hasBall = false })
  const kicker = gp(players, kickerId)!
  kicker.hasBall = true
  kicker.x = (FIELD.LEFT + FIELD.RIGHT) / 2
  kicker.y = (FIELD.TOP  + FIELD.BOTTOM) / 2
  ball.x = kicker.x; ball.y = kicker.y
  ball.inFlight = false; ball.vx = 0; ball.vy = 0
  ball.ownerId = kickerId; ball.lastOwnerId = null; ball.targetId = null
}

// ─── Main tick ────────────────────────────────────────────────────────────────
export function computeNextTick(prev: GameData): GameData {
  if (!prev.isRunning || prev.matchOver) return prev

  const players: Player[] = prev.players.map(p => ({ ...p }))
  const ball: Ball = { ...prev.ball }
  let scoreA = prev.scoreA
  let scoreB = prev.scoreB
  const tickCount = prev.tickCount + 1
  let goalFlashTimer = Math.max(0, prev.goalFlashTimer - 1)
  const newEntries: Array<{ time: string; text: string }> = []
  const time = formatTime(tickCount)

  const addLog = (text: string) => newEntries.push({ time, text })
  const get = (id: string) => gp(players, id)

  // Match over
  if (tickCount >= TOTAL_TICKS) {
    addLog(`🏁 Full time! Final score: ${scoreA}:${scoreB}`)
    const log = [...newEntries.map((e, i) => ({ id: Date.now() + i, ...e })), ...prev.log].slice(0, 80)
    return { ...prev, players, ball, scoreA, scoreB, tickCount, matchOver: true, goalFlashTimer, log }
  }

  // ── Move ball ─────────────────────────────────────────────────────────────
  if (ball.inFlight) {
    ball.x += ball.vx
    ball.y += ball.vy

    // Goal: right (Team A scores)
    if (ball.x >= FIELD.RIGHT && ball.y >= FIELD.GOAL_Y1 && ball.y <= FIELD.GOAL_Y2) {
      scoreA++
      goalFlashTimer = 25
      addLog(pick(GOAL_MSGS)(get(ball.lastOwnerId ?? '')?.name ?? 'Someone', scoreA, scoreB))
      kickOff(players, ball, 'strB3')
      const log = [...newEntries.map((e, i) => ({ id: Date.now() + i, ...e })), ...prev.log].slice(0, 80)
      return { ...prev, players, ball, scoreA, scoreB, tickCount, matchOver: false, goalFlashTimer, log }
    }

    // Goal: left (Team B scores)
    if (ball.x <= FIELD.LEFT && ball.y >= FIELD.GOAL_Y1 && ball.y <= FIELD.GOAL_Y2) {
      scoreB++
      goalFlashTimer = 25
      addLog(pick(GOAL_MSGS)(get(ball.lastOwnerId ?? '')?.name ?? 'Someone', scoreA, scoreB))
      kickOff(players, ball, 'strA3')
      const log = [...newEntries.map((e, i) => ({ id: Date.now() + i, ...e })), ...prev.log].slice(0, 80)
      return { ...prev, players, ball, scoreA, scoreB, tickCount, matchOver: false, goalFlashTimer, log }
    }

    // Out of bounds (non-goal)
    if (ball.x <= FIELD.LEFT || ball.x >= FIELD.RIGHT ||
        ball.y <= FIELD.TOP  || ball.y >= FIELD.BOTTOM) {
      const gkTeam = ball.x <= FIELD.LEFT ? 'A'
                   : ball.x >= FIELD.RIGHT ? 'B'
                   : ball.x < (FIELD.LEFT + FIELD.RIGHT) / 2 ? 'A' : 'B'
      const gkId = gkTeam === 'A' ? 'gkA' : 'gkB'
      clearBall(players, ball, gkId)
      addLog(`${get(gkId)?.name} claims the ball.`)
    }

    // Pass pickup by target
    if (ball.inFlight && ball.targetId) {
      const target = get(ball.targetId)
      if (target && dist(target.x, target.y, ball.x, ball.y) < RADIUS.pickup) {
        clearBall(players, ball, target.id)
      }
    }

    // Interception by any nearby enemy
    if (ball.inFlight) {
      const attackerTeam = ball.lastOwnerId ? get(ball.lastOwnerId)?.team : null
      for (const p of players) {
        if (attackerTeam && p.team === attackerTeam) continue
        if (dist(p.x, p.y, ball.x, ball.y) < RADIUS.steal && chance(CHANCE.intercept)) {
          addLog(pick(STEAL_MSGS)(p.name, get(ball.lastOwnerId ?? '')?.name ?? '?'))
          clearBall(players, ball, p.id)
          break
        }
      }
    }

    // GK catch
    if (ball.inFlight) {
      const checks = [
        { id: 'gkA', relevant: ball.vx < 0 && ball.x < GK_CATCH_ZONE.A },
        { id: 'gkB', relevant: ball.vx > 0 && ball.x > GK_CATCH_ZONE.B },
      ]
      for (const { id, relevant } of checks) {
        if (!relevant) continue
        const gk = get(id)
        if (gk && dist(gk.x, gk.y, ball.x, ball.y) < RADIUS.catch && chance(CHANCE.gkCatch)) {
          addLog(pick(SAVE_MSGS)(gk.name))
          clearBall(players, ball, gk.id)
          break
        }
      }
    }
  }

  // ── Defenders steal from ball carrier ─────────────────────────────────────
  if (!ball.inFlight && ball.ownerId) {
    const carrier = get(ball.ownerId)
    if (carrier && carrier.role !== 'goalkeeper') {
      for (const p of players) {
        if (p.team === carrier.team) continue
        const ch = p.role === 'defender' ? CHANCE.defSteal : CHANCE.strSteal
        if (dist(p.x, p.y, carrier.x, carrier.y) < RADIUS.steal && chance(ch)) {
          carrier.hasBall = false
          p.hasBall = true
          ball.ownerId = p.id
          ball.lastOwnerId = carrier.id
          addLog(pick(STEAL_MSGS)(p.name, carrier.name))
          break
        }
      }
    }
  }

  // ── Move players ──────────────────────────────────────────────────────────
  for (const p of players) {
    if (p.role === 'goalkeeper') {
      p.x = GK_X[p.team]
      const ty = Math.max(p.yMin, Math.min(p.yMax, ball.y))
      p.y += Math.sign(ty - p.y) * Math.min(SPEED.gk, Math.abs(ty - p.y))

    } else if (p.role === 'defender') {
      p.x = p.lane
      const ty = Math.max(p.yMin, Math.min(p.yMax, ball.y))
      p.y += Math.sign(ty - p.y) * Math.min(SPEED.player, Math.abs(ty - p.y))

    } else {
      // Striker: locked on y-lane, patrols xMin–xMax
      p.y = p.lane
      if (p.hasBall) {
        const tx = DRIBBLE_TARGET_X[p.team]
        p.x += Math.sign(tx - p.x) * SPEED.player
      } else {
        const ideal = p.team === 'A'
          ? Math.max(p.xMin, Math.min(p.xMax, ball.x - SUPPORT_BIAS_X))
          : Math.max(p.xMin, Math.min(p.xMax, ball.x + SUPPORT_BIAS_X))
        const dx = ideal - p.x
        if (Math.abs(dx) > 4) p.x += Math.sign(dx) * Math.min(SPEED.player * SPEED.support, Math.abs(dx))
      }
      p.x = Math.max(FIELD.LEFT + 10, Math.min(FIELD.RIGHT - 10, p.x))
    }
  }

  // Sync ball to owner position
  if (!ball.inFlight && ball.ownerId) {
    const owner = get(ball.ownerId)
    if (owner) { ball.x = owner.x; ball.y = owner.y }
  }

  // ── Player AI ─────────────────────────────────────────────────────────────
  if (!ball.inFlight && ball.ownerId) {
    const carrier = get(ball.ownerId)
    if (carrier?.hasBall) {

      if (carrier.role === 'goalkeeper') {
        if (chance(CHANCE.gkThrow)) {
          const targets = players.filter(p => p.team === carrier.team && p.role === 'striker')
          const target = targets[Math.floor(Math.random() * targets.length)]
          if (target) {
            const vel = velocityToward(ball.x, ball.y, target.x, target.y, SPEED.throw, NOISE.throw)
            ball.inFlight = true; ball.vx = vel.vx; ball.vy = vel.vy
            ball.lastOwnerId = carrier.id; ball.targetId = target.id; ball.ownerId = null
            carrier.hasBall = false
            addLog(pick(THROW_MSGS)(carrier.name, target.name))
          }
        }

      } else if (carrier.role === 'defender') {
        if (chance(CHANCE.defPass)) {
          const targets = players.filter(p => p.team === carrier.team && p.role === 'striker')
          const target = targets[Math.floor(Math.random() * targets.length)]
          if (target) {
            const vel = velocityToward(ball.x, ball.y, target.x, target.y, SPEED.pass, NOISE.defPass)
            ball.inFlight = true; ball.vx = vel.vx; ball.vy = vel.vy
            ball.lastOwnerId = carrier.id; ball.targetId = target.id; ball.ownerId = null
            carrier.hasBall = false
            addLog(pick(PASS_MSGS)(carrier.name, target.name))
          }
        }

      } else {
        // Striker
        const distToGoal = carrier.team === 'A'
          ? FIELD.RIGHT - carrier.x
          : carrier.x - FIELD.LEFT

        if (distToGoal < SHOOT_DIST && chance(CHANCE.strShoot)) {
          const goalX = carrier.team === 'A' ? FIELD.RIGHT - 5 : FIELD.LEFT + 5
          const goalY = (FIELD.GOAL_Y1 + FIELD.GOAL_Y2) / 2 + rand(-SHOT_AIM_SPREAD, SHOT_AIM_SPREAD)
          const vel = velocityToward(ball.x, ball.y, goalX, goalY, SPEED.shot, NOISE.shot)
          ball.inFlight = true; ball.vx = vel.vx; ball.vy = vel.vy
          ball.lastOwnerId = carrier.id; ball.targetId = null; ball.ownerId = null
          carrier.hasBall = false
          addLog(pick(SHOT_MSGS)(carrier.name))

        } else if (chance(CHANCE.strPass)) {
          const targets = players.filter(p =>
            p.team === carrier.team && p.id !== carrier.id && p.role !== 'goalkeeper'
          )
          if (targets.length > 0) {
            const target = targets[Math.floor(Math.random() * targets.length)]
            const vel = velocityToward(ball.x, ball.y, target.x, target.y, SPEED.pass, NOISE.pass)
            ball.inFlight = true; ball.vx = vel.vx; ball.vy = vel.vy
            ball.lastOwnerId = carrier.id; ball.targetId = target.id; ball.ownerId = null
            carrier.hasBall = false
            addLog(pick(PASS_MSGS)(carrier.name, target.name))
          }
        }
      }
    }
  }

  // Safety: orphaned ball
  if (!ball.inFlight && !ball.ownerId) {
    clearBall(players, ball, 'strA3')
  }

  const log = [...newEntries.map((e, i) => ({ id: Date.now() + i, ...e })), ...prev.log].slice(0, 80)
  return { ...prev, players, ball, scoreA, scoreB, tickCount, matchOver: false, goalFlashTimer, log }
}
