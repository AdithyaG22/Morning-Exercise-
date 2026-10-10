// Exercise library. Each exercise is a loop of keyframe poses (joint angles in degrees).
// Pose keys: pitch/yaw/roll (whole body), lift (jump height m), spineF/spineSide/spineTwist,
// neckF/neckSide/neckTurn, and per-limb shF, shAbd, shRot, elbow, wrist, hipF, hipAbd,
// hipRot, knee, ankle. A limb key without _L/_R applies to both sides.
//
// level: 1 beginner, 2 intermediate, 3 advanced
// cat: warmup | cardio | strength | core | yoga | stretch
// sides: hold one side for the first half, mirror for the second half
// props: ['dumbbells'] shows dumbbells in the hands (water bottles work too)
// ease: 'linear' keeps a constant speed between keyframes (use for circles); default eases in and out
// met: metabolic equivalent, used for the calorie estimate

// ---- Reusable poses ----
const STAND = {};
const HANDS_ON_HIPS = { shAbd: 35, elbow: 100, shRot: -75 };

// High plank (push-up top). Arms vertical: shF = pitch.
const HIGH_PLANK = { pitch: 75, shF: 75, shAbd: 8, elbow: 0, wrist: 90, ankle: 30 };
const PUSHUP_DOWN = { pitch: 85, shF: 0, shAbd: 18, elbow: 80, wrist: 90, ankle: 18, neckF: -10 };
const KNEE_PLANK = { pitch: 60, shF: 60, shAbd: 8, elbow: 0, wrist: 90, knee: 95, ankle: 30 };
const KNEE_PUSH_DOWN = { pitch: 75, shF: -2, shAbd: 18, elbow: 81, wrist: 90, knee: 95, ankle: 30, neckF: -10 };
const FOREARM_PLANK = { pitch: 84, shF: 84, shAbd: 6, elbow: 90, wrist: 0, ankle: 17, neckF: -5 };

// Lying on the back with knees bent, feet flat
const BACK_KNEES = { pitch: -90, hipF: 50, knee: 105, ankle: 35, shF: -16, shAbd: 16, elbow: 20 };
// Lying on the back, legs straight
const BACK_FLAT = { pitch: -90, ankle: 20, shAbd: 12, elbow: 0 };
// Face down, arms overhead
const PRONE = { pitch: 90, shF: 165, shAbd: 15, elbow: 5, ankle: 59, hipF: 3 };
// Hands and knees
const TABLETOP = { pitch: 87, shF: 87, shAbd: 4, elbow: 0, wrist: 90, hipF: 87, knee: 90, ankle: 59, hipAbd: 4 };

const SQUAT_LOW = { pitch: 35, hipF: 112, knee: 112, ankle: -35, shF: 125, shAbd: 6, elbow: 10, hipAbd: 8 };
// Hip hinge with soft knees, back flat (bent-over rows, kickbacks)
const HINGE = { pitch: 45, hipF: 52, knee: 15, ankle: -8 };

const SQUAT_HANDS_DOWN = { pitch: 26, spineF: 53, hipF: 128, knee: 154, ankle: -40, shF: 54, shAbd: 10, wrist: 80, hipAbd: 8 };

export const EXERCISES = [
  // ---------------- Warm-up ----------------
  {
    id: 'march', on: 'feet', name: 'March in Place', cat: 'warmup', level: 1, met: 3.5, cycle: 1.5, view: 'threeq',
    muscles: ['hipFlexors', 'quads', 'calves'],
    tips: 'Lift your knees to hip height and swing your arms naturally. Stand tall.',
    frames: [
      { hipF_L: 88, knee_L: 90, ankle_L: 15, shF_R: 40, shF_L: -25, elbow: 80, roll: 4, hipAbd_R: 0, on: 'foot_R' },
      { elbow: 80 },
      { hipF_R: 88, knee_R: 90, ankle_R: 15, shF_L: 40, shF_R: -25, elbow: 80, roll: -4, hipAbd_L: 0, on: 'foot_L' },
      { elbow: 80 },
    ],
  },
  {
    id: 'arm-circles', on: 'feet', name: 'Arm Circles', cat: 'warmup', level: 1, met: 3, cycle: 8, view: 'threeq', ease: 'linear',
    muscles: ['shoulders', 'traps', 'back'],
    tips: 'Arms straight out to the sides. Make small, controlled circles forward, then switch direction.',
    // Arms held out at 75°; shoulder flexion keeps turning, so each hand traces a small circle.
    // Two circles forward (0 → 720°), then two backward.
    frames: [
      { shF: 0, shAbd: 75, elbow: 0, hipAbd: 8 },
      { shF: 90, shAbd: 75, elbow: 0, hipAbd: 8 },
      { shF: 180, shAbd: 75, elbow: 0, hipAbd: 8 },
      { shF: 270, shAbd: 75, elbow: 0, hipAbd: 8 },
      { shF: 360, shAbd: 75, elbow: 0, hipAbd: 8 },
      { shF: 450, shAbd: 75, elbow: 0, hipAbd: 8 },
      { shF: 540, shAbd: 75, elbow: 0, hipAbd: 8 },
      { shF: 630, shAbd: 75, elbow: 0, hipAbd: 8 },
      { shF: 720, shAbd: 75, elbow: 0, hipAbd: 8 },
      { shF: 630, shAbd: 75, elbow: 0, hipAbd: 8 },
      { shF: 540, shAbd: 75, elbow: 0, hipAbd: 8 },
      { shF: 450, shAbd: 75, elbow: 0, hipAbd: 8 },
      { shF: 360, shAbd: 75, elbow: 0, hipAbd: 8 },
      { shF: 270, shAbd: 75, elbow: 0, hipAbd: 8 },
      { shF: 180, shAbd: 75, elbow: 0, hipAbd: 8 },
      { shF: 90, shAbd: 75, elbow: 0, hipAbd: 8 },
    ],
  },
  {
    id: 'neck-tilt', on: 'feet', name: 'Neck Tilts', cat: 'warmup', level: 1, met: 2, cycle: 5, view: 'front',
    muscles: ['neck', 'traps'],
    tips: 'Slowly tilt your ear toward your shoulder. Keep shoulders relaxed and down. Great after long screen time.',
    frames: [{ neckSide: 32 }, STAND, { neckSide: -32 }, STAND],
  },
  {
    id: 'hip-circles', on: 'feet', name: 'Hip Circles', cat: 'warmup', level: 1, met: 2.5, cycle: 3, view: 'front',
    muscles: ['obliques', 'lowerBack', 'glutes'],
    tips: 'Hands on hips, feet shoulder-width. Draw big slow circles with your hips.',
    frames: [
      { ...HANDS_ON_HIPS, x: 0.06, hipAbd_L: 6, hipAbd_R: 14, spineSide: -8 },
      { ...HANDS_ON_HIPS, hipAbd: 10, z: 0.05, pitch: -5, spineF: 10, hipF: -8.3, ankle: -3.3 },
      { ...HANDS_ON_HIPS, x: -0.06, hipAbd_L: 14, hipAbd_R: 6, spineSide: 8 },
      { ...HANDS_ON_HIPS, hipAbd: 10, z: -0.05, pitch: 6, spineF: -6, hipF: 9.3, ankle: 3.3 },
    ],
  },
  {
    id: 'torso-twist', on: 'feet', name: 'Torso Twists', cat: 'warmup', level: 1, met: 3, cycle: 2, view: 'front',
    muscles: ['obliques', 'abs', 'lowerBack'],
    tips: 'Keep hips facing forward and rotate from your waist. Arms loose at chest height.',
    frames: [
      { spineTwist: 45, neckTurn: 15, shAbd: 75, elbow: 115, shRot: -35, hipAbd: 9 },
      { spineTwist: -45, neckTurn: -15, shAbd: 75, elbow: 115, shRot: -35, hipAbd: 9 },
    ],
  },
  {
    id: 'side-bend', on: 'feet', name: 'Standing Side Bends', cat: 'warmup', level: 1, met: 2.5, cycle: 3.5, view: 'front',
    muscles: ['obliques', 'back'],
    tips: 'Reach one arm overhead and lean to the opposite side. Do not lean forward.',
    frames: [
      { spineSide: 32, shAbd_R: 165, elbow_R: 15, shAbd_L: 15, hipAbd: 9 },
      { hipAbd: 9 },
      { spineSide: -32, shAbd_L: 165, elbow_L: 15, shAbd_R: 15, hipAbd: 9 },
      { hipAbd: 9 },
    ],
  },
  {
    id: 'tadasana-reach', on: 'feet', name: 'Mountain Reach', cat: 'warmup', level: 1, met: 2.3, cycle: 6, view: 'threeq',
    muscles: ['shoulders', 'back', 'calves', 'abs'],
    tips: 'Breathe in as you reach up and rise onto your toes. Breathe out as you lower.',
    frames: [{ d: 0.8 }, { shAbd: 172, elbow: 0, ankle: 25, neckF: -10, pitch: 4, hipF: -3, on: 'toes' }],
  },

  // ---------------- Cardio ----------------
  {
    id: 'jumping-jacks', on: 'feet', name: 'Jumping Jacks', cat: 'cardio', level: 1, met: 8, cycle: 1.1, view: 'front',
    muscles: ['calves', 'shoulders', 'glutes', 'adductors'],
    tips: 'Land softly on the balls of your feet. Low impact option: step one leg out at a time.',
    frames: [
      { shAbd: 12, hipAbd: 3 },
      { shAbd: 90, hipAbd: 10, lift: 0.07, ankle: 30, d: 0.6 },
      { shAbd: 172, hipAbd: 17, elbow: 5 },
      { shAbd: 90, hipAbd: 10, lift: 0.07, ankle: 30, d: 0.6 },
    ],
  },
  {
    id: 'high-knees', on: 'feet', name: 'High Knees', cat: 'cardio', level: 2, met: 8, cycle: 0.75, view: 'threeq',
    muscles: ['hipFlexors', 'quads', 'calves', 'abs'],
    tips: 'Drive your knees up to hip height quickly. Stay on the balls of your feet.',
    frames: [
      { hipF_L: 95, knee_L: 95, ankle_L: 20, shF_R: 55, shF_L: -30, elbow: 85, ankle_R: 20.8, roll: 5.2, pitch: 2.9, hipAbd_R: 1.1, on: 'foot_R' },
      { shF: 10, elbow: 85, lift: 0.04, ankle: 25, d: 0.4 },
      { hipF_R: 95, knee_R: 95, ankle_R: 20, shF_L: 55, shF_R: -30, elbow: 85, ankle_L: 20.8, roll: -5.2, pitch: 2.9, hipAbd_L: 1.1, on: 'foot_L' },
      { shF: 10, elbow: 85, lift: 0.04, ankle: 25, d: 0.4 },
    ],
  },
  {
    id: 'butt-kicks', on: 'feet', name: 'Butt Kicks', cat: 'cardio', level: 1, met: 7, cycle: 0.8, view: 'side',
    muscles: ['hamstrings', 'calves', 'quads'],
    tips: 'Jog in place and kick your heels toward your glutes.',
    frames: [
      { knee_L: 130, hipF_L: -5, ankle_L: 20, shF_R: 35, shF_L: -25, elbow: 85, ankle_R: 15, roll: 5.7, pitch: 6.9, hipAbd_R: 1.5, on: 'foot_R' },
      { elbow: 85, lift: 0.03, ankle: 20, d: 0.4 },
      { knee_R: 130, hipF_R: -5, ankle_R: 20, shF_L: 35, shF_R: -25, elbow: 85, ankle_L: 15, roll: -5.7, pitch: 6.9, hipAbd_L: 1.5, on: 'foot_L' },
      { elbow: 85, lift: 0.03, ankle: 20, d: 0.4 },
    ],
  },
  {
    id: 'knee-elbow', on: 'feet', touch: [['hand_L', 'head-back', 0.14]], name: 'Standing Knee to Elbow', cat: 'cardio', level: 1, met: 5, cycle: 1.8, view: 'front',
    muscles: ['obliques', 'abs', 'hipFlexors'],
    tips: 'Hands behind your head. Bring your knee up to meet the opposite elbow.',
    frames: [
      { hipF_L: 90, knee_L: 90, spineTwist: 30, spineF: 20, spineSide: -10, shAbd: 120, elbow: 132, shRot: 90, roll: 4, hipAbd_R: 1, on: 'foot_R' },
      { shAbd: 120, elbow: 132, shRot: 90, hipAbd: 8 },
      { hipF_R: 90, knee_R: 90, spineTwist: -30, spineF: 20, spineSide: 10, shAbd: 120, elbow: 132, shRot: 90, roll: -4, hipAbd_L: 1, on: 'foot_L' },
      { shAbd: 120, elbow: 132, shRot: 90, hipAbd: 8 },
    ],
  },
  {
    id: 'mountain-climbers', on: 'hands toes', name: 'Mountain Climbers', cat: 'cardio', level: 2, met: 8, cycle: 0.9, view: 'side', mat: true,
    muscles: ['abs', 'shoulders', 'hipFlexors', 'quads'],
    tips: 'From a high plank, drive knees toward your chest one at a time. Keep hips low.',
    frames: [
      { ...HIGH_PLANK, hipF_L: 119, knee_L: 150, ankle_L: -16, ankle_R: 0, on: 'hands foot_R' },
      { ...HIGH_PLANK, hipF_R: 119, knee_R: 150, ankle_R: -16, ankle_L: 0, on: 'hands foot_L' },
    ],
  },
  {
    id: 'squat-jumps', on: 'feet', name: 'Squat Jumps', cat: 'cardio', level: 3, met: 9, cycle: 1.6, view: 'side',
    muscles: ['quads', 'glutes', 'calves', 'hamstrings'],
    tips: 'Squat down, then explode up. Land softly and go straight into the next squat.',
    frames: [
      { ...SQUAT_LOW, shF: -35, shRot: 0, d: 1.2 },
      { shAbd: 20, shF: 160, ankle: 35, lift: 0.2, d: 0.7 },
      { lift: 0.08, shF: 90, ankle: 25, d: 0.3 },
      { pitch: 21.7, hipF: 53.4, knee: 35, ankle: -21.6, shF: 40, d: 0.5 },   // land softly
    ],
  },
  {
    id: 'burpees', on: 'feet', name: 'Burpees', cat: 'cardio', level: 3, met: 10, cycle: 3.4, view: 'side', mat: true,
    muscles: ['quads', 'chest', 'shoulders', 'abs', 'glutes'],
    tips: 'Squat, hands down, jump back to plank, jump feet in, then jump up. Move with control.',
    frames: [
      { d: 0.6 },
      { ...SQUAT_HANDS_DOWN, d: 0.7, on: 'feet hands' },
      { ...HIGH_PLANK, d: 0.9, on: 'hands toes' },
      { ...SQUAT_HANDS_DOWN, d: 0.6, on: 'feet hands' },
      { shAbd: 20, shF: 165, ankle: 35, lift: 0.18, d: 0.6 },
    ],
  },
  {
    id: 'plank-jacks', on: 'hands toes', name: 'Plank Jacks', cat: 'cardio', level: 3, met: 8, cycle: 1, view: 'threeq', mat: true,
    muscles: ['abs', 'shoulders', 'adductors', 'glutes'],
    tips: 'Hold a high plank and jump your feet wide and back together.',
    frames: [
      { ...HIGH_PLANK, hipAbd: 2 },
      { ...HIGH_PLANK, hipAbd: 16 },
    ],
  },

  // ---------------- Strength ----------------
  {
    id: 'squats', on: 'feet', name: 'Bodyweight Squats', cat: 'strength', level: 1, met: 5, cycle: 2.6, view: 'side',
    muscles: ['quads', 'glutes', 'hamstrings', 'adductors'],
    tips: 'Feet shoulder-width, chest up, push hips back. Knees follow your toes.',
    frames: [{ shF: 15, hipAbd: 8, d: 0.8 }, { ...SQUAT_LOW, d: 1.2 }],
  },
  {
    id: 'lunges', on: 'feet', name: 'Alternating Lunges', cat: 'strength', level: 2, met: 5.5, cycle: 4, view: 'side',
    muscles: ['quads', 'glutes', 'hamstrings', 'calves'],
    tips: 'Step forward, lower until both knees are about 90°. Front knee stays over the ankle.',
    frames: [
      { ...HANDS_ON_HIPS, d: 0.6 },
      { ...HANDS_ON_HIPS, hipF_L: 82, knee_L: 84, ankle_L: -6, hipF_R: -9, knee_R: 87, ankle_R: -37 },
      { ...HANDS_ON_HIPS, d: 0.6 },
      { ...HANDS_ON_HIPS, hipF_R: 82, knee_R: 84, ankle_R: -6, hipF_L: -9, knee_L: 87, ankle_L: -37 },
    ],
  },
  {
    id: 'calf-raises', on: 'feet', name: 'Calf Raises', cat: 'strength', level: 1, met: 3, cycle: 3, view: 'side',
    muscles: ['calves'],
    tips: 'Rise slowly onto your toes, pause at the top, lower with control.',
    frames: [
      { ...HANDS_ON_HIPS, d: 0.8 },
      { ...HANDS_ON_HIPS, ankle: 38, pitch: 2, hipF: -2, on: 'toes', d: 0.6 },   // pause at the top
      { ...HANDS_ON_HIPS, ankle: 38, pitch: 2, hipF: -2, on: 'toes', d: 1.3 },   // lower slowly
    ],
  },
  {
    id: 'knee-pushups', on: 'hands knees', name: 'Knee Push-ups', cat: 'strength', level: 1, met: 4, cycle: 2.4, view: 'side', mat: true,
    muscles: ['chest', 'triceps', 'shoulders'],
    tips: 'Knees down, body straight from knees to head. Lower your chest toward the floor.',
    frames: [KNEE_PLANK, KNEE_PUSH_DOWN],
  },
  {
    id: 'pushups', on: 'hands toes', name: 'Push-ups', cat: 'strength', level: 2, met: 6, cycle: 2.2, view: 'side', mat: true,
    muscles: ['chest', 'triceps', 'shoulders', 'abs'],
    tips: 'Hands under shoulders, body in one straight line. Lower until chest is near the floor.',
    frames: [HIGH_PLANK, PUSHUP_DOWN],
  },
  {
    id: 'glute-bridge', on: 'back feet arms', name: 'Glute Bridge', cat: 'strength', level: 1, met: 3.5, cycle: 2.6, view: 'side', mat: true,
    muscles: ['glutes', 'hamstrings', 'lowerBack'],
    tips: 'Feet flat, push through your heels and squeeze your glutes at the top.',
    frames: [
      BACK_KNEES,
      { pitch: -112, hipF: -3, knee: 104, ankle: 16, shF: -38, shAbd: 12, elbow: 0 },
    ],
  },
  {
    id: 'superman', on: 'front arms knees', name: 'Superman', cat: 'strength', level: 1, met: 3.5, cycle: 3, view: 'side', mat: true,
    muscles: ['lowerBack', 'glutes', 'back', 'hamstrings'],
    tips: 'Lying face down, lift your arms and legs a few centimetres off the floor. Keep your neck long and look at the floor; do not arch your lower back.',
    frames: [PRONE, { ...PRONE, spineF: -8, neckF: 0, shF: 178, hipF: -14, ankle: 60, on: 'front' }],
  },
  {
    id: 'bird-dog', on: 'hands knees', name: 'Bird Dog', cat: 'strength', level: 1, met: 3, cycle: 4, view: 'side', mat: true,
    muscles: ['lowerBack', 'glutes', 'abs', 'shoulders'],
    tips: 'On hands and knees, reach one arm forward and the opposite leg back. Keep hips level.',
    frames: [
      TABLETOP,
      { ...TABLETOP, shF_L: 178, wrist_L: 0, hipF_R: 0, knee_R: 0, ankle_R: 60, on: 'hand_R knee_L' },
      TABLETOP,
      { ...TABLETOP, shF_R: 178, wrist_R: 0, hipF_L: 0, knee_L: 0, ankle_L: 60, on: 'hand_L knee_R' },
    ],
  },

  // ---------------- Core ----------------
  {
    id: 'plank', on: 'forearms toes', name: 'Forearm Plank', cat: 'core', level: 1, met: 4, view: 'side', mat: true,
    muscles: ['abs', 'shoulders', 'lowerBack', 'glutes', 'quads'],
    tips: 'Elbows under shoulders, body straight. Squeeze your glutes and breathe.',
    frames: [FOREARM_PLANK],
  },
  {
    id: 'crunches', on: 'back feet', name: 'Crunches', cat: 'core', level: 1, met: 3.8, cycle: 2.2, view: 'side', mat: true,
    muscles: ['abs'],
    tips: 'Lift your shoulders off the floor using your abs. Do not pull on your neck.',
    frames: [
      { ...BACK_KNEES, shF: 40 },
      { ...BACK_KNEES, spineF: 28, neckF: 10, shF: 50 },
    ],
  },
  {
    id: 'dead-bug', on: 'back', name: 'Dead Bug', cat: 'core', level: 1, met: 3, cycle: 4, view: 'side', mat: true,
    muscles: ['abs', 'hipFlexors'],
    tips: 'Press your lower back into the floor. Extend opposite arm and leg slowly.',
    frames: [
      { pitch: -90, shF: 90, elbow: 0, hipF: 90, knee: 90, ankle: 0 },
      { pitch: -90, shF_L: 90, shF_R: 175, elbow: 0, hipF_R: 90, knee_R: 90, hipF_L: 25, knee_L: 5, ankle: 0 },
      { pitch: -90, shF: 90, elbow: 0, hipF: 90, knee: 90, ankle: 0 },
      { pitch: -90, shF_R: 90, shF_L: 175, elbow: 0, hipF_L: 90, knee_L: 90, hipF_R: 25, knee_R: 5, ankle: 0 },
    ],
  },
  {
    id: 'leg-raises', on: 'back', name: 'Leg Raises', cat: 'core', level: 2, met: 4, cycle: 3, view: 'side', mat: true,
    muscles: ['abs', 'hipFlexors'],
    tips: 'Legs straight, lift them to 90°, lower slowly without touching the floor.',
    frames: [{ ...BACK_FLAT, hipF: 8 }, { ...BACK_FLAT, hipF: 85 }],
  },
  {
    id: 'flutter-kicks', on: 'back', name: 'Flutter Kicks', cat: 'core', level: 2, met: 4, cycle: 0.8, view: 'side', mat: true,
    muscles: ['abs', 'hipFlexors', 'quads'],
    tips: 'Legs straight and low, kick up and down in small quick movements.',
    frames: [
      { ...BACK_FLAT, hipF_L: 35, hipF_R: 15, neckF: 15 },
      { ...BACK_FLAT, hipF_L: 15, hipF_R: 35, neckF: 15 },
    ],
  },
  {
    id: 'bicycle', on: 'back', name: 'Bicycle Crunches', cat: 'core', level: 2, met: 5, cycle: 1.8, view: 'threeq', mat: true,
    muscles: ['abs', 'obliques', 'hipFlexors'],
    tips: 'Bring elbow toward the opposite knee while extending the other leg. Slow and controlled.',
    frames: [
      { pitch: -90, spineF: 35, spineTwist: 30, neckF: 10, shAbd: 120, elbow: 132, shRot: 90, hipF_L: 90, knee_L: 95, hipF_R: 25, knee_R: 5, ankle: 10 },
      { pitch: -90, spineF: 35, spineTwist: -30, neckF: 10, shAbd: 120, elbow: 132, shRot: 90, hipF_R: 90, knee_R: 95, hipF_L: 25, knee_L: 5, ankle: 10 },
    ],
  },
  {
    id: 'side-plank', on: 'forearm_R foot_R', name: 'Side Plank', cat: 'core', level: 2, met: 4, view: 'front', mat: true, sides: true,
    muscles: ['obliques', 'shoulders', 'abs', 'glutes'],
    tips: 'Elbow under shoulder, lift your hips so your body forms a straight line.',
    frames: [{ roll: 72, shAbd_R: 72, elbow_R: 90, shRot_R: 90, shAbd_L: 100, elbow_L: 0, hipAbd: 0, neckSide: 0 }],
  },

  // ---------------- Yoga ----------------
  {
    id: 'cat-cow', on: 'hands knees', name: 'Cat-Cow', cat: 'yoga', level: 1, met: 2.5, cycle: 6, view: 'side', mat: true,
    muscles: ['lowerBack', 'abs', 'back', 'neck'],
    tips: 'Inhale: drop belly, lift head (cow). Exhale: round your back, tuck chin (cat).',
    frames: [
      { ...TABLETOP, pitch: 94.7, spineF: -22, neckF: -25, shF: 72.7, hipF: 81.2, knee: 95.3 },
      { ...TABLETOP, spineF: 21, neckF: 30, shF: 108, hipF: 97 },
    ],
  },
  {
    id: 'downward-dog', on: 'hands feet', name: 'Downward Dog', cat: 'yoga', level: 1, met: 2.8, view: 'side', mat: true,
    muscles: ['hamstrings', 'calves', 'shoulders', 'back'],
    tips: 'Hips high, press the floor away, heels toward the floor. Bend knees slightly if needed.',
    frames: [{ pitch: 132, shF: 174, shAbd: 8, wrist: 50, hipF: 89, ankle: -35, neckF: -10 }],
  },
  {
    id: 'cobra', on: 'hands front knees', name: 'Cobra Pose', cat: 'yoga', level: 1, met: 2.5, view: 'side', mat: true,
    muscles: ['lowerBack', 'chest', 'abs'],
    tips: 'Low cobra: hands under shoulders, elbows bent and close to your sides. Lift your chest using your back, not your arms.',
    frames: [{ pitch: 88.7, spineF: -30, neckF: -10, shF: -13.6, shAbd: 10, elbow: 108.9, wrist: 89.3, ankle: 60 }],
  },
  {
    id: 'childs-pose', on: 'knees head arms', name: "Child's Pose", cat: 'yoga', level: 1, met: 2, view: 'side', mat: true,
    muscles: ['lowerBack', 'back', 'glutes'],
    tips: 'Sit back on your heels, stretch your arms forward and relax your forehead down.',
    frames: [{ pitch: 73, spineF: 39, hipF: 130, knee: 155, ankle: 31, shF: 180, shAbd: 10, elbow: 0, neckF: 30 }],
  },
  {
    id: 'tree', on: 'foot_R', name: 'Tree Pose', cat: 'yoga', level: 1, met: 2.3, view: 'front', sides: true,
    muscles: ['calves', 'glutes', 'abs', 'adductors'],
    tips: 'Foot on your inner calf or thigh (never on the knee). Fix your eyes on one point.',
    frames: [{ hipF_L: 40, hipAbd_L: 50, hipRot_L: 55, knee_L: 135, ankle_L: 20, shAbd: 168, elbow: 15, hipAbd_R: -2.5, roll: 3 }],
  },
  {
    id: 'warrior2', on: 'feet', name: 'Warrior II', cat: 'yoga', level: 1, met: 3, view: 'front', mat: true, sides: true,
    muscles: ['quads', 'glutes', 'shoulders', 'adductors'],
    tips: 'Front knee over ankle, arms long and level, gaze over your front hand.',
    frames: [{ yaw: 30, spineTwist: -30, hipRot_L: 60, hipAbd_L: 44, hipF_L: 19.6, knee_L: 90, hipAbd_R: 32.4, hipF_R: 10.4, roll: -0.3, hipRot_R: -10, shAbd: 90, elbow: 0, neckTurn: 60 }],
  },
  {
    id: 'triangle', on: 'feet', touch: [['hand_L', 'shin_L', 0.12]], name: 'Triangle Pose', cat: 'yoga', level: 2, met: 2.5, view: 'front', mat: true, sides: true,
    muscles: ['obliques', 'hamstrings', 'adductors', 'shoulders'],
    tips: 'Legs straight and wide. Reach forward, then tip down toward your front shin.',
    frames: [{ hipRot_L: 60, hipAbd_L: 50, hipAbd_R: -19.9, hipF: 4.4, roll: -23.7, spineSide: 37.2, shAbd_R: 119, shAbd_L: 61, shF_L: 3.7, elbow: 0, neckTurn: 50 }],
  },
  {
    id: 'chair', on: 'feet', name: 'Chair Pose', cat: 'yoga', level: 2, met: 3.5, view: 'side',
    muscles: ['quads', 'glutes', 'shoulders', 'calves'],
    tips: 'Sit back as if into a chair, arms reaching up, weight in your heels.',
    frames: [{ pitch: 28, hipF: 88, knee: 72, ankle: -12, shF: 170, shAbd: 8, elbow: 0 }],
  },
  {
    id: 'bridge-yoga', on: 'back feet arms', name: 'Bridge Pose', cat: 'yoga', level: 1, met: 2.5, view: 'side', mat: true,
    muscles: ['glutes', 'hamstrings', 'lowerBack', 'chest'],
    tips: 'Lift your hips, roll your shoulders under and breathe deeply.',
    frames: [{ pitch: -122, hipF: -22, knee: 105, ankle: 26, shF: -51, shAbd: 10, elbow: 0 }],
  },

  // ---------------- Stretch / cool-down ----------------
  {
    id: 'forward-fold', on: 'feet', name: 'Standing Forward Fold', cat: 'stretch', level: 1, met: 2.3, view: 'side',
    muscles: ['hamstrings', 'lowerBack', 'calves'],
    tips: 'Hinge at your hips and let your upper body hang. Bend your knees if your back rounds a lot.',
    frames: [{ pitch: 75, spineF: 35, hipF: 81, knee: 5, ankle: -5, shF: 105, shAbd: 5, elbow: 10, neckF: 10 }],
  },
  {
    id: 'seated-fold', on: 'seat heels', name: 'Seated Forward Bend', cat: 'stretch', level: 1, met: 2.3, view: 'side', mat: true,
    muscles: ['hamstrings', 'lowerBack', 'calves'],
    tips: 'Sit tall, legs straight, reach forward from your hips toward your feet.',
    frames: [{ pitch: 40, spineF: 35, hipF: 130, ankle: 0, shF: 150, shAbd: 8, elbow: 5, neckF: 5 }],
  },
  {
    id: 'quad-stretch', on: 'foot_R', touch: [['hand_L', 'foot-top_L', 0.06]], name: 'Standing Quad Stretch', cat: 'stretch', level: 1, met: 2.3, view: 'side', sides: true,
    muscles: ['quads', 'hipFlexors'],
    tips: 'Hold your foot behind you, knees together, hips pushed slightly forward.',
    frames: [{ knee_L: 155, hipF_L: -7, ankle_L: 30, shF_L: -42.7, shAbd_L: -6, elbow_L: 31.6, shF_R: 70, elbow_R: 5, roll: 6.2 }],
  },
  {
    id: 'shoulder-stretch', on: 'feet', name: 'Cross-body Shoulder Stretch', cat: 'stretch', level: 1, met: 2, view: 'front', sides: true,
    muscles: ['shoulders', 'back', 'triceps'],
    tips: 'Pull one straight arm across your chest with the other arm. Keep the shoulder down.',
    frames: [{ shF_L: 88, shAbd_L: -45, elbow_L: 0, shF_R: 70, shAbd_R: -15, elbow_R: 110, shRot_R: 20, hipAbd: 6 }],
  },
  {
    id: 'deep-breath', on: 'feet', name: 'Deep Breathing', cat: 'stretch', level: 1, met: 1.8, cycle: 8, view: 'front',
    muscles: ['chest', 'back', 'shoulders'],
    tips: 'Inhale slowly as your arms rise, exhale as they lower. Relax your whole body.',
    frames: [{ shAbd: 10, hipAbd: 6 }, { shAbd: 170, elbow: 5, hipAbd: 6, neckF: -8 }],
  },

  // ---------------- Added for the Beginner Full Body routine ----------------
  {
    id: 'arm-swings', on: 'feet', name: 'Arm Swings', cat: 'warmup', level: 1, met: 3.5, cycle: 2, view: 'threeq', ease: 'linear',
    muscles: ['shoulders', 'chest', 'back', 'traps'],
    tips: 'Swing both arms in big full circles: forward, up past your ears, back and down. Keep arms long and relaxed.',
    // One continuous circle: shoulder flexion runs 0° → 360°. Behind the body the arm opens out to the
    // side (abduction), because no shoulder can swing straight back past 60°.
    frames: [
      { shF: 0, shAbd: 15, elbow: 5, hipAbd: 8 },
      { shF: 90, shAbd: 15, elbow: 5, hipAbd: 8 },
      { shF: 180, shAbd: 20, elbow: 5, hipAbd: 8 },
      { shF: 270, shAbd: 70, elbow: 5, hipAbd: 8 },
      { shF: 360, shAbd: 15, elbow: 5, hipAbd: 8, d: 0.001 },   // same as the first frame: loops seamlessly
    ],
  },
  {
    id: 'side-leg-raise', on: 'feet', name: 'Side Leg Raises', cat: 'warmup', level: 1, met: 3.5, cycle: 2.4, view: 'front',
    muscles: ['glutes', 'obliques', 'adductors'],
    tips: 'Hands on hips, lift one straight leg out to the side, lower it and switch. Stay tall.',
    frames: [
      { ...HANDS_ON_HIPS, hipAbd_L: 40, hipAbd_R: -3, roll: 4, on: 'foot_R' },
      { ...HANDS_ON_HIPS, d: 0.5 },
      { ...HANDS_ON_HIPS, hipAbd_R: 40, hipAbd_L: -3, roll: -4, on: 'foot_L' },
      { ...HANDS_ON_HIPS, d: 0.5 },
    ],
  },
  {
    id: 'twisters', on: 'feet', name: 'Twisters', cat: 'cardio', level: 1, met: 6, cycle: 1.2, view: 'front',
    muscles: ['obliques', 'abs', 'calves'],
    tips: 'Small hops, twisting your hips one way and your shoulders the other. Arms out for balance.',
    frames: [
      { yaw: 35, spineTwist: -35, shAbd: 70, elbow: 70, shRot: -30, hipAbd: 6 },
      { shAbd: 70, elbow: 70, shRot: -30, hipAbd: 6, lift: 0.05, ankle: 25, d: 0.5 },
      { yaw: -35, spineTwist: 35, shAbd: 70, elbow: 70, shRot: -30, hipAbd: 6 },
      { shAbd: 70, elbow: 70, shRot: -30, hipAbd: 6, lift: 0.05, ankle: 25, d: 0.5 },
    ],
  },
  {
    id: 'cross-toe-touch', on: 'feet', name: 'Cross Toe Touch', cat: 'warmup', level: 1, met: 4, cycle: 2.6, view: 'threeq',
    muscles: ['hamstrings', 'obliques', 'lowerBack', 'shoulders'],
    tips: 'Feet wide. Reach one hand down to the opposite foot, other arm up. Stand and switch.',
    frames: [
      { hipAbd: 18, shAbd: 80, d: 0.6 },
      { hipAbd: 18, pitch: 80, hipF: 109.4, ankle: 18, spineF: 41.5, spineTwist: 33.8, shF_R: 117.3, shAbd_R: -15, shAbd_L: 95, shF_L: 30, knee: 12, touch: [['hand_R', 'toes_L', 0.14]] },
      { hipAbd: 18, shAbd: 80, d: 0.6 },
      { hipAbd: 18, pitch: 80, hipF: 109.4, ankle: 18, spineF: 41.5, spineTwist: -33.8, shF_L: 117.3, shAbd_L: -15, shAbd_R: 95, shF_R: 30, knee: 12, touch: [['hand_L', 'toes_R', 0.14]] },
    ],
  },
  {
    id: 'diamond-pushups', on: 'hands toes', name: 'Diamond Push-ups', cat: 'strength', level: 2, met: 6, cycle: 2.4, view: 'side', mat: true,
    muscles: ['triceps', 'chest', 'shoulders', 'abs'],
    tips: 'Hands together under your chest, thumbs and fingers forming a diamond. Too hard? Drop to your knees.',
    touch: [['hand_L', 'hand_R', 0.08]],
    frames: [
      { ...HIGH_PLANK, shF: 68, shAbd: -19, shRot: 17 },
      { ...PUSHUP_DOWN, pitch: 88, shF: 5, elbow: 75, shAbd: -2, shRot: -45 },
    ],
  },
  {
    id: 'squat-hold', on: 'feet', name: 'Squat Hold', cat: 'strength', level: 1, met: 5, view: 'side',
    muscles: ['quads', 'glutes', 'hamstrings'],
    tips: 'Sit low as if on a chair and hold. Chest up, weight in your heels, keep breathing.',
    frames: [{ ...SQUAT_LOW, shF: 100 }],
  },
  {
    id: 'db-rows', on: 'feet', name: 'Dumbbell Rows', cat: 'strength', level: 1, met: 4, cycle: 2.4, view: 'side', props: ['dumbbells'],
    muscles: ['back', 'biceps', 'shoulders', 'lowerBack'],
    tips: 'Hinge forward with a flat back. Pull the weights to your ribs, squeeze your shoulder blades, lower slowly.',
    frames: [
      { ...HINGE, shF: 45, shAbd: 6, elbow: 5 },
      { ...HINGE, shF: -25, shAbd: 12, elbow: 70 },
    ],
  },
  {
    id: 'shoulder-press', on: 'feet', name: 'Shoulder Press', cat: 'strength', level: 1, met: 4, cycle: 2.4, view: 'front', props: ['dumbbells'],
    muscles: ['shoulders', 'triceps', 'traps'],
    tips: 'Weights at shoulder height, press straight up overhead, lower back to your shoulders.',
    frames: [
      { shAbd: 85, elbow: 95, shRot: 90, hipAbd: 6 },
      { shAbd: 168, elbow: 10, shRot: 90, hipAbd: 6 },
    ],
  },
  {
    id: 'front-raises', on: 'feet', name: 'Front Raises', cat: 'strength', level: 1, met: 3.5, cycle: 2.4, view: 'side', props: ['dumbbells'],
    muscles: ['shoulders', 'chest'],
    tips: 'Arms almost straight, lift the weights in front of you to shoulder height, lower slowly.',
    frames: [
      { shF: 8, elbow: 8, hipAbd: 6 },
      { shF: 88, elbow: 8, hipAbd: 6 },
    ],
  },
  {
    id: 'lateral-raises', on: 'feet', name: 'Lateral Raises', cat: 'strength', level: 1, met: 3.5, cycle: 2.4, view: 'front', props: ['dumbbells'],
    muscles: ['shoulders', 'traps'],
    tips: 'Lift the weights out to the sides to shoulder height, elbows soft. Do not shrug.',
    frames: [
      { shAbd: 12, elbow: 10, hipAbd: 6 },
      { shAbd: 85, elbow: 12, hipAbd: 6 },
    ],
  },
  {
    id: 'bicep-curls', on: 'feet', name: 'Bicep Curls', cat: 'strength', level: 1, met: 3.5, cycle: 2.2, view: 'threeq', props: ['dumbbells'],
    muscles: ['biceps', 'forearms'],
    tips: 'Elbows tucked at your sides, curl the weights up to your shoulders, lower all the way.',
    frames: [
      { shAbd: 10, elbow: 8, hipAbd: 6 },
      { shAbd: 10, shF: 2, elbow: 135, hipAbd: 6 },
    ],
  },
  {
    id: 'tricep-kickbacks', on: 'feet', name: 'Tricep Kickbacks', cat: 'strength', level: 1, met: 3.5, cycle: 2.2, view: 'side', props: ['dumbbells'],
    muscles: ['triceps', 'shoulders', 'back'],
    tips: 'Hinge forward, upper arms along your body. Straighten your elbows to push the weights back.',
    frames: [
      { ...HINGE, pitch: 75, hipF: 87, knee: 17, ankle: -3, shF: -15, shAbd: 6, elbow: 90 },
      { ...HINGE, pitch: 75, hipF: 87, knee: 17, ankle: -3, shF: -15, shAbd: 6, elbow: 5 },
    ],
  },
  {
    id: 'knee-touch', on: 'back feet', name: 'Knee Touches', cat: 'core', level: 1, met: 3.8, cycle: 2.2, view: 'side', mat: true,
    muscles: ['abs'],
    tips: 'Lying with knees bent, curl your shoulders up and slide your hands up your thighs toward your knees. Lower slowly.',
    frames: [
      { ...BACK_KNEES, shF: 30 },
      { ...BACK_KNEES, spineF: 40, neckF: 12, shF: 50, shAbd: -1, touch: [['hand_L', 'knee_L', 0.2]] },
    ],
  },
  {
    id: 'russian-twists', on: 'seat feet', name: 'Russian Twists', cat: 'core', level: 1, met: 4, cycle: 2, view: 'threeq', mat: true,
    muscles: ['obliques', 'abs', 'hipFlexors'],
    tips: 'Sit leaning back with a straight back, feet on the floor. Rotate your chest side to side, hands together.',
    frames: [
      { pitch: -42, hipF: 101.7, knee: 110.7, ankle: 15.1, spineTwist: 40, shF: 60, shAbd: -25, elbow: 60 },
      { pitch: -42, hipF: 101.7, knee: 110.7, ankle: 15.1, spineTwist: -40, shF: 60, shAbd: -25, elbow: 60 },
    ],
  },
  {
    id: 'plank-knee-elbow', on: 'hands toes', name: 'Knee to Elbow Plank', cat: 'core', level: 1, met: 5, cycle: 2.4, view: 'threeq', mat: true,
    muscles: ['abs', 'obliques', 'shoulders', 'hipFlexors'],
    tips: 'From a high plank, bring one knee out to the side toward the same elbow, then switch. Hips stay low.',
    frames: [
      { ...HIGH_PLANK, hipF_L: 130, hipAbd_L: 50, hipRot_L: 30, knee_L: 155, ankle_L: -16, ankle_R: 0, on: 'hands foot_R', touch: [['knee_L', 'elbow_L', 0.32]] },
      { ...HIGH_PLANK, d: 0.6 },
      { ...HIGH_PLANK, hipF_R: 130, hipAbd_R: 50, hipRot_R: 30, knee_R: 155, ankle_R: -16, ankle_L: 0, on: 'hands foot_L', touch: [['knee_R', 'elbow_R', 0.32]] },
      { ...HIGH_PLANK, d: 0.6 },
    ],
  },

  // ---------------- Added: bodyweight strength, cardio & core ----------------
  {
    id: 'reverse-lunges', on: 'feet', name: 'Reverse Lunges', cat: 'strength', level: 1, met: 5, cycle: 4, view: 'side',
    muscles: ['quads', 'glutes', 'hamstrings', 'calves'],
    tips: 'Step one foot back and lower your back knee toward the floor, chest up. Push through the front heel to stand. Hold a chair for balance if needed.',
    frames: [
      { ...HANDS_ON_HIPS, d: 0.6 },
      { ...HANDS_ON_HIPS, pitch: 8, hipF_L: 90, knee_L: 87.8, ankle_L: -4.7, hipF_R: 1.8, knee_R: 90, ankle_R: -33.1 },
      { ...HANDS_ON_HIPS, d: 0.6 },
      { ...HANDS_ON_HIPS, pitch: 8, hipF_R: 90, knee_R: 87.8, ankle_R: -4.7, hipF_L: 1.8, knee_L: 90, ankle_L: -33.1 },
    ],
  },
  {
    id: 'side-lunges', on: 'feet', name: 'Side Lunges', cat: 'strength', level: 2, met: 5, cycle: 4, view: 'threeq',
    muscles: ['adductors', 'glutes', 'quads', 'hamstrings'],
    tips: 'Take a wide step to the side, sit your hips back over that foot and keep the other leg straight. Both feet stay flat. Push back to the middle and switch.',
    frames: [
      { shF: 80, shAbd: -20, elbow: 70, hipAbd: 6, d: 0.6 },
      { shF: 80, shAbd: -20, elbow: 70, pitch: 30.4, hipF_L: 80, knee_L: 85, ankle_L: -29.1, hipAbd_L: 20, hipRot_L: 10, hipF_R: 25.6, hipAbd_R: 41.3, ankle_R: -0.4 },
      { shF: 80, shAbd: -20, elbow: 70, hipAbd: 6, d: 0.6 },
      { shF: 80, shAbd: -20, elbow: 70, pitch: 30.4, hipF_R: 80, knee_R: 85, ankle_R: -29.1, hipAbd_R: 20, hipRot_R: 10, hipF_L: 25.6, hipAbd_L: 41.3, ankle_L: -0.4 },
    ],
  },
  {
    id: 'sumo-squats', on: 'feet', name: 'Sumo Squats', cat: 'strength', level: 1, met: 5, cycle: 2.8, view: 'front',
    muscles: ['adductors', 'glutes', 'quads', 'hamstrings'],
    tips: 'Feet wide, toes turned out. Sit straight down with your chest up and knees pushing out over your toes, then squeeze your glutes to stand.',
    frames: [
      { hipAbd: 25, hipRot: 35, ankle: 3.9, pitch: 3.5, shF: 70, shAbd: -25, elbow: 100, d: 0.8 },
      { hipAbd: 40, hipRot: 0, hipF: 82.6, knee: 95, ankle: -26, pitch: 24.2, shF: 70, shAbd: -25, elbow: 100, d: 1.2 },
    ],
  },
  {
    id: 'step-jacks', on: 'feet', name: 'Step Jacks', cat: 'cardio', level: 1, met: 4.5, cycle: 1.8, view: 'front',
    muscles: ['shoulders', 'glutes', 'adductors', 'calves'],
    tips: 'A quiet jumping jack: step one foot out to the side as both arms sweep overhead, step back in, switch. No jumping, so it is kind to knees and neighbours.',
    frames: [
      { shAbd: 165, elbow: 5, hipAbd_L: 25, hipAbd_R: -8.6, roll: -10 },
      { shAbd: 12, hipAbd: 3, d: 0.8 },
      { shAbd: 165, elbow: 5, hipAbd_R: 25, hipAbd_L: -8.6, roll: 10 },
      { shAbd: 12, hipAbd: 3, d: 0.8 },
    ],
  },
  {
    id: 'skaters', on: 'foot_R', name: 'Skaters', cat: 'cardio', level: 2, met: 7, cycle: 1.6, view: 'threeq',
    muscles: ['glutes', 'quads', 'adductors', 'calves'],
    tips: 'Hop sideways onto one foot, sweep the other leg behind you and swing your arms across, like a speed skater. Low-impact option: step instead of hopping.',
    frames: [
      { pitch: 29, roll: 6.1, hipF_R: 60, knee_R: 55, ankle_R: -20.1, hipF_L: 5, hipAbd_L: -15, knee_L: 50, ankle_L: 30, spineTwist: 25, shF_L: 50, shAbd_L: -30, shF_R: -30, elbow: 20 },
      { pitch: 10, hipF: 25, knee: 30, ankle: 25, shF: 10, elbow: 20, lift: 0.1, d: 0.6 },
      { pitch: 29, roll: -6.1, hipF_L: 60, knee_L: 55, ankle_L: -20.1, hipF_R: 5, hipAbd_R: -15, knee_R: 50, ankle_R: 30, spineTwist: -25, shF_R: 50, shAbd_R: -30, shF_L: -30, elbow: 20, on: 'foot_L' },
      { pitch: 10, hipF: 25, knee: 30, ankle: 25, shF: 10, elbow: 20, lift: 0.1, d: 0.6 },
    ],
  },
  {
    id: 'inchworm', on: 'feet', name: 'Inchworm', cat: 'strength', level: 2, met: 4.5, cycle: 7, view: 'side', mat: true,
    muscles: ['abs', 'shoulders', 'hamstrings', 'chest'],
    tips: 'Bend forward and put your hands on the floor (bend your knees as much as you need). Walk your hands out to a plank, then walk them back and stand up.',
    frames: [
      { d: 0.6 },
      { pitch: 113.7, spineF: 35, hipF: 118.7, knee: 33.5, ankle: -20, shF: 117.7, wrist: 80, neckF: 10, on: 'feet hands' },
      { pitch: 122.8, shF: 155, wrist: 70, hipF: 75.2, knee: 5, ankle: -20, on: 'hands feet' },
      { ...HIGH_PLANK, d: 1.2, on: 'hands toes' },
      { pitch: 122.8, shF: 155, wrist: 70, hipF: 75.2, knee: 5, ankle: -20, on: 'hands feet' },
      { pitch: 113.7, spineF: 35, hipF: 118.7, knee: 33.5, ankle: -20, shF: 117.7, wrist: 80, neckF: 10, on: 'feet hands' },
    ],
  },
  {
    id: 'plank-shoulder-taps', on: 'hands toes', name: 'Plank Shoulder Taps', cat: 'core', level: 2, met: 5, cycle: 2, view: 'threeq', mat: true,
    muscles: ['abs', 'obliques', 'shoulders', 'triceps'],
    tips: 'High plank with feet wide. Lift one hand to tap the opposite shoulder without rocking your hips, then switch. Easier: do it with your knees down.',
    frames: [
      { ...HIGH_PLANK, hipAbd: 10, shF_L: 130.4, shAbd_L: -22, elbow_L: 113.1, shRot_L: -80, wrist_L: 0, spineTwist: -2.8, on: 'hand_R toes', touch: [['hand_L', 'shoulder_R', 0.1]] },
      { ...HIGH_PLANK, hipAbd: 10, d: 0.6 },
      { ...HIGH_PLANK, hipAbd: 10, shF_R: 130.4, shAbd_R: -22, elbow_R: 113.1, shRot_R: -80, wrist_R: 0, spineTwist: 2.8, on: 'hand_L toes', touch: [['hand_R', 'shoulder_L', 0.1]] },
      { ...HIGH_PLANK, hipAbd: 10, d: 0.6 },
    ],
  },
  {
    id: 'reverse-crunches', on: 'back arms', name: 'Reverse Crunches', cat: 'core', level: 1, met: 3.8, cycle: 2.6, view: 'side', mat: true,
    muscles: ['abs', 'hipFlexors'],
    tips: 'Lying on your back, knees bent at 90° over your hips. Use your abs to curl your hips off the floor toward your ribs, then lower slowly. No swinging.',
    frames: [
      { pitch: -90, hipF: 90, knee: 90, ankle: 10, shF: -9.9, shAbd: 14.2, elbow: 0 },
      { pitch: -110, spineF: 20, hipF: 110, knee: 90, ankle: 10, shF: -9.9, shAbd: 14.2, elbow: 0 },
    ],
  },
  {
    id: 'heel-touches', on: 'back feet', name: 'Heel Touches', cat: 'core', level: 1, met: 3.8, cycle: 1.6, view: 'threeq', mat: true,
    muscles: ['obliques', 'abs'],
    tips: 'Lying with knees bent and shoulders slightly lifted, reach one hand toward the same-side heel, then the other. Keep your lower back on the floor.',
    frames: [
      { ...BACK_KNEES, pitch: -90.8, hipF: 60, knee: 118.9, ankle: 43, hipAbd: 12, spineF: 26.9, neckF: 10, spineSide: 20, shF_L: 7.2, shAbd_L: 10, shF_R: 15, shAbd_R: 30, touch: [['hand_L', 'heel_L', 0.15]] },
      { ...BACK_KNEES, pitch: -90.8, hipF: 60, knee: 118.9, ankle: 43, hipAbd: 12, spineF: 26.9, neckF: 10, spineSide: -20, shF_R: 7.2, shAbd_R: 10, shF_L: 15, shAbd_L: 30, touch: [['hand_R', 'heel_R', 0.15]] },
    ],
  },
  {
    id: 'hollow-hold', on: 'back', name: 'Hollow Body Hold', cat: 'core', level: 3, met: 4, view: 'side', mat: true,
    muscles: ['abs', 'hipFlexors', 'quads'],
    tips: 'Lower back pressed into the floor, shoulders and legs lifted, arms reaching past your ears. Too hard? Bend your knees or bring your arms forward.',
    frames: [{ pitch: -90, spineF: 22, neckF: 12, shF: 165, shAbd: 8, elbow: 0, hipF: 30, ankle: 30 }],
  },
  {
    id: 'donkey-kicks', on: 'hands knees', name: 'Donkey Kicks', cat: 'strength', level: 1, met: 3.5, cycle: 2.4, view: 'side', mat: true,
    muscles: ['glutes', 'hamstrings', 'abs'],
    tips: 'On hands and knees, keep one knee bent at 90° and press that foot up toward the ceiling. Small and controlled: do not arch your lower back.',
    frames: [
      TABLETOP,
      { ...TABLETOP, hipF_L: -10, knee_L: 90, ankle_L: 0, on: 'hands knee_R' },
      TABLETOP,
      { ...TABLETOP, hipF_R: -10, knee_R: 90, ankle_R: 0, on: 'hands knee_L' },
    ],
  },
  {
    id: 'fire-hydrants', on: 'hands knees', name: 'Fire Hydrants', cat: 'strength', level: 1, met: 3.5, cycle: 2.4, view: 'back', mat: true,
    muscles: ['glutes', 'abs', 'obliques'],
    tips: 'On hands and knees, keep the knee bent and lift one leg out to the side up to hip height. Keep your back flat and do not lean away.',
    frames: [
      TABLETOP,
      { ...TABLETOP, hipAbd_L: 50, on: 'hands knee_R' },
      TABLETOP,
      { ...TABLETOP, hipAbd_R: 50, on: 'hands knee_L' },
    ],
  },
  {
    id: 'clamshells', on: 'side_R forearm_R knee_R foot_R', name: 'Clamshells', cat: 'strength', level: 1, met: 2.8, cycle: 2.4, view: 'threeq', mat: true, sides: true,
    muscles: ['glutes'],
    tips: 'Lie on your side, knees bent and stacked, feet together. Keep your feet touching and lift your top knee like a clam opening, then lower slowly.',
    frames: [
      { roll: 86.5, pitch: -4.7, hipF: 52.4, knee: 90, shAbd_R: 180, elbow_R: 55.9, shF_L: 30, elbow_L: 60 },
      { roll: 86.5, pitch: -4.7, hipF: 52.4, knee: 90, hipAbd_L: 35, hipRot_L: 30, shAbd_R: 180, elbow_R: 55.9, shF_L: 30, elbow_L: 60 },
    ],
  },
  {
    id: 'good-mornings', on: 'feet', name: 'Good Mornings', cat: 'strength', level: 1, met: 3.5, cycle: 3, view: 'side',
    muscles: ['hamstrings', 'glutes', 'lowerBack'],
    tips: 'Hands behind your head, knees soft. Push your hips back and tip your chest forward with a flat back until you feel your hamstrings, then stand tall.',
    frames: [
      { shAbd: 120, elbow: 132, shRot: 90, hipAbd: 6, d: 0.8 },
      { shAbd: 120, elbow: 132, shRot: 90, hipAbd: 6, pitch: 70, hipF: 81.9, knee: 15, ankle: -8.3, d: 1.2 },
    ],
  },
  {
    id: 'standing-oblique-crunch', on: 'feet', name: 'Standing Side Crunch', cat: 'core', level: 1, met: 4, cycle: 2, view: 'front',
    muscles: ['obliques', 'abs', 'hipFlexors'],
    tips: 'Hands behind your head. Lift one knee out to the side and bend sideways to bring the same elbow down to meet it. Stand tall and switch.',
    frames: [
      { shAbd: 120, elbow: 132, shRot: 90, hipF_L: 60, hipAbd_L: 40, hipRot_L: 30, knee_L: 90, spineSide: 25, roll: 9.4, hipAbd_R: 1.8, on: 'foot_R' },
      { shAbd: 120, elbow: 132, shRot: 90, hipAbd: 8, d: 0.6 },
      { shAbd: 120, elbow: 132, shRot: 90, hipF_R: 60, hipAbd_R: 40, hipRot_R: 30, knee_R: 90, spineSide: -25, roll: -9.4, hipAbd_L: 1.8, on: 'foot_L' },
      { shAbd: 120, elbow: 132, shRot: 90, hipAbd: 8, d: 0.6 },
    ],
  },
  {
    id: 'plank-to-dog', on: 'hands toes', name: 'Plank to Down Dog', cat: 'core', level: 2, met: 4.5, cycle: 3.2, view: 'side', mat: true,
    muscles: ['shoulders', 'abs', 'hamstrings', 'calves'],
    tips: 'From a high plank, press the floor away and lift your hips up and back into an upside-down V, then lower back to a straight plank. Bend your knees if your hamstrings are tight.',
    frames: [
      HIGH_PLANK,
      { pitch: 132, shF: 174, shAbd: 8, wrist: 50, hipF: 89, ankle: -35, neckF: -10, on: 'hands feet' },
    ],
  },
  {
    id: 'boxing-punches', on: 'feet', name: 'Shadow Boxing', cat: 'cardio', level: 1, met: 5.5, cycle: 1.2, view: 'threeq',
    muscles: ['shoulders', 'chest', 'triceps', 'obliques'],
    tips: 'Soft knees, fists by your chin. Punch one arm straight out and turn your body with it, pull it back fast, then punch with the other. Keep it light and quick.',
    frames: [
      { hipAbd: 8, knee: 15, hipF: 12, ankle: -5, shF_L: 88, shAbd_L: -8, elbow_L: 5, shRot_L: -60, spineTwist: -20, shF_R: 35, shAbd_R: -20, elbow_R: 140, shRot_R: -20 },
      { hipAbd: 8, knee: 15, hipF: 12, ankle: -5, shF: 35, shAbd: -20, elbow: 140, shRot: -20, d: 0.6 },
      { hipAbd: 8, knee: 15, hipF: 12, ankle: -5, shF_R: 88, shAbd_R: -8, elbow_R: 5, shRot_R: -60, spineTwist: 20, shF_L: 35, shAbd_L: -20, elbow_L: 140, shRot_L: -20 },
      { hipAbd: 8, knee: 15, hipF: 12, ankle: -5, shF: 35, shAbd: -20, elbow: 140, shRot: -20, d: 0.6 },
    ],
  },
  // ---------------- Added: yoga & stretching ----------------
  {
    id: 'sun-salutation-half', on: 'feet', name: 'Half Sun Salutation', cat: 'yoga', level: 1, met: 3, cycle: 16, view: 'side',
    muscles: ['hamstrings', 'shoulders', 'lowerBack', 'back', 'calves'],
    tips: 'Breathe in, arms up. Breathe out, fold forward. Breathe in, lift halfway with a flat back. Breathe out, fold. Breathe in, rise up.',
    frames: [
      { shAbd: 10, d: 0.7 },
      { shF: 172, shAbd: 10, elbow: 0, neckF: -10, spineF: -6 },
      { pitch: 75, spineF: 35, hipF: 81, knee: 5, ankle: -5, shF: 105, shAbd: 5, elbow: 10, neckF: 10 },
      { pitch: 82, spineF: -5, hipF: 102.4, knee: 8.6, ankle: 4.4, shF: 46.3, shAbd: 6, elbow: 0, neckF: -20, touch: [['hand_L', 'knee_L', 0.16]] },
      { pitch: 75, spineF: 35, hipF: 81, knee: 5, ankle: -5, shF: 105, shAbd: 5, elbow: 10, neckF: 10 },
      { shF: 172, shAbd: 10, elbow: 0, neckF: -10, spineF: -6 },
    ],
  },
  {
    id: 'low-lunge', on: 'foot_L knee_R', name: 'Low Lunge', cat: 'yoga', level: 1, met: 2.8, view: 'side', mat: true, sides: true,
    muscles: ['hipFlexors', 'quads', 'glutes', 'shoulders'],
    tips: 'Front knee over the ankle, back knee down on the mat. Sink your hips forward and reach your arms up. Pad the knee if needed.',
    frames: [{ pitch: -6.6, hipF_L: 90, knee_L: 95, ankle_L: -10, hipF_R: -20.6, knee_R: 84.3, ankle_R: 50, shF: 170, shAbd: 10, elbow: 0, neckF: -5 }],
  },
  {
    id: 'thread-needle', on: 'knees hand_R forearm_L head', name: 'Thread the Needle', cat: 'yoga', level: 1, met: 2.2, view: 'side', mat: true, sides: true,
    muscles: ['back', 'shoulders', 'obliques'],
    tips: 'On hands and knees, slide one arm under your chest, palm up, and lower that shoulder and the side of your head toward the mat. Hips stay over knees.',
    frames: [{ ...TABLETOP, pitch: 119.7, hipF: 119.7, spineTwist: -40, roll: -0.3, shF_R: 76.9, shF_L: 87.3, shAbd_L: -35.5, elbow_L: 0, wrist_L: 0, neckSide: 28.5, neckTurn: -9.6 }],
  },
  {
    id: 'seated-twist', on: 'seat heels hand_L', touch: [['elbow_R', 'knee_L', 0.17]], name: 'Seated Spinal Twist', cat: 'yoga', level: 1, met: 2.2, view: 'sidefront', mat: true, sides: true,
    muscles: ['obliques', 'lowerBack', 'back', 'glutes'],
    tips: 'Sit tall, one leg straight. Cross the other foot over the knee, hug it with the opposite arm and turn to look behind you.',
    frames: [{ pitch: -20, spineF: 12, hipF_R: 69.5, knee_R: 0, ankle_R: 0, hipF_L: 130, knee_L: 119, hipAbd_L: -12, ankle_L: 10, spineTwist: 40, neckTurn: 40, shF_R: 60, shAbd_R: -40, elbow_R: 100, shF_L: -36, shAbd_L: 10, elbow_L: 0, wrist_L: 80 }],
  },
  {
    id: 'butterfly', on: 'seat feet', touch: [['hand_L', 'toes_L', 0.1]], name: 'Butterfly Stretch', cat: 'stretch', level: 1, met: 2, view: 'front', mat: true,
    muscles: ['adductors', 'hipFlexors', 'lowerBack'],
    tips: 'Sit tall with the soles of your feet together and let your knees fall open. Hold your feet and lean forward from your hips.',
    frames: [{ pitch: -15.5, hipF: 105.3, hipAbd: 45, hipRot: 50, knee: 135, ankle: 10, spineF: 34.7, shF: 50.5, shAbd: -17.5, elbow: 10, neckF: 0 }],
  },
  {
    id: 'knees-to-chest', on: 'back', touch: [['hand_L', 'shin_L', 0.1]], name: 'Knees to Chest', cat: 'stretch', level: 1, met: 2, view: 'side', mat: true,
    muscles: ['lowerBack', 'glutes'],
    tips: 'Lie on your back and hug both knees toward your chest. Keep your head and shoulders relaxed on the mat.',
    frames: [{ pitch: -90, spineF: 15, neckF: 10, hipF: 129.5, knee: 140, ankle: 20, shF: 25.6, shAbd: -2, elbow: 49.9 }],
  },
  {
    id: 'supine-twist', on: 'back arms', name: 'Lying Spinal Twist', cat: 'yoga', level: 1, met: 2, view: 'front', mat: true, sides: true,
    muscles: ['obliques', 'lowerBack', 'glutes', 'chest'],
    tips: 'Lie on your back, arms out wide. Let your bent knees drop to one side and turn your head the other way. Keep both shoulders down.',
    // Lying on the back, pelvis rolled about 45° toward the floor (pitch -45 + yaw 90 + roll -90 is a roll about
    // the body's long axis) and the chest turned back flat with spineTwist. Knees hover just above the mat.
    frames: [{ pitch: -45, yaw: 90, roll: -90, spineTwist: -45, hipF: 90, knee: 90, ankle: 20, hipAbd_L: 30, hipAbd_R: -25, shAbd: 60, shF: -23.3, elbow: 0, neckTurn: -30 }],
  },
  {
    id: 'puppy-pose', on: 'knees hands head', name: 'Puppy Pose', cat: 'yoga', level: 1, met: 2.2, view: 'side', mat: true,
    muscles: ['shoulders', 'back', 'lowerBack'],
    tips: 'From hands and knees, keep hips over knees and walk your hands forward. Melt your chest down and rest your forehead.',
    frames: [{ pitch: 125.3, spineF: -15.9, hipF: 114, knee: 90, ankle: 59, shF: 175, shAbd: 10, elbow: 0, wrist: 15, neckF: 30 }],
  },
  {
    id: 'sphinx', on: 'forearms front knees', name: 'Sphinx Pose', cat: 'yoga', level: 1, met: 2.2, view: 'side', mat: true,
    muscles: ['lowerBack', 'abs', 'chest'],
    tips: 'Lie on your belly, elbows under shoulders, forearms flat. Lift your chest gently and keep your neck long.',
    frames: [{ pitch: 88.7, spineF: -34.5, neckF: -10, shF: 71.5, shAbd: 10, elbow: 90, wrist: 0, ankle: 60 }],
  },
  {
    id: 'boat-pose', on: 'seat', name: 'Boat Pose', cat: 'yoga', level: 2, met: 3.5, view: 'side', mat: true,
    muscles: ['abs', 'hipFlexors', 'obliques', 'lowerBack'],
    tips: 'Lean back with a long, straight back and lift your feet so your shins are level. Reach your arms forward. Keep your chest lifted.',
    frames: [{ pitch: -40, hipF: 110, knee: 85, ankle: 20, shF: 50, shAbd: 8, elbow: 0, neckF: 5 }],
  },
  {
    id: 'chest-opener', on: 'feet', touch: [['hand_L', 'hand_R', 0.06]], name: 'Standing Chest Opener', cat: 'stretch', level: 1, met: 2, view: 'side',
    muscles: ['chest', 'shoulders', 'biceps'],
    tips: 'Clasp your hands behind your back, straighten your arms and lift your chest. Shoulders down, do not arch your lower back.',
    frames: [{ shF: -45, shAbd: -14.5, shRot: -20, elbow: 0, neckF: -8, hipAbd: 5 }],
  },
  {
    id: 'neck-rolls', on: 'feet', name: 'Neck Rolls', cat: 'warmup', level: 1, met: 2, cycle: 8, view: 'threeq',
    muscles: ['neck', 'traps'],
    tips: 'Drop your ear toward one shoulder, roll your chin slowly down across your chest to the other side, and back. Do not roll your head backward.',
    frames: [{ neckSide: 32 }, { neckF: 35 }, { neckSide: -32 }, { neckF: 35 }],
  },
  {
    id: 'wrist-stretch', on: 'feet', touch: [['hand_R', 'hand_L', 0.09]], name: 'Wrist & Forearm Stretch', cat: 'stretch', level: 1, met: 1.8, cycle: 12, view: 'sidefront', sides: true,
    muscles: ['forearms'],
    tips: 'Arm straight out, palm forward. Gently pull your fingers back with the other hand, then turn the palm down and press the hand down.',
    frames: [
      { shF_L: 90, elbow_L: 0, wrist_L: 70, shF_R: 65.5, shAbd_R: -43.2, elbow_R: 37.9, hipAbd: 5 },
      { shF_L: 90, elbow_L: 0, wrist_L: 70, shF_R: 65.5, shAbd_R: -43.2, elbow_R: 37.9, hipAbd: 5 },
      { shF_L: 90, elbow_L: 0, wrist_L: -70, shF_R: 59.4, shAbd_R: -42.6, elbow_R: 36.8, hipAbd: 5 },
      { shF_L: 90, elbow_L: 0, wrist_L: -70, shF_R: 59.4, shAbd_R: -42.6, elbow_R: 36.8, hipAbd: 5 },
    ],
  },
  {
    id: 'hamstring-stretch', on: 'feet', name: 'Standing Hamstring Stretch', cat: 'stretch', level: 1, met: 2, view: 'sidefront', sides: true,
    muscles: ['hamstrings', 'calves', 'lowerBack'],
    tips: 'Put one heel forward with the toes up and that leg straight. Bend the back knee and hinge forward from your hips with a flat back.',
    frames: [{ ...HANDS_ON_HIPS, pitch: 44.1, hipF_L: 63.4, knee_L: 0, ankle_L: -25, hipF_R: 65.4, knee_R: 21.6, ankle_R: -1.8, neckF: -10 }],
  },
];

export const CATEGORIES = {
  warmup: 'Warm-up', cardio: 'Cardio', strength: 'Strength', core: 'Core', yoga: 'Yoga', stretch: 'Stretch',
};

export const LEVELS = { 1: 'Beginner', 2: 'Intermediate', 3: 'Advanced' };

export const byId = (id) => EXERCISES.find((e) => e.id === id);
