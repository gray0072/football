export const rand = (min: number, max: number): number => min + Math.random() * (max - min)
export const chance = (p: number): boolean => Math.random() < p
export const clamp = (v: number, lo: number, hi: number): number => Math.max(lo, Math.min(hi, v))
export const pick = <T>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)]

export function dist(ax: number, ay: number, bx: number, by: number): number {
  return Math.sqrt((ax - bx) ** 2 + (ay - by) ** 2)
}

export function normalize(vx: number, vy: number, speed: number): { vx: number; vy: number } {
  const len = Math.sqrt(vx * vx + vy * vy)
  if (len === 0) return { vx: speed, vy: 0 }
  return { vx: (vx / len) * speed, vy: (vy / len) * speed }
}

export function velocityToward(
  fx: number, fy: number,
  tx: number, ty: number,
  speed: number,
  noise: number,
): { vx: number; vy: number } {
  const norm = normalize(tx - fx, ty - fy, speed)
  const angle = Math.atan2(norm.vy, norm.vx) + rand(-noise, noise)
  return { vx: Math.cos(angle) * speed, vy: Math.sin(angle) * speed }
}
