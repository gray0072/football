export type Team = 'A' | 'B'
export type Role = 'goalkeeper' | 'defender' | 'striker'

export interface Player {
  id: string
  team: Team
  role: Role
  name: string
  x: number
  y: number
  lane: number       // striker → fixed y; defender → fixed x; gk → unused
  yMin: number       // patrol y lower bound  (defenders / gk)
  yMax: number       // patrol y upper bound  (defenders / gk)
  xMin: number       // patrol x lower bound  (strikers)
  xMax: number       // patrol x upper bound  (strikers)
  hasBall: boolean
}

export interface Ball {
  x: number
  y: number
  vx: number
  vy: number
  inFlight: boolean
  ownerId: string | null
  lastOwnerId: string | null
  targetId: string | null
}

export interface LogEntry {
  id: number
  time: string
  text: string
}

export interface GameData {
  players: Player[]
  ball: Ball
  scoreA: number
  scoreB: number
  tickCount: number
  isRunning: boolean
  log: LogEntry[]
  goalFlashTimer: number
  matchOver: boolean
}
