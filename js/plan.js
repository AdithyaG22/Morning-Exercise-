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

// ---------------- Sequencing (see docs/SEQUENCING.md) ----------------
// Warm-up follows RAMP: Raise the heart rate gently, Mobilise joints with moving stretches, then build up.
// The main block alternates body areas, builds to a peak and eases off, and goes down to the floor once.
// The cool-down lowers intensity and uses held stretches. Yoga backbends are followed by a counter-pose.

const UPPER = ['chest', 'triceps', 'shoulders', 'biceps', 'back', 'forearms', 'traps', 'neck'];
const LOWER = ['quads', 'glutes', 'hamstrings', 'calves', 'adductors', 'hipFlexors'];
const CORE = ['abs', 'obliques', 'lowerBack'];
const RAISE = ['march', 'step-jacks', 'arm-swings', 'boxing-punches'];          // gentle pulse raisers
const POSTURES = ['standing', 'prone', 'kneeling', 'side', 'seated', 'supine'];  // natural way down to the floor
const COUNTER = { prone: 'childs-pose', supine: 'knees-to-chest' };             // counter-pose after a backbend

/** Main body area worked: 'upper' | 'lower' | 'core', or 'cardio' for whole-body cardio moves. */
export function region(e) {
  if (e.cat === 'cardio') return 'cardio';
  const c = { upper: 0, lower: 0, core: 0 };
  e.muscles.forEach((m, i) => {
    const w = i === 0 ? 2 : 1;   // the first muscle listed is the main one
    if (UPPER.includes(m)) c.upper += w; else if (LOWER.includes(m)) c.lower += w; else if (CORE.includes(m)) c.core += w;
  });
  return Object.keys(c).reduce((a, b) => (c[b] > c[a] ? b : a));
}

/** Body position the exercise starts in, used to keep floor work in a natural order. */
export function posture(e) {
  if (!e.mat) return 'standing';
  const f = e.frames[0];
  const pitch = f.pitch ?? 0, on = f.on ?? e.on ?? '';
  if (Math.abs(f.roll ?? 0) > 45) return 'side';
  if (/feet|foot/.test(on) && !/knee|shin|hand|seat|back|front/.test(on) && Math.abs(pitch) < 60) return 'standing';   // standing yoga poses on the mat
  if (pitch < -60) return 'supine';
  if (/seat/.test(on) || pitch < -10) return 'seated';
  if (pitch > 45 && (/front/.test(on) || !/knee|shin/.test(on))) return 'prone';   // face down or in a plank
  return 'kneeling';
}

const isHold = (e) => e.frames.length === 1;
const isBackbend = (e) => e.cat === 'yoga' && e.frames.some((f) => (f.spineF ?? 0) <= -20);

/** Order a group so body areas alternate, intensity builds to a peak (~65 %) and eases off,
 *  bigger multi-muscle moves come early, and hard cardio moves are never back to back. */
function arrange(group, rand, prevBefore) {
  if (group.length < 2) return group.slice();
  const mets = group.map((e) => e.met);
  const lo = Math.min(...mets), hi = Math.max(...mets);
  const left = group.slice(), out = [];
  const n = group.length;
  while (left.length) {
    const pos = out.length / (n - 1);
    const bell = pos <= 0.65 ? pos / 0.65 : 1 - ((pos - 0.65) / 0.35) * 0.5;   // 0 → 1 at 65 % → 0.5
    const target = lo + (hi - lo) * bell;
    const prev = out.length ? out[out.length - 1] : prevBefore;
    let best = 0, bestScore = -Infinity;
    left.forEach((e, i) => {
      let sc = -Math.abs(e.met - target) / Math.max(1, hi - lo) * 2;
      if (prev && e === prev) sc -= 10;
      if (prev && region(e) === region(prev)) sc -= 1.5;
      if (prev && prev.met >= 7 && e.met >= 7) sc -= 1.5;
      sc += (e.muscles.length >= 4 ? 0.4 : 0) * (1 - pos);   // big compound moves earlier
      sc += rand() * 0.3;
      if (sc > bestScore) { bestScore = sc; best = i; }
    });
    out.push(left.splice(best, 1)[0]);
  }
  return out;
}

/** Arrange a main block: standing first, then down to the floor once, each posture group arranged. */
function sequenceMain(list, rand, prevBefore) {
  const groups = POSTURES.map((p) => list.filter((e) => posture(e) === p));
  const out = [];
  for (const g of groups) out.push(...arrange(g, rand, out[out.length - 1] ?? prevBefore));
  const flow = out.findIndex((e) => e.id === 'sun-salutation-half');   // a flow warms up the yoga block
  if (flow > 0) out.unshift(...out.splice(flow, 1));
  return out;
}

/** After a backbend, put a counter-pose next (moving one from later, or swapping one in). */
function addCounterPoses(list, pool) {
  const a = list.slice();
  for (let i = 0; i < a.length; i++) {
    if (!isBackbend(a[i])) continue;
    const want = COUNTER[posture(a[i])];
    if (!want || a[i + 1]?.id === want) continue;
    const j = a.findIndex((e, k) => k > i && e.id === want);
    if (j > 0) { a.splice(i + 1, 0, a.splice(j, 1)[0]); continue; }
    const counter = pool.find((e) => e.id === want);
    if (counter && i + 1 < a.length && !isBackbend(a[i + 1])) a[i + 1] = counter;
  }
  return a;
}

/** Warm-up: one pulse raiser first, then mobility moves from gentlest to most active. Moving moves only. */
function warmUp(pool, n, rand) {
  const moving = pool.filter((e) => !isHold(e));
  const raisers = shuffle(moving.filter((e) => RAISE.includes(e.id)), rand);
  const first = raisers[0];
  const rest = take(moving.filter((e) => e !== first), n - (first ? 1 : 0), rand, first);
  // Gentlest to most active; if the pool is small and moves repeat, do a second gentle-to-active round
  const rounds = [];
  for (const e of rest) {
    const r = rounds.find((x) => !x.includes(e)) || (rounds.push([]), rounds[rounds.length - 1]);
    r.push(e);
  }
  return fixRepeats([...(first ? [first] : []), ...rounds.flatMap((r) => r.sort((a, b) => a.met - b.met))]);
}

/** Cool-down: stretches for the muscles just worked, held still, in an order that continues from where
 *  the main block ended (no getting up and down); Deep Breathing closes when the session ends standing. */
function coolDown(pool, n, rand, worked, lastPosture, used) {
  // Prefer stretches for the muscles just worked, and ones not already done in the main block
  const score = (e) => e.muscles.filter((m) => worked.has(m)).length - (used.includes(e) ? 3 : 0) + rand();
  const picked = shuffle(pool, rand).sort((a, b) => score(b) - score(a));
  const chosen = [];
  for (const e of picked) { if (chosen.length < n && !chosen.includes(e)) chosen.push(e); }
  while (chosen.length < n && pool.length) chosen.push(pool[chosen.length % pool.length]);
  const breathe = chosen.filter((e) => e.id === 'deep-breath');
  const stretches = chosen.filter((e) => e.id !== 'deep-breath');
  const order = lastPosture === 'standing' ? POSTURES : [...POSTURES.slice(1), 'standing'];
  stretches.sort((a, b) => order.indexOf(posture(a)) - order.indexOf(posture(b)));
  return lastPosture === 'standing' ? [...breathe, ...stretches] : [...stretches, ...breathe];
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

  const warm = warmUp(warmPool, nWarm, rand);
  const picked = take(mainPool, nMain, rand, warm[warm.length - 1]);
  // When moves must repeat (long session, small pool), run it like a circuit: each round has every move
  // at most once, ordered standing → floor, and the next round starts standing again.
  const circuits = [];
  for (const e of picked) (circuits.find((c) => !c.includes(e)) || (circuits.push([]), circuits[circuits.length - 1])).push(e);
  let main = [];
  for (const c of circuits) {
    let round = sequenceMain(c, rand, main[main.length - 1] ?? warm[warm.length - 1]);
    if (focus === 'yoga' || focus === 'desk') round = addCounterPoses(round, EXERCISES.filter(ok));
    if (round[0] === main[main.length - 1] && round.length > 1) [round[0], round[1]] = [round[1], round[0]];
    main.push(...round);
  }
  main = fixRepeats(main);
  if (main[0] === warm[warm.length - 1] && main.length > 1) [main[0], main[1]] = [main[1], main[0]];
  const worked = new Set(main.flatMap((e) => e.muscles));
  const cool = coolDown(coolPool, nCool, rand, worked, posture(main[main.length - 1]), main);
  if (cool[0] === main[main.length - 1] && cool.length > 1) [cool[0], cool[1]] = [cool[1], cool[0]];

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

/** Swap items so the same exercise never appears twice in a row. Only swaps within the same body
 *  position (so standing and floor work stay together) and never moves a counter-pose off its backbend. */
function fixRepeats(list) {
  const a = list.slice();
  const clash = (i) => (i > 0 && a[i] === a[i - 1]) || (i < a.length - 1 && a[i] === a[i + 1]);
  const pinned = (k) => k > 0 && isBackbend(a[k - 1]) && Object.values(COUNTER).includes(a[k].id);
  for (let i = 1; i < a.length; i++) {
    if (a[i] !== a[i - 1]) continue;
    const order = [...a.keys()].filter((j) => posture(a[j]) === posture(a[i]))
      .concat([...a.keys()].filter((j) => posture(a[j]) !== posture(a[i])));
    for (const j of order) {
      if (a[j] === a[i] || pinned(j) || pinned(i)) continue;
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
