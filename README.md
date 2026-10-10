# Morning Move 🌅

A **free, lightweight** morning workout app with a **3D trainer** you follow along with.
It is built for people who sit at a laptop all day and want to stay fit and healthy. It is not about building big muscles.

- 🧍 **3D trainer sized to you**: enter your height and weight and the trainer matches your build.
- 🔴 **See which muscles work**: the muscles used in each exercise glow red, and the next exercise's muscles show in amber during rest.
- ⏱️ **Interval timer**: 20 s exercise / 10 s rest by default, adjustable. Workouts run 5–30 minutes (default 15).
- 📈 **Beginner → Intermediate → Advanced** levels.
- 📋 **Ready-made routines**: e.g. *Beginner Full Body*, 4 circuits with breathing breaks, dumbbell moves included.
- 🧘 **Focus modes**: Full body, Cardio, Core & back, **Yoga**, and **Desk relief** (stretches for screen workers).
- 🗣️ **Voice coach and countdown beeps**, so you do not have to watch the screen.
- 🔥 Streak, weekly calendar, minutes and estimated calories.
- 📴 **Works offline** and installs to your home screen. No account, no ads, and no data leaves your device.
- 🪶 **Tiny**: about 0.9 MB total. The 3D trainer is built from code, so there are no heavy model files.

## Using it

### Option 1: Put it online for free (recommended, works on your phone)
1. On GitHub, open this repo → **Settings → Pages**.
2. Under *Build and deployment*, choose **Deploy from a branch**, pick your branch and the `/ (root)` folder, then **Save**.
3. After about a minute your app is live at `https://<your-username>.github.io/Morning-Exercise-/`.
4. Open that link on your phone in Chrome → menu ⋮ → **Add to Home screen** (or **Install app**). It now opens like a normal app and works offline.

### Option 2: Run it on your laptop
Any static file server works:
```bash
python3 -m http.server 8000
# then open http://localhost:8000
```
(Opening `index.html` directly with `file://` will not work, because browsers block ES modules from local files.)

### Publishing on Google Play
Follow **[docs/PLAY-STORE.md](docs/PLAY-STORE.md)**. The store graphics and texts are ready in `store/`.
The app is wrapped into an Android app for free with [PWABuilder](https://www.pwabuilder.com/).

## Tips during a workout
- **Drag** on the trainer to rotate the camera. **Double-tap** resets the view.
- `Space` pauses, `←` / `→` go to the previous / next exercise (keyboard).
- One-sided holds (Tree pose, Side plank, Warrior II…) switch sides automatically halfway.
- The screen stays awake during a workout on supported browsers.

## Project structure
```
index.html            App shell (home, exercise library, profile, player)
css/style.css         Styles (light/dark themes, phone and laptop layouts)
js/app.js             UI, workout timer, history, settings
js/stage.js           Three.js scene, theme lighting, auto-framing camera, animation blending
js/avatar.js          Skeleton, body shapes, muscle groups, sizing, posing, floor contact
js/skin.js            Builds one smooth skin over the body shapes and binds it to the skeleton
js/exercises.js       Exercise library: joint-angle keyframes, muscles, level, tips
js/plan.js            Builds warm-up → main → cool-down for the chosen duration, and routine plans
js/routines.js        Ready-made routines (e.g. 20-min Beginner Full Body in 4 circuits)
js/audio.js           Beeps (Web Audio) and voice (speech synthesis)
sw.js                 Offline cache
vendor/three.module.min.js   Three.js r160 (MIT)

tools/check-poses.mjs Checks every pose with numbers (joint ranges, floor contact, balance,
                      limbs passing through the body) and fits poses that fail
tools/motion.js       Joint-angle conventions and normal ranges of motion
tools/build-preview.py  Bundles the app into one HTML page for previews
pose-debug.html       Shows any exercise keyframe in 3D
docs/EXERCISES.md     How poses are described, checked and added
docs/EXERCISE-TECHNIQUE.md  Correct form for every exercise, with sources
docs/PLAY-STORE.md    Step-by-step guide to publishing on Google Play
store/                Play Store screenshots, feature graphic and listing text
privacy.html          Privacy policy (needed for the Play Store)
CLAUDE.md             Project guide for new Claude sessions
```

## Adding an exercise
Add one entry to `js/exercises.js` and run `node tools/check-poses.mjs`. The planner, library, timer,
voice and muscle glow pick it up automatically. See **[docs/EXERCISES.md](docs/EXERCISES.md)** for the joint-angle
system, the floor-contact rules, and the pose fitter.

> ⚠️ This app gives general fitness guidance, not medical advice. If you have an injury or a health condition, check with a doctor first, and stop any exercise that causes pain.
