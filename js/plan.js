// Builds a workout: warm-up → main block → cool-down, filled to the chosen duration.
import { EXERCISES, byId } from './exercises.js';

export const FOCUS = {
  full: { name: 'Full body', main: ['strength', 'cardio', 'core'], extra: ['yoga'] },
  cardio: { name: 'Cardio', main: ['cardio'], extra: ['strength'] },
  core: { name: 'Core & back', main: ['core'], extra: ['strength'] },
  yoga: { name: 'Yoga', main: ['yoga'], extra: ['stretch'] },
  desk: { name: 'Desk relief', main: ['stretch', 'yoga'], extra: ['warmup'] },
};

function rng(seed) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function shuffle(arr, rand) {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/** Take n exercises from pool, cycling when the pool runs out and never repeating back-to-back. */
function take(pool, n, rand, avoidFirst) {
  const out = [];
  if (!pool.length) return out;
  let deck = [];
  while (out.length < n) {
    if (!deck.length) deck = shuffle(pool, rand);
    let i = 0;
    const prev = out.length ? out[out.length - 1] : avoidFirst;
    if (deck.length > 1 && deck[0] === prev) i = 1;
    out.push(deck.splice(i, 1)[0]);
  }
  return out;
}

export const todaySeed = () => {
  const d = new Date();
  return d.getFullYear() * 10000 + (d.getMonth() + 1) * 100 + d.getDate();
};

// Moves that jump without a `lift` in their frames (feet hop apart in a plank).
const JUMPY = new Set(['plank-jacks']);

/** True for moves with a jump or hop: any keyframe leaves the floor, or listed in JUMPY. */
export function isJumping(e) {
  return JUMPY.has(e.id) || e.frames.some((f) => (f.lift || 0) > 0);
}

export function buildPlan({ minutes = 15, level = 1, focus = 'full', work = 20, rest = 10, lowImpact = false, seed = todaySeed() }) {
  const rand = rng(seed * 31 + level * 7 + focus.length);
  const rounds = Math.max(4, Math.round((minutes * 60 + rest) / (work + rest)));
  const f = FOCUS[focus] || FOCUS.full;
  // Equipment moves only appear in routines; "No jumping" removes every jumping move.
  const ok = (e) => e.level <= level && !e.props && !(lowImpact && isJumping(e));
  // Weight exercises at the chosen level higher so harder plans feel harder.
  const weighted = (list) => list.flatMap((e) => (e.level === level && level > 1 ? [e, e] : [e]));

  const gentle = focus === 'yoga' || focus === 'desk';
  const warmPool = EXERCISES.filter((e) => e.cat === 'warmup' && ok(e) && (!gentle || e.met < 3.2));
  const coolPool = EXERCISES.filter((e) => (e.cat === 'stretch' || (e.cat === 'yoga' && e.met <= 2.5)) && ok(e));
  let mainPool = EXERCISES.filter((e) => f.main.includes(e.cat) && ok(e));
  const extras = shuffle(EXERCISES.filter((e) => f.extra.includes(e.cat) && ok(e)), rand).slice(0, 3);
  mainPool = weighted([...mainPool, ...extras]);
  if (focus === 'desk') mainPool = [...mainPool, ...EXERCISES.filter((e) => e.cat === 'warmup' && e.met < 3)];
  // Without jumps, Cardio has very few moves left: top up with brisk standing moves that keep the heart rate up.
  if (lowImpact && new Set(mainPool).size < 6) {
    mainPool = [...mainPool, ...EXERCISES.filter((e) => ok(e) && !e.mat && !mainPool.includes(e) &&
      ((e.cat === 'warmup' && e.met >= 3.5) || e.cat === 'strength'))];
  }

  const nWarm = Math.max(2, Math.round(rounds * 0.15));
  const nCool = Math.max(2, Math.round(rounds * 0.12));
  const nMain = Math.max(1, rounds - nWarm - nCool);

  const warm = take(warmPool, nWarm, rand);
  let main = take(mainPool, nMain, rand, warm[warm.length - 1]);
  // Keep standing moves together and floor moves together so you are not up and down constantly.
  const standing = main.filter((e) => !e.mat), floor = main.filter((e) => e.mat);
  main = fixRepeats([...standing, ...floor]);
  if (main[0] === warm[warm.length - 1] && main.length > 1) main.push(main.shift());
  const cool = take(coolPool, nCool, rand, main[main.length - 1]);

  return {
    items: [...warm, ...main, ...cool].map((ex) => ({ ex })),
    work, rest, rounds, lowImpact,
    seconds: rounds * work + (rounds - 1) * rest,
  };
}

// Desk break: moves that ease the neck, shoulders and back come first.
const RELIEF = ['neck-tilt', 'shoulder-stretch', 'arm-circles', 'arm-swings', 'side-bend', 'torso-twist', 'tadasana-reach'];

/**
 * A short standing break for desk workers: no mat, no equipment, no jumping, gentle moves only.
 * Starts with neck/shoulder/back relief, then hips and legs, and ends with deep breathing.
 */
export function buildBreakPlan({ minutes = 3, work = 20, rest = 10, seed = todaySeed() } = {}) {
  const rand = rng(seed * 17 + minutes);
  const rounds = Math.max(3, Math.round((minutes * 60 + rest) / (work + rest)));
  const ok = (e) => !e.mat && !e.props && !isJumping(e) && e.level === 1 &&
    (['warmup', 'stretch', 'yoga'].includes(e.cat) || e.id === 'calf-raises');
  const pool = EXERCISES.filter(ok);
  const breathe = pool.find((e) => e.id === 'deep-breath');
  // Neck and shoulder moves lead, then the other back/shoulder openers.
  const top = (e) => RELIEF.indexOf(e.id) < 2;
  const reliefAll = pool.filter((e) => RELIEF.includes(e.id));
  const relief = [...shuffle(reliefAll.filter(top), rand), ...shuffle(reliefAll.filter((e) => !top(e)), rand)];
  const others = pool.filter((e) => !RELIEF.includes(e.id) && e !== breathe);

  // Relief moves fill about half the break, then a mix of the rest, then a deep breath to finish.
  const nEnd = breathe && rounds >= 4 ? 1 : 0;
  const first = relief.slice(0, Math.min(relief.length, Math.max(2, Math.ceil((rounds - nEnd) / 2))));
  const middle = take([...others, ...relief.slice(first.length)], Math.max(0, rounds - nEnd - first.length), rand, first[first.length - 1]);
  const list = [...first, ...middle, ...(nEnd ? [breathe] : [])].slice(0, rounds);
  return {
    items: list.map((ex) => ({ ex })),
    work, rest, rounds: list.length, kind: 'break',
    seconds: list.length * work + (list.length - 1) * rest,
  };
}

/** Swap items so the same exercise never appears twice in a row. Prefers swaps within the same posture group. */
function fixRepeats(list) {
  const a = list.slice();
  const clash = (i) => (i > 0 && a[i] === a[i - 1]) || (i < a.length - 1 && a[i] === a[i + 1]);
  for (let i = 1; i < a.length; i++) {
    if (a[i] !== a[i - 1]) continue;
    const order = [...a.keys()].sort((x, y) => (a[y].mat === a[i].mat) - (a[x].mat === a[i].mat));
    for (const j of order) {
      if (a[j] === a[i]) continue;
      [a[i], a[j]] = [a[j], a[i]];
      if (!clash(i) && !clash(j)) break;
      [a[i], a[j]] = [a[j], a[i]];
    }
  }
  return a;
}

/** Turn a ready-made routine into a plan: circuits in order, a longer breathing break between circuits. */
export function buildRoutinePlan(r) {
  const items = [];
  r.circuits.forEach((c, ci) => c.ids.forEach((id, i) => {
    const last = i === c.ids.length - 1;
    items.push({
      ex: byId(id), circuit: ci, circuitName: c.name, circuitSize: c.ids.length, indexInCircuit: i,
      restAfter: last ? r.circuitRest : r.rest, circuitEnd: last && ci < r.circuits.length - 1,
    });
  }));
  const seconds = items.reduce((t, it, i) => t + r.work + (i < items.length - 1 ? it.restAfter : 0), 0);
  return { items, work: r.work, rest: r.rest, rounds: items.length, seconds, routine: r };
}
