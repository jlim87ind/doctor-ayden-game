import { LEVELS, CONDITIONS, PEOPLE, BEDS } from './data.js';
export const OBSTACLES = [
  { x: 20, y: 70, w: 1160, h: 16 },
  { x: 810, y: 86, w: 16, h: 329 },
  { x: 20, y: 415, w: 310, h: 15 },
  { x: 440, y: 415, w: 370, h: 15 },
  { x: 830, y: 415, w: 40, h: 15 },
  { x: 1090, y: 415, w: 90, h: 15 },
  { x: 20, y: 535, w: 160, h: 15 },
  { x: 285, y: 535, w: 185, h: 15 },
  { x: 710, y: 535, w: 160, h: 15 },
  { x: 1090, y: 535, w: 90, h: 15 },
  { x: 365, y: 550, w: 15, h: 190 },
  { x: 810, y: 550, w: 15, h: 190 },
  { x: 82, y: 633, w: 160, h: 52 },
  ...BEDS.map((p) => ({ x: p.x - 58, y: p.y - 68, w: 116, h: 115 })),
  { x: 882, y: 180, w: 253, h: 125 },
];
export function walkable(x, y, r = 12) {
  return (
    x >= 30 + r &&
    x <= 1170 - r &&
    y >= 100 + r &&
    y <= 730 - r &&
    !OBSTACLES.some((o) => x + r > o.x && x - r < o.x + o.w && y + r > o.y && y - r < o.y + o.h)
  );
}
const GRID = 20,
  COLS = 60,
  ROWS = 38;
export function findPath(start, end) {
  const cell = (p) => ({ x: Math.round(p.x / GRID), y: Math.round(p.y / GRID) });
  const nearest = (p) => {
    let best = null,
      dist = Infinity;
    for (let x = 2; x < COLS - 1; x++)
      for (let y = 6; y < ROWS - 1; y++)
        if (walkable(x * GRID, y * GRID)) {
          let d = (x * GRID - p.x) ** 2 + (y * GRID - p.y) ** 2;
          if (d < dist) {
            dist = d;
            best = { x, y };
          }
        }
    return best;
  };
  const s = nearest(start),
    e = nearest(end);
  if (!s || !e) return [];
  const key = (p) => p.x + ',' + p.y,
    queue = [s],
    seen = new Map([[key(s), null]]);
  let target = null;
  for (let i = 0; i < queue.length; i++) {
    const p = queue[i];
    if (p.x === e.x && p.y === e.y) {
      target = p;
      break;
    }
    for (const [dx, dy] of [
      [1, 0],
      [-1, 0],
      [0, 1],
      [0, -1],
    ]) {
      const n = { x: p.x + dx, y: p.y + dy };
      if (
        n.x < 1 ||
        n.x >= COLS ||
        n.y < 1 ||
        n.y >= ROWS ||
        seen.has(key(n)) ||
        !walkable(n.x * GRID, n.y * GRID)
      )
        continue;
      seen.set(key(n), p);
      queue.push(n);
    }
  }
  if (!target) return [];
  const out = [];
  for (let p = target; p; p = seen.get(key(p))) out.unshift({ x: p.x * GRID, y: p.y * GRID });
  return out;
}
export class GameModel {
  constructor(index, settings) {
    this.levelIndex = index;
    this.level = LEVELS[index];
    this.settings = settings;
    this.time = 0;
    this.score = 0;
    this.helped = 0;
    this.errors = 0;
    this.care = 0;
    this.miniScores = [];
    this.patients = [];
    this.inventory = [];
    this.doctor = { x: 380, y: 487, face: 'down', moving: false, pose: 'idle' };
    this.path = [];
    this.destination = null;
    this.wheelchair = null;
    this.emptyChair = false;
    this.transportLock = null;
    this.washed = false;
    this.finished = false;
    this.closed = false;
    this.spawn();
  }
  spawn() {
    for (let i = 0; i < this.level.schedule.length; i++) {
      const entry = this.level.schedule[i];
      if (this.patients.some((p) => p.id === i) || entry.at > this.time) continue;
      const active = this.patients.filter((p) => p.state !== 'discharged');
      if (active.length >= this.level.capacity) continue;
      const bed = [0, 1, 2, 3].find((n) => !active.some((p) => p.bed === n));
      const p = {
        ...PEOPLE[entry.person],
        id: i,
        bed,
        condition: entry.condition,
        state: 'waiting',
        exam: 0,
        step: 0,
        happiness: 3,
        reassured: false,
        mistakes: 0,
        location: 'ward',
        arrived: this.time,
        done: [],
      };
      this.patients.push(p);
    }
  }
  update(dt) {
    if (this.finished) return;
    this.time += dt;
    if (this.settings.patience) {
      for (const p of this.patients)
        if (p.state !== 'discharged')
          p.happiness = Math.max(1, p.happiness - dt / (p.personality === 'Nervous' ? 150 : 210));
    }
    this.spawn();
  }
  position(p) {
    if (p.location === 'procedure') return { x: 595, y: 615 };
    if (p.location === 'recovery') return { x: 997, y: 621 };
    return BEDS[p.bed];
  }
  approach(p) {
    const at = this.position(p);
    return { x: at.x, y: p.location === 'ward' ? 365 : p.location === 'procedure' ? 655 : 675 };
  }
  next(p) {
    const c = CONDITIONS[p.condition];
    if (p.exam < c.exam.length) return { game: c.exam[p.exam], phase: 'exam' };
    return { ...c.steps[p.step], phase: 'treatment' };
  }
  needs(p) {
    if (p.exam < CONDITIONS[p.condition].exam.length) return [];
    return [
      ...new Set(
        CONDITIONS[p.condition].steps
          .slice(p.step)
          .map((s) => s.item)
          .filter(Boolean)
      ),
    ];
  }
  take(item) {
    if (this.inventory.length >= Number(this.settings.capacity)) return false;
    this.inventory.push(item);
    return true;
  }
  use(p, item) {
    if (!this.inventory.includes(item)) return false;
    this.inventory.splice(this.inventory.indexOf(item), 1);
    return true;
  }
  wrong(p) {
    this.errors++;
    p.mistakes++;
    this.score = Math.max(0, this.score - 25);
  }
  complete(p, quality = 1) {
    const next = this.next(p);
    if (!next.game) return false;
    if (next.item && !this.use(p, next.item)) return false;
    this.score += 100 + Math.round(150 * quality);
    this.miniScores.push(quality);
    p.happiness = Math.min(3, p.happiness + 0.5);
    p.done.push(next.game);
    if (next.phase === 'exam') {
      p.exam++;
      p.state = p.exam === CONDITIONS[p.condition].exam.length ? 'treatment' : 'checkup';
    } else {
      p.step++;
      p.state = 'treatment';
    }
    if (
      p.exam >= CONDITIONS[p.condition].exam.length &&
      p.step >= CONDITIONS[p.condition].steps.length
    )
      this.discharge(p);
    return true;
  }
  discharge(p) {
    if (p.state === 'discharged') return;
    p.state = 'discharged';
    p.careAtDischarge = p.happiness;
    this.score += 500 + Math.round((p.happiness / 3) * 100);
    p.happiness = 3;
    this.helped++;
    if (this.wheelchair === p.id) this.wheelchair = null;
    if (this.transportLock === p.id) this.transportLock = null;
    this.emptyChair = false;
    if (this.helped === this.level.schedule.length) this.finished = true;
    else this.spawn();
  }
  reassure(p) {
    if (p.state === 'discharged' || p.reassured) return false;
    p.reassured = true;
    p.happiness = Math.min(3, p.happiness + 1);
    this.care++;
    this.score += 50;
    return true;
  }
  report() {
    const avg = this.miniScores.reduce((a, b) => a + b, 0) / Math.max(1, this.miniScores.length);
    const skill = avg > 0.84 ? 3 : avg > 0.6 ? 2 : 1;
    const caring =
      this.patients.reduce((a, p) => a + (p.careAtDischarge ?? p.happiness), 0) /
        Math.max(1, this.patients.length) >
      2.3
        ? 3
        : 2;
    const efficiency =
      this.errors <= 2 && this.time < this.level.duration ? 3 : this.errors < 8 ? 2 : 1;
    return {
      score: this.score,
      caring,
      skill,
      efficiency,
      stars: Math.max(1, Math.round((caring + skill + efficiency) / 3)),
      seconds: Math.round(this.time),
    };
  }
}
