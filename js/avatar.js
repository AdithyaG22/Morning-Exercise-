// Procedural 3D trainer built from simple shapes — no model files to download.
// Every visible muscle is its own mesh grouped by muscle name so it can glow.
import * as THREE from '../vendor/three.module.min.js';
import { buildSkinGeometry, makePrim } from './skin.js';

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
  skin: 0xe8ebef,      // porcelain-white sculpture
  muscle: 0xeef0f3,
  active: new THREE.Color(0xff4a26),
  activeGlow: new THREE.Color(0xff2a00),
  halo: new THREE.Color(0x4f8dff),
  next: new THREE.Color(0xffa340),
};

// Additive fresnel shell: a soft halo around a glowing muscle.
function glowMaterial() {
  return new THREE.ShaderMaterial({
    uniforms: { color: { value: COLORS.halo.clone() }, intensity: { value: 0 } },
    vertexShader: `
      varying vec3 vN; varying vec3 vV;
      void main() {
        vec4 mv = modelViewMatrix * vec4(position, 1.0);
        vN = normalize(normalMatrix * normal);
        vV = normalize(-mv.xyz);
        gl_Position = projectionMatrix * mv;
      }`,
    fragmentShader: `
      uniform vec3 color; uniform float intensity;
      varying vec3 vN; varying vec3 vV;
      void main() {
        float f = pow(1.0 - abs(dot(normalize(vN), normalize(vV))), 2.2);
        gl_FragColor = vec4(color * f * intensity, f * intensity);
      }`,
    transparent: true,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
  });
}

export class Avatar {
  constructor() {
    this.object = new THREE.Group();   // grounded container (y offset)
    this.scaled = new THREE.Group();   // height scale
    this.object.add(this.scaled);
    this.markers = [];
    this.muscleMats = {};
    this.glowMats = {};
    this.glowShells = {};
    this.girthTargets = [];
    this.bellyMeshes = [];
    this.muscleMeshes = [];
    this.bones = [];
    this.shapes = [];   // body shapes the skin is generated from
    this.highlight = new Set();
    this.mode = 'active';

    this.bodyMat = new THREE.MeshStandardMaterial({ color: COLORS.skin, roughness: 0.42, metalness: 0.02 });
    for (const m of Object.keys(MUSCLES)) {
      this.muscleMats[m] = new THREE.MeshStandardMaterial({
        color: COLORS.muscle, roughness: 0.38, metalness: 0.02, emissive: 0x000000,
      });
      this.glowMats[m] = glowMaterial();
      this.glowShells[m] = [];
    }
    this.sphere = new THREE.SphereGeometry(1, 32, 20);
    this.build();
    this.setBody({ heightCm: 170, weightKg: 65, sex: 'male' }, false);
  }

  joint(parent, x, y, z) {
    const g = new THREE.Bone();
    g.position.set(x, y, z);
    parent.add(g);
    this.bones.push(g);
    return g;
  }

  /** Ellipsoid. rot = optional [rx, ry, rz] radians to angle a muscle along its fibres. */
  blob(parent, mat, [x, y, z], [sx, sy, sz], girth = true, rot = null) {
    const m = new THREE.Mesh(this.sphere, mat);
    m.position.set(x, y, z);
    m.scale.set(sx, sy, sz);
    if (rot) m.rotation.set(rot[0], rot[1], rot[2]);
    m.castShadow = true;
    parent.add(m);
    if (girth) this.girthTargets.push({ mesh: m, base: m.scale.clone(), basePos: m.position.clone() });
    if (mat === this.bodyMat) this.shapes.push({ mesh: m, type: 'ell', bone: parent });
    const group = Object.keys(this.muscleMats).find((k) => this.muscleMats[k] === mat);
    if (group) {
      m.visible = false;
      this.muscleMeshes.push(m);
      const shell = new THREE.Mesh(this.sphere, this.glowMats[group]);
      shell.scale.setScalar(1.32);
      shell.visible = false;
      shell.renderOrder = 2;
      m.add(shell);
      this.glowShells[group].push(shell);
    }
    return m;
  }

  capsule(parent, mat, r, len, y, r2 = r) {
    // Tapered limb: a capsule squashed toward its far end
    if (mat === this.bodyMat) this.shapes.push({ type: 'cap', bone: parent, r, len, r2 });
    const geo = new THREE.CapsuleGeometry(r, len, 8, 20);
    if (r2 !== r) {
      const pos = geo.attributes.position;
      for (let i = 0; i < pos.count; i++) {
        const t = (pos.getY(i) + len / 2 + r) / (len + 2 * r); // 0 bottom → 1 top
        const k = (r2 + (r - r2) * t) / r;
        pos.setX(i, pos.getX(i) * k);
        pos.setZ(i, pos.getZ(i) * k);
      }
      geo.computeVertexNormals();
    }
    const m = new THREE.Mesh(geo, mat);
    if (mat === this.bodyMat) this.shapes[this.shapes.length - 1].mesh = m;
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
    // Smooth skin shapes form the body. Muscle shapes sit just under the skin and
    // only appear (glowing) while they are being worked.

    // ---- Pelvis ----
    this.blob(pelvis, B, [0, 0, 0], [0.165, 0.115, 0.11]);
    this.blob(pelvis, B, [0.06, -0.035, -0.045], [0.088, 0.092, 0.078]);
    this.blob(pelvis, B, [-0.06, -0.035, -0.045], [0.088, 0.092, 0.078]);
    this.blob(pelvis, M.glutes, [0.066, -0.035, -0.06], [0.082, 0.088, 0.07]);
    this.blob(pelvis, M.glutes, [-0.066, -0.035, -0.06], [0.082, 0.088, 0.07]);
    this.blob(pelvis, M.hipFlexors, [0.072, 0.0, 0.072], [0.04, 0.065, 0.036], true, [0, 0, -0.35]);
    this.blob(pelvis, M.hipFlexors, [-0.072, 0.0, 0.072], [0.04, 0.065, 0.036], true, [0, 0, 0.35]);
    this.marker(pelvis, 0, -0.1, -0.1);
    this.marker(pelvis, 0.1, -0.06, -0.1);
    this.marker(pelvis, -0.1, -0.06, -0.1);
    this.marker(pelvis, 0, -0.04, 0.1);

    // ---- Waist ----
    const spine = this.spine = this.joint(pelvis, 0, 0.08, 0);
    this.bellyMeshes.push(this.blob(spine, B, [0, 0.07, 0], [0.145, 0.175, 0.1]));
    for (const y of [0.025, 0.085, 0.145]) {
      for (const s of [1, -1]) {
        this.bellyMeshes.push(this.blob(spine, M.abs, [0.03 * s, y, 0.076 - (y - 0.08) * 0.08], [0.03, 0.027, 0.026]));
      }
    }
    this.bellyMeshes.push(this.blob(spine, M.abs, [0, -0.03, 0.072], [0.05, 0.035, 0.026]));
    this.blob(spine, M.obliques, [0.112, 0.06, 0.022], [0.038, 0.11, 0.062], true, [0, 0, 0.12]);
    this.blob(spine, M.obliques, [-0.112, 0.06, 0.022], [0.038, 0.11, 0.062], true, [0, 0, -0.12]);
    this.blob(spine, M.lowerBack, [0.036, 0.07, -0.07], [0.035, 0.13, 0.04]);
    this.blob(spine, M.lowerBack, [-0.036, 0.07, -0.07], [0.035, 0.13, 0.04]);
    this.marker(spine, 0, 0.08, -0.1);
    this.marker(spine, 0, 0.08, 0.11);

    // ---- Chest & upper back ----
    const chest = this.chest = this.joint(spine, 0, 0.18, 0);
    this.blob(chest, B, [0, 0.1, 0], [0.166, 0.19, 0.104]);
    this.blob(chest, B, [0, 0.15, 0.025], [0.15, 0.085, 0.085]);
    this.blob(chest, B, [0, 0.21, -0.01], [0.16, 0.06, 0.08]);
    this.blob(chest, M.chest, [0.068, 0.158, 0.074], [0.082, 0.058, 0.04], true, [0, 0.25, -0.22]);
    this.blob(chest, M.chest, [-0.068, 0.158, 0.074], [0.082, 0.058, 0.04], true, [0, -0.25, 0.22]);
    this.blob(chest, M.back, [0.098, 0.07, -0.05], [0.055, 0.15, 0.05], true, [0, 0, 0.32]);
    this.blob(chest, M.back, [-0.098, 0.07, -0.05], [0.055, 0.15, 0.05], true, [0, 0, -0.32]);
    this.blob(chest, M.back, [0.05, 0.16, -0.076], [0.055, 0.075, 0.035]);
    this.blob(chest, M.back, [-0.05, 0.16, -0.076], [0.055, 0.075, 0.035]);
    this.blob(chest, M.traps, [0.07, 0.24, -0.018], [0.085, 0.034, 0.05], true, [0, 0, -0.42]);
    this.blob(chest, M.traps, [-0.07, 0.24, -0.018], [0.085, 0.034, 0.05], true, [0, 0, 0.42]);
    this.blob(chest, M.traps, [0, 0.19, -0.08], [0.05, 0.09, 0.03]);
    this.marker(chest, 0, 0.14, -0.12);
    this.marker(chest, 0, 0.14, 0.13);
    this.marker(chest, 0.17, 0.2, 0);
    this.marker(chest, -0.17, 0.2, 0);

    // ---- Neck & head ----
    const neck = this.neck = this.joint(chest, 0, 0.26, 0);
    this.capsule(neck, B, 0.046, 0.08, 0.03, 0.056);
    this.blob(neck, M.neck, [0.026, 0.03, 0.028], [0.016, 0.065, 0.016], false, [0.35, 0, -0.3]);
    this.blob(neck, M.neck, [-0.026, 0.03, 0.028], [0.016, 0.065, 0.016], false, [0.35, 0, 0.3]);
    const head = this.head = this.joint(neck, 0, 0.1, 0);
    this.blob(head, B, [0, 0.105, 0], [0.086, 0.112, 0.098], false);
    this.blob(head, B, [0, 0.05, 0.022], [0.06, 0.055, 0.07], false);   // jaw
    this.blob(head, B, [0, 0.09, 0.093], [0.009, 0.018, 0.01], false);   // nose
    this.marker(head, 0, 0.22, 0);
    this.marker(head, 0, 0.1, -0.11);
    this.marker(head, 0, 0.1, 0.12);
    this.marker(head, 0, -0.01, 0.07);

    // ---- Arms ----
    this.arms = {};
    for (const [side, s] of [['L', 1], ['R', -1]]) {
      const shoulder = this.joint(chest, 0.2 * s, 0.215, -0.005);
      this.blob(shoulder, B, [0.01 * s, -0.03, 0], [0.064, 0.078, 0.064]);
      this.capsule(shoulder, B, 0.046, 0.21, -0.15, 0.034);
      this.blob(shoulder, M.shoulders, [0.016 * s, -0.035, 0], [0.066, 0.086, 0.066]);
      this.blob(shoulder, M.biceps, [0, -0.15, 0.024], [0.04, 0.088, 0.04]);
      this.blob(shoulder, M.triceps, [0, -0.13, -0.024], [0.042, 0.11, 0.038]);
      this.marker(shoulder, 0, -0.29, -0.04);
      const elbow = this.joint(shoulder, 0, -0.29, 0);
      this.blob(elbow, B, [0, 0, 0], [0.036, 0.036, 0.036], true);
      this.capsule(elbow, B, 0.038, 0.19, -0.12, 0.024);
      this.blob(elbow, M.forearms, [0, -0.075, 0.006], [0.041, 0.1, 0.036]);
      const wrist = this.joint(elbow, 0, -0.25, 0);
      this.blob(wrist, B, [0, -0.05, 0], [0.02, 0.05, 0.04], false);       // palm
      this.blob(wrist, B, [0, -0.11, 0.004], [0.016, 0.048, 0.035], false); // fingers
      this.blob(wrist, B, [0, -0.05, 0.036], [0.012, 0.032, 0.012], false, [0.4, 0, 0]); // thumb
      this.marker(wrist, 0, -0.15, 0);
      this.marker(wrist, 0, -0.04, 0);
      this.arms[side] = { shoulder, elbow, wrist };
    }

    // ---- Legs ----
    this.legs = {};
    for (const [side, s] of [['L', 1], ['R', -1]]) {
      const hip = this.joint(pelvis, 0.09 * s, -0.05, 0);
      this.blob(hip, B, [0.01 * s, -0.02, 0], [0.085, 0.09, 0.085]);
      this.capsule(hip, B, 0.08, 0.28, -0.21, 0.05);
      this.blob(hip, M.quads, [0.004 * s, -0.19, 0.058], [0.044, 0.16, 0.036]);
      this.blob(hip, M.quads, [0.054 * s, -0.2, 0.022], [0.038, 0.16, 0.044], true, [0, 0, 0.08 * s]);
      this.blob(hip, M.quads, [-0.032 * s, -0.33, 0.032], [0.036, 0.065, 0.038]);
      this.blob(hip, M.hamstrings, [0, -0.21, -0.05], [0.056, 0.16, 0.044]);
      this.blob(hip, M.adductors, [-0.04 * s, -0.12, 0.002], [0.034, 0.12, 0.046]);
      this.marker(hip, 0, -0.43, 0.06);
      const knee = this.joint(hip, 0, -0.43, 0);
      this.blob(knee, B, [0, 0, 0.004], [0.05, 0.052, 0.05]);
      this.capsule(knee, B, 0.046, 0.32, -0.2, 0.03);
      this.blob(knee, B, [0, -0.12, -0.02], [0.046, 0.11, 0.048]); // calf shape
      this.blob(knee, M.calves, [0.016, -0.12, -0.034], [0.032, 0.1, 0.042]);
      this.blob(knee, M.calves, [-0.016, -0.11, -0.034], [0.032, 0.1, 0.042]);
      this.marker(knee, 0, 0, 0.05);
      this.marker(knee, 0, -0.2, -0.06);
      const ankle = this.joint(knee, 0, -0.43, 0);
      this.blob(ankle, B, [0, -0.012, 0.0], [0.03, 0.045, 0.034], false);    // ankle
      this.blob(ankle, B, [0, -0.04, 0.045], [0.042, 0.034, 0.11], false);   // foot
      this.blob(ankle, B, [0, -0.045, -0.035], [0.035, 0.032, 0.04], false); // heel
      this.blob(ankle, B, [0, -0.06, 0.135], [0.038, 0.016, 0.035], false);  // toes
      this.marker(ankle, 0, -0.075, -0.06);
      this.marker(ankle, 0, -0.075, 0.17);
      this.marker(ankle, 0, -0.01, 0.17);
      this.legs[side] = { hip, knee, ankle };
    }
  }

  /** Scale overall size to height; widen/narrow body to match weight (BMI). */
  setBody({ heightCm, weightKg, sex }, skin = true) {
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
    // Rounder belly for higher BMI: push the front of the waist forward
    for (const m of this.bellyMeshes) {
      if (m.position.z > 0.01) m.position.z *= belly;
      else m.scale.z *= belly;
    }
    for (const m of this.muscleMeshes) m.userData.s = m.scale.clone();
    const female = sex === 'female';
    this.arms.L.shoulder.position.x = female ? 0.185 : 0.2;
    this.arms.R.shoulder.position.x = female ? -0.185 : -0.2;
    this.legs.L.hip.position.x = female ? 0.098 : 0.09;
    this.legs.R.hip.position.x = female ? -0.098 : -0.09;
    for (const s of [this.arms.L.shoulder, this.arms.R.shoulder]) s.position.x *= girth ** 0.5;
    for (const s of [this.legs.L.hip, this.legs.R.hip]) s.position.x *= girth ** 0.6;
    if (skin) this.buildSkin();
  }

  /** Replace the separate body shapes with one smooth skin bound to the skeleton. */
  buildSkin() {
    if (this.skin) {
      this.scaled.remove(this.skin);
      this.skin.geometry.dispose();
    }
    // Bind pose: arms out and legs apart so armpits and thighs stay separate.
    this.applyPose(expandPose({ shAbd: 40, hipAbd: 6, elbow: 5 }));
    const inv = this.scaled.matrixWorld.clone().invert();
    const prims = this.shapes.map((s) => {
      s.mesh.visible = true;
      const rel = inv.clone().multiply(s.mesh.matrixWorld);
      return makePrim(s, rel);
    });
    const geo = buildSkinGeometry(prims, this.bones);
    const skin = new THREE.SkinnedMesh(geo, this.bodyMat);
    skin.castShadow = true;
    skin.frustumCulled = false;
    this.scaled.add(skin);
    skin.updateMatrixWorld(true);
    skin.bind(new THREE.Skeleton(this.bones), skin.matrixWorld);
    this.skin = skin;
    for (const s of this.shapes) s.mesh.visible = false;
  }

  setSkin(hex) {
    this.bodyMat.color.setHex(hex);
    COLORS.muscle = hex;
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
    const pulse = 0.5 + 0.5 * Math.sin(time * 4.5);
    for (const [name, mat] of Object.entries(this.muscleMats)) {
      const on = this.highlight.has(name);
      const glow = this.glowMats[name].uniforms;
      for (const s of this.glowShells[name]) {
        s.visible = on;
        const m = s.parent;
        m.visible = on;
        if (m.userData.s) m.scale.copy(m.userData.s).multiplyScalar(on ? 1.13 : 1);
      }
      if (on && this.mode === 'active') {
        mat.color.copy(COLORS.active);
        mat.emissive.copy(COLORS.activeGlow);
        mat.emissiveIntensity = 0.35 + 0.5 * pulse;
        glow.color.value.copy(COLORS.halo);
        glow.intensity.value = 1.3 + 0.9 * pulse;
      } else if (on) {
        mat.color.copy(COLORS.next);
        mat.emissive.copy(COLORS.next);
        mat.emissiveIntensity = 0.2;
        glow.color.value.copy(COLORS.next);
        glow.intensity.value = 0.5;
      } else {
        mat.color.setHex(COLORS.muscle);
        mat.emissive.setHex(0x000000);
        mat.emissiveIntensity = 0;
      }
    }
  }
}
