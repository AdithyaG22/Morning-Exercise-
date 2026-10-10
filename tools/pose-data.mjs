// Body data for any exercise keyframe: a stick figure as numbers and text, no 3D rendering needed.
//
//   node tools/pose-data.mjs seated-twist            # every keyframe of one exercise
//   node tools/pose-data.mjs seated-twist 0          # one keyframe
//   node tools/pose-data.mjs seated-twist 0 --mirror # the other side of a one-sided pose
//   node tools/pose-data.mjs seated-twist --json     # machine-readable keypoints
//   node tools/pose-data.mjs seated-twist 0 --svg out.svg   # front/side/top stick-figure drawing
//   node tools/pose-data.mjs --root ../other-worktree seated-twist   # use another copy of the repo
//
// For each keyframe it prints:
//   • KEYPOINTS: 3D positions in cm of a 175 cm body (MediaPipe-style names: nose, left_shoulder,
//     left_elbow, left_wrist, left_index, left_hip, left_knee, left_ankle, left_heel, left_foot_index …).
//     World axes: y up (floor = 0); x = the trainer's left when it faces forward; z = forward.
//     "body" columns use the pelvis's own axes (x = its left, y = up its spine, z = its front),
//     so left/right/front/back stay meaningful even when lying down.
//   • SEGMENTS: where each body part points, in words (e.g. "left shin: 3° from vertical, down").
//   • CONTACTS: body parts on the floor, body parts touching each other (< 8 cm), crossed limbs.
//   • VIEWS: ASCII stick figures seen from the front, the side and above.
import * as THREE from '../vendor/three.module.min.js';

const args = process.argv.slice(2);
const flag = (name) => { const i = args.indexOf(name); if (i < 0) return null; const v = args[i + 1]; args.splice(i, 2); return v; };
const has = (name) => { const i = args.indexOf(name); if (i < 0) return false; args.splice(i, 1); return true; };
const root = flag('--root') || new URL('..', import.meta.url).pathname;
const svgOut = flag('--svg');
const asJson = has('--json');
const mirrored = has('--mirror');
const [id, frameArg] = args;
if (!id) { console.log('usage: node tools/pose-data.mjs <exercise-id> [frame] [--mirror] [--json] [--svg file] [--root path]'); process.exit(1); }

const { Avatar, expandPose, mirrorPose } = await import(`${root}/js/avatar.js`);
const { EXERCISES } = await import(`${root}/js/exercises.js`);
const ex = EXERCISES.find((e) => e.id === id);
if (!ex) { console.log(`unknown exercise "${id}"`); process.exit(1); }

const av = new Avatar();
av.setBody({ heightCm: 175, weightKg: 70, sex: 'male' }, false);
const k = av.scaleFactor;
const cm = (v) => Math.round(v * 100);   // world units are metres on a 175 cm person
const W = (o) => o.getWorldPosition(new THREE.Vector3());
const marker = (name) => av.markers.filter((m) => m.name === name).map(W);
const lowestOf = (name) => marker(name).reduce((a, b) => (b.y < a.y ? b : a));

/** MediaPipe-style keypoints (plus a few extra spine points). */
function keypoints() {
  const kp = {};
  const headTop = marker('head')[0], face = marker('face')[0];
  kp.head_top = headTop;
  kp.nose = face;
  kp.neck = W(av.neck);
  kp.chest = W(av.chest);
  kp.mid_hip = W(av.pelvis);
  for (const [s, side] of [['L', 'left'], ['R', 'right']]) {
    const a = av.arms[s], l = av.legs[s];
    kp[`${side}_shoulder`] = W(a.shoulder);
    kp[`${side}_elbow`] = W(a.elbow);
    kp[`${side}_wrist`] = W(a.wrist);
    kp[`${side}_index`] = marker(`hand_${s}`).reduce((p, q) => (q.distanceTo(W(a.wrist)) > p.distanceTo(W(a.wrist)) ? q : p));
    kp[`${side}_hip`] = W(l.hip);
    kp[`${side}_knee`] = W(l.knee);
    kp[`${side}_ankle`] = W(l.ankle);
    kp[`${side}_heel`] = marker(`heel_${s}`)[0];
    kp[`${side}_foot_index`] = marker(`toes_${s}`)[0];
  }
  return kp;
}

const SEGMENTS = [
  ['torso', 'mid_hip', 'neck'], ['head', 'neck', 'head_top'],
  ['left upper arm', 'left_shoulder', 'left_elbow'], ['left forearm', 'left_elbow', 'left_wrist'],
  ['right upper arm', 'right_shoulder', 'right_elbow'], ['right forearm', 'right_elbow', 'right_wrist'],
  ['left thigh', 'left_hip', 'left_knee'], ['left shin', 'left_knee', 'left_ankle'], ['left foot', 'left_heel', 'left_foot_index'],
  ['right thigh', 'right_hip', 'right_knee'], ['right shin', 'right_knee', 'right_ankle'], ['right foot', 'right_heel', 'right_foot_index'],
];
const BONES = [
  ['head_top', 'neck', 'T'], ['neck', 'chest', 'T'], ['chest', 'mid_hip', 'T'],
  ['neck', 'left_shoulder', 'L'], ['left_shoulder', 'left_elbow', 'L'], ['left_elbow', 'left_wrist', 'L'], ['left_wrist', 'left_index', 'L'],
  ['neck', 'right_shoulder', 'R'], ['right_shoulder', 'right_elbow', 'R'], ['right_elbow', 'right_wrist', 'R'], ['right_wrist', 'right_index', 'R'],
  ['mid_hip', 'left_hip', 'L'], ['left_hip', 'left_knee', 'L'], ['left_knee', 'left_ankle', 'L'], ['left_heel', 'left_foot_index', 'L'], ['left_ankle', 'left_heel', 'L'],
  ['mid_hip', 'right_hip', 'R'], ['right_hip', 'right_knee', 'R'], ['right_knee', 'right_ankle', 'R'], ['right_heel', 'right_foot_index', 'R'], ['right_ankle', 'right_heel', 'R'],
];

/** Direction of a segment in words, in world terms (up/down/forward/back/left/right). */
function describeDir(v) {
  const d = v.clone().normalize();
  const fromUp = Math.round(THREE.MathUtils.radToDeg(Math.acos(Math.max(-1, Math.min(1, d.y)))));
  const vertical = fromUp <= 15 ? 'pointing up' : fromUp >= 165 ? 'pointing down' : fromUp >= 75 && fromUp <= 105 ? 'level' : fromUp < 90 ? 'angled up' : 'angled down';
  const h = [];
  if (Math.abs(d.z) > 0.25) h.push(d.z > 0 ? 'forward' : 'back');
  if (Math.abs(d.x) > 0.25) h.push(d.x > 0 ? "to the trainer's left" : "to the trainer's right");
  return `${fromUp}° from straight up, ${vertical}${h.length ? ', ' + h.join(' and ') : ''}`;
}

function analyse(pose) {
  av.applyPose(pose);
  const kp = keypoints();
  const inv = new THREE.Matrix4().copy(av.pelvis.matrixWorld).invert();
  const body = (p) => p.clone().applyMatrix4(inv).multiplyScalar(k);   // pelvis-local, in real metres
  const out = { keypoints: {}, body: {}, segments: {}, floor: [], touching: [], notes: [] };
  for (const [n, p] of Object.entries(kp)) {
    out.keypoints[n] = [cm(p.x), cm(p.y), cm(p.z)];
    const b = body(p);
    out.body[n] = [Math.round(b.x * 100), Math.round(b.y * 100), Math.round(b.z * 100)];
  }
  for (const [name, a, b] of SEGMENTS) out.segments[name] = describeDir(kp[b].clone().sub(kp[a]));

  // Floor contacts (named markers within 3 cm of the floor)
  const names = [...new Set(av.markers.map((m) => m.name))];
  for (const n of names) { const h = cm(lowestOf(n).y); if (h <= 3) out.floor.push(`${n} ${h} cm`); }

  // Body parts touching each other (< 8 cm), excluding neighbours on the same limb
  const pts = ['hand_L', 'hand_R', 'elbow_L', 'elbow_R', 'forearm_L', 'forearm_R', 'knee_L', 'knee_R', 'shin_L', 'shin_R',
    'heel_L', 'heel_R', 'toes_L', 'toes_R', 'foot-top_L', 'foot-top_R', 'head', 'head-back', 'face', 'chin', 'chest', 'belly', 'back', 'seat', 'shoulder_L', 'shoulder_R'];
  const limb = (n) => n.match(/_(L|R)$/)?.[1] + (/(hand|elbow|forearm)/.test(n) ? 'arm' : /(knee|shin|heel|toes|foot)/.test(n) ? 'leg' : '');
  for (let i = 0; i < pts.length; i++) for (let j = i + 1; j < pts.length; j++) {
    const a = pts[i], b = pts[j];
    if (limb(a) && limb(a) === limb(b)) continue;
    if (/^(head|head-back|face|chin)$/.test(a) && /^(head|head-back|face|chin)$/.test(b)) continue;
    if (/^(chest|belly|back|seat)$/.test(a) && /^(chest|belly|back|seat)$/.test(b)) continue;
    let best = Infinity;
    for (const p of marker(a)) for (const q of marker(b)) best = Math.min(best, p.distanceTo(q));
    const d = cm(best);
    if (d < 8) out.touching.push(`${a} ↔ ${b}: ${d} cm`);
  }

  // Crossing and placement, in the body's own left/right
  const bx = (n) => out.body[n][0];
  if (bx('left_ankle') < bx('right_ankle')) out.notes.push('ankles crossed (left ankle is right of the right ankle)');
  if (bx('left_knee') < bx('right_knee')) out.notes.push('knees crossed');
  if (bx('left_ankle') < bx('right_knee') && bx('left_ankle') < bx('right_hip')) out.notes.push('left foot is across the right leg');
  if (bx('right_ankle') > bx('left_knee') && bx('right_ankle') > bx('left_hip')) out.notes.push('right foot is across the left leg');
  if (bx('left_wrist') < 0) out.notes.push("left hand crosses the body's midline");
  if (bx('right_wrist') > 0) out.notes.push("right hand crosses the body's midline");
  for (const s of ['left', 'right']) {
    const w = kp[`${s}_wrist`], top = kp.head_top;
    if (w.y > top.y) out.notes.push(`${s} hand above the head`);
  }
  out.notes.push(`torso: ${describeDir(kp.neck.clone().sub(kp.mid_hip))}`);
  out.kp = kp;
  return out;
}

/** ASCII stick figure: project keypoints onto a plane and draw the bones. */
function ascii(kp, axisH, axisV, flipH = false, w = 46, h = 22) {
  const pts = Object.values(kp);
  const H = (p) => (flipH ? -1 : 1) * p[axisH], V = (p) => p[axisV];
  const minH = Math.min(...pts.map(H)), maxH = Math.max(...pts.map(H));
  const minV = Math.min(0, ...pts.map(V)), maxV = Math.max(...pts.map(V));
  const span = Math.max(maxH - minH, (maxV - minV) * 2.1, 0.5);
  const sx = (w - 3) / span, sy = sx / 2.1;
  const cH = (minH + maxH) / 2;
  const grid = Array.from({ length: h }, () => Array(w).fill(' '));
  const put = (x, y, c) => { if (y >= 0 && y < h && x >= 0 && x < w) grid[y][x] = c; };
  const toXY = (p) => [Math.round(w / 2 + (H(p) - cH) * sx), Math.round(h - 2 - (V(p) - minV) * sy)];
  if (axisV === 'y') for (let x = 0; x < w; x++) put(x, Math.round(h - 2 + minV * sy), '=');
  for (const [a, b, c] of BONES) {
    const [x0, y0] = toXY(kp[a]), [x1, y1] = toXY(kp[b]);
    const n = Math.max(Math.abs(x1 - x0), Math.abs(y1 - y0), 1);
    for (let i = 0; i <= n; i++) put(Math.round(x0 + ((x1 - x0) * i) / n), Math.round(y0 + ((y1 - y0) * i) / n), c);
  }
  const [hx, hy] = toXY(kp.head_top); put(hx, hy, 'O');
  const rows = grid.map((r) => r.join('').replace(/\s+$/, ''));
  while (rows.length && !rows[0]) rows.shift();   // drop empty rows above the figure
  return rows.join('\n');
}

function svg(frames) {
  const views = [['front (as the camera sees it)', 'x', 'y', true], ['side (trainer facing left)', 'z', 'y', true], ['top (forward = up)', 'x', 'z', true]];
  const cell = 220, pad = 16;
  let body = '';
  frames.forEach((f, fi) => views.forEach(([title, ah, av2, flip], vi) => {
    const kp = f.kp; const pts = Object.values(kp);
    const H = (p) => (flip ? -1 : 1) * p[ah], V = (p) => p[av2];
    const minH = Math.min(...pts.map(H)), maxH = Math.max(...pts.map(H)), minV = Math.min(av2 === 'y' ? 0 : Infinity, ...pts.map(V)), maxV = Math.max(...pts.map(V));
    const s = (cell - 2 * pad) / Math.max(maxH - minH, maxV - minV, 0.5);
    const ox = vi * cell, oy = fi * (cell + 20);
    const X = (p) => ox + cell / 2 + (H(p) - (minH + maxH) / 2) * s, Y = (p) => oy + 20 + cell - pad - (V(p) - minV) * s;
    body += `<text x="${ox + 6}" y="${oy + 14}" font-size="11" fill="#333">#${f.index} ${title}</text>`;
    if (av2 === 'y') body += `<line x1="${ox}" x2="${ox + cell}" y1="${oy + 20 + cell - pad + minV * s}" y2="${oy + 20 + cell - pad + minV * s}" stroke="#bbb"/>`;
    for (const [a, b, c] of BONES) body += `<line x1="${X(kp[a]).toFixed(1)}" y1="${Y(kp[a]).toFixed(1)}" x2="${X(kp[b]).toFixed(1)}" y2="${Y(kp[b]).toFixed(1)}" stroke="${c === 'L' ? '#2563eb' : c === 'R' ? '#dc2626' : '#111'}" stroke-width="3" stroke-linecap="round"/>`;
    body += `<circle cx="${X(kp.head_top).toFixed(1)}" cy="${Y(kp.head_top).toFixed(1)}" r="6" fill="#111"/>`;
  }));
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${cell * 3}" height="${frames.length * (cell + 20)}" style="background:#fff;font-family:sans-serif">${body}</svg>`;
}

const idx = frameArg !== undefined ? [Number(frameArg)] : ex.frames.map((_, i) => i);
const results = idx.map((i) => {
  const p = expandPose(ex.frames[i]);
  const r = analyse(mirrored ? mirrorPose(p) : p);
  r.index = i;
  return r;
});

if (svgOut) {
  (await import('fs')).writeFileSync(svgOut, svg(results));
  console.log(`wrote ${svgOut} (blue = left side, red = right side)`);
}
if (asJson) {
  console.log(JSON.stringify(results.map(({ kp, ...r }) => r), null, 1));
} else if (!svgOut) {
  console.log(`${ex.name} (${ex.id})${mirrored ? ' — other side' : ''}  ·  floor: ${ex.on || '—'}  ·  tips: ${ex.tips}`);
  for (const r of results) {
    console.log(`\n── keyframe #${r.index} ${'─'.repeat(50)}`);
    console.log('KEYPOINTS cm   world [x left+, y up, z fwd]   body [x its left, y its up, z its front]');
    for (const [n, p] of Object.entries(r.keypoints)) console.log(`  ${n.padEnd(17)} ${p.map((v) => String(v).padStart(5)).join('')}    ${r.body[n].map((v) => String(v).padStart(5)).join('')}`);
    console.log('SEGMENTS');
    for (const [n, d] of Object.entries(r.segments)) console.log(`  ${n.padEnd(16)} ${d}`);
    console.log(`ON FLOOR  ${r.floor.join(', ') || '—'}`);
    console.log(`TOUCHING  ${r.touching.join(', ') || '—'}`);
    console.log(`NOTES     ${r.notes.join('; ')}`);
    console.log('VIEWS  (T = head/torso, L = trainer\'s left limbs, R = right limbs, O = head, = floor)');
    const front = ascii(r.kp, 'x', 'y', true).split('\n'), side = ascii(r.kp, 'z', 'y', true).split('\n'), top = ascii(r.kp, 'x', 'z', true).split('\n');
    const rows = Math.max(front.length, side.length, top.length);
    console.log('  ' + 'FRONT'.padEnd(48) + 'SIDE (facing left)'.padEnd(48) + 'TOP (forward = up)');
    for (let i = 0; i < rows; i++) console.log('  ' + (front[i] || '').padEnd(48) + (side[i] || '').padEnd(48) + (top[i] || ''));
  }
}
