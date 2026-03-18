# Football Simulator — Developer Spec

## Stack

| Tool | Version | Role |
|---|---|---|
| React | 18 | UI components and rendering |
| TypeScript | 5 | Type safety across all modules |
| Vite | 5 | Build tool, dev server |
| Zustand | 4 | Global game state management |
| SVG | — | Field, players, ball (no canvas/WebGL) |
| gh-pages | 6 | Deploy to GitHub Pages |

---

## Overview

A full-page, self-running football (soccer) simulator rendered in SVG. Two teams play against each other autonomously. Players move along lanes, pass and shoot with random inaccuracy. The app shows a live scoreboard and emotional match log. No user input required beyond loading the page.

---

## Features / Operations

### Strikers
- Move along horizontal lanes across the field.
- Each tick: if holding the ball, randomly decide to **pass** (to nearest teammate) or **shoot** (toward the goal).
- Pass and shot trajectories include random angular and speed variance.

### Defenders
- Move along vertical lanes.
- Each tick: if a ball carrier enters their zone, attempt to **steal** (random chance based on distance).

### Goalkeepers
- Move only vertically within the goal box.
- Each tick: if a shot is incoming, attempt to **catch** (chance based on shot speed and proximity).
- After a goal or out: **throw-in** — launches ball toward a striker.

### Ball
- Travels along computed trajectories with overshoot/undershoot randomness.
- Out-of-bounds detection triggers a throw-in.
- Goal detection triggers score increment and a reset to kick-off.

### Scoreboard
- Displayed at the top of the viewport.
- Shows: Team A score — Team B score, and match clock (mm:ss).
- Clock runs from 00:00 to 90:00 then full-time.

### Match Log
- Displayed at the bottom of the viewport.
- Scrolling list of events with timestamps.
- Entries are emotionally worded, e.g. "45' — Torres blazes a rocket shot! — GOOOAL! 2:1".

---

## UX & Interface

### Layout
```
┌─────────────────────────────┐
│         ScoreBoard           │  ← fixed top bar, score + clock
├─────────────────────────────┤
│                             │
│         SVG Field           │  ← fills remaining viewport height
│   (goals L/R, players,      │
│    ball, lane guides)       │
│                             │
├─────────────────────────────┤
│         Match Log           │  ← fixed bottom panel, ~150px
└─────────────────────────────┘
```

### Convenience Features
- Simulation starts automatically on page load.
- Field scales to window size via SVG `viewBox`.
- Log auto-scrolls to the latest event.
- Player sprites are colored circles with shirt numbers.
- Ball is a white circle with black outline.

### Result Presentation
- Goals trigger a brief flash animation on the scoreboard.
- Steal events highlight the defender momentarily.

---

## State (Zustand)

```ts
interface Player {
  id: string;
  team: 'A' | 'B';
  role: 'goalkeeper' | 'defender' | 'striker';
  x: number;
  y: number;
  lane: number;          // which horizontal (striker) or vertical (defender) lane
  hasBall: boolean;
}

interface Ball {
  x: number;
  y: number;
  vx: number;
  vy: number;
  inFlight: boolean;
}

interface LogEntry {
  time: string;          // "mm:ss"
  text: string;
}

interface GameState {
  players: Player[];
  ball: Ball;
  scoreA: number;
  scoreB: number;
  matchTime: number;     // seconds elapsed
  isRunning: boolean;
  log: LogEntry[];

  // Actions
  tick: () => void;
  reset: () => void;
}
```

---

## Project Structure

```
football/
  index.html
  vite.config.ts
  tsconfig.json
  package.json
  prompt.md
  README.md
  .gitignore
  .github/
    workflows/
      deploy.yml
  src/
    main.tsx
    App.tsx
    store/
      gameStore.ts       # Zustand store
    components/
      Field.tsx          # SVG pitch, goals, players, ball
      ScoreBoard.tsx     # Top bar: score + clock
      GameLog.tsx        # Bottom panel: event log
    engine/
      gameEngine.ts      # Per-tick logic: movement, collisions, events
      physics.ts         # Random helpers, vector math
    types/
      game.ts            # Shared types (Player, Ball, LogEntry, etc.)
```

---

## GitHub Pages Deployment

- `vite.config.ts`: `base: '/football/'`
- `package.json` scripts:
  ```json
  "predeploy": "npm run build",
  "deploy": "gh-pages -d dist"
  ```
- `devDependencies`: `"gh-pages": "^6.0.0"`
- GitHub Actions: `.github/workflows/deploy.yml` — triggers on push to `main`, builds and deploys via `peaceiris/actions-gh-pages@v4`.

---

## Backlog

- Team formations (4-4-2, 4-3-3)
- Player names and nationality flags
- Sound effects for goals and tackles
- Manual pause / restart controls
- Half-time and full-time flow with animations
- Substitutions
- Penalty shootout mode
- Mobile touch support
