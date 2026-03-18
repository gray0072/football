import { useEffect } from 'react'
import { useGameStore } from './store/gameStore'
import { ScoreBoard } from './components/ScoreBoard'
import { Field } from './components/Field'
import { GameLog } from './components/GameLog'

export default function App() {
  const tick = useGameStore(s => s.tick)
  const isRunning = useGameStore(s => s.isRunning)

  useEffect(() => {
    if (!isRunning) return
    const id = setInterval(tick, 80)
    return () => clearInterval(id)
  }, [isRunning, tick])

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      height: '100vh',
      overflow: 'hidden',
      background: '#111827',
    }}>
      <ScoreBoard />
      <Field />
      <GameLog />
    </div>
  )
}
