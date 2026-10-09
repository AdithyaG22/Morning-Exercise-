// Procedural 3D trainer built from simple shapes — no model files to download.
// Every visible muscle is its own mesh grouped by muscle name so it can glow.
import * as THREE from '../vendor/three.module.min.js';

export const MUSCLES = {
  neck: 'Neck',
  traps: 'Traps',
  shoulders: 'Shoulders',
  chest: 'Chest',
  back: 'Upper back',
  biceps: 'Biceps',
  triceps: 'Triceps',
  forearms: 'Forearms',
  abs: 'Abs',
  obliques: 'Obliques',
  lowerBack: 'Lower back',
  glutes: 'Glutes',
  hipFlexors: 'Hip flexors',
  quads: 'Quads',
  hamstrings: 'Hamstrings',
  adductors: 'Inner thighs',
  calves: 'Calves',
};

const D = THREE.MathUtils.degToRad;
const BASE_HEIGHT = 1.83; // model height in metres before scaling

const LIMB_KEYS = ['shF', 'shAbd', 'shRot', 'elbow', 'wrist', 'hipF', 'hipAbd', 'hipRot', 'knee', 'ankle'];
const MIRROR_NEG = ['yaw', 'roll', 'spineSide', 'spineTwist', 'neckSide', 'neckTurn', 'x'];

export const NEUTRAL = {
  pitch: 0, yaw: 0, roll: 0, lift: 0, x: 0, z: 0,
  spineF: 0, spineSide: 0, spineTwist: 0,
  neckF: 0, neckSide: 0, neckTurn: 0,
  shF_L: 0, shF_R: 0, shAbd_L: 8, shAbd_R: 8, shRot_L: 0, shRot_R: 0,
  elbow_L: 6, elbow_R: 6, wrist_L: 0, wrist_R: 0,
  hipF_L: 0, hipF_R: 0, hipAbd_L: 3, hipAbd_R: 3, hipRot_L: 0, hipRot_R: 0,
  knee_L: 0, knee_R: 0, ankle_L: 0, ankle_R: 0,
};

/** Expand shorthand (keys without _L/_R apply to both sides) into a full pose. */
export function expandPose(p) {
  const out = { ...NEUTRAL };
  for (const [k, v] of Object.entries(p)) {
    if (LIMB_KEYS.includes(k)) { out[k + '_L'] = v; out[k + '_R'] = v; }
    else out[k] = v;
  }
  return out;
}

/** Left/right mirror image of a full pose. */
export function mirrorPose(p) {
  const out = { ...p };
  for (const k of LIMB_KEYS) { out[k + '_L'] = p[k + '_R']; out[k + '_R'] = p[k + '_L']; }
  for (const k of MIRROR_NEG) out[k] = -p[k];
  return out;
}

export function lerpPose(a, b, t, out = {}) {
  for (const k in NEUTRAL) out[k] = a[k] + (b[k] - a[k]) * t;
  return out;
}

const COLORS = {
  body: 0xc7d0dc,
  muscle: 0xd99a8c,
  hair: 0x3b302b,
  shoe: 0x39424e,
  active: new THREE.Color(0xff3d1f),
  activeGlow: new THREE.Color(0xff2200),
  next: new THREE.Color(0xffa340),
};

export class Avatar {
  constructor() {
    this.object = new THREE.Group();   // grounded container (y offset)
    this.scaled = new THREE.Group();   // height scale
    this.object.add(this.scaled);
    this.markers = [];
    this.muscleMats = {};
    this.girthTargets = [];
    this.highlight = new Set();
    this.mode = 'active';

    this.bodyMat = new THREE.MeshStandardMaterial({ color: COLORS.body, roughness: 0.55, metalness: 0.05 });
    this.hairMat = new THREE.MeshStandardMaterial({ color: COLORS.hair, roughness: 0.9 });
    this.shoeMat = new THREE.MeshStandardMaterial({ color: COLORS.shoe, roughness: 0.7 });
    for (const m of Object.keys(MUSCLES)) {
      this.muscleMats[m] = new THREE.MeshStandardMaterial({
        color: COLORS.muscle, roughness: 0.5, metalness: 0.0, emissive: 0x000000,
      });
    }
    this.sphere = new THREE.SphereGeometry(1, 24, 16);
    this.build();
    this.setBody({ heightCm: 170, weightKg: 65, sex: 'male' });
  }

  joint(parent, x, y, z) {
    const g = new THREE.Group();
    g.position.set(x, y, z);
    parent.add(g);
    return g;
  }

  blob(parent, mat, [x, y, z], [sx, sy, sz], girth = true) {
    const m = new THREE.Mesh(this.sphere, mat);
    m.position.set(x, y, z);
    m.scale.set(sx, sy, sz);
    m.castShadow = true;
    parent.add(m);
    if (girth) this.girthTargets.push({ mesh: m, base: m.scale.clone(), basePos: m.position.clone() });
    return m;
  }

  capsule(parent, mat, r, len, y) {
    const geo = new THREE.CapsuleGeometry(r, len, 6, 16);
    const m = new THREE.Mesh(geo, mat);
    m.position.y = y;
    m.castShadow = true;
    parent.add(m);
    this.girthTargets.push({ mesh: m, base: m.scale.clone(), basePos: m.position.clone() });
    return m;
  }

  marker(parent, x, y, z) {
    const o = new THREE.Object3D();
    o.position.set(x, y, z);
    parent.add(o);
    this.markers.push(o);
    return o;
  }

  build() {
    const M = this.muscleMats, B = this.bodyMat;
    const pelvis = this.pelvis = this.joint(this.scaled, 0, 1.0, 0);

    // Pelvis
    this.blob(pelvis, B, [0, 0, 0], [0.165, 0.11, 0.11]);
    this.blob(pelvis, M.glutes, [0.068, -0.035, -0.055], [0.085, 0.09, 0.075]);
    this.blob(pelvis, M.glutes, [-0.068, -0.035, -0.055], [0.085, 0.09, 0.075]);
    this.blob(pelvis, M.hipFlexors, [0.075, 0.0, 0.07], [0.045, 0.06, 0.04]);
    this.blob(pelvis, M.hipFlexors, [-0.075, 0.0, 0.07], [0.045, 0.06, 0.04]);
    this.marker(pelvis, 0, -0.1, -0.1);
    this.marker(pelvis, 0.1, -0.06, -0.1);
    this.marker(pelvis, -0.1, -0.06, -0.1);
    this.marker(pelvis, 0, -0.04, 0.1);

    // Lower torso
    const spine = this.spine = this.joint(pelvis, 0, 0.08, 0);
    this.blob(spine, B, [0, 0.08, 0], [0.145, 0.14, 0.1]);
    this.blob(spine, M.abs, [0, 0.08, 0.068], [0.085, 0.13, 0.045]);
    this.blob(spine, M.obliques, [0.112, 0.07, 0.02], [0.045, 0.11, 0.07]);
    this.blob(spine, M.obliques, [-0.112, 0.07, 0.02], [0.045, 0.11, 0.07]);
    this.blob(spine, M.lowerBack, [0.04, 0.07, -0.065], [0.045, 0.12, 0.045]);
    this.blob(spine, M.lowerBack, [-0.04, 0.07, -0.065], [0.045, 0.12, 0.045]);
    this.marker(spine, 0, 0.08, -0.1);
    this.marker(spine, 0, 0.08, 0.11);

    // Chest
    const chest = this.chest = this.joint(spine, 0, 0.18, 0);
    this.blob(chest, B, [0, 0.11, 0], [0.17, 0.17, 0.11]);
    this.blob(chest, M.chest, [0.072, 0.15, 0.08], [0.085, 0.07, 0.045]);
    this.blob(chest, M.chest, [-0.072, 0.15, 0.08], [0.085, 0.07, 0.045]);
    this.blob(chest, M.back, [0.08, 0.1, -0.07], [0.08, 0.14, 0.05]);
    this.blob(chest, M.back, [-0.08, 0.1, -0.07], [0.08, 0.14, 0.05]);
    this.blob(chest, M.traps, [0, 0.235, -0.035], [0.12, 0.055, 0.06]);
    this.marker(chest, 0, 0.14, -0.12);
    this.marker(chest, 0, 0.14, 0.13);
    this.marker(chest, 0.17, 0.2, 0);
    this.marker(chest, -0.17, 0.2, 0);

    // Neck & head
    const neck = this.neck = this.joint(chest, 0, 0.26, 0);
    const neckMesh = new THREE.Mesh(new THREE.CylinderGeometry(0.048, 0.055, 0.12, 14), M.neck);
    neckMesh.position.y = 0.03;
    neckMesh.castShadow = true;
    neck.add(neckMesh);
    const head = this.head = this.joint(neck, 0, 0.1, 0);
    this.blob(head, B, [0, 0.1, 0.005], [0.093, 0.115, 0.105], false);
    this.blob(head, this.hairMat, [0, 0.135, -0.018], [0.098, 0.095, 0.1], false);
    this.blob(head, B, [0, 0.085, 0.104], [0.016, 0.024, 0.02], false); // nose
    this.blob(head, B, [0.092, 0.09, 0], [0.014, 0.028, 0.02], false);  // ears
    this.blob(head, B, [-0.092, 0.09, 0], [0.014, 0.028, 0.02], false);
    this.marker(head, 0, 0.22, 0);
    this.marker(head, 0, 0.1, -0.11);
    this.marker(head, 0, 0.1, 0.12);
    this.marker(head, 0, -0.01, 0.07);

    // Arms
    this.arms = {};
    for (const [side, s] of [['L', 1], ['R', -1]]) {
      const shoulder = this.joint(chest, 0.2 * s, 0.215, -0.005);
      this.blob(shoulder, M.shoulders, [0.012 * s, -0.025, 0], [0.065, 0.075, 0.065]);
      this.capsule(shoulder, B, 0.04, 0.22, -0.15);
      this.blob(shoulder, M.biceps, [0, -0.145, 0.022], [0.041, 0.095, 0.042]);
      this.blob(shoulder, M.triceps, [0, -0.13, -0.022], [0.043, 0.11, 0.04]);
      this.marker(shoulder, 0, -0.29, -0.04);
      const elbow = this.joint(shoulder, 0, -0.29, 0);
      this.capsule(elbow, B, 0.03, 0.2, -0.125);
      this.blob(elbow, M.forearms, [0, -0.085, 0.004], [0.04, 0.11, 0.039]);
      const wrist = this.joint(elbow, 0, -0.25, 0);
      this.blob(wrist, B, [0, -0.07, 0], [0.024, 0.072, 0.042], false);
      this.marker(wrist, 0, -0.15, 0);
      this.marker(wrist, 0, -0.04, 0);
      this.arms[side] = { shoulder, elbow, wrist };
    }

    // Legs
    this.legs = {};
    for (const [side, s] of [['L', 1], ['R', -1]]) {
      const hip = this.joint(pelvis, 0.09 * s, -0.05, 0);
      this.capsule(hip, B, 0.068, 0.3, -0.21);
      this.blob(hip, M.quads, [0.004 * s, -0.2, 0.035], [0.064, 0.17, 0.05]);
      this.blob(hip, M.hamstrings, [0, -0.21, -0.034], [0.06, 0.16, 0.045]);
      this.blob(hip, M.adductors, [-0.035 * s, -0.12, 0.002], [0.035, 0.12, 0.048]);
      this.marker(hip, 0, -0.43, 0.06);
      const knee = this.joint(hip, 0, -0.43, 0);
      this.capsule(knee, B, 0.043, 0.33, -0.2);
      this.blob(knee, M.calves, [0, -0.13, -0.03], [0.05, 0.12, 0.048]);
      this.marker(knee, 0, 0, 0.05);
      this.marker(knee, 0, -0.2, -0.06);
      const ankle = this.joint(knee, 0, -0.43, 0);
      this.blob(ankle, this.shoeMat, [0, -0.038, 0.05], [0.048, 0.04, 0.125], false);
      this.marker(ankle, 0, -0.075, -0.06);
      this.marker(ankle, 0, -0.075, 0.17);
      this.marker(ankle, 0, -0.01, 0.17);
      this.legs[side] = { hip, knee, ankle };
    }
  }

  /** Scale overall size to height; widen/narrow body to match weight (BMI). */
  setBody({ heightCm, weightKg, sex }) {
    const h = Math.max(120, Math.min(220, heightCm || 170)) / 100;
    const w = Math.max(30, Math.min(200, weightKg || 65));
    const bmi = w / (h * h);
    this.scaleFactor = h / BASE_HEIGHT;
    this.scaled.scale.setScalar(this.scaleFactor);
    const girth = Math.max(0.8, Math.min(1.55, Math.sqrt(bmi / 22)));
    const belly = Math.max(0.85, Math.min(1.9, 1 + (bmi - 22) * 0.06));
    for (const t of this.girthTargets) {
      t.mesh.scale.set(t.base.x * girth, t.base.y, t.base.z * girth);
      t.mesh.position.set(t.basePos.x, t.basePos.y, t.basePos.z * girth);
    }
    // Softer belly for higher BMI
    const abs = this.spine.children.slice(0, 2);
    for (const m of abs) m.scale.z *= belly;
    const female = sex === 'female';
    this.arms.L.shoulder.position.x = female ? 0.185 : 0.2;
    this.arms.R.shoulder.position.x = female ? -0.185 : -0.2;
    this.legs.L.hip.position.x = female ? 0.098 : 0.09;
    this.legs.R.hip.position.x = female ? -0.098 : -0.09;
    for (const s of [this.arms.L.shoulder, this.arms.R.shoulder]) s.position.x *= girth ** 0.5;
    for (const s of [this.legs.L.hip, this.legs.R.hip]) s.position.x *= girth ** 0.6;
  }

  /** Muscles to glow. mode: 'active' (red, pulsing) or 'next' (amber preview). */
  setHighlight(muscles, mode = 'active') {
    this.highlight = new Set(muscles || []);
    this.mode = mode;
  }

  applyPose(p) {
    this.pelvis.rotation.set(D(p.pitch), D(p.yaw), D(p.roll), 'YXZ');
    this.pelvis.position.set(p.x, 1.0, p.z);
    this.spine.rotation.set(D(p.spineF * 0.45), D(p.spineTwist * 0.5), D(-p.spineSide * 0.5));
    this.chest.rotation.set(D(p.spineF * 0.55), D(p.spineTwist * 0.5), D(-p.spineSide * 0.5));
    this.neck.rotation.set(D(p.neckF * 0.5), D(p.neckTurn * 0.5), D(-p.neckSide * 0.5));
    this.head.rotation.set(D(p.neckF * 0.5), D(p.neckTurn * 0.5), D(-p.neckSide * 0.5));
    for (const [side, s] of [['L', 1], ['R', -1]]) {
      const a = this.arms[side];
      a.shoulder.rotation.set(D(-p['shF_' + side]), D(s * p['shRot_' + side]), D(s * p['shAbd_' + side]), 'XZY');
      a.elbow.rotation.set(D(-p['elbow_' + side]), 0, 0);
      a.wrist.rotation.set(D(-p['wrist_' + side]), 0, 0);
      const l = this.legs[side];
      l.hip.rotation.set(D(-p['hipF_' + side]), D(s * p['hipRot_' + side]), D(s * p['hipAbd_' + side]), 'XZY');
      l.knee.rotation.set(D(p['knee_' + side]), 0, 0);
      l.ankle.rotation.set(D(p['ankle_' + side]), 0, 0);
    }
    // Ground the body: lowest contact point touches the floor.
    this.object.position.y = 0;
    this.object.updateMatrixWorld(true);
    const v = new THREE.Vector3();
    let minY = Infinity;
    const box = this.bounds || (this.bounds = new THREE.Box3());
    box.makeEmpty();
    for (const m of this.markers) {
      m.getWorldPosition(v);
      if (v.y < minY) minY = v.y;
      box.expandByPoint(v);
    }
    const dy = -minY + p.lift * this.scaleFactor;
    this.object.position.y = dy;
    box.min.y += dy; box.max.y += dy;
    this.object.updateMatrixWorld(true);
  }

  update(time) {
    const pulse = 0.5 + 0.5 * Math.sin(time * 5);
    for (const [name, mat] of Object.entries(this.muscleMats)) {
      if (this.highlight.has(name)) {
        if (this.mode === 'active') {
          mat.color.copy(COLORS.active);
          mat.emissive.copy(COLORS.activeGlow);
          mat.emissiveIntensity = 0.25 + 0.45 * pulse;
        } else {
          mat.color.copy(COLORS.next);
          mat.emissive.copy(COLORS.next);
          mat.emissiveIntensity = 0.15;
        }
      } else {
        mat.color.setHex(COLORS.muscle);
        mat.emissive.setHex(0x000000);
        mat.emissiveIntensity = 0;
      }
    }
  }
}
