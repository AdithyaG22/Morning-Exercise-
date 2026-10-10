// Pose checker: verifies every exercise keyframe with numbers instead of screenshots.
//
//   node tools/check-poses.mjs            # check everything
//   node tools/check-poses.mjs squats     # one exercise, with a detailed contact table
//   node tools/check-poses.mjs --fit pushups 0 pitch+shF knee
//        adjusts the listed angles (a+b moves both together) until the frame meets its rules,
//        then prints the corrected numbers to paste into exercises.js
//
// Checks per keyframe:
//   ROM      every joint angle is inside the normal human range of motion
//   ON       the body parts listed in `on` touch the floor, and nothing else does
//   BALANCE  when standing, the centre of mass is over the feet
//   CLIP     a hand, foot or limb does not pass through another body part
//   TOUCH    the targets in `touch` (e.g. hand holds foot) are within reach
import * as THREE from '../vendor/three.module.min.js';
import { Avatar, expandPose, mirrorPose } from '../js/avatar.js';
import { makePrim } from '../js/skin.js';
import { EXERCISES } from '../js/exercises.js';
import { ROUTINES } from '../js/routines.js';
import { ROM, SUPPORT_TERMS } from './motion.js';

const FLOOR = 0.03;      // a marker within 3 cm of the floor counts as touching
const CLIP = -0.02;      // 2 cm inside another body part counts as passing through

const only = process.argv[2];
const av = new Avatar();
av.setBody({ heightCm: 175, weightKg: 70, sex: 'male' }, false);
const k = av.scaleFactor;

// Which bones belong to which chain, for the clip test
const chainOf = (bone) => {
  const out = new Set();
  for (let b = bone; b && b.isBone; b = b.parent) out.add(b);
  return out;
};

function markersByName() {
  const m = new Map();
  for (const o of av.markers) {
    const p = o.getWorldPosition(new THREE.Vector3());
    if (!m.has(o.name)) m.set(o.name, []);
    m.get(o.name).push({ p, bone: o.parent });
  }
  return m;
}

const lowest = (pts) => Math.min(...pts.map((x) => x.p.y));

function touching(marks) {
  const on = new Set();
  for (const [name, pts] of marks) if (lowest(pts) < FLOOR * k) on.add(name);
  return on;
}

/** Does the support term (e.g. 'feet', 'hand_R', 'back') touch the floor? Returns names that satisfy it. */
function termSatisfied(term, on) {
  const spec = SUPPORT_TERMS[term];
  if (!spec) return { ok: false, uses: [], unknown: true };
  const groups = spec.all || [spec.any];
  const uses = [];
  for (const g of groups) {
    const hit = g.filter((n) => on.has(n));
    if (!hit.length) return { ok: false, uses };
    uses.push(...hit);
  }
  // Everything in the term's family counts as expected contact
  return { ok: true, uses: [...uses, ...groups.flat()] };
}

function centreOfMass() {
  // Segment masses (% body mass, Dempster) placed at bone midpoints
  const W = (o) => o.getWorldPosition(new THREE.Vector3());
  const mid = (a, b) => W(a).add(W(b)).multiplyScalar(0.5);
  const segs = [
    [mid(av.pelvis, av.spine), 14], [mid(av.spine, av.chest), 14], [mid(av.chest, av.neck), 22], [W(av.head), 8],
  ];
  for (const s of ['L', 'R']) {
    const a = av.arms[s], l = av.legs[s];
    segs.push([mid(a.shoulder, a.elbow), 2.8], [mid(a.elbow, a.wrist), 1.6], [W(a.wrist), 0.6]);
    segs.push([mid(l.hip, l.knee), 10], [mid(l.knee, l.ankle), 4.65], [W(l.ankle), 1.45]);
  }
  const c = new THREE.Vector3();
  let m = 0;
  for (const [p, w] of segs) { c.addScaledVector(p, w); m += w; }
  return c.multiplyScalar(1 / m);
}

/** Horizontal distance (m) from the centre of mass to the support area under the feet; 0 = balanced. */
function hullDistance(pt, pts) {
  const P = pts.map((p) => [p.x, p.z]).sort((a, b) => a[0] - b[0] || a[1] - b[1]);
  const cross = (o, a, b) => (a[0] - o[0]) * (b[1] - o[1]) - (a[1] - o[1]) * (b[0] - o[0]);
  const lower = [], upper = [];
  for (const p of P) { while (lower.length >= 2 && cross(lower.at(-2), lower.at(-1), p) <= 0) lower.pop(); lower.push(p); }
  for (const p of [...P].reverse()) { while (upper.length >= 2 && cross(upper.at(-2), upper.at(-1), p) <= 0) upper.pop(); upper.push(p); }
  const hull = lower.slice(0, -1).concat(upper.slice(0, -1));
  const q = [pt.x, pt.z];
  if (hull.length >= 3 && hull.every((h, i) => cross(h, hull[(i + 1) % hull.length], q) >= 0)) return 0;
  let best = Infinity;
  const ring = hull.length ? hull : P;
  for (let i = 0; i < ring.length; i++) {
    const [ax, az] = ring[i], [bx, bz] = ring[(i + 1) % ring.length];
    const t = Math.max(0, Math.min(1, ((q[0] - ax) * (bx - ax) + (q[1] - az) * (bz - az)) / ((bx - ax) ** 2 + (bz - az) ** 2 || 1)));
    best = Math.min(best, Math.hypot(q[0] - ax - t * (bx - ax), q[1] - az - t * (bz - az)));
  }
  return best;
}

const STANDING_TERMS = /^(feet|foot_[LR]|toes|heels)$/;
/** Balance error in metres for frames that stand only on the feet, else 0. */
function balanceError(ex, frame, pose, marks) {
  const terms = (frame.on ?? ex.on ?? '').split(/\s+/).filter(Boolean);
  if (!terms.length || pose.lift > 0.01 || !terms.every((t) => STANDING_TERMS.test(t))) return 0;
  const base = [];
  for (const [n, pts] of marks) if (/^(heel|toes|foot-top)_/.test(n)) for (const x of pts) if (x.p.y < FLOOR * k) base.push(x.p);
  if (!base.length) return 0;
  return Math.max(0, hullDistance(centreOfMass(), base) - 0.02 * k) / k;   // 2 cm grace for the foot's width
}

function clipCheck(marks) {
  const inv = av.scaled.matrixWorld.clone().invert();
  const prims = av.shapes.map((s) => ({ ...makePrim(s, inv.clone().multiply(s.mesh.matrixWorld)), bone: s.bone }));
  const toLocal = (p) => p.clone().applyMatrix4(inv);
  const issues = [];
  for (const [name, pts] of marks) {
    if (!/_(L|R)$/.test(name)) continue;          // only limb points can pass through other parts
    for (const { p, bone } of pts) {
      const chain = chainOf(bone);
      const q = toLocal(p);
      for (const pr of prims) {
        if (chain.has(pr.bone)) continue;
        // ignore the neighbouring torso bone of a limb root (shoulder ↔ chest, hip ↔ pelvis)
        if ([...chain].some((b) => b.parent === pr.bone || pr.bone.parent === b)) continue;
        const d = pr.dist(q.x, q.y, q.z) * k;
        if (d < CLIP * k) issues.push(`${name} inside ${pr.bone.name || 'body'} (${Math.round(-d * 100)} cm)`);
      }
    }
  }
  return [...new Set(issues)];
}

function checkFrame(ex, frame, fi, mirrored) {
  const p = expandPose(frame);
  const pose = mirrored ? mirrorPose(p) : p;
  av.applyPose(pose);
  const problems = [];

  // ROM
  for (const [key, [lo, hi]] of Object.entries(ROM)) {
    for (const side of ['', '_L', '_R']) {
      const v = pose[key + side];
      if (v === undefined) continue;
      if (romExcess(key, v, pose, side) > 0.5) problems.push(`ROM ${key}${side}=${Math.round(v)}° (normal ${lo}…${hi})`);
    }
  }

  // Support / floor contact
  const marks = markersByName();
  const on = touching(marks);
  const spec = (frame.on ?? ex.on ?? '').split(/\s+/).filter(Boolean);
  const airborne = pose.lift > 0.01;
  const expected = new Set();
  if (!airborne) {
    for (const term of spec) {
      const r = termSatisfied(mirrored ? term.replace(/_L$/, '_X').replace(/_R$/, '_L').replace(/_X$/, '_R') : term, on);
      if (r.unknown) problems.push(`ON unknown term "${term}"`);
      else if (!r.ok) problems.push(`ON "${term}" not on the floor`);
      r.uses.forEach((n) => expected.add(n));
    }
    if (spec.length) {
      const extra = [...on].filter((n) => !expected.has(n));
      if (extra.length) problems.push(`ON also touching: ${extra.join(', ')}`);
    }
  }

  // Balance when standing on the feet only
  const off = balanceError(ex, frame, pose, marks);
  if (off > 0) problems.push(`BALANCE centre of mass ${Math.round(off * 100)} cm outside the feet`);

  // Limbs passing through the body
  for (const c of clipCheck(marks)) problems.push('CLIP ' + c);

  // Touch targets: [pointA, pointB, maxDistanceMetres]
  for (const [a, b, max = 0.06] of frame.touch || ex.touch || []) {
    const pa = marks.get(a), pb = marks.get(b);
    if (!pa || !pb) { problems.push(`TOUCH unknown point ${pa ? b : a}`); continue; }
    let best = Infinity;
    for (const x of pa) for (const y of pb) best = Math.min(best, x.p.distanceTo(y.p) / k);
    if (best > max) problems.push(`TOUCH ${a} → ${b} is ${Math.round(best * 100)} cm (want ≤ ${Math.round(max * 100)})`);
  }

  if (only) {
    const h = [...marks].map(([n, pts]) => [n, Math.round((lowest(pts) / k) * 100)]).sort((a, b) => a[1] - b[1]);
    console.log(`  #${fi}${mirrored ? ' (other side)' : ''} height above floor (cm): ${h.slice(0, 12).map(([n, v]) => `${n} ${v}`).join(', ')}`);
  }
  return problems;
}

// ---------- Fitter ----------
/** How far a frame is from meeting its rules (0 = perfect). Units: metres² plus scaled degrees². */
function cost(ex, frame) {
  const pose = expandPose(frame);
  av.applyPose(pose);
  let c = 0;
  for (const [key, [lo, hi]] of Object.entries(ROM)) {
    for (const side of ['', '_L', '_R']) {
      const v = pose[key + side];
      if (v !== undefined) c += romExcess(key, v, pose, side) ** 2 * 1e-4;
    }
  }
  const marks = markersByName();
  const height = (n) => (marks.has(n) ? lowest(marks.get(n)) / k : Infinity);
  const expected = new Set();
  for (const term of (frame.on ?? ex.on ?? '').split(/\s+/).filter(Boolean)) {
    const spec = SUPPORT_TERMS[term];
    for (const g of spec.all || [spec.any]) {
      c += Math.min(...g.map(height)) ** 2 * 50;
      g.forEach((n) => expected.add(n));
    }
  }
  c += balanceError(ex, frame, pose, marks) ** 2 * 50;
  for (const [n] of marks) {               // keep everything else off the floor
    if (!expected.has(n)) c += Math.max(0, FLOOR + 0.01 - height(n)) ** 2 * 50;
  }
  for (const [a, b, max = 0.06] of frame.touch || ex.touch || []) {
    let best = Infinity;
    for (const x of marks.get(a)) for (const y of marks.get(b)) best = Math.min(best, x.p.distanceTo(y.p) / k);
    c += Math.max(0, best - max) ** 2 * 50;
  }
  return c;
}

/** Nelder–Mead search over the chosen angles. Each param may join keys with '+' to move them together. */
function fit(ex, frame, params) {
  const apply = (x) => {
    const f = { ...frame };
    params.forEach((p, i) => p.split('+').forEach((key) => {
      const base = frame[key] ?? expandPose(frame)[key] ?? 0;
      f[key] = Math.round((base + x[i]) * 10) / 10;
    }));
    return f;
  };
  const reg = (x) => x.reduce((s, v) => s + (v / 40) ** 2 * 1e-4, 0);
  const F = (x) => cost(ex, apply(x)) + reg(x);
  const n = params.length;
  let simplex = [new Array(n).fill(0)];
  for (let i = 0; i < n; i++) { const v = new Array(n).fill(0); v[i] = 12; simplex.push(v); }
  let vals = simplex.map(F);
  for (let it = 0; it < 300 * n; it++) {
    const order = vals.map((v, i) => i).sort((a, b) => vals[a] - vals[b]);
    simplex = order.map((i) => simplex[i]); vals = order.map((i) => vals[i]);
    const cen = new Array(n).fill(0);
    for (let i = 0; i < n; i++) for (let d = 0; d < n; d++) cen[d] += simplex[i][d] / n;
    const pt = (t) => cen.map((c, d) => c + t * (simplex[n][d] - c));
    const xr = pt(-1), fr = F(xr);
    if (fr < vals[0]) { const xe = pt(-2), fe = F(xe); [simplex[n], vals[n]] = fe < fr ? [xe, fe] : [xr, fr]; }
    else if (fr < vals[n - 1]) { simplex[n] = xr; vals[n] = fr; }
    else {
      const xc = pt(0.5), fc = F(xc);
      if (fc < vals[n]) { simplex[n] = xc; vals[n] = fc; }
      else for (let i = 1; i <= n; i++) { simplex[i] = simplex[i].map((v, d) => simplex[0][d] + 0.5 * (v - simplex[0][d])); vals[i] = F(simplex[i]); }
    }
  }
  const best = apply(simplex[0]);
  return { frame: best, before: cost(ex, frame), after: cost(ex, best) };
}

if (process.argv[2] === '--fit') {
  const [, , , id, fi, ...params] = process.argv;
  const ex = EXERCISES.find((e) => e.id === id);
  const r = fit(ex, ex.frames[+fi], params);
  const keys = new Set(params.flatMap((p) => p.split('+')));
  console.log(`${id} #${fi}: cost ${r.before.toFixed(4)} → ${r.after.toFixed(4)}`);
  console.log('  ' + [...keys].map((key) => `${key}: ${r.frame[key]}`).join(', '));
  console.log('  ' + checkFrame(ex, r.frame, +fi, false).join(' | ') || '  ✓ passes');
  process.exit(0);
}

/** Degrees outside the normal range. Angles wrap at 360° (a full arm circle ends where it began), and
 *  an arm that is out to the side (abduction ≥ 60°) may also move behind the body. */
function romExcess(key, v, pose, side) {
  let a = ((v + 180) % 360 + 360) % 360 - 180;
  if (Math.abs(v) <= 180) a = v;
  const [lo, hi] = ROM[key];
  if (key === 'shF' && a < lo && (pose['shAbd' + side] ?? 0) >= 60) return 0;
  return Math.max(0, lo - a) + Math.max(0, a - hi);
}

let total = 0, bad = 0;
for (const ex of EXERCISES) {
  if (only && ex.id !== only) continue;
  const lines = [];
  ex.frames.forEach((f, i) => {
    total++;
    const probs = checkFrame(ex, f, i, false);
    if (probs.length) { bad++; lines.push(`  #${i}: ${probs.join(' | ')}`); }
  });
  if (lines.length || only) console.log(`${lines.length ? '✗' : '✓'} ${ex.id}\n${lines.join('\n')}`);
}
// Every exercise a routine names must exist
for (const r of ROUTINES) {
  for (const c of r.circuits) for (const id of c.ids) {
    if (!EXERCISES.some((e) => e.id === id)) { bad++; console.log(`✗ routine ${r.id}: unknown exercise "${id}"`); }
  }
}

console.log(`\n${total - bad}/${total} keyframes pass`);
process.exitCode = bad ? 1 : 0;
