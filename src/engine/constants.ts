// ─── Field geometry ───────────────────────────────────────────────────────────
export const FIELD = {
  W: 1000, H: 600,
  LEFT: 55, RIGHT: 945,
  TOP: 25,  BOTTOM: 575,
  GOAL_Y1: 225, GOAL_Y2: 375,
}

export const TOTAL_TICKS = 2000

// Pitch inner dimensions
const pw = FIELD.RIGHT - FIELD.LEFT   // 890
const ph = FIELD.BOTTOM - FIELD.TOP   // 550

/** Fraction of pitch width  → absolute x pixel */
export const px = (f: number): number => FIELD.LEFT + pw * f
/** Fraction of pitch height → absolute y pixel */
export const py = (f: number): number => FIELD.TOP  + ph * f

// ─── Speeds (px / tick) ───────────────────────────────────────────────────────
export const SPEED = {
  shot:    15,
  pass:    11,
  throw:   13,
  player:  3.5,
  gk:      5.5,
  support: 0.7,   // fraction of player speed when positioning without ball
}

// ─── Interaction radii (px) ───────────────────────────────────────────────────
export const RADIUS = {
  steal:  48,
  pickup: 32,
  catch:  52,
}

// ─── Per-tick probabilities ───────────────────────────────────────────────────
export const CHANCE = {
  gkThrow:   0.04,   // per tick: GK launches a throw-in after ball goes out
  defPass:   0.12,   // per tick: defender with ball attempts a forward pass
  strShoot:  0.10,   // per tick: striker decides to shoot (when in range)
  strPass:   0.04,   // per tick: striker decides to pass instead of dribbling
  intercept: 0.22,   // per tick: defender in range intercepts a flying ball
  gkCatch:   0.45,   // per tick: GK in range catches a shot on target
  defSteal:  0.07,   // per tick: defender adjacent to ball carrier steals the ball
  strSteal:  0.025,  // per tick: striker adjacent to ball carrier steals the ball
}

// ─── Shot / pass accuracy (noise angle in radians) ────────────────────────────
export const NOISE = {
  shot:    0.28,
  pass:    0.20,
  defPass: 0.25,
  throw:   0.20,
}

// ─── Goalkeeper ───────────────────────────────────────────────────────────────
/** Fixed x-position for each GK (fraction of pitch width → px) */
export const GK_X = {
  A: px(0.015),    // ≈  68  (hugs left post)
  B: px(0.985),    // ≈ 932  (hugs right post)
}

/** Ball must cross this x threshold before the GK starts tracking it as a shot */
export const GK_CATCH_ZONE = {
  A: px(0.275),    // ≈ 300  — GK_A reacts when ball.x < this
  B: px(0.725),    // ≈ 700  — GK_B reacts when ball.x > this
}

// ─── Defenders ────────────────────────────────────────────────────────────────
/**
 * Fixed x-lane per defender group (fraction of pitch width → px).
 *   x1  — nearest to own goal
 *   x23 — middle row (defenders 2 & 3 share this lane)
 *   x45 — closest to midfield (defenders 4 & 5 share this lane)
 */
export const DEF_LANE = {
  A: { x1: px(0.135), x23: px(0.241), x45: px(0.360) },
  B: { x1: px(0.865), x23: px(0.759), x45: px(0.640) },
}

/**
 * Y patrol boundaries (fraction of pitch height → px).
 *   def1     patrols  p30 – p70   (centre channel, 30–70 %)
 *   def2/4   patrols  p10 – p50   (upper half,     10–50 %)
 *   def3/5   patrols  p50 – p90   (lower half,     50–90 %)
 */
export const DEF_Y = {
  p10: py(0.10),   //  80
  p30: py(0.30),   // 190
  p50: py(0.50),   // 300
  p70: py(0.70),   // 410
  p90: py(0.90),   // 520
}

// ─── Strikers ─────────────────────────────────────────────────────────────────
/**
 * Five y-lanes, evenly spaced at 1/6 … 5/6 of pitch height (fraction → px).
 * Indices: 0=top wing … 2=centre … 4=bottom wing
 */
export const STR_LANES = ([1, 2, 3, 4, 5] as const).map(i => py(i / 6))
// ≈ [117, 208, 300, 392, 483]

/**
 * Horizontal patrol bounds (fraction of pitch width → px).
 * Team A attacks right, Team B mirrors.
 *   _ctr — central striker  (closest to enemy goal)
 *   _far — wing strikers    (wider starting position)
 */
export const STR_PATROL = {
  A_ctr: { xMin: px(0.50), xMax: px(0.80) },
  A_hlf: { xMin: px(0.40), xMax: px(0.70) },
  A_far: { xMin: px(0.30), xMax: px(0.60) },
  B_ctr: { xMin: px(0.20), xMax: px(0.50) },
  B_hlf: { xMin: px(0.30), xMax: px(0.60) },
  B_far: { xMin: px(0.40), xMax: px(0.70) },
}

/** Target x a striker dribbles toward when they have the ball (fraction → px) */
export const DRIBBLE_TARGET_X = {
  A: px(0.91),    // ≈ 865
  B: px(0.09),    // ≈ 135
}

/** Striker shoots when distance to enemy goal < this value (fraction of width → px) */
export const SHOOT_DIST = pw * 0.315   // ≈ 280

/** Half-height of random aim spread around goal centre when shooting (px) */
export const SHOT_AIM_SPREAD = 40

/** Horizontal bias (px) — striker without ball stays this far behind the ball */
export const SUPPORT_BIAS_X = 60
