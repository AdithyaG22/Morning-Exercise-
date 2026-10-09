# Morning Move 🌅

A **free, lightweight** morning workout app with a **3D trainer** you follow along with.
It is built for people who sit at a laptop all day and want to stay fit and healthy. It is not about building big muscles.

- 🧍 **3D trainer sized to you**: enter your height and weight and the trainer matches your build.
- 🔴 **See which muscles work**: the muscles used in each exercise glow red, and the next exercise's muscles show in amber during rest.
- ⏱️ **Interval timer**: 20 s exercise / 10 s rest by default, adjustable. Workouts run 5–30 minutes (default 15).
- 📈 **Beginner → Intermediate → Advanced** levels.
- 🧘 **Focus modes**: Full body, Cardio, Core & back, **Yoga**, and **Desk relief** (stretches for screen workers).
- 🗣️ **Voice coach and countdown beeps**, so you do not have to watch the screen.
- 🔥 Streak, weekly calendar, minutes and estimated calories.
- 📴 **Works offline** and installs to your home screen. No account, no ads, and no data leaves your device.
- 🪶 **Tiny**: about 800 KB total. The 3D trainer is built from code, so there are no heavy model files.

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

### Want a real Play Store APK later?
Because this is a PWA, you can wrap it into an Android app for free with
[PWABuilder](https://www.pwabuilder.com/): paste your GitHub Pages URL and download the Android package.

## Tips during a workout
- **Drag** on the trainer to rotate the camera. **Double-tap** resets the view.
- `Space` pauses, `←` / `→` go to the previous / next exercise (keyboard).
- One-sided holds (Tree pose, Side plank, Warrior II…) switch sides automatically halfway.
- The screen stays awake during a workout on supported browsers.

## Project structure
```
index.html            App shell (home, exercise library, profile, player)
css/style.css         Styles (light and dark mode, phone and laptop layouts)
js/app.js             UI, workout timer and history
js/stage.js           Three.js scene, auto-framing camera, animation blending
js/avatar.js          Procedural 3D body: skeleton, muscle groups, sizing, posing
js/exercises.js       Exercise library: keyframe poses, muscles, level, tips
js/plan.js            Builds warm-up → main → cool-down for the chosen duration
js/audio.js           Beeps (Web Audio) and voice (speech synthesis)
sw.js                 Offline cache
pose-debug.html       Developer tool to view any exercise keyframe
vendor/three.module.min.js   Three.js r160 (MIT)
```

## Adding an exercise
Add an entry in `js/exercises.js`. A pose is a set of joint angles in degrees, for example:

```js
{
  id: 'squats', name: 'Bodyweight Squats', cat: 'strength', level: 1, met: 5,
  cycle: 2.6,            // seconds per repetition
  view: 'side',          // camera: front | threeq | side
  muscles: ['quads', 'glutes', 'hamstrings'],
  tips: 'Chest up, push hips back.',
  frames: [ {}, { pitch: 35, hipF: 112, knee: 112, ankle: -35, shF: 125 } ],
}
```
The body is grounded automatically, so whichever point is lowest touches the floor. To check a pose, open
`pose-debug.html` and run `show('squats', 1)` in the browser console.

> ⚠️ This app gives general fitness guidance, not medical advice. If you have an injury or a health condition, check with a doctor first, and stop any exercise that causes pain.
