import { create } from 'zustand'
import { GameData } from '../types/game'
import { computeNextTick, createInitialBall, createInitialPlayers } from '../engine/gameEngine'

const makeInitial = (): GameData => ({
  players: createInitialPlayers(),
  ball: createInitialBall(),
  scoreA: 0,
  scoreB: 0,
  tickCount: 0,
  isRunning: true,
  log: [{ id: 0, time: "0'", text: "🎮 Kick off! The match begins!" }],
  goalFlashTimer: 0,
  matchOver: false,
})

interface GameStore extends GameData {
  tick: () => void
  reset: () => void
  toggleRunning: () => void
}

export const useGameStore = create<GameStore>((set) => ({
  ...makeInitial(),
  tick: () => set(state => computeNextTick(state)),
  reset: () => set({ ...makeInitial() }),
  toggleRunning: () => set(state => ({ isRunning: !state.isRunning })),
}))
