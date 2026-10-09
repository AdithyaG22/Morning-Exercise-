# Exercises and the movement system

Every exercise in Morning Move is plain data in [`js/exercises.js`](../js/exercises.js). A pose is
a list of **joint angles in degrees**, written the way physiotherapists describe movement. A
small checker then verifies each pose with numbers, so poses don't have to be judged from screenshots.

## 1. Describing a pose: joint angles

Angles follow the clinical convention used in range-of-motion charts (ISB / AAOS). Every joint is
`0°` when standing upright with arms at the sides, and each key names one anatomical motion:

| Key | + direction | − direction | Normal range |
|---|---|---|---|
| `spineF` | bend forward (flexion) | arch back (extension) | −60 … 90 |
| `spineSide` | lean left | lean right | −40 … 40 |
| `spineTwist` | turn left | turn right | −45 … 45 |
| `neckF` / `neckSide` / `neckTurn` | as the spine | | −60 … 50 / ±45 / ±80 |
| `shF` | arm forward / up | arm back | −60 … 180 |
| `shAbd` | arm out to the side | arm across the body | −45 … 180 |
| `shRot` | external rotation | internal rotation | −80 … 90 |
| `elbow` | bend | | 0 … 150 |
| `wrist` | back of hand up | palm down | −80 … 90 |
| `hipF` | knee up / forward | leg back | −30 … 130 |
| `hipAbd` | leg out | leg across | −30 … 50 |
| `hipRot` | toes out | toes in | −40 … 60 |
| `knee` | bend | | 0 … 155 |
| `ankle` | point toes | toes up | −40 … 60 |

A key without a side (`knee: 90`) applies to both limbs; add `_L` or `_R` for one side
(`knee_L: 90`). The whole body is placed with `pitch` (+ lean forward, `90` = face down,
`−90` = face up), `yaw` (turn), `roll` (+ tip to the right) and `lift` (metres, for jumps).
**You never set the height:** the lowest body part is always placed on the floor.

The ranges live in [`tools/motion.js`](../tools/motion.js).

## 2. Describing the rules: `on` and `touch`

Each exercise, or a single keyframe, states which body parts rest on the floor, plus optional
contact targets:

```js
{ id: 'pushups', on: 'hands toes', frames: [HIGH_PLANK, PUSHUP_DOWN] }
{ id: 'quad-stretch', on: 'foot_R', touch: [['hand_L', 'foot-top_L', 0.06]], ... }   // hand holds foot
```

Floor words: `feet`, `foot_L`, `foot_R`, `toes`, `heels`, `hands`, `hand_L/R`, `knees`, `knee_L/R`,
`forearms`, `forearm_L/R`, `arms`, `back`, `front`, `seat`, `head`, `side_R`.
Touch points: `hand`, `elbow`, `forearm`, `knee`, `shin`, `calf`, `heel`, `toes`, `foot-top`
(each with `_L` or `_R`), plus `head`, `face`, `chin`, `chest`, `belly`, `back`, `seat`, `sit-bones`.

## 3. Checking poses with numbers

```bash
node tools/check-poses.mjs              # check every keyframe of every exercise
node tools/check-poses.mjs pushups      # one exercise, with each body part's height above the floor
```

For each keyframe it reports:

- **ROM**: a joint is bent beyond the normal human range.
- **ON**: a body part that should be on the floor isn't, or something else touches it
  (e.g. a knee in a push-up).
- **BALANCE**: when standing, the centre of mass is outside the feet, so the person would tip over.
  It uses standard body-segment masses.
- **CLIP**: a hand or limb passes through another body part.
- **TOUCH**: a contact target is out of reach.

## 4. Fixing a pose automatically

The fitter adjusts the angles you name until the keyframe meets its rules, then prints the numbers:

```bash
node tools/check-poses.mjs --fit pushups 0 pitch+shF ankle
#   pushups #0: cost 4.1059 → 0.0000
#   pitch: 74.6, shF: 74.6, ankle: 29.5
```

`pitch+shF` moves both together. Here that keeps the arms vertical while the body angle changes.
Copy the result into `exercises.js` and check again.

Watch for one trap: the fitter can satisfy the rules by giving up the pose itself. For example, it
might pass a triangle pose by not tilting. If that happens, add a `touch` goal that defines the pose
(triangle: front hand to front shin), or fix the angle that gives the pose its character.

## 5. Adding an exercise

1. Add an object to `EXERCISES` in `js/exercises.js`:

```js
{
  id: 'wall-sit', name: 'Wall Sit', cat: 'strength', level: 2, met: 4, view: 'side',
  on: 'feet',
  muscles: ['quads', 'glutes'],
  tips: 'Back against a wall, thighs parallel to the floor.',
  frames: [{ hipF: 90, knee: 90 }],          // one frame = a hold; several = a movement loop
}
```

   `cat` decides where it appears in plans (`warmup`, `cardio`, `strength`, `core`, `yoga`,
   `stretch`). `level` is 1–3. `cycle` is seconds per repetition. A frame's `d` makes that step
   longer or shorter. `sides: true` mirrors a hold halfway. `mat: true` shows the exercise mat.
2. Run `node tools/check-poses.mjs wall-sit`, and fit any failures.
3. Preview it: open `pose-debug.html` and run `show('wall-sit', 0)` in the console.

Nothing else needs changing. The workout planner, library, timer, voice coach and muscle glow pick
it up automatically.
