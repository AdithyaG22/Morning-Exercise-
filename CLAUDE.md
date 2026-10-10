# Morning Move: project guide for Claude

Read this first. It explains what the app is, the decisions already made, how the code fits
together, and how to change it safely. `README.md` (user-facing), `docs/EXERCISES.md`
(movement system) and `docs/EXERCISE-TECHNIQUE.md` (sourced correct form for every exercise)
hold more detail.

## 1. What this is and who it's for

Morning Move is a free, lightweight morning workout web app. The user is a 23-year-old who works
from home at a laptop. They wanted:

- a 3D trainer sized to their height and weight that demonstrates each exercise and highlights the
  muscles being worked;
- 20 s work / 10 s rest intervals (adjustable: work 10–90 s, rest 5–60 s, in 5 s steps);
- 10–20 minute sessions (slider 5–30, default 15);
- Beginner → Intermediate → Advanced levels, with yoga included.

The goal is general fitness and health, not bodybuilding. **The user is not a programmer.** Explain
what you changed and why in plain language, describe what they will see in the app, and avoid jargon.

## 2. Decisions already made (do not re-litigate)

- **Installable PWA, no backend.** Works offline. All data stays in `localStorage`. No accounts,
  no analytics, no ads.
- **Three.js r160 is vendored** at `vendor/three.module.min.js` (MIT, `vendor/three.LICENSE`).
  No npm, no bundler, no build step for the app itself.
- **Procedural avatar.** No downloaded 3D model. The body is built from code (ellipsoids and
  tapered capsules on a bone skeleton), then covered with one generated smooth skin.
- **Muscles are hidden until highlighted.** During work they glow red with a pulsing blue fresnel
  halo. During rest/get-ready the next exercise's muscles show in amber.
- **Light theme is the default**, with a Dark option under Profile ("You" tab) → Appearance.
- **Install:** an "⬇ Install app" button appears when the browser fires `beforeinstallprompt`;
  on iPhone/iPad (not standalone) an install hint explains Safari → Share → Add to Home Screen.
- **Ready-made routines** live in `js/routines.js`. Currently one: *Beginner Full Body*
  (4 circuits: Warm-up, Push-ups & squats, Dumbbells, Core; 20 s / 10 s; 30 s "breathe deeply"
  break between circuits).
- **Dumbbell exercises (`props: ['dumbbells']`) appear only in routines**, never in the automatic
  daily mix (`buildPlan` filters out anything with `props`). They still show in the library.
- Ending a workout uses an in-page "End workout" button, not `confirm()` (dialogs do not work in
  the claude.ai preview).

## 3. Architecture

Plain ES modules loaded by `index.html` (`<script type="module" src="js/app.js">`).

```
app.js ──► stage.js ──► avatar.js ──► skin.js ──► vendor/three.module.min.js
   │                      ▲
   ├──► exercises.js      │ (MUSCLES)
   ├──► plan.js ──► exercises.js
   ├──► routines.js
   └──► audio.js
tools/check-poses.mjs ──► avatar.js, skin.js, exercises.js, routines.js, tools/motion.js
```

| File | Role |
|---|---|
| `index.html` | App shell: home (hero, today's workout, routines, plan list), library, profile, player overlay, done screen, preview sheet. One `<canvas id="stage">` is moved between `hero-slot`, `player-slot` and `preview-slot` (`mountStage()` in app.js). |
| `css/style.css` | Styles. Colour tokens on `:root`; dark via `:root[data-theme="dark"]` (and `prefers-color-scheme` when no theme is set). Phone and laptop layouts. |
| `js/app.js` | UI, settings, storage, workout player/timer, history, stats, install button, service worker registration. |
| `js/stage.js` | `Stage` class: renderer, lights, floor/shadow/mat, theme lighting (`setTheme`), drag-to-orbit, animation sampling and blending, camera auto-framing, render loop. |
| `js/avatar.js` | `Avatar` class: skeleton, body shapes, muscle meshes + glow shells, markers, dumbbells, `setBody` sizing, `applyPose`, grounding, highlight colours. Exports `MUSCLES`, `NEUTRAL`, `expandPose`, `mirrorPose`, `lerpPose`. |
| `js/skin.js` | `buildSkinGeometry(prims, bones)` and `makePrim(shape, matrix)`: builds the smooth skinned body. |
| `js/exercises.js` | `EXERCISES` (59 exercises), `CATEGORIES`, `LEVELS`, `byId`. |
| `js/plan.js` | `FOCUS`, `buildPlan`, `buildRoutinePlan`, `todaySeed`. |
| `js/routines.js` | `ROUTINES`. |
| `js/audio.js` | `sound` flags, `unlockAudio`, `beep` (Web Audio), `say` (speech synthesis, en-US). |
| `sw.js` | Service worker: pre-caches `FILES`, network-first with cache fallback. |
| `manifest.webmanifest` | PWA manifest (icons in `icons/`). |
| `pose-debug.html` | Bare page that shows any keyframe for screenshots. |
| `tools/` | `check-poses.mjs` (pose checker/fitter), `motion.js` (ROM table + `on` vocabulary), `build-preview.py` (single-file bundle). |

**Render loop** (`Stage.loop`, every animation frame): skip entirely while the canvas is hidden
(`document.hidden` or no `offsetParent`) → advance `animTime` and the movement `phase`
(`dt · speed / cycle`, always speed 1, so the motion never jumps) → `sample()` → blend from the
previous pose over 0.7 s → `avatar.applyPose` → `avatar.update(time)` → camera → render.
`adaptQuality` lowers the pixel ratio (down to 1) when the frame rate stays under 40 fps.
`play()` with the same exercise and side only changes the highlight (get-ready → GO keeps moving).
`window.__stage` (set in app.js) exposes the stage for browser tests.

**Pose pipeline:**
1. An exercise's `frames` are shorthand angle objects. `Stage.play(ex, {mirrored, highlight})`
   runs each through `expandPose` (fills `NEUTRAL`, copies side-less limb keys to `_L`/`_R`) and
   `mirrorPose` for the other side. Frame `d` = relative step duration; `cycle` = seconds per loop
   (default 2), divided by `stage.speed` (1 during work, 0.6 during rest).
2. `sample()` finds the current pair of frames and `lerpPose`s with cosine easing (or constant speed
   when the exercise has `ease: 'linear'`, used for full arm circles where `shF` runs 0 → 360 and the
   last frame has `d: 0.001` so the loop is seamless). A single-frame hold gets a slow "breathing"
   wobble on `spineF`/`neckF`.
3. `Avatar.applyPose` sets bone rotations (spine split 45 % waist / 55 % chest; neck/head 50/50;
   shoulders and hips use Euler order `XZY`).
4. **Grounding:** the lowest of all named markers is put on the floor (`object.position.y`), plus
   `lift × scale` for jumps. You never set height by hand. `avatar.bounds` is the marker box.
5. **Camera:** `computeFraming()` runs once per `play()` (and after `setBody`): it poses the avatar
   at every keyframe and half-way between, takes the union of the marker bounds, and the camera
   eases (≈2/s) to a fixed target and distance that fit the whole movement, so it stays still while
   the body moves. Yaw comes
   from `view` (`front` 0°, `threeq` 30°, `side` 75°, `sidefront` 55°, `back` 180°; negated when
   mirrored) plus the user's drag. Double-click resets.

**Skin generation** (`Avatar.buildSkin` → `skin.js`): put the avatar in a bind pose
(`shAbd 40, hipAbd 6, elbow 5`) → turn each body shape into a signed distance field (smooth union
only between shapes on adjacent bones) → surface nets mesh (grid `CELL` 1.1 cm) → 3 rounds of
Taubin smoothing → per-vertex weights to the 4 nearest bones → `THREE.SkinnedMesh`. It is slow-ish,
so it runs once just after first paint (`setTimeout(() => stage.setBody(profile), 60)` in app.js)
and again whenever height, weight or body type changes. Before it runs, the raw shapes are shown.
`setBody` scales overall size by height (base model 1.83 m) and girth/belly by BMI.

**Workout engine** (app.js): `buildSegments(plan)` → `[ready 10 s, work, rest, work, …]`. Rest
length is `item.restAfter ?? plan.rest`; a rest after a circuit's last item has `breather: true`
("BREATHE DEEPLY", announces the next circuit). `tick()` runs every 100 ms; 3-2-1 beeps; for
`sides: true` exercises it mirrors the pose at half time and says "Switch sides". Prev/next skip
rests. Space / ← / → work on the keyboard. Wake lock keeps the screen on. A workout is saved to
history only if at least 60 s of work was done. Calories = MET × kg × hours (rest at MET 2).

**Plan builder** (`buildPlan`): rounds = `max(4, round((minutes·60 + rest)/(work + rest)))`;
~15 % warm-up, ~12 % cool-down, rest main. Pools filter by `cat`, `level <= chosen level` and no
`props`; exercises at the chosen level are double-weighted above Beginner. Standing moves come
before mat moves; no exercise repeats back-to-back. Seeded by date (`todaySeed`), so the plan is
stable for the day; "↻ Shuffle" changes the seed. Focus modes: `full`, `cardio`, `core`, `yoga`,
`desk`. `buildRoutinePlan(r)` flattens circuits in order with circuit metadata.

**Storage keys** (via `store` in app.js, JSON in `localStorage`):
- `mm.settings` – `{minutes, level, focus, work, rest, voice, beeps, theme}`
- `mm.profile` – `{heightCm, weightKg, sex}`
- `mm.history` – array of `{date, secs, kcal, count, focus}` (last 400 kept)

Keep these keys and shapes backward-compatible; `store.get` merges saved values over defaults.

**Service worker:** on every release that changes any shipped file, **bump `CACHE` in `sw.js`**
(currently `morning-move-v13`) and **add any new JS/CSS/asset file to `FILES`**, or installed users
may get a broken mix of old and new files.

## 4. The movement system

Full reference: `docs/EXERCISES.md` and the header of `tools/motion.js`. Essentials:

- All angles are degrees, clinical convention, 0 = standing with arms at the sides.
  `spineF` + forward / − arch back; `spineSide` + left; `spineTwist` + left;
  `neckF`/`neckSide`/`neckTurn` like the spine; `shF` + arm forward/up; `shAbd` + arm out;
  `shRot` + external; `elbow` + bend; `wrist` + back of hand up; `hipF` + knee up;
  `hipAbd` + leg out; `hipRot` + toes out; `knee` + bend; `ankle` + point toes / − toes up.
- Limb keys without a side apply to both; add `_L`/`_R` for one side.
- Whole body: `pitch` (+ lean forward, 90 face down, −90 face up), `yaw`, `roll` (+ tip right),
  `lift` (metres, jumps), `x`/`z` (pelvis shift, metres).
- Normal ranges: `ROM` in `tools/motion.js`.
- **`on`** (exercise-level or per-frame) lists what touches the floor, from `SUPPORT_TERMS`:
  `feet foot_L foot_R toes heels hands hand_L hand_R knees knee_L knee_R forearms forearm_L
  forearm_R arms back front seat head side_R`. Anything else touching the floor is an error.
- **`touch`**: `[[pointA, pointB, maxMetres]]`, e.g. `['hand_L', 'foot-top_L', 0.06]`.
- **Marker names** (in `Avatar.build`): `seat`, `hips-front`, `sit-bones`, `back`, `belly`, `chest`,
  `shoulder_L/R`, `head`, `head-back`, `face`, `chin`, and per side `elbow_`, `forearm_`, `hand_`,
  `knee_`, `shin_`, `calf_`, `heel_`, `toes_`, `foot-top_` + `L`/`R`. Markers drive grounding,
  camera framing and the checker, so moving one changes all three.

**Pose checker / fitter** (Node, no browser needed):
```bash
node tools/check-poses.mjs                          # all keyframes; must end "N/N keyframes pass"
node tools/check-poses.mjs squats                   # one exercise, with heights above the floor
node tools/check-poses.mjs --fit pushups 0 pitch+shF ankle   # adjust listed angles to satisfy rules
```
Checks: ROM, ON, BALANCE (standing on feet only), CLIP (limb inside another body part), TOUCH.
It also fails if a routine names an unknown exercise id. It checks frames unmirrored. Angles wrap at
360°, and shoulder extension past −60° is allowed while the arm is out to the side (abduction ≥ 60°).

**Fitter trap:** it can satisfy the rules by dropping the pose itself (e.g. a triangle pose that
no longer tilts). If so, add a `touch` that defines the pose, or fix the defining angle by hand.

**Rule:** every pose change must keep `node tools/check-poses.mjs` at 100 % pass **and** be looked
at visually at least once (see section 6).

## 5. Adding an exercise or a routine

Follow `docs/EXERCISES.md` §5–6, and check the movement against a reputable source first
(see `docs/EXERCISE-TECHNIQUE.md` for the format and sources used so far). In short:
- **Exercise:** add one object to `EXERCISES` in `js/exercises.js` (`id, name, cat, level, met,
  view, on, muscles, tips, frames`, optional `cycle`, `sides`, `mat`, `props`, `touch`).
  Muscle ids must be keys of `MUSCLES` in avatar.js. Run the checker, fit failures, then view it.
  Planner, library, player, voice and glow pick it up automatically.
- **Routine:** add an object to `ROUTINES` in `js/routines.js` (`id, name, level, work, rest,
  circuitRest, description, note?, circuits: [{name, ids}]`). Run the checker (validates ids).

## 6. Testing and verification

1. `node tools/check-poses.mjs` → 100 % pass.
2. Serve locally: `python3 -m http.server 8765` in the repo root (ES modules do not load from `file://`).
3. Browser checks use Playwright for Node with Chromium at `/opt/pw-browsers/chromium`. In this sandbox
   it has been imported as `/opt/node-tools/node_modules/playwright/index.mjs` (check with
   `npm ls -g playwright` if the path differs):
   ```js
   const { chromium } = require('playwright');
   const browser = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium',
     args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
   ```
   WebGL is software-rendered, so it is slow: use long timeouts (tens of seconds) and wait for the
   skin build. Always collect `page.on('console')` errors and `page.on('pageerror')`; there should be none.
4. Pose screenshots: open `http://localhost:8765/pose-debug.html`, wait for `window.ready`, then
   `show(id, frame, mirrored?)`, optionally `yaw(deg)` to set the camera angle, and
   `window.stageRef` for direct access to the `Stage`. `window.EX` lists ids and frame counts.
5. For UI changes, click through: home → start workout (ready/work/rest/breather, switch sides,
   pause/end), library preview, profile (height/weight rebuilds the skin, theme switch), both themes,
   phone and laptop widths.

## 7. Deployment

- Branch **`claude/3d-fitness-exercise-app-2093hi`** is served by GitHub Pages at
  **https://adithyag22.github.io/Morning-Exercise-/** (`.nojekyll` keeps files served as-is).
  Pushing to that branch deploys. Remember the `sw.js` cache bump.
- **Private claude.ai preview:** https://claude.ai/artifact/TFujaJLR3zBpaUK6JVjiAB. It is a
  single-file bundle built with `python3 tools/build-preview.py` → `dist/morning-move.html`
  (`dist/` is git-ignored). The script inlines CSS and all modules (list `MODULES` in dependency
  order; add new modules there), strips the service worker registration, and imports Three.js from
  `https://cdn.jsdelivr.net/npm/three@0.160.0/...` because artifacts only allow allowlisted CDNs.
  In artifacts there is no service worker and no `confirm()`/`alert()` dialogs.
  Republish to the same URL when updating.
- **Sandbox note:** in the cloud sandbox, `cdn.jsdelivr.net` and `github.io` are blocked by the
  proxy. To test the preview bundle, route the CDN URL to the local vendor file, e.g.
  `page.route('**/cdn.jsdelivr.net/**', r => r.fulfill({ path: 'vendor/three.module.min.js',
  contentType: 'text/javascript' }))`. You cannot check the live Pages site from the sandbox.

**Google Play:** the plan is a Trusted Web Activity built by the owner with PWABuilder
(package `io.github.adithyag22.morningmove`), which loads the live Pages site. The step-by-step
owner guide is `docs/PLAY-STORE.md`; store assets and listing text are in `store/`; the privacy
policy is `privacy.html`. Digital Asset Links must be served from the domain root, i.e. a separate
`adithyag22.github.io` repository with `.nojekyll` and `.well-known/assetlinks.json`. If store
screenshots go stale after UI changes, regenerate them at 360×640 @3x (1080×1920).

## 8. Known limitations and ideas not yet done

- The mannequin has no face details or separate fingers (hands are simple blobs).
- Linear-blend skinning pinches/thins at deep bends (knees, elbows, hips in deep squats).
- The one-foot balance check ignores foot roll; the checker only tests unmirrored frames.
- Voice coach is English only (`say` uses `en-US`).
- Ideas: retarget motion capture (e.g. CMU BVH) onto the skeleton; extract poses from videos with
  MediaPipe; morning reminders/notifications; more voice-coach languages; more routines.

## 9. Conventions

- Match existing style: ES modules, no build step, no frameworks, small explanatory comments,
  2-space indent, single quotes.
- Keep the app light (about 0.9 MB, mostly Three.js). No model files, fonts, or heavy dependencies.
- Do not add a backend, tracking, or anything that sends user data off the device.
- Commit with clear messages that describe the change for a human. Follow the session's commit
  attribution instructions for trailer lines; do not mention model names anywhere else.
- Update `README.md` / `docs/EXERCISES.md` when behaviour or workflow changes.
