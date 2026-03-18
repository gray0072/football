# Football Simulator

**Live: [gray0072.github.io/football](https://gray0072.github.io/football/)**

A full-page browser football (soccer) simulation with real-time SVG graphics, autonomous players, and an emotional match log.

---

## Features

| Feature | Description |
|---|---|
| SVG Field | Full-viewport animated pitch rendered entirely in SVG |
| Goalkeepers | Move only vertically; chance to catch shots |
| Defenders | Move along vertical lanes; chance to intercept passes |
| Strikers | Move along horizontal lanes; can pass or shoot each tick |
| Ball Physics | All passes and shots include random inaccuracy |
| Goal / Out logic | Out triggers a goalkeeper throw-in |
| Scoreboard | Live score + match clock displayed at the top |
| Match Log | Emotional real-time event log at the bottom (passes, steals, goals) |
| Auto-play | Simulation runs continuously without user input |

---

## How It Works

1. **Kick-off** — The simulation starts automatically; the ball spawns at center field.
2. **Each tick** — Every striker with the ball decides to pass to a teammate or shoot at goal.
3. **Defence** — Nearby defenders attempt to steal; goalkeepers dive for shots.
4. **Events** — Goals, steals, fouls, and out-of-bounds are logged with timestamps.

---

## Tech Stack

- [React 18](https://react.dev/) — UI rendering
- [TypeScript](https://www.typescriptlang.org/) — type safety
- [Vite](https://vitejs.dev/) — build tool & dev server
- [Zustand](https://zustand-demo.pmnd.rs/) — global game state
- SVG — field and player graphics (no canvas / WebGL)

---

## Getting Started

```bash
git clone https://github.com/gray0072/football.git
cd football
npm install
npm run dev
```

Open [http://localhost:5173/football/](http://localhost:5173/football/)

---

## Build & Deploy

```bash
npm run build    # builds to dist/
npm run deploy   # pushes dist/ to gh-pages branch
```

> `vite.config.ts` uses `base: '/football/'` so all assets resolve correctly on GitHub Pages.

---

## Project Structure

```
src/
  main.tsx              # App entry point
  App.tsx               # Root layout
  store/
    gameStore.ts        # Zustand store (full game state + actions)
  components/
    Field.tsx           # SVG pitch, goals, and player sprites
    ScoreBoard.tsx      # Score & clock header
    GameLog.tsx         # Bottom event log
  engine/
    gameEngine.ts       # Tick loop, collision detection, event dispatch
    physics.ts          # Randomness helpers, movement math
  types/
    game.ts             # Shared TypeScript types
```

---

## Roadmap

- [ ] Team formations (4-4-2, 4-3-3)
- [ ] Player names and nationality flags
- [ ] Sound effects for goals and tackles
- [ ] Manual kick-off / pause / restart controls
- [ ] Half-time and full-time flow
- [ ] Substitutions
- [ ] Penalty shootout mode
- [ ] Mobile touch support

---

## License

MIT
