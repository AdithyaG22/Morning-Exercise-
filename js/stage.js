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
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.05;

    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(32, 1, 0.05, 50);

    // Studio lighting: soft key from above-front, cool rim lights from behind.
    this.hemi = new THREE.HemisphereLight(0xdfe8ff, 0x1a1f28, 0.9);
    this.scene.add(this.hemi);
    const sun = new THREE.DirectionalLight(0xffffff, 2.6);
    sun.position.set(1.2, 5, 3.2);
    sun.castShadow = true;
    sun.shadow.mapSize.set(1024, 1024);
    Object.assign(sun.shadow.camera, { left: -2, right: 2, top: 2, bottom: -2, near: 0.5, far: 15 });
    sun.shadow.radius = 5;
    this.sun = sun;
    this.scene.add(sun, sun.target);
    const rimL = new THREE.DirectionalLight(0x7fb0ff, 2.2);
    rimL.position.set(-3, 2.5, -3.5);
    const rimR = new THREE.DirectionalLight(0x9fc4ff, 1.6);
    rimR.position.set(3, 2, -3);
    const fill = new THREE.DirectionalLight(0xffffff, 0.5);
    fill.position.set(-2, 1, 3);
    this.rims = [rimL, rimR];
    this.scene.add(rimL, rimR, fill);

    const floor = new THREE.Mesh(
      new THREE.CircleGeometry(2.4, 64),
      new THREE.ShadowMaterial({ opacity: 0.45 })
    );
    floor.rotation.x = -Math.PI / 2;
    floor.receiveShadow = true;
    this.floor = floor;
    this.scene.add(floor);
    // Soft pool of light on the floor under the trainer
    const c = document.createElement('canvas');
    c.width = c.height = 128;
    const g = c.getContext('2d');
    const grad = g.createRadialGradient(64, 64, 0, 64, 64, 64);
    grad.addColorStop(0, 'rgba(150,180,230,0.35)');
    grad.addColorStop(1, 'rgba(150,180,230,0)');
    g.fillStyle = grad;
    g.fillRect(0, 0, 128, 128);
    const spot = new THREE.Mesh(
      new THREE.PlaneGeometry(2.6, 2.6),
      new THREE.MeshBasicMaterial({ map: new THREE.CanvasTexture(c), transparent: true, depthWrite: false })
    );
    spot.rotation.x = -Math.PI / 2;
    spot.position.y = 0.001;
    this.spot = spot;
    this.scene.add(spot);
    const mat = new THREE.Mesh(
      new THREE.PlaneGeometry(0.75, 1.9),
      new THREE.MeshStandardMaterial({ color: 0x2a3a52, roughness: 0.9, transparent: true, opacity: 0.6 })
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

  /** 'light': bright room like a daytime studio. 'dark': black stage with blue rim lights. */
  setTheme(theme) {
    const dark = theme === 'dark';
    this.renderer.toneMappingExposure = dark ? 1.05 : 1.0;
    this.hemi.color.setHex(dark ? 0xdfe8ff : 0xffffff);
    this.hemi.groundColor.setHex(dark ? 0x1a1f28 : 0x8a8f99);
    this.hemi.intensity = dark ? 0.9 : 1.7;
    this.sun.intensity = dark ? 2.6 : 2.0;
    this.rims[0].intensity = dark ? 2.2 : 0.7;
    this.rims[1].intensity = dark ? 1.6 : 0.3;
    this.floor.material.opacity = dark ? 0.45 : 0.22;
    this.spot.visible = dark;
    this.mat.material.color.setHex(dark ? 0x2a3a52 : 0x3fb59b);
    this.mat.material.opacity = dark ? 0.6 : 0.35;
    this.avatar.setSkin(dark ? 0xe8ebef : 0xd2d9e2);
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
    const center = box.getCenter(this._center || (this._center = new THREE.Vector3()));
    const size = box.getSize(this._size || (this._size = new THREE.Vector3()));
    const k = this.snapCam ? 1 : 1 - Math.exp(-dt * 3);
    this.snapCam = false;
    const wantTarget = (this._want || (this._want = new THREE.Vector3())).set(center.x, Math.max(center.y, 0.35), center.z);
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
    this.sun.position.set(center.x + 1.2, 5, center.z + 3.2);
    this.spot.position.x = center.x;
    this.spot.position.z = center.z;
    this.mat.position.x = center.x;
    this.mat.position.z = center.z;
    this.renderer.render(this.scene, cam);
  }
}

export { NEUTRAL };
