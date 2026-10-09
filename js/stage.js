// Renders the avatar, keeps it framed, and lets the user drag to orbit.
import * as THREE from '../vendor/three.module.min.js';
import { Avatar, expandPose, mirrorPose, lerpPose, NEUTRAL } from './avatar.js';

const VIEW_YAW = { front: 0, threeq: 30, side: 75, back: 180, sidefront: 55 };
const ease = (t) => 0.5 - 0.5 * Math.cos(Math.PI * t);

export class Stage {
  constructor(canvas) {
    this.canvas = canvas;
    this.renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true, powerPreference: 'low-power' });
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;

    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(32, 1, 0.05, 50);

    this.scene.add(new THREE.HemisphereLight(0xffffff, 0x8a8f99, 1.6));
    const sun = new THREE.DirectionalLight(0xffffff, 1.9);
    sun.position.set(2.5, 5, 3.5);
    sun.castShadow = true;
    sun.shadow.mapSize.set(1024, 1024);
    Object.assign(sun.shadow.camera, { left: -2, right: 2, top: 2, bottom: -2, near: 0.5, far: 15 });
    sun.shadow.radius = 4;
    this.sun = sun;
    this.scene.add(sun, sun.target);
    const rim = new THREE.DirectionalLight(0xbfd8ff, 0.8);
    rim.position.set(-3, 3, -4);
    this.scene.add(rim);

    const floor = new THREE.Mesh(
      new THREE.CircleGeometry(2.4, 64),
      new THREE.ShadowMaterial({ opacity: 0.22 })
    );
    floor.rotation.x = -Math.PI / 2;
    floor.receiveShadow = true;
    this.scene.add(floor);
    const mat = new THREE.Mesh(
      new THREE.PlaneGeometry(0.75, 1.9),
      new THREE.MeshStandardMaterial({ color: 0x3fb59b, roughness: 0.9, transparent: true, opacity: 0.35 })
    );
    mat.rotation.x = -Math.PI / 2;
    mat.position.y = 0.002;
    this.mat = mat;
    this.scene.add(mat);

    this.avatar = new Avatar();
    this.scene.add(this.avatar.object);

    this.exercise = null;
    this.mirrored = false;
    this.exStart = 0;
    this.pose = expandPose({});
    this.frames = [this.pose];
    this.weights = [1];
    this.blendFrom = { ...this.pose };
    this.blendStart = -10;
    this.speed = 1;
    this.paused = false;
    this.animTime = 0;

    this.viewYaw = VIEW_YAW.threeq;
    this.userYaw = 0;
    this.userPitch = 0;
    this.camTarget = new THREE.Vector3(0, 0.9, 0);
    this.camDist = 4;
    this.camYaw = this.viewYaw;

    this.bindDrag();
    this.resize();
    new ResizeObserver(() => this.resize()).observe(canvas);
    this.clock = new THREE.Clock();
    this.running = true;
    this.loop = this.loop.bind(this);
    requestAnimationFrame(this.loop);
  }

  bindDrag() {
    let down = null;
    const c = this.canvas;
    c.addEventListener('pointerdown', (e) => { down = { x: e.clientX, y: e.clientY, yaw: this.userYaw, pitch: this.userPitch }; c.setPointerCapture(e.pointerId); });
    c.addEventListener('pointermove', (e) => {
      if (!down) return;
      this.userYaw = down.yaw - (e.clientX - down.x) * 0.4;
      this.userPitch = Math.max(-10, Math.min(60, down.pitch + (e.clientY - down.y) * 0.25));
    });
    const up = () => { down = null; };
    c.addEventListener('pointerup', up);
    c.addEventListener('pointercancel', up);
    c.addEventListener('dblclick', () => { this.userYaw = 0; this.userPitch = 0; });
  }

  resize() {
    const w = this.canvas.clientWidth, h = this.canvas.clientHeight;
    if (!w || !h) return;
    this.renderer.setSize(w, h, false);
    this.camera.aspect = w / h;
    this.camera.updateProjectionMatrix();
  }

  setBody(profile) { this.avatar.setBody(profile); }

  /** Show an exercise. mirrored = do the other side. */
  play(ex, { mirrored = false, highlight = 'active' } = {}) {
    this.blendFrom = { ...this.pose };
    this.blendStart = this.animTime;
    this.exercise = ex;
    this.mirrored = mirrored;
    this.exStart = this.animTime;
    this.frames = ex ? ex.frames.map((f) => {
      const p = expandPose(f);
      return mirrored ? mirrorPose(p) : p;
    }) : [expandPose({})];
    this.weights = ex ? ex.frames.map((f) => f.d || 1) : [1];
    this.viewYaw = VIEW_YAW[ex?.view || 'threeq'] * (mirrored ? -1 : 1);
    this.avatar.setHighlight(ex ? ex.muscles : [], highlight);
    this.mat.visible = !!ex?.mat;
  }

  /** Jump straight to one keyframe (used by the pose debugger). */
  snapTo(ex, frame = 0, mirrored = false) {
    this.play(ex, { mirrored });
    this.frames = [this.frames[frame]];
    this.weights = [1];
    this.blendStart = -10;
    this.snapCam = true;
    this.camYaw = this.viewYaw;
  }

  setHighlightMode(mode) { this.avatar.mode = mode; }

  sample(t) {
    const frames = this.frames;
    if (frames.length === 1) {
      // Static hold: gentle breathing so it doesn't look frozen
      const p = { ...frames[0] };
      const b = Math.sin(t * 2 * Math.PI / 4);
      p.spineF += b * 1.2;
      p.neckF += b * 1;
      return p;
    }
    const cycle = (this.exercise?.cycle || 2) / this.speed;
    const total = this.weights.reduce((a, b) => a + b, 0);
    let u = ((t % cycle) / cycle) * total;
    let i = 0;
    while (u > this.weights[i] && i < frames.length - 1) { u -= this.weights[i]; i++; }
    const a = frames[i], b = frames[(i + 1) % frames.length];
    const k = ease(Math.min(1, u / this.weights[i]));
    return lerpPose(a, b, k);
  }

  loop() {
    if (!this.running) return;
    requestAnimationFrame(this.loop);
    const dt = Math.min(0.05, this.clock.getDelta());
    if (!this.paused) this.animTime += dt;
    const t = this.animTime;

    const target = this.sample(t - this.exStart);
    const bt = Math.min(1, (t - this.blendStart) / 0.7);
    this.pose = bt < 1 ? lerpPose(this.blendFrom, target, ease(bt)) : target;
    this.avatar.applyPose(this.pose);
    this.avatar.update(performance.now() / 1000);

    // Auto-frame the body
    const box = this.avatar.bounds;
    const center = box.getCenter(new THREE.Vector3());
    const size = box.getSize(new THREE.Vector3());
    const k = this.snapCam ? 1 : 1 - Math.exp(-dt * 3);
    this.snapCam = false;
    const wantTarget = new THREE.Vector3(center.x, Math.max(center.y, 0.35), center.z);
    this.camTarget.lerp(wantTarget, k);
    const vFov = THREE.MathUtils.degToRad(this.camera.fov);
    const fitH = (Math.max(size.y, 0.9) * 1.25) / (2 * Math.tan(vFov / 2));
    const horiz = Math.max(size.x, size.z, 0.6) * 1.2;
    const fitW = horiz / (2 * Math.tan(vFov / 2) * this.camera.aspect);
    const wantDist = Math.max(fitH, fitW, 2.2);
    this.camDist += (wantDist - this.camDist) * k;
    this.camYaw += (this.viewYaw - this.camYaw) * k;

    const yaw = THREE.MathUtils.degToRad(this.camYaw + this.userYaw);
    const pitch = THREE.MathUtils.degToRad(8 + this.userPitch);
    const cam = this.camera;
    cam.position.set(
      this.camTarget.x + Math.sin(yaw) * Math.cos(pitch) * this.camDist,
      this.camTarget.y + Math.sin(pitch) * this.camDist,
      this.camTarget.z + Math.cos(yaw) * Math.cos(pitch) * this.camDist
    );
    cam.lookAt(this.camTarget);
    this.sun.target.position.copy(center);
    this.sun.position.set(center.x + 2.5, 5, center.z + 3.5);
    this.mat.position.x = center.x;
    this.mat.position.z = center.z;
    this.renderer.render(this.scene, cam);
  }
}

export { NEUTRAL };
