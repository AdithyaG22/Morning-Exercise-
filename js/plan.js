// Builds a workout: warm-up → main block → cool-down, filled to the chosen duration.
import { EXERCISES } from './exercises.js';

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

export function buildPlan({ minutes = 15, level = 1, focus = 'full', work = 20, rest = 10, seed = todaySeed() }) {
  const rand = rng(seed * 31 + level * 7 + focus.length);
  const rounds = Math.max(4, Math.round((minutes * 60 + rest) / (work + rest)));
  const f = FOCUS[focus] || FOCUS.full;
  const ok = (e) => e.level <= level;
  // Weight exercises at the chosen level higher so harder plans feel harder.
  const weighted = (list) => list.flatMap((e) => (e.level === level && level > 1 ? [e, e] : [e]));

  const gentle = focus === 'yoga' || focus === 'desk';
  const warmPool = EXERCISES.filter((e) => e.cat === 'warmup' && ok(e) && (!gentle || e.met < 3.2));
  const coolPool = EXERCISES.filter((e) => (e.cat === 'stretch' || (e.cat === 'yoga' && e.met <= 2.5)) && ok(e));
  let mainPool = EXERCISES.filter((e) => f.main.includes(e.cat) && ok(e));
  const extras = shuffle(EXERCISES.filter((e) => f.extra.includes(e.cat) && ok(e)), rand).slice(0, 3);
  mainPool = weighted([...mainPool, ...extras]);
  if (focus === 'desk') mainPool = [...mainPool, ...EXERCISES.filter((e) => e.cat === 'warmup' && e.met < 3)];

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
    work, rest, rounds,
    seconds: rounds * work + (rounds - 1) * rest,
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
